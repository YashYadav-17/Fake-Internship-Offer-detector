import React from 'react';

export default function SecurityWarning() {
  return (
    <div className="security-warning">
      <div className="warning-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <div className="warning-text">
        <strong>Do not paste PAN numbers, bank details, passwords, or private documents.</strong>
        <span className="warning-subtext">OfferShield analyzes message content for scam indicators. Please ensure sensitive personal and financial credentials are omitted.</span>
      </div>
    </div>
  );
}
