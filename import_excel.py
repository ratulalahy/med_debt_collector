# Updated on July 1, 2025
# This is updated code for excel proxy import part of poc

import pandas as pd
import psycopg2
from loguru import logger
from dotenv import load_dotenv
import os

load_dotenv()

db_config = {
    "dbname": os.getenv("DB_NAME", "debt_collection"),
    "user": os.getenv("DB_USER", "user"),
    "password": os.getenv("DB_PASSWORD", "password"),
    "host": os.getenv("DB_HOST", "localhost")
}

def import_excel_to_db(file_path: str):
    try:
        df = pd.read_excel(file_path)
        conn = psycopg2.connect(**db_config)
        cur = conn.cursor()
        for _, row in df.iterrows():
            cur.execute("""
                INSERT INTO patients (
                    resident_id, resident_first_name, resident_last_name, contact_first_name, contact_last_name,
                    contact_number, date_of_birth, balance, due_date, facility_name, facility_code, payer_desc
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (resident_id) DO UPDATE SET
                    resident_first_name = EXCLUDED.resident_first_name,
                    resident_last_name = EXCLUDED.resident_last_name,
                    contact_first_name = EXCLUDED.contact_first_name,
                    contact_last_name = EXCLUDED.contact_last_name,
                    contact_number = EXCLUDED.contact_number,
                    date_of_birth = EXCLUDED.date_of_birth,
                    balance = EXCLUDED.balance,
                    due_date = EXCLUDED.due_date,
                    facility_name = EXCLUDED.facility_name,
                    facility_code = EXCLUDED.facility_code,
                    payer_desc = EXCLUDED.payer_desc
            """, (
                row["Resident ID"],
                row["Resident First Name"],
                row["Resident Last Name"],
                row["Contact First Name"],
                row["Contact Last Name"],
                str(row["Contact Number"]),
                row["Date of Birth"] if pd.notna(row["Date of Birth"]) else None,
                row["Total"],
                row["As Of Date"],
                row["Facility Name"],
                row["Facility Code"],
                row["Payer Desc"]
            ))
        conn.commit()
        cur.close()
        conn.close()
        logger.info("Excel data imported successfully")
    except Exception as e:
        logger.error(f"Excel import failed: {e}")
        raise

if __name__ == "__main__":
    import_excel_to_db("patients.xlsx")