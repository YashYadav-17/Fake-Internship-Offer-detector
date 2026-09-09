import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function NextActions({ actions = [] }) {
  if (!actions || actions.length === 0) return null;

  return (
    <div className="actions-card">
      <h3 className="section-title">
        <CheckCircle2 size={18} style={{ color: 'var(--accent-cyan)' }} />
        <span>Recommended Next Actions</span>
      </h3>
      <ul className="actions-list">
        {actions.map((action, index) => (
          <li key={index} className="action-item">
            <span className="action-bullet">{index + 1}</span>
            <span>{action}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
