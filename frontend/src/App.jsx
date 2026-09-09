import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import SecurityWarning from './components/SecurityWarning';
import OfferInput from './components/OfferInput';
import LoadingState from './components/LoadingState';
import RiskResult from './components/RiskResult';
import { analyzeOffer, checkBackendHealth } from './services/api';

export default function App() {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isMockMode, setIsMockMode] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);

  // Check backend health on mount and periodically
  useEffect(() => {
    let mounted = true;
    async function verifyHealth() {
      const health = await checkBackendHealth();
      if (mounted) {
        if (health && health.status === 'ok') {
          setBackendOnline(true);
        } else {
          setBackendOnline(false);
        }
      }
    }
    verifyHealth();
    const interval = setInterval(verifyHealth, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleAnalyze = async () => {
    const trimmed = text.trim();

    // Client-side validation
    if (!trimmed) {
      setError('Please paste an offer text before analyzing.');
      return;
    }
    if (trimmed.length < 5) {
      setError('Offer text is too short (minimum 5 characters required).');
      return;
    }
    if (trimmed.length > 10000) {
      setError('Offer text exceeds the 10,000 character maximum limit.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await analyzeOffer(trimmed, isMockMode);
      setResult(response);
      // Smooth scroll to result
      setTimeout(() => {
        const el = document.getElementById('analysis-result');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      setError(err.message || 'An error occurred while analyzing the offer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setText('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Header
        isMockMode={isMockMode}
        setIsMockMode={setIsMockMode}
        backendOnline={backendOnline}
      />

      <main className="main-content">
        <div className="container">
          <Hero />

          <SecurityWarning />

          {!result && (
            <>
              {isLoading ? (
                <LoadingState />
              ) : (
                <OfferInput
                  text={text}
                  setText={setText}
                  onAnalyze={handleAnalyze}
                  isLoading={isLoading}
                  error={error}
                />
              )}
            </>
          )}

          {result && !isLoading && (
            <RiskResult result={result} onReset={handleReset} />
          )}
        </div>
      </main>

      <footer className="site-footer">
        <div className="container">
          <p>
            <strong>OfferShield</strong> — AI-Powered Internship & Job Offer Scam Detector
          </p>
          <p className="footer-disclaimer">
            Evaluation is heuristic and explainable AI-based. OfferShield does not store your offer text or personal documents. Always verify independently through official employer domains and college placement cells.
          </p>
        </div>
      </footer>
    </>
  );
}
