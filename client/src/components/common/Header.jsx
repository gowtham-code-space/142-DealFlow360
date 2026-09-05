import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/constants';
import { Bell, Search, ShieldCheck, UserCheck } from 'lucide-react';

export default function Header() {
  const { user, switchRole } = useAuth();

  return (
    <header className="top-navbar">
      <div className="flex-gap-3" style={{ flex: 1, maxWidth: '400px' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search quotations, SKUs, customers..."
            className="input-field"
            style={{ paddingLeft: '36px', height: '38px', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      <div className="flex-gap-4">
        {/* Role Demo Switcher */}
        <div className="flex-gap-2" style={{ background: 'var(--bg-input)', padding: '4px 10px', borderRadius: 'var(--radius-md)', border: 'var(--glass-border)' }}>
          <ShieldCheck size={16} color="var(--primary)" />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Role:</span>
          <select
            value={user?.role}
            onChange={(e) => switchRole(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '0.8rem', fontWeight: 600, outline: 'none', cursor: 'pointer' }}
          >
            <option value={ROLES.SALES_REP} style={{ background: '#111827' }}>Sales Rep</option>
            <option value={ROLES.SALES_MANAGER} style={{ background: '#111827' }}>Sales Manager</option>
            <option value={ROLES.OPERATIONS} style={{ background: '#111827' }}>Operations / Finance</option>
            <option value={ROLES.CUSTOMER} style={{ background: '#111827' }}>Customer Portal</option>
          </select>
        </div>

        <button className="btn btn-secondary btn-sm" style={{ padding: '6px 10px' }} title="Notifications">
          <Bell size={16} />
        </button>

        {/* User Profile */}
        <div className="flex-gap-2">
          <img
            src={user?.avatar}
            alt={user?.name}
            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--primary)' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user?.name}</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{user?.role}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
