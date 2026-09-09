import os
from dotenv import load_dotenv

# Load .env if present
load_dotenv()


class Settings:
    """Backend environment settings."""

    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "").strip()
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash").strip()
    HOST: str = os.getenv("HOST", "0.0.0.0").strip()
    PORT: int = int(os.getenv("PORT", "8000"))

    # CORS settings: parse comma-separated origins, default to local dev origins
    raw_cors = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173",
    )
    if raw_cors.strip() == "*":
        CORS_ORIGINS: list[str] = ["*"]
    else:
        CORS_ORIGINS: list[str] = [
            origin.strip() for origin in raw_cors.split(",") if origin.strip()
        ]

    # Input length limits
    MAX_TEXT_LENGTH: int = int(os.getenv("MAX_TEXT_LENGTH", "10000"))
    MIN_TEXT_LENGTH: int = int(os.getenv("MIN_TEXT_LENGTH", "5"))

    @property
    def is_ai_configured(self) -> bool:
        return bool(self.GEMINI_API_KEY)


settings = Settings()
