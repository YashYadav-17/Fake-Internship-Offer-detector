import React, { useState } from 'react';

export default function AboutPage({ onNavigateToDetector }) {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "Does OfferShield guarantee whether a job offer is 100% genuine?",
      a: "No. OfferShield provides an intelligent risk assessment by evaluating known scam patterns and pressure language. It is designed to alert you to red flags so you can verify the employer through official company domain channels or your college placement cell."
    },
    {
      q: "Is my personal data saved when I check an offer?",
      a: "No! OfferShield enforces strict zero data retention. Your submitted offer text is processed transiently, and server-side PII masking strips out sensitive identifiers before analysis."
    },
    {
      q: "What are the most common red flags in fake internship offers?",
      a: "The top red flags include: requests for upfront security deposits or training fees, interviews conducted solely via messaging apps (Telegram/WhatsApp), offers sent from free email addresses (e.g. @gmail.com), and pressure to accept within hours."
    },
    {
      q: "Can I connect OfferShield to my own backend?",
      a: "Yes! OfferShield is built with a standard JSON backend contract (POST /analyze). The frontend architecture is pre-configured to easily swap the mock service with a real FastAPI or Express backend."
    }
  ];

  return (
    <div className="page-view about-page">
      {/* MISSION HERO */}
      <section className="about-hero animate-fade-up">
        <span className="section-tag">OUR MISSION</span>
        <h1 className="about-title">Safeguarding Student Careers in the Digital Age</h1>
        <p className="about-subtext">
          Recruitment scams targeting college students and recent graduates are at an all-time high. 
          OfferShield was created during an AI hackathon to empower candidates with real-time scam pattern identification.
        </p>
      </section>

      {/* COMMON SCAM TYPES GUIDE */}
      <section className="scam-guide-section reveal-on-scroll">
        <h2 className="section-heading">4 Major Recruitment Scam Red Flags</h2>
        <div className="scam-cards-grid">
          <div className="scam-card">
            <div className="scam-card-number">01</div>
            <h3>Upfront Payment Demands</h3>
            <p>Legitimate employers pay you — they never ask candidates for security deposits, laptop fees, document verification charges, or training fees.</p>
          </div>

          <div className="scam-card">
            <div className="scam-card-number">02</div>
            <h3>Unverified Communication</h3>
            <p>Recruiters who refuse phone calls, avoid official company email domains (@company.com), and insist on Telegram or WhatsApp text interviews.</p>
          </div>

          <div className="scam-card">
            <div className="scam-card-number">03</div>
            <h3>Artificial Urgency</h3>
            <p>High-pressure tactics requiring immediate deposit payment within 2 to 24 hours under the threat of losing "limited seats".</p>
          </div>

          <div className="scam-card">
            <div className="scam-card-number">04</div>
            <h3>Unrealistic Stipends</h3>
            <p>Promising exorbitant salaries for entry-level positions requiring zero prior interview assessment or technical skills validation.</p>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="faq-section reveal-on-scroll">
        <h2 className="section-heading">Frequently Asked Questions</h2>
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`faq-item ${openFaq === index ? 'active' : ''}`}
              onClick={() => toggleFaq(index)}
            >
              <div className="faq-question">
                <span>{faq.q}</span>
                <span className="faq-icon">{openFaq === index ? '−' : '+'}</span>
              </div>
              {openFaq === index && (
                <div className="faq-answer">
                  <p>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="about-cta reveal-on-scroll">
        <h3>Ready to verify an internship offer?</h3>
        <button type="button" className="cta-primary-btn" onClick={onNavigateToDetector}>
          Open Offer Detector →
        </button>
      </section>
    </div>
  );
}
