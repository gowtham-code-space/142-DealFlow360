import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/constants';

const MS = ({ icon, size = 20 }) => (
  <span className="material-symbols-outlined" style={{ fontSize: size, color: 'inherit' }}>{icon}</span>
);

export default function RoleNotDeveloped({ roleName }) {
  const navigate = useNavigate();
  const { user, switchRole, logout } = useAuth();

  const handleSwitchToSalesRep = () => {
    switchRole(ROLES.SALES_REP);
    navigate('/dashboard/sales');
  };

  const handleSwitchToManager = () => {
    switchRole(ROLES.SALES_MANAGER);
    navigate('/dashboard/manager');
  };

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{
      maxWidth: '760px',
      margin: '40px auto',
      padding: '32px',
      background: '#ffffff',
      borderRadius: '12px',
      border: '1px solid #d1c3ca',
      boxShadow: '0 4px 16px rgba(27, 28, 28, 0.04)',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        paddingBottom: '20px',
        marginBottom: '24px',
        borderBottom: '1px solid #efeded'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: 'rgba(234, 179, 8, 0.12)',
          color: '#ca8a04',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <MS icon="engineering" size={28} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1b1c1c', margin: 0 }}>
              {roleName || 'Role Workspace'} Under Development
            </h1>
            <span style={{
              padding: '2px 8px',
              borderRadius: '99px',
              background: 'rgba(234, 179, 8, 0.15)',
              color: '#a16207',
              fontSize: '0.75rem',
              fontWeight: 700
            }}>
              NOT DEVELOPED YET
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#4e444a', margin: '4px 0 0 0' }}>
            The dedicated frontend workspace for this role has not been built in this hackathon release.
          </p>
        </div>
      </div>

      {/* Session Details Box */}
      <div style={{
        padding: '16px',
        borderRadius: '8px',
        background: '#faf9f9',
        border: '1px solid #efeded',
        marginBottom: '24px'
      }}>
        <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1b1c1c', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Active Developer Session Status
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.8rem' }}>
          <div>
            <span style={{ color: '#80747a' }}>Authenticated User:</span>
            <div style={{ fontWeight: 600, color: '#1b1c1c', marginTop: '2px' }}>{user?.name || 'Developer Session'}</div>
          </div>
          <div>
            <span style={{ color: '#80747a' }}>User Email:</span>
            <div style={{ fontWeight: 600, color: '#1b1c1c', marginTop: '2px' }}>{user?.email || 'N/A'}</div>
          </div>
          <div>
            <span style={{ color: '#80747a' }}>Active Role Session:</span>
            <div style={{ fontWeight: 700, color: '#57344f', marginTop: '2px' }}>{user?.role || 'N/A'}</div>
          </div>
          <div>
            <span style={{ color: '#80747a' }}>Session Persistence:</span>
            <div style={{ fontWeight: 600, color: '#059669', marginTop: '2px' }}>Active (`localStorage.dealflow_user`)</div>
          </div>
        </div>
      </div>

      {/* Navigation Options */}
      <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1b1c1c', marginBottom: '12px' }}>
        Switch to Developed Workspaces:
      </h4>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button
          onClick={handleSwitchToSalesRep}
          style={{
            padding: '10px 16px',
            borderRadius: '6px',
            background: '#00696e',
            color: '#ffffff',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <MS icon="work" size={18} />
          <span>Sales Representative Workspace</span>
        </button>

        <button
          onClick={handleSwitchToManager}
          style={{
            padding: '10px 16px',
            borderRadius: '6px',
            background: '#57344f',
            color: '#ffffff',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <MS icon="fact_check" size={18} />
          <span>Sales Manager Workspace</span>
        </button>

        <button
          onClick={handleSignOut}
          style={{
            padding: '10px 16px',
            borderRadius: '6px',
            background: 'transparent',
            color: '#b91c1c',
            border: '1px solid #fca5a5',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <MS icon="logout" size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
