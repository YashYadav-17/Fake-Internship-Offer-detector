import React from 'react';
import SecurityWarning from './SecurityWarning.jsx';
import OfferInput from './OfferInput.jsx';
import ResultCard from './ResultCard.jsx';

export default function DetectorPage({
  offerText,
  setOfferText,
  onAnalyze,
  loading,
  result,
  error,
  onReset
}) {
  return (
    <div className="page-view detector-page">
      {!result ? (
        <div className="input-flow animate-fade-up">
          {/* HERO SECTION */}
          <section className="hero-section">
            <span className="hero-tagline">VERIFY BEFORE YOU TRUST</span>
            <h2 className="hero-title">
              Is that job offer <span className="highlight-text">really safe?</span>
            </h2>
            <p className="hero-description">
              Paste a recruiter message or internship offer. OfferShield analyzes suspicious language and identifies potential scam warning signs.
            </p>
          </section>

          {/* SECURITY WARNING */}
          <SecurityWarning />

          {/* OFFER INPUT */}
          <OfferInput
            offerText={offerText}
            setOfferText={setOfferText}
            onAnalyze={onAnalyze}
            loading={loading}
          />

          {error && (
            <div className="error-message">
              <span>{error}</span>
              <button type="button" onClick={onAnalyze} className="retry-btn">Retry</button>
            </div>
          )}

          {/* HOW IT WORKS */}
          <section className="how-it-works reveal-on-scroll">
            <h3 className="how-it-works-heading">How It Works</h3>
            <div className="steps-container">
              <div className="step-card">
                <span className="step-number">01</span>
                <div className="step-info">
                  <strong>Paste</strong>
                  <span>Recruiter message</span>
                </div>
              </div>
              <div className="step-arrow-divider">→</div>
              <div className="step-card">
                <span className="step-number">02</span>
                <div className="step-info">
                  <strong>Analyze</strong>
                  <span>Rules + Gemini AI</span>
                </div>
              </div>
              <div className="step-arrow-divider">→</div>
              <div className="step-card">
                <span className="step-number">03</span>
                <div className="step-info">
                  <strong>Act</strong>
                  <span>Verify & stay safe</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      ) : (
        <ResultCard result={result} onReset={onReset} />
      )}
    </div>
  );
}
