# OfferShield — AI/ML Risk-Analysis Engine

The `aiml/` module provides explainable fraud and scam risk analysis for internship and job offers targeting students. It implements a **hybrid defense model** combining deterministic heuristics with Google Gemini contextual NLP reasoning.

---

## 1. Architecture Flow

```text
Raw Offer Text
      │
      ▼
1. PII Masking Engine (aiml/pii.py)
      │  - Redacts Email, Phone (+91/Intl), Indian PAN, and Aadhaar numbers
      ▼
2. Deterministic Fraud Rules (aiml/fraud_rules.py)
      │  - High-confidence regex heuristics
      │  - Negation-aware pattern matching ("There is no registration fee")
      ▼
3. Google Gemini AI Contextual NLP (aiml/gemini_service.py)
      │  - Model: gemini-2.5-flash (configurable)
      │  - Structured JSON output with zero-shot temperature 0.1
      ▼
4. Synthesis & Grounding Engine (aiml/analyzer.py)
      │  - Evidence grounding: strips hallucinated quotes
      │  - Invariant enforcement: deterministic red flags cannot be overridden by AI
      │  - Sanitization: eliminates absolute certainty assertions
      ▼
Normalized AnalyzeResponse (SAFE | SUSPICIOUS | HIGH_RISK)
```

---

## 2. Fraud Signal Taxonomy

The engine evaluates 8 signal categories grounded exclusively in the supplied text:

| Signal Category | Description & Scope |
| :--- | :--- |
| `PAYMENT_REQUEST` | Demands for registration fees, security deposits, laptop fees, training charges, or payments to issue offer letters. |
| `ARTIFICIAL_URGENCY` | Deadlines attached to payment ("pay today", "within 24 hours"), or intense pressure to accept without evaluation. |
| `RECRUITMENT_ANOMALY` | Selection without an interview, guaranteed selection/placement, or hiring without application. |
| `SENSITIVE_INFORMATION` | Requests for PAN, Aadhaar, bank accounts, card details, netbanking passwords, OTPs, or physical certificates. |
| `CONTACT_ANOMALY` | Telegram/WhatsApp-only contact, personal/free webmail recruiters, or mismatched domains. |
| `COMPENSATION_ANOMALY` | Unrealistic stipends/salaries in context (note: high salary alone does not classify an offer as HIGH_RISK). |
| `CONTEXTUAL_LANGUAGE` | Manipulation, secrecy, emotional pressure, or non-standard recruiter behavior. |
| `VAGUE_OFFER` | Extremely minimal shortlisting messages lacking legitimate company context or criteria. |

---

## 3. Anti-Hallucination & Evidence Rules

- **Strict Textual Grounding**: Every detected indicator is linked to an exact or near-exact quote from the offer text.
- **No Extrapolations**: Never invents company names, recruiters, websites, salaries, or deadlines.
- **Missing Information Is Not Fraud**: If details are sparse, the system defaults to `SUSPICIOUS`, not `HIGH_RISK`.
- **No Certainty Claims**: Never outputs that an offer is "definitely fraudulent" or "definitely genuine".

---

## 4. Module Layout

- **[`aiml/analyzer.py`](analyzer.py)**: Main pipeline orchestrator, synthesis invariants, and evidence verification.
- **[`aiml/gemini_service.py`](gemini_service.py)**: Google Gemini API integration and structured JSON validator.
- **[`aiml/fraud_rules.py`](fraud_rules.py)**: Regex heuristics and negation handling.
- **[`aiml/pii.py`](pii.py)**: Privacy redaction engine for Email, Phone, PAN, and Aadhaar.
