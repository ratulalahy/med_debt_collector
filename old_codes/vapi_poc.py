import os
import requests
import datetime
from typing import Optional, Dict, Any, List
from dotenv import load_dotenv
from loguru import logger
import psycopg2
from twilio.rest import Client

load_dotenv()


class VapiDebtCollector:
    def __init__(self):
        self.api_key = os.getenv("VAPI_API_KEY")
        self.assistant_id = os.getenv("VAPI_ASSISTANT_ID")
        self.phone_number_id = os.getenv("VAPI_PHONE_NUMBER_ID")
        self.base_url = "https://api.vapi.ai"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        self.twilio_sid = os.getenv("TWILIO_SID")
        self.twilio_auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        self.twilio_phone = os.getenv("TWILIO_PHONE_NUMBER")
        self.db_config = {
            "dbname": "debt_collection",
            "user": "user",
            "password": "password",
            "host": "localhost"
        }

    def is_fdppa_compliant(self) -> bool:
        now = datetime.datetime.now().hour
        return 8 <= now < 21

    def make_outbound_call(self, customer_number: str, balance: float, customer_id: str) -> Dict[str, Any]:
        payload = {
            "assistantId": self.assistant_id,
            "phoneNumberId": self.phone_number_id,
            "customer": {"number": customer_number}
        }
        resp = requests.post(f"{self.base_url}/call", json=payload, headers=self.headers)
        if resp.status_code not in (200, 201):
            logger.error(f"Call failed: {resp.status_code} {resp.text}")
            return {"status": resp.status_code, "error": resp.text}
        call_id = resp.json().get("id")
        logger.success(f"Call initiated: {call_id}")
        return {"status": 200, "call_id": call_id}

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

    def send_sms(self, phone: str, message: str) -> Dict[str, Any]:
        if not self.is_fdppa_compliant():
            return {"status": 403, "error": "Not FDCPA compliant"}
        try:
            client = Client(self.twilio_sid, self.twilio_auth_token)
            msg = client.messages.create(
                body=f"{message} This is an attempt to collect a debt.",
                from_=self.twilio_phone,
                to=phone
            )
            logger.success(f"SMS sent to {phone}, ID: {msg.sid}")
            return {"status": 200, "message_id": msg.sid}
        except Exception as e:
            logger.error(f"SMS failed: {e}")
            return {"status": 500, "error": str(e)}

    def run_full_call_flow(self, customer_number: str, balance: float, customer_id: str):
        result = self.make_outbound_call(customer_number, balance, customer_id)
        if result["status"] != 200:
            logger.error("Call initiation failed.")
            return

        call_id = result["call_id"]
        logger.info("Waiting 10 seconds for call to complete...")
        import time; time.sleep(10)  # in real apps, poll call status or webhook

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
    collector.run_full_call_flow("+15754181944", 100.50, "cust_001")
