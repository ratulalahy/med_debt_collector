# Working!
import os
import requests
import datetime
from typing import Optional, Dict, Any
from dotenv import load_dotenv
from loguru import logger
import psycopg2
from twilio.rest import Client
import pytz

load_dotenv()

class VapiDebtCollector:
    def __init__(self):
        self.api_key = os.getenv("VAPI_API_KEY")
        self.workflow_id = os.getenv("DEBT_COLLECTION_WORKFLOW_ID")
        self.phone_number_id = os.getenv("VAPI_PHONE_NUMBER_ID")
        self.base_url = "https://api.vapi.ai"
        self.api_url = "http://your-fastapi-domain.com"  # Replace with your AWS API Gateway URL
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        self.twilio_sid = os.getenv("TWILIO_SID")
        self.twilio_auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        self.twilio_phone = os.getenv("TWILIO_PHONE_NUMBER")
        self.db_config = {
            "dbname": os.getenv("DB_NAME", "debt_collection"),
            "user": os.getenv("DB_USER", "user"),
            "password": os.getenv("DB_PASSWORD", "password"),
            "host": os.getenv("DB_HOST", "localhost")
        }

    def is_tcp_compliant(self, phone: str) -> bool:
        # Placeholder: Use phone number to infer time zone via external service
        now = datetime.datetime.now(pytz.timezone("US/Mountain"))
        hour = now.hour
        return 8 <= hour < 21

    def make_outbound_call(self, customer_name: str, customer_number: str, balance: float, customer_id: str, due_date: str) -> Dict[str, Any]:
        if not self.is_tcp_compliant(customer_number):
            logger.error("Call blocked: Not TCPA compliant")
            return {"status": 403, "error": "Not TCPA compliant"}

        payload = {
            "workflowId": self.workflow_id,
            "phoneNumberId": self.phone_number_id,
            "customer": {
                "number": customer_number,
                "name": customer_name
            }
        }

        try:
            resp = requests.post(f"{self.base_url}/call", json=payload, headers=self.headers)
            if resp.status_code not in (200, 201):
                logger.error(f"Call failed: {resp.status_code} {resp.text}")
                return {"status": resp.status_code, "error": resp.text}
            call_id = resp.json().get("id")
            logger.success(f"Call initiated: {call_id}")
            return {"status": 200, "call_id": call_id}
        except Exception as e:
            logger.error(f"Call initiation failed: {e}")
            return {"status": 500, "error": str(e)}

    def lookup_patient(self, patient_id: Optional[str] = None, patient_name: Optional[str] = None, date_of_birth: Optional[str] = None) -> Dict[str, Any]:
        payload = {
            "patient_id": patient_id,
            "patient_name": patient_name,
            "date_of_birth": date_of_birth
        }
        try:
            resp = requests.post(f"{self.api_url}/lookup_patient", json=payload)
            resp.raise_for_status()
            return resp.json()
        except Exception as e:
            logger.error(f"Patient lookup failed: {e}")
            return {"status": 500, "error": str(e)}

    def process_payment(self, patient_id: str, payment_method: str, amount: float) -> Dict[str, Any]:
        payload = {
            "patient_id": patient_id,
            "payment_method": payment_method,
            "amount": amount
        }
        try:
            resp = requests.post(f"{self.api_url}/process_payment", json=payload)
            resp.raise_for_status()
            return resp.json()
        except Exception as e:
            logger.error(f"Payment processing failed: {e}")
            return {"status": 500, "error": str(e)}

    def schedule_reminder_call(self, patient_name: str, patient_id: str, schedule_time: str) -> Dict[str, Any]:
        payload = {
            "patient_name": patient_name,
            "patient_id": patient_id,
            "schedule_time": schedule_time
        }
        try:
            resp = requests.post(f"{self.api_url}/reminder_call", json=payload)
            resp.raise_for_status()
            return resp.json()
        except Exception as e:
            logger.error(f"Reminder call scheduling failed: {e}")
            return {"status": 500, "error": str(e)}

    def reschedule_call(self, patient_name: str, patient_id: str, schedule_time: str) -> Dict[str, Any]:
        payload = {
            "patient_name": patient_name,
            "patient_id": patient_id,
            "schedule_time": schedule_time
        }
        try:
            resp = requests.post(f"{self.api_url}/reschedule_call", json=payload)
            resp.raise_for_status()
            return resp.json()
        except Exception as e:
            logger.error(f"Call rescheduling failed: {e}")
            return {"status": 500, "error": str(e)}

    def send_sms(self, phone: str, patient_name: str, balance: float, due_date: str) -> Dict[str, Any]:
        payload = {
            "phone_number": phone,
            "patient_name": patient_name,
            "balance": balance,
            "due_date": due_date
        }
        try:
            resp = requests.post(f"{self.api_url}/send_sms", json=payload)
            resp.raise_for_status()
            return resp.json()
        except Exception as e:
            logger.error(f"SMS sending failed: {e}")
            return {"status": 500, "error": str(e)}

    def get_call_details(self, call_id: str) -> Optional[Dict[str, Any]]:
        try:
            response = requests.get(f"{self.base_url}/call/{call_id}", headers=self.headers)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Failed to fetch call details: {e}")
            return None

    def get_transcript(self, call_data: Dict[str, Any]) -> Optional[str]:
        return call_data.get("artifact", {}).get("transcript")

    def get_analysis(self, call_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        return call_data.get("analysis")

    def get_recording_url(self, call_data: Dict[str, Any]) -> Optional[str]:
        rec = call_data.get("artifact", {}).get("recording", {})
        return rec.get("stereoUrl") or rec.get("mono", {}).get("combinedUrl")

    def log_call_to_db(self, call_id: str, phone: str, cost: Optional[float], transcript: Optional[str]):
        try:
            conn = psycopg2.connect(**self.db_config)
            cur = conn.cursor()
            cur.execute("""
                INSERT INTO call_logs (call_id, phone, type, cost, transcript, created_at)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (call_id, phone, "outbound", cost, transcript, datetime.datetime.now()))
            conn.commit()
            cur.close()
            conn.close()
            logger.success(f"Logged call to DB: {call_id}")
        except Exception as e:
            logger.error(f"DB logging failed: {e}")

    def run_full_call_flow(self, customer_name: str, customer_number: str, balance: float, customer_id: str, due_date: str):
        result = self.make_outbound_call(customer_name, customer_number, balance, customer_id, due_date)
        if result["status"] != 200:
            logger.error("Call initiation failed.")
            return

        call_id = result["call_id"]
        logger.info("Waiting for webhook or polling call status...")
        # In production, rely on webhook for call completion
        import time
        time.sleep(10)  # Temporary polling for PoC

        details = self.get_call_details(call_id)
        if not details:
            logger.error("Failed to retrieve call details")
            return

        transcript = self.get_transcript(details)
        analysis = self.get_analysis(details)
        recording_url = self.get_recording_url(details)

        logger.info(f"[Transcript]: {transcript}")
        logger.info(f"[Analysis]: {analysis}")
        logger.info(f"[Recording URL]: {recording_url}")

        self.log_call_to_db(call_id, customer_number, details.get("cost", 0.0), transcript)

if __name__ == "__main__":
    collector = VapiDebtCollector()
    collector.run_full_call_flow("Ratul", "+15754181944", 100.50, "cust_001", "January Fifteen")