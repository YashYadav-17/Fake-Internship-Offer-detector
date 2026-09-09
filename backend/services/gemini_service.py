import json
import logging
from typing import Optional, Dict, Any
import httpx
from backend.config import settings

logger = logging.getLogger("offershield.gemini")

GEMINI_API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"

SYSTEM_INSTRUCTION = """
You are OfferShield AI, an explainable AI risk-analysis engine helping students evaluate internship and job offers for scam warning signs.

CRITICAL ROLE AND BOUNDARIES:
1. You are NOT a fraud confirmation system. NEVER state that an offer or company is definitely genuine or definitely fraudulent.
2. Your classification represents the strength of warning signals present in the supplied text.
3. Classifications MUST be exactly one of:
   - SAFE: The text contains no meaningful scam indicators and provides reasonably normal recruitment information.
   - SUSPICIOUS: The text contains some warning signs, unusual patterns, or insufficient information to establish that the offer is trustworthy. Prefer SUSPICIOUS over SAFE when information is vague or incomplete.
   - HIGH_RISK: The text contains multiple strong warning signs, direct financial requests, demands for sensitive credentials/documents, strong urgency, or highly abnormal recruitment behavior.

ANALYZE THESE SIGNAL CATEGORIES:
- PAYMENT_REQUEST: Registration fees, security deposits, processing fees, training fees, laptop fees, payments to receive an offer letter, or upfront payments.
- ARTIFICIAL_URGENCY: Artificial deadlines, immediate payment demands, pressure to respond quickly, threats of losing the opportunity, or "act now" language.
- RECRUITMENT_ANOMALY: Selection without an interview, guaranteed selection, direct offers without a normal application process, or unusual hiring claims.
- SENSITIVE_INFORMATION: Requests for Aadhaar, PAN, bank details, card details, OTP, passwords, or original physical certificates.
- CONTACT_ANOMALY: Suspicious contact patterns, unusual recruiter addresses, mismatched domains, or Telegram/WhatsApp-only communication.
- COMPENSATION_ANOMALY: Unusually inflated or unrealistic compensation in context. Note: High salary alone MUST NOT make an offer HIGH_RISK.
- CONTEXTUAL_LANGUAGE: Manipulation, impersonation, suspicious promises, contradictions, emotional pressure, or unusual recruiter language.
- VAGUE_OFFER: Extremely brief shortlisting notifications with zero details, role description, or company verification context.

ANTI-HALLUCINATION AND EVIDENCE RULES:
- Every indicator MUST be supported by exact or near-exact evidence quotes from the supplied text.
- NEVER invent evidence, company names, websites, recruiters, salaries, or deadlines.
- Do NOT use external training knowledge to claim a specific named company is fake or real. Ground your assessment ONLY in the supplied text.
- Missing information must be treated as missing, NOT as proof of fraud.
- Keep explanations concise (1-3 sentences), factual, objective, and student-friendly.
- Provide 2-4 practical, actionable safety recommendations (e.g., verify official website, do not pay, contact college placement cell).

OUTPUT FORMAT:
Return ONLY a valid JSON object strictly matching this schema:
{
  "risk": "SAFE" | "SUSPICIOUS" | "HIGH_RISK",
  "indicators": [
    {
      "type": "PAYMENT_REQUEST" | "ARTIFICIAL_URGENCY" | "RECRUITMENT_ANOMALY" | "SENSITIVE_INFORMATION" | "CONTACT_ANOMALY" | "COMPENSATION_ANOMALY" | "CONTEXTUAL_LANGUAGE" | "VAGUE_OFFER" | "SUSPICIOUS_DOCUMENT_REQUEST" | "NO_INTERVIEW_SELECTION" | "INFORMAL_COMMUNICATION",
      "severity": "LOW" | "MEDIUM" | "HIGH",
      "evidence": "Exact or near-exact quote from text"
    }
  ],
  "explanation": "Short, objective, student-friendly explanation",
  "next_actions": [
    "Practical safety recommendation 1",
    "Practical safety recommendation 2"
  ]
}
"""


class GeminiService:
    """Service client for calling Google Gemini API."""

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.model = model or settings.GEMINI_MODEL
        self.timeout = 15.0  # 15 seconds network timeout

    @property
    def is_available(self) -> bool:
        return bool(self.api_key)

    async def analyze_offer(self, masked_text: str) -> Optional[Dict[str, Any]]:
        """
        Call Gemini API with masked offer text and return parsed, validated JSON.
        Returns None if API key is not set, network fails, or model response is invalid.
        Guarantees no secret keys leak into exceptions or logs.
        """
        if not self.is_available:
            logger.info("Gemini API key not configured; using deterministic analyzer.")
            return None

        endpoint = f"{GEMINI_API_BASE_URL}/{self.model}:generateContent?key={self.api_key}"

        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [
                        {
                            "text": f"Analyze the following student internship/job offer text for scam risk:\n\n---\n{masked_text}\n---"
                        }
                    ]
                }
            ],
            "systemInstruction": {
                "parts": [
                    {"text": SYSTEM_INSTRUCTION}
                ]
            },
            "generationConfig": {
                "responseMimeType": "application/json",
                "temperature": 0.1
            }
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(endpoint, json=payload)
                
                if response.status_code != 200:
                    logger.warning(
                        "Gemini API returned non-200 status: %d (model=%s)",
                        response.status_code,
                        self.model
                    )
                    return None

                data = response.json()
                candidates = data.get("candidates", [])
                if not candidates:
                    logger.warning("Gemini API returned no candidates.")
                    return None

                content_parts = candidates[0].get("content", {}).get("parts", [])
                if not content_parts:
                    return None

                raw_text = content_parts[0].get("text", "").strip()
                parsed = self._parse_and_validate_json(raw_text)
                return parsed

        except httpx.TimeoutException:
            logger.warning("Gemini API request timed out; falling back to deterministic rules.")
            return None
        except Exception as err:
            logger.error("Error communicating with Gemini API: %s", type(err).__name__)
            return None

    def _parse_and_validate_json(self, raw_text: str) -> Optional[Dict[str, Any]]:
        """Safely parse JSON and validate schema compatibility."""
        if not raw_text:
            return None

        # Clean markdown fences if present
        text = raw_text
        if text.startswith("```"):
            lines = text.splitlines()
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            text = "\n".join(lines).strip()

        try:
            parsed = json.loads(text)
        except json.JSONDecodeError:
            logger.warning("Failed to decode JSON from Gemini response; falling back.")
            return None

        if not isinstance(parsed, dict):
            logger.warning("Gemini output is not a JSON object; falling back.")
            return None

        # Validate required top-level fields
        risk = str(parsed.get("risk", "")).upper()
        if risk not in ("SAFE", "SUSPICIOUS", "HIGH_RISK"):
            logger.warning("Invalid risk in Gemini output: %s", risk)
            return None

        explanation = parsed.get("explanation")
        if not isinstance(explanation, str) or not explanation.strip():
            logger.warning("Missing or empty explanation in Gemini output.")
            return None

        # Validate indicators array
        raw_indicators = parsed.get("indicators", [])
        if not isinstance(raw_indicators, list):
            parsed["indicators"] = []
        else:
            valid_indicators = []
            for item in raw_indicators:
                if isinstance(item, dict):
                    itype = str(item.get("type", "")).strip().upper()
                    isev = str(item.get("severity", "MEDIUM")).strip().upper()
                    ievidence = str(item.get("evidence", "")).strip()

                    if itype and ievidence:
                        if isev not in ("LOW", "MEDIUM", "HIGH"):
                            isev = "MEDIUM"
                        valid_indicators.append({
                            "type": itype,
                            "severity": isev,
                            "evidence": ievidence
                        })
            parsed["indicators"] = valid_indicators

        # Validate next_actions array
        raw_actions = parsed.get("next_actions", [])
        if not isinstance(raw_actions, list):
            parsed["next_actions"] = []
        else:
            parsed["next_actions"] = [
                str(a).strip() for a in raw_actions if str(a).strip()
            ]

        return parsed


gemini_service = GeminiService()
