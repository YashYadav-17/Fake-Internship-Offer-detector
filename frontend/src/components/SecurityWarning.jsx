import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function SecurityWarning() {
  return (
    <div className="security-warning-card" role="alert">
      <AlertTriangle size={18} className="warning-icon" />
      <div className="warning-text">
        <strong>Privacy Notice:</strong> Do not paste PAN numbers, bank details, passwords, or private documents.
        OfferShield performs client-side and server-side PII redacting for privacy.
      </div>
    </div>
  );
}
