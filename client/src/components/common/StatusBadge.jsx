import React from 'react';
import { getStatusBadgeClass } from '../../utils/formatters';

export default function StatusBadge({ status, text }) {
  const badgeClass = getStatusBadgeClass(status);
  const label = text || status?.replace(/_/g, ' ');

  return (
    <span className={`badge ${badgeClass}`}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}></span>
      {label}
    </span>
  );
}
