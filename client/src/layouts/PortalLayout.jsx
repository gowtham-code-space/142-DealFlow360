import React from 'react';
import Header from '../components/common/Header';
import { Layers, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import DealFlowLogo from '../components/common/DealFlowLogo';

export default function PortalLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      {/* Customer Header */}
      <header style={{
        height: '70px',
        background: 'var(--bg-secondary)',
        borderBottom: 'var(--glass-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <DealFlowLogo variant="portal" />
            <span style={{ fontSize: '0.75rem', color: '#10b981', background: 'var(--success-light)', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>Customer Portal</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/dashboard/sales" className="btn btn-secondary btn-sm">
            ← Switch to Internal View
          </Link>
          <div className="flex-gap-2">
            <span className="badge badge-gold">Nexus HyperScale (Gold Tier)</span>
          </div>
        </div>
      </header>

      <main style={{ flex: 1, padding: '32px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        {children}
      </main>
    </div>
  );
}
