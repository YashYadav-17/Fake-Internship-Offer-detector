import React from 'react';

export default function Header({ activePage, setActivePage, isScrolled }) {
  return (
    <header className={`app-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-inner">
        <div className="header-brand" onClick={() => setActivePage('home')} style={{ cursor: 'pointer' }}>
          <div className="logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div className="brand-title-wrap">
              <h1 className="brand-title">OfferShield</h1>
              <span className="badge">AI + Rule-based</span>
            </div>
            <p className="brand-subtitle">AI-powered internship & job offer scam detection</p>
          </div>
        </div>

        <nav className="header-nav">
          <button
            type="button"
            className={`nav-link ${activePage === 'home' ? 'active' : ''}`}
            onClick={() => setActivePage('home')}
          >
            Home
          </button>
          <button
            type="button"
            className={`nav-link ${activePage === 'detector' ? 'active' : ''}`}
            onClick={() => setActivePage('detector')}
          >
            Check Offer
          </button>
          <button
            type="button"
            className={`nav-link ${activePage === 'about' ? 'active' : ''}`}
            onClick={() => setActivePage('about')}
          >
            About
          </button>
        </nav>
      </div>
    </header>
  );
}
