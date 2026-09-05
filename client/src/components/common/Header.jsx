import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/constants';

const MS = ({ icon, size = 20 }) => (
  <span className="material-symbols-outlined" style={{ fontSize: size, color: 'inherit' }}>{icon}</span>
);

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [searchValue, setSearchValue] = useState('');

  const isManagerView = user?.role === ROLES.SALES_MANAGER ||
                        location.pathname.startsWith('/dashboard/manager') || 
                        location.pathname.startsWith('/approvals') || 
                        location.pathname.startsWith('/manager');

  const isOpsView = location.pathname.startsWith('/dashboard/operations') ||
                    location.pathname.startsWith('/inventory') ||
                    location.pathname.startsWith('/billing') ||
                    location.pathname.startsWith('/finance') ||
                    user?.role === ROLES.OPERATIONS;

  const isCustomerView = user?.role === ROLES.CUSTOMER ||
                        location.pathname.startsWith('/portal');

  const isAdminView = location.pathname.startsWith('/dashboard/admin') ||
                    location.pathname.startsWith('/admin') ||
                    user?.role === ROLES.ADMIN;

  const currentRoleName = user?.role || (isCustomerView ? ROLES.CUSTOMER : isAdminView ? ROLES.ADMIN : isManagerView ? ROLES.SALES_MANAGER : isOpsView ? ROLES.OPERATIONS : ROLES.SALES_REP);
  const currentUserName = user?.name || (isCustomerView ? 'Marcus Vance (Nexus HyperScale)' : isAdminView ? 'Victoria Stone' : isManagerView ? 'David K. Vance' : isOpsView ? 'Elena Rostova' : 'Sarah Jenkins');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="top-navbar">
      {/* Left: Role + Context */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {isCustomerView ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                padding: '2px 8px', borderRadius: 99,
                background: 'rgba(5, 150, 105, 0.1)', color: '#059669',
                fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                border: '1px solid rgba(5, 150, 105, 0.25)'
              }}>CUSTOMER PORTAL</span>
              <span style={{
                padding: '2px 8px', borderRadius: 99,
                background: 'var(--surface-container-high)', color: 'var(--on-surface-variant)',
                fontSize: 11, fontWeight: 500
              }}>Nexus HyperScale Ltd</span>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '3px 10px', borderRadius: 99,
              background: 'var(--surface-container-low)',
              border: '1px solid rgba(209,195,202,0.3)',
              color: 'var(--on-surface-variant)'
            }}>
              <MS icon="storefront" size={16} />
              <span style={{ fontSize: 11, color: 'var(--on-surface)' }}>
                Account Tier: <strong style={{ color: '#059669', fontWeight: 600 }}>Gold Tier (20% Max Disc)</strong>
              </span>
            </div>
          </>
        ) : isAdminView ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                padding: '2px 8px', borderRadius: 99,
                background: 'rgba(124, 58, 237, 0.15)', color: '#7c3aed',
                fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                border: '1px solid rgba(124, 58, 237, 0.3)'
              }}>ADMINISTRATOR</span>
              <span style={{
                padding: '2px 8px', borderRadius: 99,
                background: 'var(--surface-container-high)', color: 'var(--on-surface-variant)',
                fontSize: 11, fontWeight: 500
              }}>System Governance & Security Policy</span>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '3px 10px', borderRadius: 99,
              background: 'var(--surface-container-low)',
              border: '1px solid rgba(209,195,202,0.3)',
              color: 'var(--on-surface-variant)'
            }}>
              <MS icon="security" size={16} />
              <span style={{ fontSize: 11, color: 'var(--on-surface)' }}>
                System Audit: <strong style={{ color: '#7c3aed', fontWeight: 600 }}>100% Enforced</strong>
              </span>
            </div>
          </>
        ) : isManagerView ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                padding: '2px 8px', borderRadius: 99,
                background: 'rgba(87,52,79,0.15)', color: 'var(--primary)',
                fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                border: '1px solid rgba(87,52,79,0.3)'
              }}>SALES MANAGER / APPROVER</span>
              <span style={{
                padding: '2px 8px', borderRadius: 99,
                background: 'var(--surface-container-high)', color: 'var(--on-surface-variant)',
                fontSize: 11, fontWeight: 500
              }}>North America West & Enterprise</span>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '3px 10px', borderRadius: 99,
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#b91c1c'
            }}>
              <MS icon="shield_with_heart" size={16} />
              <span style={{ fontSize: 11, fontWeight: 600 }}>
                Approval Workload: <strong>3 Pending</strong> (1 Urgent SLA)
              </span>
            </div>
          </>
        ) : isOpsView ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                padding: '2px 8px', borderRadius: 99,
                background: 'rgba(2, 132, 199, 0.1)', color: '#0284c7',
                fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                border: '1px solid rgba(2, 132, 199, 0.25)'
              }}>FINANCE & OPERATIONS</span>
              <span style={{
                padding: '2px 8px', borderRadius: 99,
                background: 'var(--surface-container-high)', color: 'var(--on-surface-variant)',
                fontSize: 11, fontWeight: 500
              }}>Global Warehouses & Logistics</span>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '3px 10px', borderRadius: 99,
              background: 'var(--surface-container-low)',
              border: '1px solid rgba(209,195,202,0.3)',
              color: 'var(--on-surface-variant)'
            }}>
              <MS icon="inventory_2" size={16} />
              <span style={{ fontSize: 11, color: 'var(--on-surface)' }}>
                MRR Pipeline: <strong style={{ color: 'var(--secondary)', fontWeight: 600 }}>{formatCurrency(1450000)}/mo</strong>
              </span>
            </div>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>

      {/* Right: Search + Notifications + User Profile + Logout */}
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
            placeholder={isManagerView ? "Search approvals, quotes, reps, risk rules..." : "Search quotes, customers, products..."}
            style={{
              height: 32, paddingLeft: 32, paddingRight: 40, paddingTop: 0, paddingBottom: 0,
              borderRadius: 'var(--radius-md)', background: 'var(--surface-container-low)',
              border: '1px solid rgba(209,195,202,0.3)', color: 'var(--on-surface)',
              fontSize: 12, outline: 'none', width: 260,
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
            onClick={() => navigate('/notifications')}
            style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, color: 'var(--on-surface-variant)', cursor: 'pointer' }}
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

        {/* User Avatar & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: isCustomerView ? '#059669' : isManagerView ? '#714b67' : isOpsView ? '#0284c7' : 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff'
              }}>
                <MS icon={isManagerView ? "admin_panel_settings" : isOpsView ? "inventory_2" : "person"} size={18} />
              </div>
              <span style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 10, height: 10, borderRadius: '50%',
                background: '#10b981', border: '2px solid #fff'
              }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--on-surface)' }}>
                {currentUserName}
              </span>
              <span style={{ fontSize: 11, color: 'var(--outline)', marginTop: 2 }}>
                {currentRoleName}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Log Out & Switch Role"
            style={{
              padding: '4px 8px', borderRadius: 6,
              border: '1px solid rgba(209,195,202,0.4)',
              background: 'var(--surface-container-low)',
              color: 'var(--on-surface-variant)',
              fontSize: 11, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4
            }}
          >
            <MS icon="logout" size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
