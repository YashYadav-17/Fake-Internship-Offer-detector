"""
Backend rules adapter delegating to the core AI/ML fraud rules.
Maintains full backward compatibility with all existing backend routes and tests.
"""
from aiml.fraud_rules import (
    RULES_CONFIG,
    NEGATION_FEE_PATTERN,
    extract_deterministic_indicators,
)

__all__ = ["RULES_CONFIG", "NEGATION_FEE_PATTERN", "extract_deterministic_indicators"]
