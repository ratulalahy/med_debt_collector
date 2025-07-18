import os
from retell import Retell
import requests
import datetime
from typing import Optional, Dict, Any
from dotenv import load_dotenv
from loguru import logger
import psycopg2
from twilio.rest import Client
import pytz
from dateutil.parser import parse

load_dotenv()

class RetellDebtCollector:
    def __init__(self):
        self.api_key = os.getenv("RETELL_API_KEY")
        self.from_number = os.getenv("RETELL_FROM_NUMBER")
        if not self.api_key or not self.from_number:
            raise ValueError("RETELL_API_KEY and RETELL_FROM_NUMBER must be set in .env")
        self.client = Retell(api_key=self.api_key)
        self.twilio_sid = os.getenv("TWILIO_SID")
        self.twilio_auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        self.twilio_phone = os.getenv("TWILIO_PHONE_NUMBER")
        
        # Load agent and workflow IDs from environment variables
        self.debt_collection_agent_id = os.getenv("RETELL_DEBT_COLLECTION_AGENT_ID")
        self.payment_reminder_agent_id = os.getenv("RETELL_PAYMENT_REMINDER_AGENT_ID")
        self.payment_reminder_workflow_id = os.getenv("RETELL_PAYMENT_REMINDER_WORKFLOW_ID")
        self.follow_up_agent_id = os.getenv("RETELL_FOLLOW_UP_AGENT_ID")
        self.follow_up_workflow_id = os.getenv("RETELL_FOLLOW_UP_WORKFLOW_ID")
        self.customer_service_agent_id = os.getenv("RETELL_CUSTOMER_SERVICE_AGENT_ID")
        self.customer_service_workflow_id = os.getenv("RETELL_CUSTOMER_SERVICE_WORKFLOW_ID")
        
        self.db_config = {
            "dbname": os.getenv("DB_NAME", "debt_collection"),
            "user": os.getenv("DB_USER", "user"),
            "password": os.getenv("DB_PASSWORD", "password"),
            "host": os.getenv("DB_HOST", "localhost")
        }
        self.api_url = "https://your-fastapi-domain.com"  # Replace with your FastAPI URL

    def is_tcp_compliant(self, phone: str) -> bool:
        now = datetime.datetime.now(pytz.timezone("US/Mountain"))
        hour = now.hour
        return 8 <= hour < 21

    def make_outbound_call_with_agent(self, contact_name: str, contact_number: str, resident_id: str, 
                           facility_name: str, resident_fname: str, resident_lname: str, 
                           balance: float, due_date: str, payer_desc: str, 
                           agent_id: Optional[str] = None, 
                           workflow_id: Optional[str] = None,
                           agent_version: Optional[int] = None) -> Dict[str, Any]:
        """
        Make an outbound call via Retell with dynamic variables and optional agent/workflow override.

        Args:
            contact_name: Pronunciation of contact's name for STT
            contact_number: Contact's phone number
            resident_id: Unique resident identifier
            facility_name: Facility name
            resident_fname: Resident's first name
            resident_lname: Resident's last name
            balance: Outstanding balance
            due_date: Payment due date
            payer_desc: Payer description
            agent_id: Optional agent ID to override default agent
            workflow_id: Optional workflow ID to override default workflow
            agent_version: Optional agent version to use

        Returns:
            Dict with call status and call_id
        """
        # if not self.is_tcp_compliant(contact_number):
        #     logger.error("Call blocked: Not TCPA compliant")
        #     return {"status": 403, "error": "Not TCPA compliant"}

        dynamic_variables = {
            "resident_id": str(resident_id),
            "resident_name": f"{resident_fname} {resident_lname}",
            "contact_name": contact_name,
            "facility_name": facility_name,
            "balance": str(balance),
            "due_date": due_date,
            "payer_desc": payer_desc
        }

        try:
            call_params = {
                "from_number": self.from_number,
                "to_number": contact_number,
                "retell_llm_dynamic_variables": dynamic_variables
            }
            
            # Apply agent/workflow override if provided
            if agent_id:
                call_params["override_agent_id"] = agent_id
                if agent_version:
                    call_params["override_agent_version"] = agent_version
                logger.info(f"Using override agent: {agent_id}")
            elif workflow_id:
                call_params["override_workflow_id"] = workflow_id
                logger.info(f"Using override workflow: {workflow_id}")

            phone_call_response = self.client.call.create_phone_call(**call_params)
            call_id = phone_call_response.call_id
            logger.success(f"Call initiated: {call_id}")
            return {"status": 200, "call_id": call_id}
        except Exception as e:
            logger.error(f"Call initiation failed: {e}")
            return {"status": 500, "error": str(e)}

    def make_outbound_call(self, contact_name: str, contact_number: str, resident_id: str, 
                           facility_name: str, resident_fname: str, resident_lname: str, 
                           balance: float, due_date: str, payer_desc: str) -> Dict[str, Any]:
        """
        Make an outbound call via Retell with default debt collection agent.
        This maintains backward compatibility with existing code.
        """
        return self.make_outbound_call_with_agent(
            contact_name=contact_name,
            contact_number=contact_number,
            resident_id=resident_id,
            facility_name=facility_name,
            resident_fname=resident_fname,
            resident_lname=resident_lname,
            balance=balance,
            due_date=due_date,
            payer_desc=payer_desc,
            agent_id=self.debt_collection_agent_id
        )

    def get_call_details(self, call_id: str) -> Optional[Dict[str, Any]]:
        try:
            response = self.client.call.retrieve(call_id)
            return {
                "call_id": response.call_id,
                "transcript": getattr(response, "transcript", None),
                "call_analysis": getattr(response, "call_analysis", None),
                "recording_url": getattr(response, "recording_url", None),
                "call_cost": getattr(response, "call_cost", None)
            }
        except Exception as e:
            logger.error(f"Failed to fetch call details: {e}")
            return None

    def get_transcript(self, call_data: Dict[str, Any]) -> Optional[str]:
        return call_data.get("transcript")

    def get_analysis(self, call_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        return call_data.get("call_analysis")

    def get_recording_url(self, call_data: Dict[str, Any]) -> Optional[str]:
        return call_data.get("recording_url")

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

    def run_call_with_specific_agent(self, agent_id: Optional[str] = None, 
                                    workflow_id: Optional[str] = None,
                                    agent_version: Optional[int] = None,
                                    **call_params) -> Dict[str, Any]:
        """
        Run a complete call flow with a specific agent or workflow.
        
        Args:
            agent_id: The specific agent ID to use for this call
            workflow_id: The specific workflow ID to use for this call
            agent_version: Optional agent version to use
            **call_params: All other parameters needed for the call
                (contact_fname, contact_lname, contact_name_pronunciation, 
                contact_number, resident_fname, resident_lname, resident_id,
                resident_dob, balance, due_date, facility_name, payer_desc)
        
        Returns:
            Dict with call status and details
        """
        try:
            dob_date = parse(call_params.get("resident_dob", ""), fuzzy=True).strftime("%Y-%m-%d")
        except (ValueError, TypeError):
            logger.error(f"Invalid DOB format: {call_params.get('resident_dob')}")
            return {"status": 400, "error": "Invalid DOB format"}
        
        contact_name = call_params.get("contact_name_pronunciation") or call_params.get("contact_lname", "")
        
        result = self.make_outbound_call_with_agent(
            contact_name=call_params.get("contact_name_pronunciation", ""),
            contact_number=call_params.get("contact_number", ""),
            resident_id=call_params.get("resident_id", ""),
            facility_name=call_params.get("facility_name", ""),
            resident_fname=call_params.get("resident_fname", ""),
            resident_lname=call_params.get("resident_lname", ""),
            balance=call_params.get("balance", 0.0),
            due_date=call_params.get("due_date", ""),
            payer_desc=call_params.get("payer_desc", ""),
            agent_id=agent_id,
            workflow_id=workflow_id,
            agent_version=agent_version
        )
        
        if result["status"] != 200:
            logger.error("Call initiation failed.")
            return result

        call_id = result["call_id"]
        logger.info("Waiting for call to complete...")
        import time
        time.sleep(10)  # Temporary polling for PoC

        details = self.get_call_details(call_id)
        if not details:
            logger.error("Failed to retrieve call details")
            return {"status": 500, "error": "Failed to retrieve call details"}

        transcript = self.get_transcript(details)
        analysis = self.get_analysis(details)
        recording_url = self.get_recording_url(details)
        cost = details.get("call_cost").combined_cost if details.get("call_cost") else 0.0

        logger.info(f"[Transcript]: {transcript}")
        logger.info(f"[Analysis]: {analysis}")
        logger.info(f"[Recording URL]: {recording_url}")

        self.log_call_to_db(call_id, call_params.get("contact_number", ""), cost, transcript)
        
        return {
            "status": 200,
            "call_id": call_id,
            "transcript": transcript,
            "analysis": analysis,
            "recording_url": recording_url,
            "cost": cost
        }

    def run_full_call_flow(self, contact_fname: str, contact_lname: str, contact_name_pronunciation: str, 
                           contact_number: str, resident_fname: str, resident_lname: str, 
                           resident_id: str, resident_dob: str, balance: float, due_date: str, 
                           facility_name: str, payer_desc: str):
        """
        Initiate a debt collection call with contact and resident details.
        Uses the default debt collection agent for backward compatibility.
        """
        return self.run_call_with_specific_agent(
            agent_id=self.debt_collection_agent_id,
            contact_fname=contact_fname,
            contact_lname=contact_lname,
            contact_name_pronunciation=contact_name_pronunciation,
            contact_number=contact_number,
            resident_fname=resident_fname,
            resident_lname=resident_lname,
            resident_id=resident_id,
            resident_dob=resident_dob,
            balance=balance,
            due_date=due_date,
            facility_name=facility_name,
            payer_desc=payer_desc
        )

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

if __name__ == "__main__":
    collector = RetellDebtCollector()
    
    # Example 1: Using default debt collection agent (backward compatible)
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
    
    # Example 2: Using customer service agent
    # collector.run_call_with_specific_agent(
    #     agent_id=collector.customer_service_agent_id,
    #     contact_fname="Ratul",
    #     contact_lname="Alahy",
    #     contact_name_pronunciation="Rah-Tool",
    #     contact_number="+15754181944",
    #     resident_fname="Liam",
    #     resident_lname="Johnson",
    #     resident_id="600999",
    #     resident_dob="25 March, 1986",
    #     balance=40.26,
    #     due_date="May Thirty-One",
    #     facility_name="Highland Manor of Elko Rehabilitation- SNF",
    #     payer_desc="Medicaid Co-Insurance"
    # )
    
    # # Example 3: Using payment reminder workflow
    # collector.run_call_with_specific_agent(
    #     workflow_id=collector.payment_reminder_workflow_id,
    #     contact_fname="Ratul",
    #     contact_lname="Alahy",
    #     contact_name_pronunciation="Rah-Tool",
    #     contact_number="+15754181944",
    #     resident_fname="Liam",
    #     resident_lname="Johnson",
    #     resident_id="600999",
    #     resident_dob="25 March, 1986",
    #     balance=40.26,
    #     due_date="May Thirty-One",
    #     facility_name="Highland Manor of Elko Rehabilitation- SNF",
    #     payer_desc="Medicaid Co-Insurance"
    # )