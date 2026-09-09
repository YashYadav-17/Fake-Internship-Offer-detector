"""
Backend service adapter delegating to the core AI/ML analyzer.
Maintains full backward compatibility with all existing backend routes and tests.
"""
from aiml.analyzer import (
    OfferAnalyzer,
    analyzer,
    DEFAULT_SAFE_ACTIONS,
    DEFAULT_SUSPICIOUS_ACTIONS,
    DEFAULT_HIGH_RISK_ACTIONS,
)

__all__ = [
    "OfferAnalyzer",
    "analyzer",
    "DEFAULT_SAFE_ACTIONS",
    "DEFAULT_SUSPICIOUS_ACTIONS",
    "DEFAULT_HIGH_RISK_ACTIONS",
]
