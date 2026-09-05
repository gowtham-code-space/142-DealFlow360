import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/constants';

const MS = ({ icon, size = 18 }) => (
  <span className="material-symbols-outlined" style={{ fontSize: size, color: 'inherit' }}>{icon}</span>
);

export default function Login() {
  const navigate = useNavigate();
  const { switchRole } = useAuth();
  const [email, setEmail] = useState('sarah.jenkins@dealflow360.internal');
  const [password, setPassword] = useState('••••••••••••');
  const [submitting, setSubmitting] = useState(false);

  const handleStandardLogin = (e) => {
    e.preventDefault();
    setSubmitting(true);
    switchRole(ROLES.SALES_REP);
    setTimeout(() => {
      navigate('/dashboard/sales');
    }, 300);
  };

  const handleEnterDemoRole = (role, routePath) => {
    switchRole(role);
    navigate(routePath);
  };

  const roleOptions = [
    {
      role: ROLES.SALES_REP,
      title: 'Sales Representative',
      desc: 'Create and manage quotations, line item discounts, and customer negotiations.',
      icon: 'work',
      route: '/dashboard/sales',
      badgeColor: '#00696e',
      badgeBg: 'rgba(0, 105, 110, 0.1)',
      isDeveloped: true
    },
    {
      role: ROLES.SALES_MANAGER,
      title: 'Sales Manager / Approver',
      desc: 'Review approval queues, evaluate margin risk, and approve/reject deal exceptions.',
      icon: 'fact_check',
      route: '/dashboard/manager',
      badgeColor: '#57344f',
      badgeBg: 'rgba(87, 52, 79, 0.15)',
      isDeveloped: true
    },
    {
      role: ROLES.OPERATIONS,
      title: 'Finance / Operations',
      desc: 'Manage multi-warehouse stock allocation, fulfillment logistics, and recurring billing.',
      icon: 'inventory_2',
      route: '/dashboard/operations',
      badgeColor: '#0284c7',
      badgeBg: 'rgba(2, 132, 199, 0.1)',
      isDeveloped: false
    },
    {
      role: ROLES.ADMIN,
      title: 'Administrator',
      desc: 'Configure governance policies, tier caps, user permissions, and system settings.',
      icon: 'admin_panel_settings',
      route: '/admin/dashboard',
      badgeColor: '#7c3aed',
      badgeBg: 'rgba(124, 58, 237, 0.1)',
      isDeveloped: true
    },
    {
      role: ROLES.CUSTOMER,
      title: 'Customer Portal User',
      desc: 'Review quotations, submit counter-offers, and track order fulfillment.',
      icon: 'storefront',
      route: '/portal',
      badgeColor: '#059669',
      badgeBg: 'rgba(5, 150, 105, 0.1)',
      isDeveloped: false
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--surface, #faf9f9)',
      padding: '24px 16px',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{
        maxWidth: '880px',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1.4fr)',
        gap: '24px',
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #d1c3ca',
        boxShadow: '0 4px 20px rgba(27, 28, 28, 0.05)',
        overflow: 'hidden'
      }}>
        
        {/* Left Column: Standard Authentication */}
        <div style={{
          padding: '32px 28px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderRight: '1px solid #efeded',
          background: '#ffffff'
        }}>
          <div>
            {/* Brand Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: '#57344f',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <MS icon="hub" size={22} />
              </div>
              <div>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1b1c1c', margin: 0, letterSpacing: '-0.01em' }}>
                  DealFlow360
                </h1>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#80747a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Enterprise Q2C Platform
                </span>
              </div>
            </div>

            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1b1c1c', marginBottom: '4px' }}>
              Sign In to Your Account
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#4e444a', margin: '0 0 20px 0' }}>
              Authenticate with your corporate credentials to access your designated workspace.
            </p>

            {/* Standard Login Form */}
            <form onSubmit={handleStandardLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#4e444a', marginBottom: '4px' }}>
                  Corporate Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    height: '36px',
                    padding: '0 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1c3ca',
                    background: '#faf9f9',
                    fontSize: '0.85rem',
                    color: '#1b1c1c',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#4e444a', marginBottom: '4px' }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    height: '36px',
                    padding: '0 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1c3ca',
                    background: '#faf9f9',
                    fontSize: '0.85rem',
                    color: '#1b1c1c',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  height: '38px',
                  width: '100%',
                  marginTop: '8px',
                  borderRadius: '6px',
                  background: '#57344f',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
                <MS icon="arrow_forward" size={16} />
              </button>
            </form>
          </div>

          <div style={{ fontSize: '0.75rem', color: '#80747a', marginTop: '24px', borderTop: '1px solid #efeded', paddingTop: '12px' }}>
            DealFlow360 &copy; 2026 • Hackathon Edition v2.0
          </div>
        </div>

        {/* Right Column: Developer / Demo Mode Controls */}
        <div style={{
          padding: '28px 24px',
          background: '#faf9f9',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Developer Mode Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '14px',
            paddingBottom: '12px',
            borderBottom: '1px solid #d1c3ca'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '99px',
                  background: 'rgba(87, 52, 79, 0.15)',
                  color: '#57344f',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em'
                }}>
                  DEVELOPER / DEMO MODE
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#4e444a', margin: '4px 0 0 0' }}>
                Select any of the 5 application roles to enter the live workspace directly.
              </p>
            </div>
          </div>

          {/* Role Cards List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {roleOptions.map((opt) => (
              <div
                key={opt.role}
                onClick={() => handleEnterDemoRole(opt.role, opt.route)}
                style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: '#ffffff',
                  border: '1px solid #d1c3ca',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease-in-out',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#57344f';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(87, 52, 79, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#d1c3ca';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    background: opt.badgeBg,
                    color: opt.badgeColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <MS icon={opt.icon} size={18} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1b1c1c' }}>
                        {opt.title}
                      </div>
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '99px',
                        background: opt.isDeveloped ? 'rgba(16, 185, 129, 0.12)' : 'rgba(234, 179, 8, 0.15)',
                        color: opt.isDeveloped ? '#047857' : '#a16207'
                      }}>
                        {opt.isDeveloped ? 'DEVELOPED' : 'NOT DEVELOPED YET'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#4e444a', marginTop: '2px' }}>
                      {opt.desc}
                    </div>
                  </div>
                </div>

                <button
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: 'transparent',
                    border: '1px solid #d1c3ca',
                    color: '#57344f',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    flexShrink: 0
                  }}
                >
                  <span>Enter</span>
                  <MS icon="chevron_right" size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
