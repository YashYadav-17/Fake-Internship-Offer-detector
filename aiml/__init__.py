"""
OfferShield AI/ML Module.

Explainable AI risk-analysis engine for detecting fraudulent internship and job offers.
Combines deterministic security heuristics with Google Gemini contextual NLP reasoning.
"""

from aiml.analyzer import (
    OfferAnalyzer,
    analyzer,
    DEFAULT_SAFE_ACTIONS,
    DEFAULT_SUSPICIOUS_ACTIONS,
    DEFAULT_HIGH_RISK_ACTIONS,
)
from aiml.gemini_service import GeminiService, gemini_service, SYSTEM_INSTRUCTION
from aiml.fraud_rules import (
    RULES_CONFIG,
    NEGATION_FEE_PATTERN,
    extract_deterministic_indicators,
)
from aiml.pii import mask_pii

__all__ = [
    "OfferAnalyzer",
    "analyzer",
    "GeminiService",
    "gemini_service",
    "SYSTEM_INSTRUCTION",
    "RULES_CONFIG",
    "NEGATION_FEE_PATTERN",
    "extract_deterministic_indicators",
    "mask_pii",
    "DEFAULT_SAFE_ACTIONS",
    "DEFAULT_SUSPICIOUS_ACTIONS",
    "DEFAULT_HIGH_RISK_ACTIONS",
]
