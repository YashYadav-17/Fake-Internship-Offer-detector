import React from 'react';

// Helper function to format snake_case enum values to Title Case (e.g. PAYMENT_REQUEST -> Payment Request)
function formatIndicatorType(type) {
  if (!type) return '';
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export default function ResultCard({ result, onReset }) {
  if (!result) return null;

  const { risk, explanation, indicators = [], next_actions = [] } = result;

  // Configuration mapping for SAFE, SUSPICIOUS, HIGH_RISK
  const getRiskConfig = (riskLevel) => {
    switch (riskLevel) {
      case 'SAFE':
        return {
          cssClass: 'risk-safe',
          title: 'SAFE',
          subtext: 'No major warning signs detected.',
          icon: (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          )
        };
      case 'SUSPICIOUS':
        return {
          cssClass: 'risk-suspicious',
          title: 'SUSPICIOUS',
          subtext: 'Some warning signs require verification.',
          icon: (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          )
        };
      case 'HIGH_RISK':
      default:
        return {
          cssClass: 'risk-high',
          title: 'HIGH RISK',
          subtext: 'Multiple strong scam indicators detected.',
          icon: (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          )
        };
    }
  };

  const config = getRiskConfig(risk);

  return (
    <div className="result-card">
      {/* Top action header */}
      <div className="result-top-bar">
        <button type="button" className="reset-button" onClick={onReset}>
          ← Check another offer
        </button>
      </div>

      {/* Main Risk Banner */}
      <div className={`risk-banner ${config.cssClass}`}>
        <div className="risk-banner-icon">{config.icon}</div>
        <div className="risk-banner-content">
          <span className="risk-assessment-label">Risk assessment</span>
          <h2 className="risk-assessment-title">{config.title}</h2>
          <p className="risk-assessment-subtext">{config.subtext}</p>
        </div>
      </div>

      {/* Section: Why this result? */}
      <div className="result-section">
        <h3 className="section-title">Why this result?</h3>
        <p className="explanation-text">{explanation}</p>
      </div>

      {/* Section: Fraud indicators */}
      {indicators && indicators.length > 0 && (
        <div className="result-section">
          <h3 className="section-title">Fraud indicators</h3>
          <div className="indicators-list">
            {indicators.map((ind, idx) => (
              <div key={idx} className="indicator-item">
                <div className="indicator-header">
                  <span className="indicator-type">{formatIndicatorType(ind.type)}</span>
                  <span className={`severity-badge severity-${ind.severity ? ind.severity.toLowerCase() : 'medium'}`}>
                    {ind.severity} SEVERITY
                  </span>
                </div>
                {ind.evidence && (
                  <div className="indicator-evidence">
                    <span className="evidence-label">Evidence:</span> "{ind.evidence}"
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section: Recommended next steps */}
      {next_actions && next_actions.length > 0 && (
        <div className="result-section">
          <h3 className="section-title">Recommended next steps</h3>
          <ul className="next-steps-list">
            {next_actions.map((action, idx) => (
              <li key={idx} className="next-step-item">
                <span className="step-arrow">→</span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Disclaimer */}
      <div className="result-disclaimer">
        <p>
          <strong>Important:</strong> This assessment identifies potential warning signs. It does not guarantee that an offer is genuine or fraudulent. Verify independently before taking action.
        </p>
      </div>
    </div>
  );
}
