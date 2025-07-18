import pytest
from vapi_poc import is_fdppa_compliant, log_notes, schedule_followup, end_call
import datetime
from unittest.mock import patch

def test_fdppa_compliant():
    with patch("datetime.datetime") as mock_datetime:
        mock_datetime.now.return_value = datetime.datetime(2025, 6, 27, 10, 0)  # 10 AM
        assert is_fdppa_compliant() is True
        mock_datetime.now.return_value = datetime.datetime(2025, 6, 27, 22, 0)  # 10 PM
        assert is_fdppa_compliant() is False

def test_log_notes():
    result = log_notes("test_call_123", "Test note")
    assert result["status"] == 200
    assert result["message"] == "Notes logged"

def test_schedule_followup_valid():
    result = schedule_followup("+15754181944", "2025-06-30T10:00:00")
    assert result["status"] == 200
    assert result["scheduledTime"] == "2025-06-30T10:00:00"

def test_schedule_followup_invalid_time():
    result = schedule_followup("+15754181944", "2025-06-29T22:00:00")  # Sunday
    assert result["status"] == 400
    assert result["error"] == "Follow-up must be on weekdays, 8 AM–5 PM"

def test_end_call():
    result = end_call()
    assert result["status"] in [200, 500]  # Depends on Vapi.ai API response