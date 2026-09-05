import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatters';

const MS = ({ icon, size = 20 }) => (
  <span className="material-symbols-outlined" style={{ fontSize: size, color: 'inherit' }}>{icon}</span>
);

export default function Header() {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');

  return (
    <header className="top-navbar">
      {/* Left: Role + Quota */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            padding: '2px 8px', borderRadius: 99,
            background: 'rgba(87,52,79,0.1)', color: 'var(--primary)',
            fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em'
          }}>SALES REPRESENTATIVE</span>
          <span style={{
            padding: '2px 8px', borderRadius: 99,
            background: 'var(--surface-container-high)', color: 'var(--on-surface-variant)',
            fontSize: 11, fontWeight: 500
          }}>Midwest Commercial</span>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '3px 10px', borderRadius: 99,
          background: 'var(--surface-container-low)',
          border: '1px solid rgba(209,195,202,0.3)',
          color: 'var(--on-surface-variant)'
        }}>
          <MS icon="trending_up" size={16} />
          <span style={{ fontSize: 11, color: 'var(--on-surface)' }}>
            <strong style={{ color: 'var(--secondary)', fontWeight: 600 }}>84.2% Quota</strong>
            {' '}({formatCurrency(20200000)} / {formatCurrency(24000000)})
          </span>
        </div>
      </div>

      {/* Right: Search + Notifications + User */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Search */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <span className="material-symbols-outlined" style={{
            position: 'absolute', left: 10, fontSize: 16, color: 'var(--outline)', pointerEvents: 'none'
          }}>search</span>
          <input
            type="text"
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            placeholder="Search quotes, customers, products..."
            style={{
              height: 32, paddingLeft: 32, paddingRight: 40, paddingTop: 0, paddingBottom: 0,
              borderRadius: var_('--radius-md'), background: 'var(--surface-container-low)',
              border: '1px solid rgba(209,195,202,0.3)', color: 'var(--on-surface)',
              fontSize: 12, outline: 'none', width: 280,
              fontFamily: 'inherit', transition: 'border-color 0.15s'
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.background = '#fff'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(209,195,202,0.3)'; e.target.style.background = 'var(--surface-container-low)'; }}
          />
          <kbd style={{
            position: 'absolute', right: 8,
            fontSize: 10, color: 'var(--outline)', padding: '1px 5px', borderRadius: 4,
            background: 'var(--surface-container-highest)', border: '1px solid rgba(209,195,202,0.4)',
            fontFamily: 'monospace'
          }}>⌘K</kbd>
        </div>

        {/* Notification bell */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn-icon"
            style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, color: 'var(--on-surface-variant)' }}
          >
            <MS icon="notifications" size={20} />
            <span style={{
              position: 'absolute', top: 6, right: 6,
              width: 8, height: 8, borderRadius: '50%',
              background: 'var(--error)',
              boxShadow: '0 0 0 2px var(--surface-container-lowest)'
            }} />
          </button>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 24, background: 'rgba(209,195,202,0.3)' }} />

        {/* User Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 2 }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff'
            }}>
              <MS icon="person" size={18} />
            </div>
            <span style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 10, height: 10, borderRadius: '50%',
              background: '#10b981', border: '2px solid #fff'
            }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--on-surface)' }}>Devon Brooks</span>
            <span style={{ fontSize: 11, color: 'var(--outline)', marginTop: 2 }}>#USR-6721 • Sales Rep</span>
          </div>
        </div>
      </div>
    </header>
  );
}

function var_(token) { return token; }
