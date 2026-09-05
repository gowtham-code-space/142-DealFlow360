import React from 'react';

export default function MetricCard({ title, value, change, isPositive, icon: Icon, color = '#6366f1' }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div className="flex-between">
        <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{title}</span>
        {Icon && (
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: `${color}20`,
            color: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Icon size={18} />
          </div>
        )}
      </div>

      <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
        {value}
      </div>

      {change && (
        <div style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ color: isPositive ? '#10b981' : '#ef4444', fontWeight: 600 }}>
            {isPositive ? '↑' : '↓'} {change}
          </span>
          <span style={{ color: 'var(--text-muted)' }}>vs last month</span>
        </div>
      )}
    </div>
  );
}
