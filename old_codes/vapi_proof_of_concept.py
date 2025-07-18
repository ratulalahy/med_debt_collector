# from vapi_proof_of_concept import VAPI_API_KEY, VAPI_ASSISTANT_ID, TWILIO_SID, TWILIO_PHONE
import requests
import os
import datetime
from pprint import pprint, pformat
import logging
from loguru import logger
from rich import print
from rich.pretty import Pretty
from rich.console import Console
from twilio.rest import Client
import psycopg2
from dotenv import load_dotenv

# Configure logging
# logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
# logger = logging.getLogger(__name__)

load_dotenv()

VAPI_API_KEY = os.getenv("VAPI_API_KEY")
VAPI_ASSISTANT_ID = os.getenv("VAPI_ASSISTANT_ID")
PHONE_NUMBER_ID = os.getenv("VAPI_PHONE_NUMBER_ID")


TWILIO_SID = os.getenv("TWILIO_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE = os.getenv("TWILIO_PHONE_NUMBER")
API_BASE = "https://api.vapi.ai"
DB_CONFIG = {
    "dbname": "debt_collection",
    "user": "user",
    "password": "password",
    "host": "localhost"
}


def check_assistant():
    """Verify existing assistant to ensure reusability."""
    try:
        url = "https://api.vapi.ai/assistant"
        headers = {"Authorization": f"Bearer {VAPI_API_KEY}"}
        response = requests.get(url, headers=headers)

        if response.status_code != 200:
            logger.error("Failed to fetch assistants: %s %s",
                         response.status_code, response.text)
            return {"status": response.status_code, "error": "Failed to fetch assistants"}

        assistants = response.json()
        for assistant in assistants:
            if assistant["id"] == VAPI_ASSISTANT_ID:
                logger.info("Assistant found: {}", VAPI_ASSISTANT_ID)
                logger.debug("Assistant details:\n{}", pformat(assistant))
                return {"status": 200, "data": assistant}

        logger.error("Assistant not found")
        return {"status": 404, "error": "Assistant not found"}

    except Exception as e:
        logger.error("Error checking assistant: {}", str(e))
        return {"status": 500, "error": str(e)}


def is_fdppa_compliant():
    """Check if current time is within FDCPA-compliant hours (8 AM–9 PM)."""
    current_hour = datetime.datetime.now().hour
    compliant = 8 <= current_hour < 21
    logger.info(
        f"FDCPA compliance check: {'Compliant' if compliant else 'Non-compliant'}")
    return compliant


def make_outbound_call(customer_number: str, balance: float, customer_id: str):
    """
    Initiate an outbound phone call via Vapi using:
      - assistantId
      - phoneNumberId  ← your imported number
      - customer.number
    """
    url = f"{API_BASE}/call"
    headers = {
        "Authorization": f"Bearer {VAPI_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "assistantId": VAPI_ASSISTANT_ID,
        "phoneNumberId": PHONE_NUMBER_ID,
        "customer": {
            "number": customer_number
        },
        # optional: schedulePlan if you want to schedule for later
        # "assistantOverrides": {
        #     "model": {
        #         "provider": "openai",
        #         "model": "gpt-4o-mini",
        #         "messages": [
        #             {
        #                 "role": "system",
        #                 "content": (
        #                     f"You are a debt collector. "
        #                     f"Inform the customer they owe ${balance:.2f} (ID: {customer_id}), "
        #                     "disclose: 'This is an attempt to collect a debt…', "
        #                     "then offer: pay, schedule follow-up, transfer, or end."
        #                 )
        #             }
        #         ]
        #     }
        # }
    }

    resp = requests.post(url, json=payload, headers=headers)
    if resp.status_code not in (200, 201):
        logger.error(
            f"Failed to initiate call: {resp.status_code} {resp.text}")
        return {"status": resp.status_code, "error": resp.text}

    data = resp.json()
    call_id = data.get("id")
    logger.info(f"Call initiated, id={call_id}")
    return {"status": 200, "call_id": call_id}


def get_call_details(call_id):
    """Retrieve call details including cost and transcript."""
    try:
        url = f"https://api.vapi.ai/call/{call_id}"
        headers = {"Authorization": f"Bearer {VAPI_API_KEY}"}
        response = requests.get(url, headers=headers)
        if response.status_code != 200:
            logger.error(
                f"Failed to fetch call details: {response.status_code} {response.text}")
            return {"status": response.status_code, "error": response.text}
        logger.info(f"Call details retrieved for call_id: {call_id}")
        return {"status": 200, "data": response.json()}
    except Exception as e:
        logger.error(f"Error fetching call details: {str(e)}")
        return {"status": 500, "error": str(e)}


def log_call_details(call_id, phone, cost, transcript):
    """Log call cost and transcript to PostgreSQL."""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO call_logs (call_id, phone, type, cost, transcript, created_at)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (call_id, phone, "outbound", cost, transcript, datetime.datetime.now())
        )
        conn.commit()
        cursor.close()
        conn.close()
        logger.info(f"Logged call details for call_id: {call_id}")
        return {"status": 200, "message": "Call details logged"}
    except Exception as e:
        logger.error(f"Error logging call details: {str(e)}")
        return {"status": 500, "error": str(e)}


def send_sms(phone, message):
    """Send SMS via Twilio if within compliant hours."""
    try:
        if not is_fdppa_compliant():
            logger.error("SMS restricted outside 8 AM–9 PM")
            return {"status": 403, "error": "SMS restricted outside 8 AM–9 PM"}
        client = Client(TWILIO_SID, TWILIO_AUTH_TOKEN)
        message = client.messages.create(
            body=f"{message} This is an attempt to collect a debt.",
            from_=TWILIO_PHONE,
            to=phone
        )
        # conn = psycopg2.connect(**DB_CONFIG)
        # cursor = conn.cursor()
        # cursor.execute(
        #     "INSERT INTO sms_logs (phone, message, status, created_at) VALUES (%s, %s, %s, %s)",
        #     (phone, message.body, "sent", datetime.datetime.now())
        # )
        # conn.commit()
        # cursor.close()
        # conn.close()
        logger.info(f"SMS sent: {message.sid}")
        return {"status": 200, "messageId": message.sid}
    except Exception as e:
        logger.error(f"Error sending SMS: {str(e)}")
        return {"status": 500, "error": str(e)}


def log_notes(call_id, notes):
    """Log call notes to PostgreSQL."""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO call_notes (call_id, notes, created_at) VALUES (%s, %s, %s)",
            (call_id, notes, datetime.datetime.now())
        )
        conn.commit()
        cursor.close()
        conn.close()
        logger.info(f"Notes logged for call_id: {call_id}")
        return {"status": 200, "message": "Notes logged"}
    except Exception as e:
        logger.error(f"Error logging notes: {str(e)}")
        return {"status": 500, "error": str(e)}


def transfer_call(phone):
    """Initiate call transfer to agent."""
    try:
        url = "https://api.vapi.ai/call/transfer"
        headers = {"Authorization": f"Bearer {VAPI_API_KEY}"}
        payload = {"phoneNumber": phone}
        response = requests.post(url, json=payload, headers=headers)
        if response.status_code != 200:
            logger.error(
                f"Failed to transfer call: {response.status_code} {response.text}")
            return {"status": response.status_code, "error": response.text}
        logger.info(f"Call transferred to: {phone}")
        return {"status": 200, "data": response.json()}
    except Exception as e:
        logger.error(f"Error transferring call: {str(e)}")
        return {"status": 500, "error": str(e)}


def schedule_followup(phone, time):
    """Schedule follow-up call within working hours (Mon–Fri, 8 AM–5 PM)."""
    try:
        schedule_time = datetime.datetime.fromisoformat(time)
        if schedule_time.weekday() >= 5 or not (8 <= schedule_time.hour < 17):
            logger.error("Follow-up must be on weekdays, 8 AM–5 PM")
            return {"status": 400, "error": "Follow-up must be on weekdays, 8 AM–5 PM"}
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO followup_schedules (phone, scheduled_time, created_at) VALUES (%s, %s, %s)",
            (phone, schedule_time, datetime.datetime.now())
        )
        conn.commit()
        cursor.close()
        conn.close()
        logger.info(f"Follow-up scheduled for: {phone} at {time}")
        return {"status": 200, "scheduledTime": time}
    except ValueError:
        logger.error("Invalid time format")
        return {"status": 400, "error": "Invalid time format"}
    except Exception as e:
        logger.error(f"Error scheduling follow-up: {str(e)}")
        return {"status": 500, "error": str(e)}


def end_call():
    """End the current call."""
    try:
        url = "https://api.vapi.ai/call/end"
        headers = {"Authorization": f"Bearer {VAPI_API_KEY}"}
        response = requests.post(url, headers=headers)
        if response.status_code != 200:
            logger.error(
                f"Failed to end call: {response.status_code} {response.text}")
            return {"status": response.status_code, "error": response.text}
        logger.info("Call ended successfully")
        return {"status": 200, "message": "Call ended"}
    except Exception as e:
        logger.error(f"Error ending call: {str(e)}")
        return {"status": 500, "error": str(e)}


def simulate_inbound_callback(phone):
    """Simulate inbound callback handling and log details."""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO call_logs (call_id, phone, type, created_at) VALUES (%s, %s, %s, %s)",
            ("inbound_sim_" + phone[-4:], phone,
             "inbound", datetime.datetime.now())
        )
        conn.commit()
        cursor.close()
        conn.close()
        logger.info(f"Inbound callback logged for: {phone}")
        return {"status": 200, "message": "Inbound callback logged"}
    except Exception as e:
        logger.error(f"Error logging inbound callback: {str(e)}")
        return {"status": 500, "error": str(e)}


if __name__ == "__main__":
    console = Console()
    # Verify assistant
    # console.print(Pretty((check_assistant())))
    # Test outbound call with cost/transcript retrieval
    cur_call_ret = make_outbound_call(
        "+15754181944", 100.50, "cust_001")
    cur_call_details = cur_call_ret["call_id"]
    console.print(Pretty(cur_call_details))
    # # Test SMS
    # console.print(Pretty(send_sms("+15754181944", "Your balance is $100.50. Please pay soon.")))
    # # Test note-taking
    # print(log_notes("call_123", "Customer disputes balance due to billing error"))
    # # Test call transfer
    # print(transfer_call("+1987654321"))
    # # Test follow-up scheduling
    # print(schedule_followup("+1234567890", "2025-06-30T10:00:00"))
    # # Test inbound callback simulation
    # print(simulate_inbound_callback("+1234567890"))
