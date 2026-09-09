import logging
from typing import List
from backend.schemas import (
    AnalyzeResponse,
    Indicator,
    RiskLevel,
    SeverityLevel,
)
from backend.security.pii import mask_pii
from backend.rules.fraud_rules import extract_deterministic_indicators
from backend.services.gemini_service import GeminiService, gemini_service

logger = logging.getLogger("offershield.analyzer")

DEFAULT_SAFE_ACTIONS = [
    "Verify the company email domain matches their official corporate website",
    "Prepare for the scheduled technical interview or assessment",
    "Remember that legitimate employers never require payment for job offers",
]

DEFAULT_SUSPICIOUS_ACTIONS = [
    "Do not pay any money or share sensitive personal documents",
    "Contact the company's verified HR team directly via official website contacts",
    "Consult your college placement cell or career counselor for verification",
    "Request formal written job descriptions and official evaluation criteria",
]

DEFAULT_HIGH_RISK_ACTIONS = [
    "Do not pay any money under any circumstances",
    "Do not share bank credentials, passwords, OTPs, or original certificates",
    "Report the sender to your university placement cell and cybercrime authorities",
    "Block the sender and avoid further communication",
]


class OfferAnalyzer:
    """Orchestrator for offer scam analysis combining deterministic rules and Gemini AI."""

    def __init__(self, ai_service: GeminiService = gemini_service):
        self.ai_service = ai_service

    async def analyze(self, raw_text: str) -> AnalyzeResponse:
        """
        Execute full pipeline:
        1. PII Redaction
        2. Deterministic Rule Matching
        3. Gemini NLP Classification (with fallback)
        4. Synthesis, Evidence Grounding & Normalization
        """
        # Step 1: PII Masking
        masked_text = mask_pii(raw_text)

        # Step 2: Deterministic Fraud Rules
        rule_indicators: List[Indicator] = extract_deterministic_indicators(masked_text)
        has_high_rule = any(ind.severity == SeverityLevel.HIGH for ind in rule_indicators)
        has_payment_rule = any(ind.type == "PAYMENT_REQUEST" for ind in rule_indicators)
        has_sensitive_rule = any(
            ind.type in ("SENSITIVE_INFORMATION", "SUSPICIOUS_DOCUMENT_REQUEST")
            for ind in rule_indicators
        )
        has_medium_rule = any(ind.severity == SeverityLevel.MEDIUM for ind in rule_indicators)

        # Step 3: Call Gemini AI
        ai_data = await self.ai_service.analyze_offer(masked_text)

        # Step 4: Synthesize Results
        if ai_data:
            return self._synthesize_ai_response(
                ai_data=ai_data,
                rule_indicators=rule_indicators,
                has_high_rule=has_high_rule,
                has_payment_rule=has_payment_rule,
                has_sensitive_rule=has_sensitive_rule,
                has_medium_rule=has_medium_rule,
                raw_text=raw_text,
                masked_text=masked_text,
            )
        else:
            return self._build_deterministic_fallback_response(
                rule_indicators=rule_indicators,
                has_high_rule=has_high_rule,
                has_payment_rule=has_payment_rule,
                has_sensitive_rule=has_sensitive_rule,
                has_medium_rule=has_medium_rule,
                text=masked_text,
            )

    def _synthesize_ai_response(
        self,
        ai_data: dict,
        rule_indicators: List[Indicator],
        has_high_rule: bool,
        has_payment_rule: bool,
        has_sensitive_rule: bool,
        has_medium_rule: bool,
        raw_text: str,
        masked_text: str,
    ) -> AnalyzeResponse:
        """Combine Gemini output with deterministic rule invariants and evidence verification."""
        # Parse AI Risk
        raw_risk = str(ai_data.get("risk", "SUSPICIOUS")).upper()
        if raw_risk in ("SAFE", "SUSPICIOUS", "HIGH_RISK"):
            ai_risk = RiskLevel(raw_risk)
        else:
            ai_risk = RiskLevel.SUSPICIOUS

        # Parse and Ground AI Indicators
        combined_indicators: List[Indicator] = list(rule_indicators)
        seen_types = {ind.type for ind in rule_indicators}

        raw_indicators = ai_data.get("indicators", [])
        if isinstance(raw_indicators, list):
            for item in raw_indicators:
                if isinstance(item, dict):
                    ind_type = str(item.get("type", "CONTEXTUAL_LANGUAGE")).upper().strip()
                    raw_sev = str(item.get("severity", "MEDIUM")).upper().strip()
                    sev = (
                        SeverityLevel(raw_sev)
                        if raw_sev in ("LOW", "MEDIUM", "HIGH")
                        else SeverityLevel.MEDIUM
                    )
                    evidence = str(item.get("evidence", "")).strip()

                    # Hallucination check: evidence must be non-empty and present in text
                    if not evidence or len(evidence) < 2:
                        continue
                    if not self._is_evidence_grounded(evidence, raw_text, masked_text):
                        logger.warning(
                            "Filtered ungrounded AI indicator '%s' with evidence: %s",
                            ind_type,
                            evidence,
                        )
                        continue

                    if ind_type not in seen_types:
                        combined_indicators.append(
                            Indicator(type=ind_type, severity=sev, evidence=evidence)
                        )
                        seen_types.add(ind_type)

        # INVARIANT: Deterministic high severity / payment / sensitive info rules MUST override optimistic AI classifications
        if has_payment_rule or has_sensitive_rule or has_high_rule:
            final_risk = RiskLevel.HIGH_RISK
        elif has_medium_rule and ai_risk == RiskLevel.SAFE:
            final_risk = RiskLevel.SUSPICIOUS
        elif self._is_insufficient_or_vague(raw_text) and ai_risk == RiskLevel.SAFE:
            final_risk = RiskLevel.SUSPICIOUS
        elif ai_risk == RiskLevel.HIGH_RISK:
            final_risk = RiskLevel.HIGH_RISK
        elif ai_risk == RiskLevel.SUSPICIOUS:
            final_risk = RiskLevel.SUSPICIOUS
        else:
            final_risk = RiskLevel.SAFE

        # Explanation
        ai_explanation = str(ai_data.get("explanation", "")).strip()
        if not ai_explanation:
            ai_explanation = self._generate_fallback_explanation(final_risk, combined_indicators)
        else:
            ai_explanation = self._sanitize_explanation(ai_explanation, final_risk)

        # Actions
        raw_actions = ai_data.get("next_actions", [])
        if isinstance(raw_actions, list) and len(raw_actions) > 0:
            next_actions = [str(a).strip() for a in raw_actions if str(a).strip()]
        else:
            next_actions = self._get_default_actions(final_risk)

        return AnalyzeResponse(
            risk=final_risk,
            indicators=combined_indicators,
            explanation=ai_explanation,
            next_actions=next_actions,
        )

    def _is_evidence_grounded(self, evidence: str, raw_text: str, masked_text: str) -> bool:
        """Verify that AI-cited evidence corresponds to text present in the offer."""
        if not evidence or len(evidence.strip()) < 2:
            return False

        import re
        snippet = re.sub(r"^[\.\s\"'’\–\-]+|[\.\s\"'’\–\-]+$", "", evidence).strip().lower()
        if not snippet:
            return False

        raw_lower = raw_text.lower()
        masked_lower = masked_text.lower()

        # Direct substring check
        if snippet in raw_lower or snippet in masked_lower:
            return True

        # Multi-word token overlap check for quotes with slight truncation
        tokens = [t for t in re.findall(r"\b\w{3,}\b", snippet)]
        if not tokens:
            return any(part in raw_lower for part in snippet.split())

        matched_tokens = sum(1 for t in tokens if t in raw_lower or t in masked_lower)
        return (matched_tokens / len(tokens)) >= 0.65

    def _sanitize_explanation(self, explanation: str, risk: RiskLevel) -> str:
        """Prevent absolute assertions of fraud or authenticity."""
        import re
        sanitized = explanation
        replacements = [
            (r"\b(?:definitely|certainly|100%)\s+fraudulent\b", "high-risk warning signs"),
            (r"\b(?:definitely|certainly|100%)\s+a\s+scam\b", "high-risk warning signs"),
            (r"\b(?:is|are)\s+(?:definitely|confirmed)\s+(?:fake|fraud|scam)\b", "displays strong scam risk indicators"),
            (r"\b(?:definitely|guaranteed|100%)\s+(?:genuine|legitimate|real|safe)\b", "consistent with standard recruitment format"),
        ]
        for pattern, repl in replacements:
            sanitized = re.sub(pattern, repl, sanitized, flags=re.IGNORECASE)
        return sanitized

    def _build_deterministic_fallback_response(
        self,
        rule_indicators: List[Indicator],
        has_high_rule: bool,
        has_payment_rule: bool,
        has_sensitive_rule: bool,
        has_medium_rule: bool,
        text: str,
    ) -> AnalyzeResponse:
        """Deterministic rule-only analysis when Gemini is not configured or fails."""
        if has_payment_rule or has_sensitive_rule or has_high_rule:
            final_risk = RiskLevel.HIGH_RISK
        elif has_medium_rule:
            final_risk = RiskLevel.SUSPICIOUS
        elif self._is_insufficient_or_vague(text):
            final_risk = RiskLevel.SUSPICIOUS
            rule_indicators.append(
                Indicator(
                    type="VAGUE_OFFER",
                    severity=SeverityLevel.MEDIUM,
                    evidence=text[:100] + ("..." if len(text) > 100 else "")
                )
            )
        else:
            final_risk = RiskLevel.SAFE

        explanation = self._generate_fallback_explanation(final_risk, rule_indicators)
        next_actions = self._get_default_actions(final_risk)

        return AnalyzeResponse(
            risk=final_risk,
            indicators=rule_indicators,
            explanation=explanation,
            next_actions=next_actions,
        )

    def _is_insufficient_or_vague(self, text: str) -> bool:
        """Detect very short / vague messages lacking formal company or assessment context."""
        cleaned = text.strip()
        lower = cleaned.lower()
        if len(cleaned) < 120 and ("interview" not in lower and "apply" not in lower and "assessment" not in lower):
            return True
        return False

    def _generate_fallback_explanation(
        self, risk: RiskLevel, indicators: List[Indicator]
    ) -> str:
        if risk == RiskLevel.HIGH_RISK:
            types = ", ".join(i.type.replace("_", " ").title() for i in indicators)
            return (
                f"High risk indicators detected ({types}). "
                "Legitimate organizations do not request upfront payments, security deposits, or direct selection without formal evaluation."
            )
        elif risk == RiskLevel.SUSPICIOUS:
            if indicators:
                types = ", ".join(i.type.replace("_", " ").title() for i in indicators)
                return (
                    f"Suspicious signals identified ({types}). "
                    "The message displays urgency or insufficient verification details. Exercise caution before proceeding."
                )
            return (
                "The provided text contains insufficient evidence to confirm legitimacy. "
                "Verify the company and recruitment details independently."
            )
        else:
            return (
                "The message aligns with standard recruitment communication patterns and contains no direct payment demands. "
                "However, always independently verify the employer's official domain."
            )

    def _get_default_actions(self, risk: RiskLevel) -> List[str]:
        if risk == RiskLevel.HIGH_RISK:
            return DEFAULT_HIGH_RISK_ACTIONS
        elif risk == RiskLevel.SUSPICIOUS:
            return DEFAULT_SUSPICIOUS_ACTIONS
        else:
            return DEFAULT_SAFE_ACTIONS


analyzer = OfferAnalyzer()
