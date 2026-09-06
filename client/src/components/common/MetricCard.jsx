import React from 'react';

export default function MetricCard({ title, value, change, isPositive, icon: Icon, color = '#6366f1' }) {
  return (
    <div style={{
      background    : '#fff',
      border        : '1px solid #e5e7eb',
      borderTop     : `3px solid ${color}`,
      borderRadius  : 12,
      padding       : '18px 20px',
      display       : 'flex',
      flexDirection : 'column',
      gap           : 10,
      boxShadow     : '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
      transition    : 'box-shadow 0.2s ease',
      fontFamily    : 'Inter, system-ui, sans-serif',
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{
          fontSize      : '0.72rem',
          fontWeight    : 600,
          color         : '#6b7280',
          letterSpacing : '0.05em',
          textTransform : 'uppercase',
          lineHeight    : 1.4,
        }}>
          {title}
        </span>

        {Icon && (
          <div style={{
            width        : 36,
            height       : 36,
            borderRadius : 10,
            background   : `${color}18`,
            color        : color,
            display      : 'flex',
            alignItems   : 'center',
            justifyContent: 'center',
            flexShrink   : 0,
          }}>
            <Icon size={18} />
          </div>
        )}
      </div>

      {/* Value */}
      <div style={{
        fontSize       : '1.8rem',
        fontWeight     : 800,
        color          : '#111827',
        letterSpacing  : '-0.02em',
        lineHeight     : 1,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {value}
      </div>

      {/* Change indicator */}
      {change && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
          <span style={{
            display      : 'inline-flex',
            alignItems   : 'center',
            gap          : 3,
            fontSize     : '0.72rem',
            fontWeight   : 700,
            padding      : '2px 6px',
            borderRadius : 99,
            background   : isPositive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            color        : isPositive ? '#059669' : '#dc2626',
          }}>
            {isPositive ? '↑' : '↓'} {change}
          </span>
        </div>
      )}
    </div>
  );
}

