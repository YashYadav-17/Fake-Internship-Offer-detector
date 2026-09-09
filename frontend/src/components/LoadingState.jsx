import React from 'react';

export default function LoadingState() {
  return (
    <div className="card loading-card" role="status" aria-live="polite">
      <div className="spinner-wrapper">
        <div className="spinner" />
      </div>
      <h3 className="loading-title">Analyzing offer signals...</h3>
      <p className="loading-desc">
        OfferShield is evaluating payment indicators, interview anomalies, artificial urgency, and contextual language patterns.
      </p>
    </div>
  );
}
