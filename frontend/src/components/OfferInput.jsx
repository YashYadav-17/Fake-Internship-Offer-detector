import React from 'react';
import { ShieldCheck, FileText, AlertCircle, Trash2, ArrowRight } from 'lucide-react';
import { SAMPLE_OFFERS } from '../constants/samples';

export default function OfferInput({
  text,
  setText,
  onAnalyze,
  isLoading,
  error,
}) {
  const charCount = text.length;

  const handleKeyDown = (e) => {
    // Cmd/Ctrl + Enter to submit
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      onAnalyze();
    }
  };

  return (
    <div className="card">
      <div className="input-label-row">
        <label htmlFor="offer-text" className="input-label">
          <FileText size={18} />
          <span>Internship or Job Offer Text</span>
        </label>
        <span className="char-count">{charCount} / 10,000 chars</span>
      </div>

      <textarea
        id="offer-text"
        className="offer-textarea"
        placeholder="Paste your internship or job offer here... (e.g. email, WhatsApp/Telegram message, offer letter text)"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
        rows={7}
      />

      <div className="sample-chips-row">
        <span className="chips-label">Try sample:</span>
        <button
          type="button"
          className="sample-chip"
          onClick={() => setText(SAMPLE_OFFERS.highRisk)}
          disabled={isLoading}
        >
          🚨 High-Risk Scam
        </button>
        <button
          type="button"
          className="sample-chip"
          onClick={() => setText(SAMPLE_OFFERS.suspicious)}
          disabled={isLoading}
        >
          ⚠️ Vague / Suspicious
        </button>
        <button
          type="button"
          className="sample-chip"
          onClick={() => setText(SAMPLE_OFFERS.safe)}
          disabled={isLoading}
        >
          ✅ Legitimate Offer
        </button>
        {text && (
          <button
            type="button"
            className="sample-chip"
            style={{ marginLeft: 'auto', color: '#94a3b8' }}
            onClick={() => setText('')}
            disabled={isLoading}
          >
            <Trash2 size={12} /> Clear
          </button>
        )}
      </div>

      {error && (
        <div className="error-banner" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="button-row" style={{ marginTop: error ? '1rem' : '0' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Press <kbd style={{ background: 'rgba(255,255,255,0.08)', padding: '2px 5px', borderRadius: '4px' }}>Ctrl + Enter</kbd> to analyze
        </div>

        <button
          type="button"
          id="analyze-btn"
          className="btn-primary"
          onClick={onAnalyze}
          disabled={isLoading || !text.trim()}
        >
          <ShieldCheck size={18} />
          <span>{isLoading ? 'Analyzing offer...' : 'Analyze Offer'}</span>
          {!isLoading && <ArrowRight size={16} />}
        </button>
      </div>
    </div>
  );
}
