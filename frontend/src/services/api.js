/**
 * OfferShield API Service
 * Handles communication with the OfferShield FastAPI backend.
 * Never connects directly to Gemini; always routes through Backend /analyze.
 */

export const MOCK_RESPONSE = {
  risk: "HIGH_RISK",
  indicators: [
    {
      type: "PAYMENT_REQUEST",
      severity: "HIGH",
      evidence: "Pay ₹20,000 security fees today"
    },
    {
      type: "ARTIFICIAL_URGENCY",
      severity: "MEDIUM",
      evidence: "today to confirm your position"
    },
    {
      type: "RECRUITMENT_ANOMALY",
      severity: "HIGH",
      evidence: "You have been selected without an interview"
    }
  ],
  explanation:
    "The offer requests an upfront payment, creates urgency, and claims selection without a normal interview process.",
  next_actions: [
    "Do not pay any money",
    "Verify the company through its official website",
    "Contact your college placement cell"
  ]
};

export const MOCK_SAFE_RESPONSE = {
  risk: "SAFE",
  indicators: [],
  explanation:
    "The text aligns with standard recruitment communication patterns with no upfront fee demands.",
  next_actions: [
    "Verify the company email domain matches their official corporate website",
    "Prepare for the scheduled technical interview or assessment",
    "Remember that legitimate employers never require payment for job offers"
  ]
};

export const MOCK_SUSPICIOUS_RESPONSE = {
  risk: "SUSPICIOUS",
  indicators: [
    {
      type: "VAGUE_OFFER",
      severity: "MEDIUM",
      evidence: "You have been shortlisted for our internship program. Contact on Telegram."
    },
    {
      type: "INFORMAL_COMMUNICATION",
      severity: "MEDIUM",
      evidence: "Telegram @intern_recruiter"
    }
  ],
  explanation:
    "The message uses informal communication channels and lacks verified corporate structure details.",
  next_actions: [
    "Do not pay any money or share sensitive personal documents",
    "Contact the company's verified HR team directly via official website contacts",
    "Consult your college placement cell or career counselor for verification"
  ]
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL !== undefined
    ? import.meta.env.VITE_API_BASE_URL
    : '';

/**
 * Check backend health status
 */
export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Execute real backend analysis via POST /analyze
 */
export async function analyzeOffer(text, useMock = false) {
  if (useMock) {
    // Mock simulation
    await new Promise((r) => setTimeout(r, 450));
    const lower = text.toLowerCase();
    if (lower.includes('no registration fee') || lower.includes('google meet')) {
      return MOCK_SAFE_RESPONSE;
    }
    if (lower.includes('telegram') || lower.includes('vague')) {
      return MOCK_SUSPICIOUS_RESPONSE;
    }
    return MOCK_RESPONSE;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });
  } catch {
    throw new Error(
      'Unable to connect to OfferShield backend at ' +
        API_BASE_URL +
        '. Ensure the backend server is running on port 8000.'
    );
  }

  if (!response.ok) {
    let errorDetail = 'Failed to analyze offer.';
    try {
      const errData = await response.json();
      if (errData.detail) {
        errorDetail =
          typeof errData.detail === 'string'
            ? errData.detail
            : Array.isArray(errData.detail)
            ? errData.detail.map((d) => d.msg || JSON.stringify(d)).join(', ')
            : JSON.stringify(errData.detail);
      } else if (errData.error) {
        errorDetail = errData.error;
      }
    } catch {
      // Keep default errorDetail
    }
    throw new Error(errorDetail);
  }

  const data = await response.json();
  return data;
}
