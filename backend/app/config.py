"""
Application configuration — loads from environment variables via .env file.
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """All configuration is loaded from environment variables or .env file."""

    # ── JWT ──
    JWT_SECRET_KEY: str = "CHANGE-ME-IN-PRODUCTION"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # ── Firebase ──
    FIREBASE_SERVICE_ACCOUNT_PATH: str = "serviceAccountKey.json"

    # ── Docker Sandbox ──
    SANDBOX_IMAGE: str = "reinforce-ml-sandbox:latest"
    SANDBOX_TIMEOUT: int = 60  # seconds
    SANDBOX_MEMORY_LIMIT: str = "1g"
    SANDBOX_CPU_LIMIT: float = 1.0
    MAX_CONCURRENT_CONTAINERS: int = 4

    # ── CORS ──
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
