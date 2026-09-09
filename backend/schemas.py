from enum import Enum
from typing import List
from pydantic import BaseModel, Field, field_validator
from backend.config import settings


class RiskLevel(str, Enum):
    """Scam risk evaluation levels."""
    SAFE = "SAFE"
    SUSPICIOUS = "SUSPICIOUS"
    HIGH_RISK = "HIGH_RISK"


class SeverityLevel(str, Enum):
    """Severity of a detected scam indicator."""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class Indicator(BaseModel):
    """Individual warning sign or contextual signal found in offer text."""
    type: str = Field(
        ...,
        description="Category of indicator (e.g., PAYMENT_REQUEST, NO_INTERVIEW_SELECTION, ARTIFICIAL_URGENCY)",
        examples=["PAYMENT_REQUEST"]
    )
    severity: SeverityLevel = Field(
        ...,
        description="Severity level of the indicator",
        examples=[SeverityLevel.HIGH]
    )
    evidence: str = Field(
        ...,
        description="Exact quote or contextual snippet from the text supporting this indicator",
        examples=["Pay ₹20,000 security fees today"]
    )


class AnalyzeRequest(BaseModel):
    """Input payload for offer analysis."""
    text: str = Field(
        ...,
        description="Raw plain text of the internship/job offer received by the student",
        examples=["You are selected without interview. Pay ₹20,000 security fees today."]
    )

    @field_validator("text")
    @classmethod
    def validate_text(cls, v: str) -> str:
        if not isinstance(v, str):
            raise ValueError("Offer text must be a valid string.")
        cleaned = v.strip()
        if not cleaned:
            raise ValueError("Offer text cannot be empty or whitespace only.")
        if len(cleaned) < settings.MIN_TEXT_LENGTH:
            raise ValueError(
                f"Offer text is too short to analyze (minimum {settings.MIN_TEXT_LENGTH} characters required)."
            )
        if len(cleaned) > settings.MAX_TEXT_LENGTH:
            raise ValueError(
                f"Offer text exceeds maximum limit of {settings.MAX_TEXT_LENGTH} characters."
            )
        return cleaned


class AnalyzeResponse(BaseModel):
    """Normalized output returned to the frontend."""
    risk: RiskLevel = Field(
        ...,
        description="Overall assessment of the offer: SAFE, SUSPICIOUS, or HIGH_RISK",
        examples=[RiskLevel.HIGH_RISK]
    )
    indicators: List[Indicator] = Field(
        default_factory=list,
        description="List of detected red flags and contextual warning signs"
    )
    explanation: str = Field(
        ...,
        description="Short, objective explanation based strictly on the provided text.",
        examples=["The message requests an upfront payment and creates immediate pressure."]
    )
    next_actions: List[str] = Field(
        default_factory=list,
        description="Actionable, safe next steps for the student",
        examples=[
            "Do not pay any money",
            "Verify the official company domain",
            "Contact your college placement cell"
        ]
    )


class HealthResponse(BaseModel):
    """Health check status payload."""
    status: str = "ok"
    version: str = "1.0.0"
    ai_configured: bool = False
