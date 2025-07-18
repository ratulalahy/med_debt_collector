import os

from fastapi import FastAPI, HTTPException
from loguru import logger
import psycopg2
from psycopg2.extras import RealDictCursor

# -- configure your DB connection via environment variables --
db_config = {
    "host":     os.getenv("DB_HOST", "localhost"),
    "port":     int(os.getenv("DB_PORT", 5432)),
    "user":     os.getenv("DB_USER", "your_user"),
    "password": os.getenv("DB_PASSWORD", "your_pass"),
    "dbname":   os.getenv("DB_NAME", "your_dbname"),
}


def get_db_connection():
    """
    Returns a new psycopg2 connection using RealDictCursor so rows come back as dicts.
    Context managers will auto-close.
    """
    return psycopg2.connect(**db_config, cursor_factory=RealDictCursor)


def add_dashboard_endpoints(app: FastAPI):
    @app.get("/call_logs")
    def get_call_logs():
        try:
            with get_db_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        """
                        SELECT call_id, phone, type, cost, created_at
                          FROM call_logs
                         ORDER BY created_at DESC
                         LIMIT 100
                        """
                    )
                    return cur.fetchall()
        except Exception as e:
            logger.error(f"Failed to fetch call logs: {e}")
            raise HTTPException(status_code=500, detail="Database error")

    @app.get("/reminders")
    def get_reminders():
        try:
            with get_db_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        """
                        SELECT reminder_id, patient_name, reminder_type,
                               schedule_time, created_at
                          FROM reminders
                         ORDER BY created_at DESC
                         LIMIT 100
                        """
                    )
                    return cur.fetchall()
        except Exception as e:
            logger.error(f"Failed to fetch reminders: {e}")
            raise HTTPException(status_code=500, detail="Database error")

    @app.get("/payments")
    def get_payments():
        try:
            with get_db_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        """
                        SELECT payment_id, patient_id, amount,
                               payment_method, payment_date
                          FROM payments
                         ORDER BY payment_date DESC
                         LIMIT 100
                        """
                    )
                    return cur.fetchall()
        except Exception as e:
            logger.error(f"Failed to fetch payments: {e}")
            raise HTTPException(status_code=500, detail="Database error")


if __name__ == "__main__":
    app = FastAPI()
    add_dashboard_endpoints(app)
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
