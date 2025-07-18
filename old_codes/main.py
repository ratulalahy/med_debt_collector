import os
import datetime
from typing import Optional, Dict, Any
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from loguru import logger
import psycopg2
from psycopg2.extras import RealDictCursor
from twilio.rest import Client
from dotenv import load_dotenv
import pytz

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

# Models for request validation
class PatientLookupRequest(BaseModel):
    patient_id: Optional[str] = None
    patient_name: Optional[str] = None
    date_of_birth: Optional[str] = None

class PaymentRequest(BaseModel):
    patient_id: str
    payment_method: str
    amount: float

class ScheduleRequest(BaseModel):
    patient_name: str
    schedule_time: str
    patient_id: str

class SMSRequest(BaseModel):
    phone_number: str
    patient_name: str
    balance: float
    due_date: str

class WebhookRequest(BaseModel):
    event_type: str
    call_id: str
    data: Dict[str, Any]

def is_tcp_compliant(phone: str) -> bool:
    # Check if current time is within 8 AM–9 PM local time for TCPA compliance
    # Placeholder: Use phone number to infer time zone (e.g., via external service)
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

@app.post("/lookup_patient")
async def lookup_patient(request: PatientLookupRequest):
    """
    Retrieve patient debt information from the database.
    """
    if not (request.patient_id or request.patient_name or request.date_of_birth):
        raise HTTPException(status_code=400, detail="At least one of patient_id, patient_name, or date_of_birth required")

    try:
        conn = connect_db()
        cur = conn.cursor()
        query = """
            SELECT patient_id, patient_name, balance, due_date, phone_number
            FROM patients
            WHERE (%(patient_id)s IS NULL OR patient_id = %(patient_id)s)
            AND (%(patient_name)s IS NULL OR patient_name = %(patient_name)s)
            AND (%(date_of_birth)s IS NULL OR date_of_birth = %(date_of_birth)s)
        """
        cur.execute(query, request.dict())
        patient = cur.fetchone()
        cur.close()
        conn.close()

        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        return {
            "status": 200,
            "patient_id": patient["patient_id"],
            "patient_name": patient["patient_name"],
            "balance": float(patient["balance"]),
            "due_date": patient["due_date"].strftime("%B %d"),
            "phone_number": patient["phone_number"]
        }
    except Exception as e:
        logger.error(f"Patient lookup failed: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/process_payment")
async def process_payment(request: PaymentRequest):
    """
    Process a payment for the patient (placeholder for payment gateway).
    """
    if request.payment_method not in ["phone", "online", "mail"]:
        raise HTTPException(status_code=400, detail="Invalid payment method")

    try:
        conn = connect_db()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO payments (patient_id, amount, payment_method, payment_date)
            VALUES (%s, %s, %s, %s)
            RETURNING payment_id
        """, (request.patient_id, request.amount, request.payment_method, datetime.datetime.now()))
        payment_id = cur.fetchone()["payment_id"]
        conn.commit()
        cur.close()
        conn.close()

        # Placeholder: Integrate with payment gateway (e.g., Stripe)
        logger.info(f"Payment processed: {payment_id} for patient {request.patient_id}")
        return {"status": 200, "payment_id": payment_id, "message": f"Payment of {request.amount} processed via {request.payment_method}"}
    except Exception as e:
        logger.error(f"Payment processing failed: {e}")
        raise HTTPException(status_code=500, detail="Payment processing error")

@app.post("/reminder_call")
async def schedule_reminder_call(request: ScheduleRequest):
    """
    Schedule a reminder call for the patient.
    """
    try:
        if not is_tcp_compliant(request.patient_id):  # Use patient_id to infer phone/time zone
            raise HTTPException(status_code=403, detail="Not TCPA compliant")
        
        conn = connect_db()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO reminders (patient_id, patient_name, reminder_type, schedule_time, created_at)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING reminder_id
        """, (request.patient_id, request.patient_name, "call", request.schedule_time, datetime.datetime.now()))
        reminder_id = cur.fetchone()["reminder_id"]
        conn.commit()
        cur.close()
        conn.close()

        logger.info(f"Reminder call scheduled: {reminder_id} for {request.patient_name}")
        return {"status": 200, "reminder_id": reminder_id, "message": f"Reminder call scheduled for {request.schedule_time}"}
    except Exception as e:
        logger.error(f"Reminder call scheduling failed: {e}")
        raise HTTPException(status_code=500, detail="Scheduling error")

@app.post("/reschedule_call")
async def reschedule_call(request: ScheduleRequest):
    """
    Reschedule a call for the patient.
    """
    try:
        if not is_tcp_compliant(request.patient_id):  # Use patient_id to infer phone/time zone
            raise HTTPException(status_code=403, detail="Not TCPA compliant")
        
        conn = connect_db()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO reminders (patient_id, patient_name, reminder_type, schedule_time, created_at)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING reminder_id
        """, (request.patient_id, request.patient_name, "call", request.schedule_time, datetime.datetime.now()))
        reminder_id = cur.fetchone()["reminder_id"]
        conn.commit()
        cur.close()
        conn.close()

        logger.info(f"Call rescheduled: {reminder_id} for {request.patient_name}")
        return {"status": 200, "reminder_id": reminder_id, "message": f"Call rescheduled for {request.schedule_time}"}
    except Exception as e:
        logger.error(f"Call rescheduling failed: {e}")
        raise HTTPException(status_code=500, detail="Scheduling error")

@app.post("/send_sms")
async def send_sms(request: SMSRequest):
    """
    Send a payment reminder SMS to the patient.
    """
    if not is_tcp_compliant(request.phone_number):
        raise HTTPException(status_code=403, detail="Not TCPA compliant")

    message = f"Healthcare Corporation reminds you: ${request.balance} due by {request.due_date}. Visit www.hcprovo.com."
    try:
        msg = twilio_client.messages.create(
            body=f"{message} This is an attempt to collect a debt.",
            from_=twilio_phone,
            to=request.phone_number
        )
        logger.info(f"SMS sent to {request.phone_number}, ID: {msg.sid}")

        # Log to database
        conn = connect_db()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO reminders (patient_name, reminder_type, schedule_time, created_at)
            VALUES (%s, %s, %s, %s)
            RETURNING reminder_id
        """, (request.patient_name, "sms", datetime.datetime.now().isoformat(), datetime.datetime.now()))
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
    """
    Handle Vapi webhook events (e.g., call ended, transcript created).
    """
    try:
        conn = connect_db()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO webhook_events (call_id, event_type, event_data, received_at)
            VALUES (%s, %s, %s, %s)
        """, (request.call_id, request.event_type, request.data, datetime.datetime.now()))
        conn.commit()
        cur.close()
        conn.close()

        logger.info(f"Webhook event logged: {request.event_type} for call {request.call_id}")
        return {"status": 200, "message": "Webhook event processed"}
    except Exception as e:
        logger.error(f"Webhook processing failed: {e}")
        raise HTTPException(status_code=500, detail="Webhook processing error")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)