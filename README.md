# OfferShield — AI-Powered Internship & Job Offer Scam Detector

**OfferShield** is an AI-powered security backend designed to protect students and job seekers from fraudulent internship and job offers. It combines deterministic rule-based fraud heuristics with Google Gemini AI contextual NLP reasoning to classify offers, highlight warning signs, and provide actionable next steps.

---

## Architecture Flow

```
Frontend (Web / Mobile)
        │
        ▼
   POST /analyze
        │
        ▼
FastAPI Request Handler
        │
        ▼
Pydantic Input Validation (Length 5-10,000 chars)
        │
        ▼
PII Redaction Engine (Email, Phone, PAN)
        │
        ▼
Deterministic Fraud Rules (Payment, Urgency, No-Interview, Credential/Doc Requests)
        │
        ▼
Google Gemini AI Service (Contextual NLP & Unstructured Language Reasoning)
        │
        ▼
Risk Synthesis & Normalization Engine (Deterministic Invariant Enforcement)
        │
        ▼
Normalized JSON Response (risk, indicators, explanation, next_actions)
        │
        ▼
Frontend
```

---

## AI vs. Deterministic Rules Boundary

| Layer | Responsibility | Why |
| :--- | :--- | :--- |
| **Backend & Rules Engine** | Input validation, PII masking, obvious payment/fee signals, zero-interview selection, sensitive document requests, API error handling, response schema validation | Fast, deterministic, guaranteed catch of obvious scams regardless of AI behavior. |
| **Google Gemini AI** | Contextual interpretation, nuanced recruiter language, ambiguous claims, student-friendly explanation generation | Handles unstructured, creative scam variations and natural language context. |
| **Synthesis Layer** | Merges AI and rule indicators. Enforces that high-severity deterministic fraud signals **cannot** be overridden by optimistic AI responses. | Prevents false negatives from AI hallucinations or prompt injections. |

---

## API Documentation

### 1. Health Check
- **Endpoint**: `GET /health`
- **Response** (`200 OK`):
```json
{
  "status": "ok",
  "version": "1.0.0",
  "ai_configured": true
}
```

---

### 2. Analyze Offer
- **Endpoint**: `POST /analyze`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "text": "You are selected without interview. Pay ₹20,000 security fees today to receive your internship letter."
}
```

- **Response Body** (`200 OK`):
```json
{
  "risk": "HIGH_RISK",
  "indicators": [
    {
      "type": "PAYMENT_REQUEST",
      "severity": "HIGH",
      "evidence": "Pay ₹20,000 security fees today"
    },
    {
      "type": "NO_INTERVIEW_SELECTION",
      "severity": "HIGH",
      "evidence": "selected without interview"
    },
    {
      "type": "ARTIFICIAL_URGENCY",
      "severity": "MEDIUM",
      "evidence": "fees today"
    }
  ],
  "explanation": "High risk indicators detected (Payment Request, No Interview Selection, Artificial Urgency). Legitimate organizations do not request upfront payments, security deposits, or direct selection without formal evaluation.",
  "next_actions": [
    "Do not pay any money under any circumstances",
    "Do not share bank credentials, passwords, OTPs, or original certificates",
    "Report the sender to your university placement cell and cybercrime authorities",
    "Block the sender and avoid further communication"
  ]
}
```

---

## Risk Levels & Categories

### Risk Levels
- **`SAFE`**: Normal hiring flow, assessments/interviews mentioned, no fees. *(Note: Text alone cannot guarantee employer legitimacy).*
- **`SUSPICIOUS`**: Missing verification info, artificial urgency, informal channels (Telegram/WhatsApp only), or vague shortlisting.
- **`HIGH_RISK`**: Requests for money/fees, selection without interview, or requests for bank passwords/OTPs/original documents.

### Indicator Types
- `PAYMENT_REQUEST`: Demands for registration, security deposit, laptop fees, training charges.
- `NO_INTERVIEW_SELECTION`: Selection without interview, test, or assessment.
- `SUSPICIOUS_DOCUMENT_REQUEST`: Requests for bank passwords, OTPs, PINs, or physical original certificates.
- `ARTIFICIAL_URGENCY`: Unrealistic deadlines ("pay within 1 hour", "confirm by 6 PM today").
- `INFORMAL_COMMUNICATION`: Telegram/WhatsApp-only contact.
- `VAGUE_OFFER`: Minimal or vague details lacking legitimate corporate structure.

---

## Setup & Running Locally

### Prerequisites
- Python 3.10+ (Tested on Python 3.14)
- `pip`

### 1. Clone & Navigate
```bash
git clone https://github.com/YashYadav-17/Fake-Internship-Offer-detector.git
cd Fake-Internship-Offer-detector
git checkout Backend
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables
Create a `.env` file from the provided `.env.example`:
```bash
cp .env.example .env
```

Edit `.env`:
```ini
# Google Gemini API Key (Optional for deterministic local dev, required for AI analysis)
GEMINI_API_KEY=your_gemini_api_key_here

# Gemini Model (Default: gemini-3.5-flash-lite)
GEMINI_MODEL=gemini-3.5-flash-lite

# Server Host & Port
HOST=0.0.0.0
PORT=8000

# CORS Allowed Origins
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173
```

### 4. Run the Backend API
```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### 5. Run the Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
- **Web Interface**: `http://localhost:5173`

---

## Running Automated Tests

Run the full pytest suite (11 test cases):
```bash
python -m pytest -v
```

Tests cover:
1. High-risk payment + no-interview scenarios.
2. Safe-looking formal job offers.
3. Registration fee scam variants.
4. Edge cases (vague shortlisting).
5. Artificial urgency without payment.
6. Lightweight PII redaction (email, phone, PAN).
7. Empty/whitespace input rejection.
8. Oversized text rejection (>10k chars).
9. Prompt injection defense.
10. Health check endpoint.
11. Sensitive credential/document requests.

---

## Frontend Integration Guide

1. **Base URL**: `http://localhost:8000` (or deployed URL).
2. **CORS**: Enabled by default for standard frontend dev ports (`3000`, `5173`). Update `CORS_ORIGINS` in `.env` if using a custom port or domain.
3. **Endpoint**: `POST /analyze`
4. **Sample Frontend Fetch Call**:
```javascript
const analyzeOffer = async (offerText) => {
  const response = await fetch("http://localhost:8000/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: offerText }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.details?.[0] || "Analysis failed");
  }

  const result = await response.json();
  // result: { risk, indicators, explanation, next_actions }
  return result;
};
```

---

## Security & Privacy Foundation

1. **No Database**: Zero user data persistence. Offers are analyzed in-memory and discarded.
2. **PII Redaction**: Email addresses, Indian & international phone numbers, and PAN cards are redacted prior to sending to Gemini.
3. **Zero Secrets Leakage**: `GEMINI_API_KEY` is loaded strictly from environment variables. `.env` is ignored in `.gitignore`. API error handlers sanitize all 500 errors to prevent credential or stack trace exposure.
4. **Prompt Injection Resilience**: Input offer text is formatted strictly as data within system instruction boundaries.
5. **Deterministic Fallback**: If Gemini API is unreachable or `GEMINI_API_KEY` is missing, the backend continues to function reliably using deterministic fraud rules.