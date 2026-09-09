import React from 'react';
import { Sparkles } from 'lucide-react';

export default function Hero() {
  return (
    <section className="hero-section">
      <div className="hero-pill">
        <Sparkles size={14} />
        <span>Scam Defense for Students & Job Seekers</span>
      </div>
      <h1 className="hero-title">
        Know before you <span className="hero-title-highlight">trust the offer.</span>
      </h1>
      <p className="hero-subtitle">
        Paste any internship or job offer letter, email, or chat message. OfferShield scans for upfront payment demands, artificial urgency, and recruitment anomalies.
      </p>
    </section>
  );
}
