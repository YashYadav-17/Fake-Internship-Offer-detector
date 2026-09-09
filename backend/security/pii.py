import re

# Explainable regex patterns for lightweight PII redaction
EMAIL_PATTERN = re.compile(
    r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b"
)

# Indian PAN format: 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F)
PAN_PATTERN = re.compile(
    r"\b[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}\b"
)

# Indian Aadhaar format: 12 digits (e.g. 2345 6789 0123 or 2345-6789-0123)
AADHAAR_PATTERN = re.compile(
    r"\b[2-9]\d{3}[\s-]\d{4}[\s-]\d{4}\b"
)

# Phone numbers: +91 9876543210, +91-98765-43210, 9876543210, +1 (555) 123-4567, etc.
# Carefully crafted to avoid masking standalone amounts like 20,000 or years like 2026.
PHONE_PATTERN = re.compile(
    r"(?:\+91[\s.-]?)?[6-9]\d{4}[\s.-]?\d{5}\b"  # Indian 10-digit mobile numbers with optional +91
    r"|(?:\+?\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b"  # US/Intl formatted numbers
    r"|\+\d{1,3}[\s.-]?\d{9,12}\b"  # Generic international phone with country prefix
)


def mask_pii(text: str) -> str:
    """
    Lightweight, explainable redaction of common PII (email, phone, PAN, Aadhaar).
    
    This provides baseline privacy protection before sending untrusted offer text 
    to external LLM providers. Note: This is lightweight heuristic masking, 
    not certified complete PII detection.
    """
    if not text:
        return text

    masked = text

    # Redact Emails
    masked = EMAIL_PATTERN.sub("[EMAIL_REDACTED]", masked)

    # Redact PAN Cards
    masked = PAN_PATTERN.sub("[PAN_REDACTED]", masked)

    # Redact Aadhaar Numbers
    masked = AADHAAR_PATTERN.sub("[AADHAAR_REDACTED]", masked)

    # Redact Phone Numbers
    masked = PHONE_PATTERN.sub("[PHONE_REDACTED]", masked)

    return masked
