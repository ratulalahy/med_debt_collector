import os
import datetime
from typing import Optional, Dict, Any
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import json
from loguru import logger
import psycopg2
from psycopg2.extras import RealDictCursor
from twilio.rest import Client
from dotenv import load_dotenv
import pytz
from fuzzywuzzy import fuzz
from dateutil.parser import parse
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

load_dotenv()

app = FastAPI(title="Debt Collection API")

# Database configuration
db_config = {
    "dbname": os.getenv("DB_NAME", "debt_collection"),
    "user": os.getenv("DB_USER", "user"),
    "password": os.getenv("DB_PASSWORD", "password"),
    "host": os.getenv("DB_HOST", "localhost")
}

# Twilio configuration
twilio_client = Client(os.getenv("TWILIO_SID"), os.getenv("TWILIO_AUTH_TOKEN"))
twilio_phone = os.getenv("TWILIO_PHONE_NUMBER")

# Google Calendar configuration
SCOPES = ['https://www.googleapis.com/auth/calendar']
GOOGLE_CREDENTIALS_FILE = os.getenv("GOOGLE_CREDENTIALS_FILE", "credentials.json")

# Models for request validation
class PatientLookupRequest(BaseModel):
    resident_id: Optional[str] = None
    resident_name: Optional[str] = None
    date_of_birth: Optional[str] = None
    contact_name: Optional[str] = None

class PaymentRequest(BaseModel):
    resident_id: str
    payment_method: str
    amount: float

class ScheduleRequest(BaseModel):
    contact_name: str
    schedule_time: str
    resident_id: str

class SMSRequest(BaseModel):
    contact_number: str
    contact_name: str
    resident_name: str
    balance: float
    due_date: str
    facility_name: str

class WebhookRequest(BaseModel):
    event_type: str
    call_id: str
    data: Dict[str, Any]
    metadata: dict

class ConversationNotesRequest(BaseModel):
    call_id: str
    resident_id: str
    notes: str

class AppointmentRequest(BaseModel):
    resident_id: str
    contact_name: str
    contact_email: str
    start_time: str
    duration_minutes: int
    title: str
    description: Optional[str] = None

class VerifyToolRequest(BaseModel):
    resident_fname: str
    resident_lname: str
    resident_dob: str
    resident_id: str
    metadata: Optional[Dict[str, Any]] = None

def is_tcp_compliant(phone: str) -> bool:
    now = datetime.datetime.now(pytz.timezone("US/Mountain"))
    hour = now.hour
    return 8 <= hour < 21

def connect_db():
    try:
        conn = psycopg2.connect(**db_config, cursor_factory=RealDictCursor)
        return conn
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        raise HTTPException(status_code=500, detail="Database connection error")

def get_google_calendar_service():
    try:
        creds = None
        if os.path.exists('token.json'):
            creds = Credentials.from_authorized_user_file('token.json', SCOPES)
        if not creds or not creds.valid:
            flow = InstalledAppFlow.from_client_secrets_file(GOOGLE_CREDENTIALS_FILE, SCOPES)
            creds = flow.run_local_server(port=0)
            with open('token.json', 'w') as token:
                token.write(creds.to_json())
        return build('calendar', 'v3', credentials=creds)
    except Exception as e:
        logger.error(f"Google Calendar authentication failed: {e}")
        raise HTTPException(status_code=500, detail="Google Calendar authentication error")


from fastapi import Request
# @app.post("/verify_resident_tool_debug")
# async def verify_resident_tool_debug(request: Request):
# @app.post("/verify_resident_tool")
# async def verify_resident_tool(request: Request):
#     body = await request.body()
#     form = await request.form()
#     json_data = await request.json() if await request.body() else None
    
#     logger.info(f"Raw body: {body.decode()}")
#     logger.info(f"Form data: {form}")
#     logger.info(f"JSON data: {json_data}")
#     logger.info(f"Query params: {request.query_params}")
    
#     return {
#         "raw_body": body.decode(),
#         "form_data": dict(form),
#         "json_data": json_data,
#         "query_params": dict(request.query_params)
#     }
    
    
import inflect
from dateutil.parser import parse

@app.post("/verify_resident_tool")
async def verify_resident_tool(request: VerifyToolRequest):
    """
    Verify resident details against patients table using resident_id.
    Compares provided fname, lname, and DOB with stored values using fuzzy matching.
    Returns due_date, due_date_pronunciation, balance, payer_desc if verified.

    Args:
        request: VerifyToolRequest with resident_id, resident_fname, resident_lname, resident_dob

    Returns:
        JSON response with verification status, resident_id, and additional patient data

    Raises:
        HTTPException: 404 if resident_id not found, 500 for other errors
    """
    logger.info(f"app.py::verify_resident_tool::Received payload: {request.dict()}")
    try:
        # Query patients table
        conn = connect_db()
        cur = conn.cursor()
        cur.execute("""
            SELECT resident_first_name, resident_last_name, date_of_birth,
                   balance, due_date, payer_desc, facility_name
            FROM patients
            WHERE resident_id = %s
        """, (request.resident_id,))
        patient = cur.fetchone()
        cur.close()
        conn.close()

        if not patient:
            logger.error(f"Resident not found: {request.resident_id}")
            raise HTTPException(status_code=404, detail="Resident not found")

        # Normalize stored and provided inputs
        stored_fname = (patient["resident_first_name"] or "").strip().lower()
        stored_lname = (patient["resident_last_name"] or "").strip().lower()
        stored_dob = patient["date_of_birth"].strftime("%Y-%m-%d") if patient["date_of_birth"] else ""
        provided_fname = request.resident_fname.strip().lower()
        provided_lname = request.resident_lname.strip().lower()
        provided_dob = request.resident_dob.strip()

        # Log for debugging
        logger.info(f"Comparing provided: fname='{provided_fname}', lname='{provided_lname}', dob='{provided_dob}'")
        logger.info(f"Against stored: fname='{stored_fname}', lname='{stored_lname}', dob='{stored_dob}'")

        # Fuzzy matching for names (threshold: 75%)
        fname_score = fuzz.ratio(provided_fname, stored_fname) if stored_fname and provided_fname else 0
        lname_score = fuzz.ratio(provided_lname, stored_lname) if stored_lname and provided_lname else 0
        name_match = (fname_score >= 75 or lname_score >= 75) or (not stored_fname and not stored_lname)

        # Parse and compare DOB
        dob_match = False
        try:
            provided_dob_date = parse(provided_dob, fuzzy=True).date()
            stored_dob_date = parse(stored_dob, fuzzy=True).date() if stored_dob else None
            dob_match = provided_dob_date == stored_dob_date if stored_dob_date else False
        except ValueError:
            logger.warning(f"Invalid DOB format - provided: {provided_dob}, stored: {stored_dob}")

        # Convert due_date to humanized pronunciation
        p = inflect.engine()
        due_date_pronunciation = ""
        if patient["due_date"]:
            due_date = patient["due_date"]
            day = p.number_to_words(p.ordinal(due_date.day)).replace("-", " ")
            month = due_date.strftime("%B")
            year = p.number_to_words(due_date.year).replace("-", " ")
            due_date_pronunciation = f"{day} {month}, {year}"

        # Verification result
        is_verified = name_match and dob_match
        result = {
            "status": 200,
            "resident_id": request.resident_id,
            "is_verified": is_verified,
            "message": "Verification successful" if is_verified else f"Verification failed: {'Incorrect name' if not name_match else ''}{' and ' if not name_match and not dob_match else ''}{'Incorrect DOB' if not dob_match else ''}",
            "details": {
                "fname_score": fname_score,
                "lname_score": lname_score,
                "dob_match": dob_match
            }
        }
        if is_verified:
            result.update({
                "due_balance": float(patient["balance"]),
                "due_date": patient["due_date"].strftime("%Y-%m-%d") if patient["due_date"] else "",
                "due_date_pronunciation": due_date_pronunciation,
                "payer_desc": patient["payer_desc"] or "",
                "facility_name": patient["facility_name"] or ""
            })
        logger.info(f"Verification {'successful' if is_verified else 'failed'} for resident_id: {request.resident_id}")
        return result
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Resident verification tool failed: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/save_conversation_notes")
def save_conversation_notes(request: ConversationNotesRequest):
    try:
        phi_data = encrypt_data(json.dumps({"resident_id": request.resident_id}))
        
        conn = connect_db()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO conversation_notes (call_id, resident_id, notes, phi_data, created_at)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING note_id
        """, (request.call_id, request.resident_id, request.notes, phi_data, datetime.datetime.now()))
        note_id = cur.fetchone()["note_id"]
        conn.commit()
        cur.close()
        conn.close()

        logger.info(f"Conversation notes saved: note_id={note_id} for call_id={request.call_id}")
        return {"status": 200, "note_id": note_id, "message": "Notes saved successfully"}
    except Exception as e:
        logger.error(f"Failed to save conversation notes: {e}")
        raise HTTPException(status_code=500, detail="Failed to save notes")

@app.post("/schedule_appointment")
async def schedule_appointment(request: AppointmentRequest):
    try:
        start_time = datetime.datetime.fromisoformat(request.start_time)
        end_time = start_time + datetime.timedelta(minutes=request.duration_minutes)

        if not is_tcp_compliant(request.contact_email):
            raise HTTPException(status_code=403, detail="Not TCPA compliant")

        service = get_google_calendar_service()
        events_result = service.events().list(
            calendarId='primary',
            timeMin=start_time.isoformat(),
            timeMax=end_time.isoformat(),
            singleEvents=True,
            orderBy='startTime'
        ).execute()
        events = events_result.get('items', [])
        if events:
            raise HTTPException(status_code=409, detail="Time slot not available")

        event = {
            'summary': request.title,
            'description': request.description or f"Follow-up call for resident {request.resident_id}",
            'start': {
                'dateTime': start_time.isoformat(),
                'timeZone': 'US/Mountain'
            },
            'end': {
                'dateTime': end_time.isoformat(),
                'timeZone': 'US/Mountain'
            },
            'attendees': [{'email': request.contact_email}],
            'reminders': {
                'useDefault': False,
                'overrides': [
                    {'method': 'email', 'minutes': 24 * 60},
                    {'method': 'email', 'minutes': 60}
                ]
            }
        }
        event = service.events().insert(calendarId='primary', body=event, sendUpdates='all').execute()

        conn = connect_db()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO appointments (call_id, resident_id, google_event_id, start_time, end_time, title, description, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING appointment_id
        """, (request.call_id, request.resident_id, event['id'], start_time, end_time, 
              request.title, request.description, datetime.datetime.now()))
        appointment_id = cur.fetchone()["appointment_id"]
        conn.commit()
        cur.close()
        conn.close()

        logger.info(f"Appointment scheduled: appointment_id={appointment_id}, google_event_id={event['id']}")
        return {
            "status": 200,
            "appointment_id": appointment_id,
            "google_event_id": event['id'],
            "message": f"Appointment scheduled for {start_time}"
        }
    except HTTPException as e:
        raise e
    except HttpError as e:
        logger.error(f"Google Calendar error: {e}")
        raise HTTPException(status_code=500, detail="Failed to schedule appointment")
    except Exception as e:
        logger.error(f"Appointment scheduling failed: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/lookup_patient")
async def lookup_patient(request: PatientLookupRequest):
    if not (request.resident_id or request.resident_name or request.date_of_birth or request.contact_name):
        raise HTTPException(status_code=400, detail="At least one of resident_id, resident_name, date_of_birth, or contact_name required")

    try:
        conn = connect_db()
        cur = conn.cursor()
        query = """
            SELECT resident_id, resident_first_name, resident_last_name, contact_first_name, contact_last_name, contact_number,
                   balance, due_date, facility_name, facility_code, payer_desc
            FROM patients
            WHERE (%(resident_id)s IS NULL OR resident_id = %(resident_id)s)
            AND (%(resident_name)s IS NULL OR (resident_first_name || ' ' || resident_last_name) ILIKE %(resident_name)s)
            AND (%(date_of_birth)s IS NULL OR date_of_birth = %(date_of_birth)s)
            AND (%(contact_name)s IS NULL OR (contact_first_name || ' ' || contact_last_name) ILIKE %(contact_name)s)
        """
        cur.execute(query, request.dict())
        patient = cur.fetchone()
        cur.close()
        conn.close()

        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        return {
            "status": 200,
            "resident_id": patient["resident_id"],
            "resident_name": f"{patient['resident_first_name']} {patient['resident_last_name']}",
            "contact_name": f"{patient['contact_first_name']} {patient['contact_last_name']}",
            "contact_number": patient["contact_number"],
            "balance": float(patient["balance"]),
            "due_date": patient["due_date"].strftime("%B %d"),
            "facility_name": patient["facility_name"],
            "facility_code": patient["facility_code"],
            "payer_desc": patient["payer_desc"]
        }
    except Exception as e:
        logger.error(f"Patient lookup failed: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/process_payment")
async def process_payment(request: PaymentRequest):
    if request.payment_method not in ["phone", "online", "mail"]:
        raise HTTPException(status_code=400, detail="Invalid payment method")

    try:
        conn = connect_db()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO payments (resident_id, amount, payment_method, payment_date)
            VALUES (%s, %s, %s, %s)
            RETURNING payment_id
        """, (request.resident_id, request.amount, request.payment_method, datetime.datetime.now()))
        payment_id = cur.fetchone()["payment_id"]
        conn.commit()
        cur.close()
        conn.close()

        logger.info(f"Payment processed: {payment_id} for resident {request.resident_id}")
        return {"status": 200, "payment_id": payment_id, "message": f"Payment of {request.amount} processed via {request.payment_method}"}
    except Exception as e:
        logger.error(f"Payment processing failed: {e}")
        raise HTTPException(status_code=500, detail="Payment processing error")

@app.post("/reminder_call")
async def schedule_reminder_call(request: ScheduleRequest):
    try:
        if not is_tcp_compliant(request.resident_id):
            raise HTTPException(status_code=403, detail="Not TCPA compliant")
        
        conn = connect_db()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO reminders (resident_id, contact_name, reminder_type, schedule_time, created_at)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING reminder_id
        """, (request.resident_id, request.contact_name, "call", request.schedule_time, datetime.datetime.now()))
        reminder_id = cur.fetchone()["reminder_id"]
        conn.commit()
        cur.close()
        conn.close()

        logger.info(f"Reminder call scheduled: {reminder_id} for {request.contact_name}")
        return {"status": 200, "reminder_id": reminder_id, "message": f"Reminder call scheduled for {request.schedule_time}"}
    except Exception as e:
        logger.error(f"Reminder call scheduling failed: {e}")
        raise HTTPException(status_code=500, detail="Scheduling error")

@app.post("/reschedule_call")
async def reschedule_call(request: ScheduleRequest):
    try:
        if not is_tcp_compliant(request.resident_id):
            raise HTTPException(status_code=403, detail="Not TCPA compliant")
        
        conn = connect_db()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO reminders (resident_id, contact_name, reminder_type, schedule_time, created_at)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING reminder_id
        """, (request.resident_id, request.contact_name, "call", request.schedule_time, datetime.datetime.now()))
        reminder_id = cur.fetchone()["reminder_id"]
        conn.commit()
        cur.close()
        conn.close()

        logger.info(f"Call rescheduled: {reminder_id} for {request.contact_name}")
        return {"status": 200, "reminder_id": reminder_id, "message": f"Call rescheduled for {request.schedule_time}"}
    except Exception as e:
        logger.error(f"Call rescheduling failed: {e}")
        raise HTTPException(status_code=500, detail="Scheduling error")

@app.post("/send_sms")
async def send_sms(request: SMSRequest):
    if not is_tcp_compliant(request.contact_number):
        raise HTTPException(status_code=403, detail="Not TCPA compliant")

    message = f"Healthcare Corporation reminds you about {request.resident_name}'s ${request.balance} due by {request.due_date} at {request.facility_name}. Visit www.hcprovo.com."
    try:
        msg = twilio_client.messages.create(
            body=f"{message} This is an attempt to collect a debt.",
            from_=twilio_phone,
            to=request.contact_number
        )
        logger.info(f"SMS sent to {request.contact_number}, ID: {msg.sid}")

        conn = connect_db()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO reminders (contact_name, reminder_type, schedule_time, created_at)
            VALUES (%s, %s, %s, %s)
            RETURNING reminder_id
        """, (request.contact_name, "sms", datetime.datetime.now().isoformat(), datetime.datetime.now()))
        reminder_id = cur.fetchone()["reminder_id"]
        conn.commit()
        cur.close()
        conn.close()

        return {"status": 200, "message_id": msg.sid, "message": "SMS sent successfully"}
    except Exception as e:
        logger.error(f"SMS failed: {e}")
        raise HTTPException(status_code=500, detail="SMS sending error")

@app.post("/webhook")
async def webhook(request: WebhookRequest):
    try:
        safe_data = {
            "call_id": request.call_id,
            "event_type": request.event_type,
            "timestamp": datetime.datetime.now(),
            "call_duration": request.data.get("duration"),
            "call_status": request.data.get("status"),
            "action_items": request.data.get("actionItems", []),
            "consent_obtained": request.metadata.get("consent", False) if request.metadata else False
        }

        phi_data = None
        if request.metadata and request.metadata.get("store_phi"):
            phi_data = encrypt_data(json.dumps({
                "resident_id": request.metadata.get("resident_id"),
                "contact_info": request.metadata.get("contact_number")
            }))

        conn = connect_db()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO call_events (
                call_id, 
                event_type, 
                safe_data,
                phi_data,
                received_at
            ) VALUES (%s, %s, %s, %s, %s)
        """, (
            request.call_id,
            request.event_type,
            json.dumps(safe_data),
            phi_data,
            datetime.datetime.now()
        ))
        conn.commit()
        cur.close()
        conn.close()

        if request.event_type == "call.ended":
            await process_call_outcome(safe_data)

        logger.info(f"Processed {request.event_type} for call {request.call_id}")
        return {"status": 200}
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def encrypt_data(data: str) -> str:
    encrypted_data = data
    return encrypted_data

async def process_call_outcome(data: dict):
    pass

@app.get("/call_logs")
async def get_call_logs():
    try:
        conn = psycopg2.connect(**db_config, cursor_factory=RealDictCursor)
        cur = conn.cursor()
        cur.execute("SELECT call_id, phone, type, cost, created_at FROM call_logs ORDER BY created_at DESC LIMIT 100")
        logs = cur.fetchall()
        cur.close()
        conn.close()
        return logs
    except Exception as e:
        logger.error(f"Failed to fetch call logs: {e}")
        raise HTTPException(status_code=500, detail="Database error")

@app.get("/reminders")
async def get_reminders():
    try:
        conn = psycopg2.connect(**db_config, cursor_factory=RealDictCursor)
        cur = conn.cursor()
        cur.execute("SELECT reminder_id, contact_name, reminder_type, schedule_time, created_at FROM reminders ORDER BY created_at DESC LIMIT 100")
        reminders = cur.fetchall()
        cur.close()
        conn.close()
        return reminders
    except Exception as e:
        logger.error(f"Failed to fetch reminders: {e}")
        raise HTTPException(status_code=500, detail="Database error")

@app.get("/payments")
async def get_payments():
    try:
        conn = psycopg2.connect(**db_config, cursor_factory=RealDictCursor)
        cur = conn.cursor()
        cur.execute("SELECT payment_id, resident_id, amount, payment_method, payment_date FROM payments ORDER BY payment_date DESC LIMIT 100")
        payments = cur.fetchall()
        cur.close()
        conn.close()
        return payments
    except Exception as e:
        logger.error(f"Failed to fetch payments: {e}")
        raise HTTPException(status_code=500, detail="Database error")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)