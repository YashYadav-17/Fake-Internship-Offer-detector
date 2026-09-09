"""
Backend service adapter delegating to the core AI/ML Gemini service.
Maintains full backward compatibility with all existing backend routes and tests.
"""
from aiml.gemini_service import (
    GeminiService,
    gemini_service,
    SYSTEM_INSTRUCTION,
    GEMINI_API_BASE_URL,
)

__all__ = [
    "GeminiService",
    "gemini_service",
    "SYSTEM_INSTRUCTION",
    "GEMINI_API_BASE_URL",
]
