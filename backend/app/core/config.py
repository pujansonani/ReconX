import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional, List

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="allow")

    PROJECT_NAME: str = "ReconX"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "reconx-fintech-super-secure-secret-key-2026")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./reconx.db")
    
    # Financial reconciliation tolerances
    AMOUNT_TOLERANCE: float = float(os.getenv("AMOUNT_TOLERANCE", "0.01"))  # Up to ₹0.01 tolerance for rounding
    DATE_WINDOW_DAYS: int = int(os.getenv("DATE_WINDOW_DAYS", "3"))         # +/- 3 days window
    DEFAULT_GST_RATE: float = float(os.getenv("DEFAULT_GST_RATE", "0.18"))   # 18% GST on gateway fees
    
    # Google Gemini AI configuration
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY", None)
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    AI_FALLBACK_ENABLED: bool = True
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8000",
        "*"
    ]

settings = Settings()
