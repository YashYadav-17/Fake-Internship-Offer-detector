import React, { useState, useEffect } from 'react';

// Count-Up Metric Subcomponent
function MetricCounter({ target, suffix = '', decimals = 0 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const steps = 40;
    const increment = target / steps;
    const intervalTime = duration / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [target]);

  return (
    <span className="metric-value">
      {decimals > 0 ? count.toFixed(decimals) : Math.floor(count).toLocaleString()}
      {suffix}
    </span>
  );
}

export default function HomePage({ onNavigateToDetector }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Mouse Parallax Effect Handler
  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    // Calculate normalized offset from center (-10px to +10px)
    const x = ((clientX / innerWidth) - 0.5) * 20;
    const y = ((clientY / innerHeight) - 0.5) * 20;
    setMousePos({ x, y });
  };

  return (
    <div className="page-view home-page" onMouseMove={handleMouseMove}>
      {/* HERO SECTION WITH WOW AURORA BACKGROUND */}
      <section className="home-hero">
        {/* AURORA WAVE BACKGROUND ORBS */}
        <div className="aurora-container">
          <div
            className="aurora-orb orb-1"
            style={{ transform: `translate(${mousePos.x * -0.8}px, ${mousePos.y * -0.8}px)` }}
          />
          <div
            className="aurora-orb orb-2"
            style={{ transform: `translate(${mousePos.x * 0.6}px, ${mousePos.y * 0.6}px)` }}
          />
          <div
            className="aurora-orb orb-3"
            style={{ transform: `translate(${mousePos.x * -0.4}px, ${mousePos.y * -0.4}px)` }}
          />
        </div>

        <div className="hero-content-wrap">
          <div className="hero-badge animate-fade-up">
            <span className="sparkle-icon">✨</span> AI & Rule-Powered Scam Protection
          </div>

          <h1 className="home-hero-title animate-fade-up delay-1">
            Protect Your Career from <br />
            <span className="hero-gradient-text">Fraudulent Job Offers</span>
          </h1>

          <p className="home-hero-subtext animate-fade-up delay-2">
            Received a suspicious internship offer via WhatsApp, Telegram, LinkedIn, or Email? 
            OfferShield instantly analyzes recruiter messages for scam indicators before you trust or pay.
          </p>

          <div className="home-hero-actions animate-fade-up delay-3">
            <button type="button" className="cta-primary-btn" onClick={onNavigateToDetector}>
              <span>Check an Offer Now</span>
              <span className="btn-arrow">→</span>
            </button>
          </div>
        </div>

        {/* ANIMATED HERO VISUAL: LIVE MOCK SCANNER CARD WITH PARALLAX */}
        <div
          className="hero-visual-card animate-fade-up delay-4"
          style={{ transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)` }}
        >
          <div className="scanner-card-header">
            <div className="scanner-status">
              <span className="pulse-dot"></span>
              <span className="status-text">OFFERSHIELD AI SCANNER</span>
            </div>
            <span className="scanner-badge">HIGH RISK DETECTED</span>
          </div>

          {/* ANIMATED LASER SCANNING BEAM */}
          <div className="scan-beam-sweep"></div>

          <div className="scanner-card-body">
            <div className="sample-offer-preview">
              <span className="sample-quote">"To confirm your internship, please pay ₹20,000 security deposit today..."</span>
            </div>
            <div className="detected-tags">
              <span className="tag tag-red">⚠️ Upfront Deposit Flag</span>
              <span className="tag tag-amber">⏱️ Urgent Pressure Language</span>
            </div>
          </div>
        </div>

        {/* METRICS BANNER WITH ANIMATED COUNT-UP */}
        <div className="metrics-grid animate-fade-up delay-5">
          <div className="metric-card">
            <MetricCounter target={98.4} suffix="%" decimals={1} />
            <span className="metric-label">Scam Pattern Accuracy</span>
          </div>
          <div className="metric-card">
            <MetricCounter target={15000} suffix="+" />
            <span className="metric-label">Offers Analyzed</span>
          </div>
          <div className="metric-card">
            <MetricCounter target={100} suffix="%" />
            <span className="metric-label">Privacy & PII Safe</span>
          </div>
        </div>
      </section>

      {/* CORE FEATURES SECTION */}
      <section className="features-section reveal-on-scroll">
        <div className="section-header">
          <span className="section-tag">WHY OFFERSHIELD</span>
          <h2 className="section-heading">How We Keep You Safe</h2>
          <p className="section-subtext">Multi-layered scam detection designed specifically for students and new grads.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card glass-card">
            <div className="feature-icon-box icon-teal">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="5" width="20" height="14" rx="2"/>
                <line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
            </div>
            <h3>Upfront Fee Detection</h3>
            <p>Identifies illegal requests for security deposits, laptop fees, training charges, or placement registration fees.</p>
          </div>

          <div className="feature-card glass-card">
            <div className="feature-icon-box icon-ocean">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <h3>Urgency & Pressure Flags</h3>
            <p>Scans for artificial pressure tactics ("Act within 2 hours", "Limited seats available") commonly used by scam recruiters.</p>
          </div>

          <div className="feature-card glass-card">
            <div className="feature-icon-box icon-navy">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <h3>Zero Data Retention</h3>
            <p>Your offer text is analyzed server-side with zero log storage. Personal information is masked automatically.</p>
          </div>
        </div>
      </section>

      {/* QUICK PREVIEW / CALLOUT */}
      <section className="cta-banner-box reveal-on-scroll">
        <div className="cta-banner-content">
          <h2>Got an offer letter or recruiter message?</h2>
          <p>Don't risk your savings or identity. It takes less than 5 seconds to run a free safety scan.</p>
          <button type="button" className="cta-secondary-btn" onClick={onNavigateToDetector}>
            Analyze Internship Offer →
          </button>
        </div>
      </section>
    </div>
  );
}
