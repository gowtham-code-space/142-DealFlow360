import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/constants';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  CheckSquare,
  Boxes,
  Receipt,
  MessageSquareDiff,
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuth();
  const isCustomer = user?.role === ROLES.CUSTOMER;

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: 'var(--glass-border)' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff'
        }}>
          <Layers size={20} />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #fff 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            DealFlow<span style={{ color: '#6366f1', WebkitTextFillColor: '#6366f1' }}>360</span>
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Quote-to-Cash Engine
          </div>
        </div>
      </div>

      {/* Nav Menu */}
      <nav style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, padding: '8px 12px 4px' }}>
          {isCustomer ? 'Customer Portal' : 'Workspace'}
        </div>

        {isCustomer ? (
          <>
            <NavLink
              to="/portal"
              className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', textAlign: 'left', border: 'none', background: ({ isActive }) => isActive ? undefined : 'transparent' }}
            >
              <ExternalLink size={18} />
              <span>Customer Portal</span>
            </NavLink>
            <NavLink
              to="/negotiation"
              className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', textAlign: 'left', border: 'none', background: ({ isActive }) => isActive ? undefined : 'transparent' }}
            >
              <MessageSquareDiff size={18} />
              <span>Negotiation Hub</span>
            </NavLink>
          </>
        ) : (
          <>
            <NavLink
              to="/dashboard/sales"
              className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', textAlign: 'left', border: 'none', background: ({ isActive }) => isActive ? undefined : 'transparent' }}
            >
              <LayoutDashboard size={18} />
              <span>Sales Dashboard</span>
            </NavLink>

            <NavLink
              to="/quotations"
              className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', textAlign: 'left', border: 'none', background: ({ isActive }) => isActive ? undefined : 'transparent' }}
            >
              <FileText size={18} />
              <span>Quotations</span>
            </NavLink>

            <NavLink
              to="/quotations/new"
              className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', textAlign: 'left', border: 'none', background: ({ isActive }) => isActive ? undefined : 'transparent' }}
            >
              <PlusCircle size={18} />
              <span>New Quote (CPQ)</span>
            </NavLink>

            <NavLink
              to="/approvals"
              className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', textAlign: 'left', border: 'none', background: ({ isActive }) => isActive ? undefined : 'transparent' }}
            >
              <CheckSquare size={18} />
              <span>Approval Queue</span>
            </NavLink>

            <NavLink
              to="/inventory"
              className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', textAlign: 'left', border: 'none', background: ({ isActive }) => isActive ? undefined : 'transparent' }}
            >
              <Boxes size={18} />
              <span>Warehouse Allocation</span>
            </NavLink>

            <NavLink
              to="/billing"
              className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', textAlign: 'left', border: 'none', background: ({ isActive }) => isActive ? undefined : 'transparent' }}
            >
              <Receipt size={18} />
              <span>Billing & Invoices</span>
            </NavLink>

            <NavLink
              to="/negotiation"
              className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', textAlign: 'left', border: 'none', background: ({ isActive }) => isActive ? undefined : 'transparent' }}
            >
              <MessageSquareDiff size={18} />
              <span>Deal Redlining</span>
            </NavLink>
          </>
        )}

        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, padding: '18px 12px 4px' }}>
          Role Views
        </div>

        <NavLink
          to="/dashboard/manager"
          className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
          style={{ justifyContent: 'flex-start', textAlign: 'left', border: 'none', background: ({ isActive }) => isActive ? undefined : 'transparent' }}
        >
          <Sparkles size={18} />
          <span>Manager Dashboard</span>
        </NavLink>

        <NavLink
          to="/dashboard/operations"
          className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
          style={{ justifyContent: 'flex-start', textAlign: 'left', border: 'none', background: ({ isActive }) => isActive ? undefined : 'transparent' }}
        >
          <Boxes size={18} />
          <span>Operations Dashboard</span>
        </NavLink>

        <NavLink
          to="/portal"
          className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
          style={{ justifyContent: 'flex-start', textAlign: 'left', border: 'none', background: ({ isActive }) => isActive ? undefined : 'transparent' }}
        >
          <ExternalLink size={18} />
          <span>Customer Portal View</span>
        </NavLink>
      </nav>

      {/* System Badge */}
      <div style={{ padding: '16px', borderTop: 'var(--glass-border)', background: 'rgba(0,0,0,0.2)' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>Database Mode:</span>
          <span style={{ color: '#10b981', fontWeight: 700, background: 'var(--success-light)', padding: '2px 6px', borderRadius: '4px' }}>MySQL</span>
        </div>
      </div>
    </aside>
  );
}
