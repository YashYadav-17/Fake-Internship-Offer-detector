import React from 'react';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

const SEVERITY_CONFIG = {
  HIGH: {
    className: 'severity-high',
    label: 'High Severity',
    icon: AlertCircle,
  },
  MEDIUM: {
    className: 'severity-medium',
    label: 'Medium Severity',
    icon: AlertTriangle,
  },
  LOW: {
    className: 'severity-low',
    label: 'Low Severity',
    icon: Info,
  },
};

function formatIndicatorType(type) {
  if (!type) return 'Warning Signal';
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export default function IndicatorCard({ indicator }) {
  const { type, severity, evidence } = indicator;
  const sevKey = (severity || 'MEDIUM').toUpperCase();
  const config = SEVERITY_CONFIG[sevKey] || SEVERITY_CONFIG.MEDIUM;
  const SeverityIcon = config.icon;

  return (
    <div className="indicator-card">
      <div className="indicator-header">
        <span className="indicator-title">
          <SeverityIcon size={16} />
          <span>{formatIndicatorType(type)}</span>
        </span>
        <span className={`severity-pill ${config.className}`}>
          {config.label}
        </span>
      </div>

      {evidence && (
        <div>
          <div className="evidence-label">Cited Evidence From Text</div>
          <div className="evidence-box">
            "{evidence}"
          </div>
        </div>
      )}
    </div>
  );
}
