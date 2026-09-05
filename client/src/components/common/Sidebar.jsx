import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/constants';

const MS = ({ icon, size = 18 }) => (
  <span className="material-symbols-outlined" style={{ fontSize: size, color: 'inherit' }}>{icon}</span>
);

export default function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

  const isCustomerView = user?.role === ROLES.CUSTOMER ||
                        location.pathname.startsWith('/portal');

  const isAdminView = user?.role === ROLES.ADMIN ||
                    location.pathname.startsWith('/dashboard/admin') ||
                    location.pathname.startsWith('/admin');

  const isManagerView = user?.role === ROLES.SALES_MANAGER ||
                        location.pathname.startsWith('/dashboard/manager') || 
                        location.pathname.startsWith('/approvals') || 
                        location.pathname.startsWith('/manager');

  const isOpsView = user?.role === ROLES.OPERATIONS ||
                    location.pathname.startsWith('/dashboard/operations') ||
                    location.pathname.startsWith('/inventory') ||
                    location.pathname.startsWith('/billing') ||
                    location.pathname.startsWith('/finance');

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
            width: 32, height: 32, borderRadius: 8, 
            background: isCustomerView ? '#059669' : isManagerView ? '#57344f' : isOpsView ? '#0284c7' : isAdminView ? '#7c3aed' : 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', flexShrink: 0
          }}>
            <MS icon={isCustomerView ? "storefront" : isManagerView ? "verified_user" : isOpsView ? "inventory_2" : isAdminView ? "admin_panel_settings" : "hub"} size={18} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)', letterSpacing: '-0.01em' }}>DealFlow360</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>
              {isCustomerView ? 'Customer Portal' : isManagerView ? 'Manager Console' : isOpsView ? 'Finance & Operations' : isAdminView ? 'System Admin Console' : 'Sales Workspace'}
            </span>
          </div>
        </div>

        {/* Nav label */}
        <div className="nav-section-label">
          {isCustomerView ? 'Procurement & Orders' : isManagerView ? 'Governance & Approvals' : isOpsView ? 'Fulfillment & Finance' : isAdminView ? 'Governance & System Admin' : 'Sales Operations'}
        </div>

        {/* Navigation */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 1, paddingBottom: 8 }}>
          {isCustomerView ? (
            <>
              <NavLink to="/portal" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <MS icon="dashboard" size={18} />
                <span>Dashboard</span>
              </NavLink>

              <NavLink to="/portal/quotes" className={({ isActive }) => `nav-item ${isActive || location.pathname.startsWith('/portal/quotes') ? 'active' : ''}`}>
                <MS icon="request_quote" size={18} />
                <span>My Quotes</span>
              </NavLink>

              <NavLink to="/portal/orders" className={({ isActive }) => `nav-item ${isActive || location.pathname.startsWith('/portal/orders') ? 'active' : ''}`}>
                <MS icon="local_shipping" size={18} />
                <span>My Orders</span>
              </NavLink>

              <NavLink to="/portal/invoices" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <MS icon="receipt_long" size={18} />
                <span>Billing / Invoices</span>
              </NavLink>

              <NavLink to="/portal/support" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <MS icon="support_agent" size={18} />
                <span>Support & SLA</span>
              </NavLink>
            </>
          ) : isAdminView ? (
            <>
              <NavLink to="/admin/dashboard" className={({ isActive }) => `nav-item ${isActive || location.pathname === '/dashboard/admin' ? 'active' : ''}`}>
                <MS icon="dashboard" size={18} />
                <span>Admin Dashboard</span>
              </NavLink>

              <NavLink to="/admin/customers" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <MS icon="group" size={18} />
                <span>Customers</span>
              </NavLink>

              <NavLink to="/admin/products" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <MS icon="inventory_2" size={18} />
                <span>Products</span>
              </NavLink>

              <NavLink to="/admin/discount-policies" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <MS icon="percent" size={18} />
                <span>Discount Policies</span>
              </NavLink>

              <NavLink to="/admin/approval-rules" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <MS icon="rule" size={18} />
                <span>Approval Rules</span>
              </NavLink>

              <NavLink to="/admin/resources-warehouses" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <MS icon="warehouse" size={18} />
                <span>Resources / Warehouses</span>
              </NavLink>

              <NavLink to="/admin/subscription-plans" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <MS icon="loyalty" size={18} />
                <span>Subscription Plans</span>
              </NavLink>

              <NavLink to="/admin/users-and-roles" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <MS icon="admin_panel_settings" size={18} />
                <span>Users & Roles</span>
              </NavLink>

              <NavLink to="/admin/audit-logs" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <MS icon="receipt_long" size={18} />
                <span>Audit Logs</span>
              </NavLink>

              <NavLink to="/admin/system-settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <MS icon="settings" size={18} />
                <span>System Settings</span>
              </NavLink>
            </>
          ) : isManagerView ? (
            <>
              <NavLink to="/dashboard/manager" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <MS icon="speed" size={18} />
                <span>Manager Dashboard</span>
              </NavLink>

              <NavLink
                to="/approvals"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                style={{ justifyContent: 'space-between' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MS icon="fact_check" size={18} />
                  <span>Approval Queue</span>
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 99,
                  background: 'var(--error-container)', color: 'var(--error)',
                  lineHeight: '16px'
                }}>3</span>
              </NavLink>

              <NavLink to="/quotations" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <MS icon="request_quote" size={18} />
                <span>All Quotations</span>
              </NavLink>

              <NavLink to="/customers" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <MS icon="domain" size={18} />
                <span>Customer Intelligence</span>
              </NavLink>

              <NavLink
                to="/negotiation"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                style={{ justifyContent: 'space-between' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MS icon="handshake" size={18} />
                  <span>Deal Negotiations</span>
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
                <span>Pipeline & Deals</span>
              </NavLink>

              <NavLink to="/notifications" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <MS icon="notifications" size={18} />
                <span>Notifications</span>
              </NavLink>
            </>
          ) : isOpsView ? (
            <>
              <NavLink to="/dashboard/operations" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <MS icon="speed" size={18} />
                <span>Operations Dashboard</span>
              </NavLink>

              <NavLink
                to="/finance/approvals"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                style={{ justifyContent: 'space-between' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MS icon="shield" size={18} />
                  <span>Finance Approvals</span>
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 99,
                  background: 'rgba(234, 179, 8, 0.15)', color: '#ca8a04',
                  lineHeight: '16px'
                }}>2</span>
              </NavLink>

              <NavLink to="/inventory" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <MS icon="inventory_2" size={18} />
                <span>Stock & Allocation</span>
              </NavLink>

              <NavLink to="/billing" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <MS icon="payments" size={18} />
                <span>Billing & Invoicing</span>
              </NavLink>

              <NavLink to="/quotations" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <MS icon="request_quote" size={18} />
                <span>Fulfillment Orders</span>
              </NavLink>

              <NavLink to="/customers" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <MS icon="domain" size={18} />
                <span>Accounts & Credit</span>
              </NavLink>

              <NavLink to="/notifications" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <MS icon="notifications" size={18} />
                <span>Notifications</span>
              </NavLink>
            </>
          ) : (
            <>
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
            </>
          )}
        </nav>
      </div>

      {/* Territory / Governance Stats */}
      <div style={{
        margin: 8, padding: 10, borderRadius: 10,
        background: 'var(--surface-container-low)',
        border: '1px solid rgba(209,195,202,0.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {isCustomerView ? 'Account Overview' : isManagerView ? 'Governance SLA' : isAdminView ? 'System Status' : isOpsView ? 'Ops Overview' : 'Territory Stats'}
          </span>
          <span style={{
            fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 99,
            background: isCustomerView ? 'rgba(5,150,105,0.12)' : isManagerView ? 'rgba(87,52,79,0.1)' : isAdminView ? 'rgba(124,58,237,0.12)' : isOpsView ? 'rgba(2,132,199,0.12)' : 'rgba(0,105,110,0.1)',
            color: isCustomerView ? '#047857' : isManagerView ? 'var(--primary)' : isAdminView ? '#7c3aed' : isOpsView ? '#0284c7' : 'var(--secondary)'
          }}>
            {isCustomerView ? 'Gold Tier' : isManagerView ? 'SLA: 4.0 Hours' : isAdminView ? 'All Systems OK' : isOpsView ? '3 Warehouses' : 'Midwest Region'}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 11, color: 'var(--on-surface-variant)' }}>
          {isCustomerView ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--outline)' }}>Credit Limit:</span>
                <span style={{ fontWeight: 600, color: '#047857', fontFeatureSettings: "'tnum'" }}>₹1.20 Cr</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--outline)' }}>Dedicated Rep:</span>
                <span style={{ fontWeight: 600, color: '#047857' }}>Alex Rivera</span>
              </div>
              <div style={{ height: 6, background: 'var(--surface-container-highest)', borderRadius: 99, marginTop: 4, overflow: 'hidden' }}>
                <div style={{ width: '68%', height: '100%', background: '#047857', borderRadius: 99 }} />
              </div>
            </>
          ) : isManagerView ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--outline)' }}>Avg Decision SLA:</span>
                <span style={{ fontWeight: 600, color: '#10b981', fontFeatureSettings: "'tnum'" }}>2.1 Hours</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--outline)' }}>Min Gross Margin:</span>
                <span style={{ fontWeight: 600, color: 'var(--primary)', fontFeatureSettings: "'tnum'" }}>≥35.0% Enforced</span>
              </div>
              <div style={{ height: 6, background: 'var(--surface-container-highest)', borderRadius: 99, marginTop: 4, overflow: 'hidden' }}>
                <div style={{ width: '92%', height: '100%', background: '#10b981', borderRadius: 99 }} />
              </div>
            </>
          ) : isAdminView ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--outline)' }}>Active Policies:</span>
                <span style={{ fontWeight: 600, color: '#7c3aed', fontFeatureSettings: "'tnum'" }}>6 Rules</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--outline)' }}>Users & Roles:</span>
                <span style={{ fontWeight: 600, color: 'var(--on-surface)', fontFeatureSettings: "'tnum'" }}>5 Roles Active</span>
              </div>
              <div style={{ height: 6, background: 'var(--surface-container-highest)', borderRadius: 99, marginTop: 4, overflow: 'hidden' }}>
                <div style={{ width: '100%', height: '100%', background: '#7c3aed', borderRadius: 99 }} />
              </div>
            </>
          ) : isOpsView ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--outline)' }}>Network Stock:</span>
                <span style={{ fontWeight: 600, color: '#0284c7', fontFeatureSettings: "'tnum'" }}>1,370 Units</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--outline)' }}>MRR Pipeline:</span>
                <span style={{ fontWeight: 600, color: 'var(--on-surface)', fontFeatureSettings: "'tnum'" }}>₹14.5L/mo</span>
              </div>
              <div style={{ height: 6, background: 'var(--surface-container-highest)', borderRadius: 99, marginTop: 4, overflow: 'hidden' }}>
                <div style={{ width: '78%', height: '100%', background: '#0284c7', borderRadius: 99 }} />
              </div>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
