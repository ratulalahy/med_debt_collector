from fastapi import FastAPI
from pydantic import BaseModel
from twilio.rest import Client
import psycopg2
import os
import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI()

DB_CONFIG = {
    "dbname": "debt_collection",
    "user": "user",
    "password": "password",
    "host": "localhost"
}

class SMSPayload(BaseModel):
    phoneNumber: str
    message: str

class NotesPayload(BaseModel):
    callId: str
    notes: str

class TransferPayload(BaseModel):
    phoneNumber: str

class FollowupPayload(BaseModel):
    phoneNumber: str
    time: str

def is_fdppa_compliant():
    """Check FDCPA-compliant hours."""
    current_hour = datetime.datetime.now().hour
    compliant = 8 <= current_hour < 21
    logger.info(f"FDCPA compliance check: {'Compliant' if compliant else 'Non-compliant'}")
    return compliant

@app.post("/send_text_tool")
async def send_sms(payload: SMSPayload):
    try:
        if not is_fdppa_compliant():
            logger.error("SMS restricted outside 8 AM–9 PM")
            return {"status": 403, "error": "SMS restricted outside 8 AM–9 PM"}
        client = Client(os.getenv("TWILIO_SID"), os.getenv("TWILIO_AUTH_TOKEN"))
        message = client.messages.create(
            body=f"{payload.message} This is an attempt to collect a debt.",
            from_=os.getenv("TWILIO_PHONE"),
            to=payload.phoneNumber
        )
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO sms_logs (phone, message, status, created_at) VALUES (%s, %s, %s, %s)",
            (payload.phoneNumber, payload.message, "sent", datetime.datetime.now())
        )
        conn.commit()
        cursor.close()
        conn.close()
        logger.info(f"SMS sent: {message.sid}")
        return {"status": 200, "messageId": message.sid}
    except Exception as e:
        logger.error(f"Error sending SMS: {str(e)}")
        return {"status": 500, "error": str(e)}

@app.post("/log_notes")
async def log_notes(payload: NotesPayload):
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO call_notes (call_id, notes, created_at) VALUES (%s, %s, %s)",
            (payload.callId, payload.notes, datetime.datetime.now())
        )
        conn.commit()
        cursor.close()
        conn.close()
        logger.info(f"Notes logged for call_id: {payload.callId}")
        return {"status": 200, "message": "Notes logged"}
    except Exception as e:
        logger.error(f"Error logging notes: {str(e)}")
        return {"status": 500, "error": str(e)}

@app.post("/transfer_call_tool")
async def transfer_call(payload: TransferPayload):
    try:
        # Simulate transfer (actual implementation via Vapi.ai in production)
        logger.info(f"Call transferred to: {payload.phoneNumber}")
        return {"status": 200, "phoneNumber": payload.phoneNumber}
    except Exception as e:
        logger.error(f"Error transferring call: {str(e)}")
        return {"status": 500, "error": str(e)}

@app.post("/schedule_followup_tool")
async def schedule_followup(payload: FollowupPayload):
    try:
        schedule_time = datetime.datetime.fromisoformat(payload.time)
        if schedule_time.weekday() >= 5 or not (8 <= schedule_time.hour < 17):
            logger.error("Follow-up must be on weekdays, 8 AM–5 PM")
            return {"status": 400, "error": "Follow-up must be on weekdays, 8 AM–5 PM"}
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO followup_schedules (phone, scheduled_time, created_at) VALUES (%s, %s, %s)",
            (payload.phoneNumber, schedule_time, datetime.datetime.now())
        )
        conn.commit()
        cursor.close()
        conn.close()
        logger.info(f"Follow-up scheduled for: {payload.phoneNumber} at {payload.time}")
        return {"status": 200, "scheduledTime": payload.time}
    except ValueError:
        logger.error("Invalid time format")
        return {"status": 400, "error": "Invalid time format"}
    except Exception as e:
        logger.error(f"Error scheduling follow-up: {str(e)}")
        return {"status": 500, "error": str(e)}

@app.post("/end_call_tool")
async def end_call():
    try:
        logger.info("Call ended successfully")
        return {"status": 200, "message": "Call ended"}
    except Exception as e:
        logger.error(f"Error ending call: {str(e)}")
        return {"status": 500, "error": str(e)}

@app.post("/receive-sms")
async def receive_sms(payload: dict):
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO sms_logs (phone, message, status, created_at) VALUES (%s, %s, %s, %s)",
            (payload.get("From"), payload.get("Body"), "received", datetime.datetime.now())
        )
        conn.commit()
        cursor.close()
        conn.close()
        logger.info(f"Inbound SMS logged from: {payload.get('From')}")
        return {"status": 200, "message": "Inbound SMS logged"}
    except Exception as e:
        logger.error(f"Error logging inbound SMS: {str(e)}")
        return {"status": 500, "error": str(e)}