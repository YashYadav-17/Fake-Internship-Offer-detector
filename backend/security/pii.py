"""
Backend security adapter delegating to the core AI/ML PII redactor.
Maintains full backward compatibility with all existing backend routes and tests.
"""
from aiml.pii import (
    EMAIL_PATTERN,
    PAN_PATTERN,
    AADHAAR_PATTERN,
    PHONE_PATTERN,
    mask_pii,
)

__all__ = ["EMAIL_PATTERN", "PAN_PATTERN", "AADHAAR_PATTERN", "PHONE_PATTERN", "mask_pii"]
