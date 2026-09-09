import React from 'react';
import { Shield } from 'lucide-react';

export default function Header({ isMockMode, setIsMockMode, backendOnline }) {
  return (
    <header className="site-header">
      <div className="container header-content">
        <a href="/" className="brand-logo" aria-label="OfferShield Home">
          <div className="logo-icon-wrapper">
            <Shield size={22} strokeWidth={2.2} />
          </div>
          <span>OfferShield</span>
          <span className="brand-tag">AI Defense</span>
        </a>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Mode Switcher Badge */}
          <button
            type="button"
            className="header-badge"
            style={{
              cursor: 'pointer',
              border: isMockMode ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)',
              background: isMockMode ? 'rgba(245, 158, 11, 0.08)' : 'rgba(16, 185, 129, 0.08)',
              color: isMockMode ? '#fbbf24' : '#34d399',
            }}
            onClick={() => setIsMockMode(!isMockMode)}
            title="Click to toggle between Live Backend API and Mock Mode"
          >
            <span
              className="status-dot"
              style={{
                background: isMockMode ? 'var(--suspicious-color)' : 'var(--safe-color)',
                boxShadow: isMockMode ? '0 0 8px var(--suspicious-color)' : '0 0 8px var(--safe-color)',
              }}
            />
            <span>
              {isMockMode
                ? 'Mode: Mock Data'
                : backendOnline
                ? 'Mode: Live Backend (Port 8000)'
                : 'Connecting Backend...'}
            </span>
            <span style={{ fontSize: '0.68rem', opacity: 0.8, textDecoration: 'underline' }}>
              (switch)
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
