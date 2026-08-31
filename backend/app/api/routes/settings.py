from fastapi import APIRouter
from pydantic import BaseModel
from app.core.config import settings

router = APIRouter()

class SettingsUpdate(BaseModel):
    amount_tolerance: float = 0.01
    date_window_days: int = 3
    default_gst_rate: float = 0.18
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"

@router.get("")
def get_settings():
    return {
        "amount_tolerance": settings.AMOUNT_TOLERANCE,
        "date_window_days": settings.DATE_WINDOW_DAYS,
        "default_gst_rate": settings.DEFAULT_GST_RATE,
        "has_gemini_key": bool(settings.GEMINI_API_KEY and len(settings.GEMINI_API_KEY) > 5),
        "gemini_model": settings.GEMINI_MODEL
    }

@router.post("")
def update_settings(payload: SettingsUpdate):
    settings.AMOUNT_TOLERANCE = payload.amount_tolerance
    settings.DATE_WINDOW_DAYS = payload.date_window_days
    settings.DEFAULT_GST_RATE = payload.default_gst_rate
    if payload.gemini_api_key:
        settings.GEMINI_API_KEY = payload.gemini_api_key
    if payload.gemini_model:
        settings.GEMINI_MODEL = payload.gemini_model
    return {
        "status": "success",
        "message": "Settings updated successfully",
        "settings": {
            "amount_tolerance": settings.AMOUNT_TOLERANCE,
            "date_window_days": settings.DATE_WINDOW_DAYS,
            "default_gst_rate": settings.DEFAULT_GST_RATE,
            "has_gemini_key": bool(settings.GEMINI_API_KEY and len(settings.GEMINI_API_KEY) > 5),
            "gemini_model": settings.GEMINI_MODEL
        }
    }
