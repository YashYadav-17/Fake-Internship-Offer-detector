import re
from typing import List
from backend.schemas import Indicator, SeverityLevel

# Negation pattern to prevent false alarms on phrases like "There is no registration fee"
NEGATION_FEE_PATTERN = re.compile(
    r"\b(?:no|without\s+any|never\s+charge|zero|don't\s+pay|do\s+not\s+pay)\s+(?:registration|security|processing|training|hidden)?\s*(?:fee|fees|deposit|charge|charges|payment)\b",
    re.IGNORECASE
)

# Deterministic Scam Rule Definitions
RULES_CONFIG = [
    {
        "type": "PAYMENT_REQUEST",
        "severity": SeverityLevel.HIGH,
        "patterns": [
            r"\b(?:pay|deposit|transfer|send)\s+(?:₹|rs\.?|inr|\$)?\s*\d+[\d,]*\b.*?(?:fee|fees|deposit|charge|security|letter|registration)?",
            r"\b(?:registration|security|processing|documentation|training|onboarding|equipment|laptop|verification)\s*(?:fee|fees|deposit|charge|charges|amount|cost)\b",
            r"\b(?:upfront|advance)\s+payment\b",
            r"\brefundable\s+(?:deposit|fee|security|amount)\b",
            r"\bpay\s+(?:₹|rs\.?|inr|\$)\s*\d+[\d,]*\b",
        ],
        "check_negation": True
    },
    {
        "type": "RECRUITMENT_ANOMALY",
        "severity": SeverityLevel.HIGH,
        "patterns": [
            r"\bselect(?:ed)?\s+(?:directly\s+)?without\s+(?:any\s+)?(?:interview|test|assessment|screening|exam|rounds?)\b",
            r"\bdirect\s+(?:selection|joining|offer|appointment|hiring)\s+without\s+(?:interview|test|assessment)\b",
            r"\bno\s+interview\s+(?:required|needed|conducted)\b",
            r"\bguaranteed\s+(?:selection|placement|job|offer|internship)\b",
        ],
        "check_negation": False
    },
    {
        "type": "NO_INTERVIEW_SELECTION",
        "severity": SeverityLevel.HIGH,
        "patterns": [
            r"\bselect(?:ed)?\s+(?:directly\s+)?without\s+(?:any\s+)?(?:interview|test|assessment|screening|exam|rounds?)\b",
            r"\bdirect\s+(?:selection|joining|offer|appointment|hiring)\s+without\s+(?:interview|test|assessment)\b",
            r"\bno\s+interview\s+(?:required|needed|conducted)\b",
        ],
        "check_negation": False
    },
    {
        "type": "SENSITIVE_INFORMATION",
        "severity": SeverityLevel.HIGH,
        "patterns": [
            r"\b(?:send|submit|provide|share|upload|forward|give)\s+(?:your\s+)?(?:pan|\[pan_redacted\]|aadhaar|aadhar|\[aadhaar_redacted\]|bank\s+account|bank\s+details|passbook|card\s+details|debit\s+card)\b",
            r"\b(?:pan|aadhaar|aadhar)\s+(?:and|,)?\s*(?:bank\s+account|bank\s+details)\b",
            r"\b(?:bank\s+account\s+details|netbanking\s+password|banking\s+credentials)\b",
            r"\b(?:send|provide|share)\s+(?:your\s+)?(?:pan|aadhaar|aadhar)\b",
            r"\b(?:bank\s+)?(?:password|pin|otp|cvv|netbanking\s+password)\b",
        ],
        "check_negation": False
    },
    {
        "type": "SUSPICIOUS_DOCUMENT_REQUEST",
        "severity": SeverityLevel.HIGH,
        "patterns": [
            r"\b(?:bank\s+)?(?:password|pin|otp|cvv|netbanking\s+password)\b",
            r"\b(?:original|physical)\s+(?:certificate|degree|mark\s*sheet|passport)s?\s+(?:submission|deposit|courier|surrender|submit)\b",
            r"\bdebit\s+card\s+pin\b",
        ],
        "check_negation": False
    },
    {
        "type": "ARTIFICIAL_URGENCY",
        "severity": SeverityLevel.MEDIUM,
        "patterns": [
            r"\b(?:pay|deposit|transfer|send|fee|fees|amount)\b[^\.\n]{0,60}\b(?:today|immediately|urgently)\b",
            r"\b(?:pay|transfer|confirm|accept|reply)\s+(?:today|immediately|urgently|within\s+\d+\s*(?:hour|min|hr|day)s?|before\s+\d+\s*(?:am|pm)|by\s+\d+\s*(?:am|pm)\s*today|before\s+(?:friday|monday|tuesday|wednesday|thursday|saturday|sunday))\b",
            r"\b(?:within|in)\s+(?:1|2|24|48)\s*hours?\b",
            r"\blast\s+chance\s+to\s+(?:confirm|claim|pay|register)\b",
            r"\bconfirm\s+(?:your\s+)?(?:availability|acceptance|slot)\s+by\s+\d+\s*(?:am|pm)\b",
            r"\boffer\s+expires\s+(?:today|in\s+\d+\s*(?:hour|min|hr)s?)\b"
        ],
        "check_negation": False
    },
    {
        "type": "INFORMAL_COMMUNICATION",
        "severity": SeverityLevel.MEDIUM,
        "patterns": [
            r"\b(?:telegram|whatsapp)\s+only\b",
            r"\bcontact\s+(?:only\s+)?(?:on|via|through)\s+(?:telegram|whatsapp)\b",
            r"\bdm\s+(?:on|via)\s+(?:telegram|whatsapp)\b",
            r"\bt\.me\/[a-zA-Z0-9_]+\b",
        ],
        "check_negation": False
    }
]


def extract_deterministic_indicators(text: str) -> List[Indicator]:
    """
    Run fast deterministic heuristics over offer text to detect obvious scam indicators.
    Returns structured Indicator objects with exact textual evidence snippets.
    """
    if not text:
        return []

    indicators: List[Indicator] = []
    seen_types = set()

    for rule in RULES_CONFIG:
        rule_type = rule["type"]
        severity = rule["severity"]
        check_negation = rule["check_negation"]

        # Check for negation if rule requires it (e.g. "There is no registration fee")
        if check_negation:
            negation_matches = list(NEGATION_FEE_PATTERN.finditer(text))
        else:
            negation_matches = []

        for pattern_str in rule["patterns"]:
            pattern = re.compile(pattern_str, re.IGNORECASE)
            for match in pattern.finditer(text):
                start, end = match.span()

                # If negation covers or overlaps this match, skip it
                is_negated = False
                if check_negation:
                    for neg in negation_matches:
                        neg_start, neg_end = neg.span()
                        if not (end <= neg_start or start >= neg_end):
                            is_negated = True
                            break

                if is_negated:
                    continue

                # Extract context snippet for clear evidence
                evidence = match.group(0).strip()
                
                # Expand slightly to capture the local phrase if very short
                snippet_start = max(0, start - 15)
                snippet_end = min(len(text), end + 25)
                context_sentence = text[snippet_start:snippet_end].strip()
                
                if len(context_sentence) > len(evidence):
                    clean_evidence = f"...{context_sentence}..."
                else:
                    clean_evidence = evidence

                if rule_type not in seen_types:
                    indicators.append(
                        Indicator(
                            type=rule_type,
                            severity=severity,
                            evidence=clean_evidence
                        )
                    )
                    seen_types.add(rule_type)
                    break  # avoid multiple duplicates of the exact same rule type

    return indicators
