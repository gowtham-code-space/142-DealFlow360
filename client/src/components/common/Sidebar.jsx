import React from 'react';
import { NavLink } from 'react-router-dom';

const MS = ({ icon, size = 18 }) => (
  <span className="material-symbols-outlined" style={{ fontSize: size, color: 'inherit' }}>{icon}</span>
);

export default function Sidebar() {
  return (
    <aside className="sidebar" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Brand */}
        <div style={{
          height: 'var(--header-height)', padding: '0 12px',
          display: 'flex', alignItems: 'center', gap: 8,
          borderBottom: '1px solid rgba(209,195,202,0.2)'
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', flexShrink: 0
          }}>
            <MS icon="hub" size={18} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)', letterSpacing: '-0.01em' }}>DealFlow360</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>Sales Workspace</span>
          </div>
        </div>

        {/* Nav label */}
        <div className="nav-section-label">Sales Operations</div>

        {/* Navigation */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 1, paddingBottom: 8 }}>
          <NavLink to="/dashboard/sales" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <MS icon="speed" size={18} />
            <span>Sales Dashboard</span>
          </NavLink>

          <NavLink to="/quotations" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <MS icon="request_quote" size={18} />
            <span>My Quotes</span>
          </NavLink>

          <NavLink to="/quotations/new" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <MS icon="post_add" size={18} />
            <span>Create Quote</span>
          </NavLink>

          <NavLink to="/customers" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <MS icon="domain" size={18} />
            <span>Customers</span>
          </NavLink>

          <NavLink
            to="/negotiation"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            style={{ justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MS icon="handshake" size={18} />
              <span>Negotiations</span>
            </div>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 99,
              background: 'var(--secondary-container)', color: 'var(--on-secondary-container)',
              lineHeight: '16px'
            }}>3</span>
          </NavLink>

          <NavLink to="/conversations" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <MS icon="forum" size={18} />
            <span>Conversations</span>
          </NavLink>

          <NavLink to="/deals" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <MS icon="monetization_on" size={18} />
            <span>My Deals</span>
          </NavLink>

          <NavLink to="/notifications" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <MS icon="notifications" size={18} />
            <span>Notifications</span>
          </NavLink>
        </nav>
      </div>

      {/* Territory Stats */}
      <div style={{
        margin: 8, padding: 10, borderRadius: 10,
        background: 'var(--surface-container-low)',
        border: '1px solid rgba(209,195,202,0.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Territory Stats</span>
          <span style={{
            fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 99,
            background: 'rgba(0,105,110,0.1)', color: 'var(--secondary)'
          }}>Midwest Region</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 11, color: 'var(--on-surface-variant)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--outline)' }}>Deal Floor Lock:</span>
            <span style={{ fontWeight: 600, color: 'var(--on-surface)', fontFeatureSettings: "'tnum'" }}>22.0% Enforced</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--outline)' }}>Fast-Path Cap:</span>
            <span style={{ fontWeight: 600, color: 'var(--secondary)', fontFeatureSettings: "'tnum'" }}>≤12.0%</span>
          </div>
          <div style={{ height: 6, background: 'var(--surface-container-highest)', borderRadius: 99, marginTop: 4, overflow: 'hidden' }}>
            <div style={{ width: '84.2%', height: '100%', background: 'var(--secondary)', borderRadius: 99 }} />
          </div>
        </div>
      </div>
    </aside>
  );
}
