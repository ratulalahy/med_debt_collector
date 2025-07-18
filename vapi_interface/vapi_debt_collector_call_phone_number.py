"""
Retell initial poc 0.0.1
This voice agent, calls a specific phone number and call that attached workflow or agent attached with that phone number.
This doesnt call specific workflow or agent. Rather, it calls a phone number, which is very basic.
To have the updated version use updated code.
"""

import os
import requests
import datetime
from typing import Optional, Dict, Any
from dotenv import load_dotenv
from loguru import logger
import psycopg2
import pytz
from dateutil.parser import parse

load_dotenv()

class VapiDebtCollector:
    def __init__(self):
        self.api_key = os.getenv("VAPI_API_KEY")
        self.workflow_id = os.getenv("DEBT_COLLECTION_WORKFLOW_ID")
        self.phone_number_id = os.getenv("VAPI_PHONE_NUMBER_ID")
        self.base_url = "https://api.vapi.ai"
        self.api_url = "https://your-fastapi-domain.com"  # Replace with ngrok or AWS API Gateway URL
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
        now = datetime.datetime.now(pytz.timezone("US/Mountain"))
        hour = now.hour
        return 8 <= hour < 21

    def make_outbound_call(self, contact_name: str, contact_number: str, resident_id: str, 
                       facility_name: str) -> Dict[str, Any]:
        """
        Make an outbound call via Vapi with minimal metadata for security.

        Args:
            contact_name: Pronunciation of contact's name for STT
            contact_number: Contact's phone number
            resident_id: Unique resident identifier
            facility_name: Facility name

        Returns:
            Dict with call status and call_id
        """
        # if not self.is_tcp_compliant(contact_number):
        #     logger.error("Call blocked: Not TCPA compliant")
        #     return {"status": 403, "error": "Not TCPA compliant"}

        payload = {
            "workflowId": self.workflow_id,
            "phoneNumberId": self.phone_number_id,
            "customer": {
                "number": contact_number,
                "name": contact_name,
                "externalId":resident_id
            },
            "name": f"Debt Call {resident_id}",
            # "metadata": {
            #     "resident_id": resident_id,
            #     "facility_name": facility_name
            # }
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

    def lookup_patient(self, resident_id: Optional[str] = None, resident_name: Optional[str] = None, 
                      date_of_birth: Optional[str] = None, contact_name: Optional[str] = None) -> Dict[str, Any]:
        payload = {
            "resident_id": resident_id,
            "resident_name": resident_name,
            "date_of_birth": date_of_birth,
            "contact_name": contact_name
        }
        try:
            resp = requests.post(f"{self.api_url}/lookup_patient", json=payload)
            resp.raise_for_status()
            return resp.json()
        except Exception as e:
            logger.error(f"Patient lookup failed: {e}")
            return {"status": 500, "error": str(e)}

    def process_payment(self, resident_id: str, payment_method: str, amount: float) -> Dict[str, Any]:
        payload = {
            "resident_id": resident_id,
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

    def schedule_reminder_call(self, contact_name: str, resident_id: str, schedule_time: str) -> Dict[str, Any]:
        payload = {
            "contact_name": contact_name,
            "resident_id": resident_id,
            "schedule_time": schedule_time
        }
        try:
            resp = requests.post(f"{self.api_url}/reminder_call", json=payload)
            resp.raise_for_status()
            return resp.json()
        except Exception as e:
            logger.error(f"Reminder call scheduling failed: {e}")
            return {"status": 500, "error": str(e)}

    def reschedule_call(self, contact_name: str, resident_id: str, schedule_time: str) -> Dict[str, Any]:
        payload = {
            "contact_name": contact_name,
            "resident_id": resident_id,
            "schedule_time": schedule_time
        }
        try:
            resp = requests.post(f"{self.api_url}/reschedule_call", json=payload)
            resp.raise_for_status()
            return resp.json()
        except Exception as e:
            logger.error(f"Call rescheduling failed: {e}")
            return {"status": 500, "error": str(e)}

    def send_sms(self, contact_number: str, contact_name: str, resident_name: str, 
                 balance: float, due_date: str, facility_name: str) -> Dict[str, Any]:
        payload = {
            "contact_number": contact_number,
            "contact_name": contact_name,
            "resident_name": resident_name,
            "balance": balance,
            "due_date": due_date,
            "facility_name": facility_name
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

    def run_full_call_flow(self, contact_fname: str, contact_lname: str, contact_name_pronunciation: str, 
                       contact_number: str, resident_fname: str, resident_lname: str, 
                       resident_id: str, resident_dob: str, balance: float, due_date: str, 
                       facility_name: str, payer_desc: str):
        """
        Initiate a debt collection call with contact and resident details.
        Normalizes DOB and passes minimal data to Vapi API.

        Args:
            contact_fname: Contact's first name
            contact_lname: Contact's last name
            contact_name_pronunciation: Pronunciation for STT (e.g., 'Jown' for 'John')
            contact_number: Contact's phone number
            resident_fname: Resident's first name
            resident_lname: Resident's last name
            resident_id: Unique resident identifier
            resident_dob: Resident's date of birth
            balance: Outstanding balance
            due_date: Payment due date
            facility_name: Facility name
            payer_desc: Payer description
        """
        # Normalize DOB to YYYY-MM-DD
        try:
            dob_date = parse(resident_dob, fuzzy=True).strftime("%Y-%m-%d")
        except ValueError:
            logger.error(f"Invalid DOB format: {resident_dob}")
            return

        contact_name = contact_name_pronunciation or contact_lname
        
        result = self.make_outbound_call(
            contact_name=contact_name_pronunciation,
            contact_number=contact_number,
            resident_id=resident_id,
            facility_name=facility_name
        )
        if result["status"] != 200:
            logger.error("Call initiation failed.")
            return

        call_id = result["call_id"]
        logger.info("Waiting for webhook or polling call status...")
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

        self.log_call_to_db(call_id, contact_number, details.get("cost", 0.0), transcript)


if __name__ == "__main__":
    collector = VapiDebtCollector()
    collector.run_full_call_flow(
        contact_fname="Ratul",
        contact_lname="Alahy",
        contact_name_pronunciation="Rah-Tool",
        contact_number="+15754181944",
        resident_fname="Liam",
        resident_lname="Johnson",
        resident_id="600999",
        resident_dob="25 March, 1986",
        balance=40.26,
        due_date="May Thirty-One",
        facility_name="Highland Manor of Elko Rehabilitation- SNF",
        payer_desc="Medicaid Co-Insurance"
    )