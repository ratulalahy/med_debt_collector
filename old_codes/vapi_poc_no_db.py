import os
import requests
import datetime
import time
from typing import Optional, Dict, Any
from dotenv import load_dotenv
from loguru import logger
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

    def is_fdppa_compliant(self) -> bool:
        """Check FDCPA time compliance (8 AM – 9 PM)."""
        now_hour = datetime.datetime.now().hour
        return 8 <= now_hour < 21

    def make_outbound_call(self, customer_number: str, balance: float, customer_id: str) -> Dict[str, Any]:
        payload = {
            "assistantId": self.assistant_id,
            "phoneNumberId": self.phone_number_id,
            "customer": {"number": customer_number}
        }

        response = requests.post(f"{self.base_url}/call", json=payload, headers=self.headers)
        if response.status_code not in (200, 201):
            logger.error(f"Call failed: {response.status_code} {response.text}")
            return {"status": response.status_code, "error": response.text}

        call_id = response.json().get("id")
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

    def send_sms(self, phone: str, message: str) -> Dict[str, Any]:
        """Send SMS via Twilio within compliant hours."""
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
        """Orchestrate full call, then retrieve and display all results."""
        result = self.make_outbound_call(customer_number, balance, customer_id)
        if result["status"] != 200:
            logger.error("Call initiation failed.")
            return

        call_id = result["call_id"]

        # In production, you might poll or listen for webhooks
        logger.info("Waiting 10 seconds for call to complete...")
        time.sleep(10)

        call_data = self.get_call_details(call_id)
        if not call_data:
            logger.error("Failed to retrieve call data")
            return

        transcript = self.get_transcript(call_data)
        analysis = self.get_analysis(call_data)
        recording_url = self.get_recording_url(call_data)

        # Display summary
        logger.info(f"[Call ID]: {call_id}")
        logger.info(f"[Transcript]:\n{transcript or 'No transcript available.'}")
        logger.info(f"[Analysis]:\n{analysis or 'No analysis available.'}")
        logger.info(f"[Recording URL]: {recording_url or 'No recording available.'}")


if __name__ == "__main__":
    collector = VapiDebtCollector()
    collector.run_full_call_flow("+15754181944", 100.50, "cust_001")
