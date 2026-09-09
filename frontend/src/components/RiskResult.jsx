import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert, RotateCcw, AlertOctagon } from 'lucide-react';
import IndicatorCard from './IndicatorCard';
import NextActions from './NextActions';

const RISK_CONFIG = {
  SAFE: {
    bannerClass: 'risk-banner-safe',
    iconClass: 'risk-icon-safe',
    badgeClass: 'risk-badge-safe',
    icon: ShieldCheck,
    title: 'Low Risk — Standard Offer Patterns',
    badgeLabel: 'SAFE EVALUATION',
    subtext: 'No immediate upfront payment demands or critical red flags were detected.',
  },
  SUSPICIOUS: {
    bannerClass: 'risk-banner-suspicious',
    iconClass: 'risk-icon-suspicious',
    badgeClass: 'risk-badge-suspicious',
    icon: AlertTriangle,
    title: 'Suspicious — Proceed With Caution',
    badgeLabel: 'SUSPICIOUS WARNING',
    subtext: 'Warning signals, missing verification details, or urgency patterns were detected.',
  },
  HIGH_RISK: {
    bannerClass: 'risk-banner-high-risk',
    iconClass: 'risk-icon-high-risk',
    badgeClass: 'risk-badge-high-risk',
    icon: ShieldAlert,
    title: 'High Scam Risk — Dangerous Indicators Found',
    badgeLabel: 'HIGH RISK SCAM ALERT',
    subtext: 'Critical warning signs such as payment demands or direct selection without interview were identified.',
  },
};

export default function RiskResult({ result, onReset }) {
  if (!result) return null;

  const rawRisk = (result.risk || 'SUSPICIOUS').toUpperCase();
  const config = RISK_CONFIG[rawRisk] || RISK_CONFIG.SUSPICIOUS;
  const RiskIcon = config.icon;

  const indicators = result.indicators || [];
  const nextActions = result.next_actions || [];

  return (
    <div className="result-container" id="analysis-result">
      {/* Primary Risk Status Banner */}
      <div className={`risk-banner ${config.bannerClass}`}>
        <div className={`risk-icon-wrapper ${config.iconClass}`}>
          <RiskIcon size={30} strokeWidth={2.2} />
        </div>
        <div style={{ flex: 1 }}>
          <div className={`risk-badge ${config.badgeClass}`}>
            <RiskIcon size={13} />
            <span>{config.badgeLabel}</span>
          </div>
          <h2 className="risk-headline">{config.title}</h2>
          <p className="risk-explanation">{result.explanation || config.subtext}</p>
        </div>
      </div>

      {/* Fraud Indicators List */}
      <div className="card">
        <h3 className="section-title">
          <AlertOctagon size={18} style={{ color: 'var(--accent-cyan)' }} />
          <span>Detected Indicators & Evidence ({indicators.length})</span>
        </h3>

        {indicators.length > 0 ? (
          <div className="indicators-list">
            {indicators.map((indicator, idx) => (
              <IndicatorCard key={idx} indicator={indicator} />
            ))}
          </div>
        ) : (
          <div
            style={{
              padding: '1.5rem',
              background: 'rgba(16, 185, 129, 0.05)',
              border: '1px dashed rgba(16, 185, 129, 0.25)',
              borderRadius: 'var(--radius-lg)',
              color: '#34d399',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
            }}
          >
            <ShieldCheck size={20} />
            <span>No critical scam patterns or fee requests were found in the provided text.</span>
          </div>
        )}
      </div>

      {/* Recommended Next Actions */}
      <NextActions actions={nextActions} />

      {/* Reset / Analyze Another */}
      <div className="reset-row">
        <button type="button" className="btn-reset" onClick={onReset} id="reset-btn">
          <RotateCcw size={16} />
          <span>Analyze Another Offer</span>
        </button>
      </div>
    </div>
  );
}
