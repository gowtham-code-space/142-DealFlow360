import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/constants';
import { Layers, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { switchRole } = useAuth();
  const [email, setEmail] = useState('sarah.jenkins@dealflow360.internal');
  const [password, setPassword] = useState('password123');

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/dashboard/sales');
  };

  const handleQuickRole = (role, path) => {
    switchRole(role);
    navigate(path);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at 50% 30%, rgba(99, 102, 241, 0.15) 0%, #0b0f17 80%)', padding: '20px' }}>
      <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '36px', borderColor: 'rgba(99, 102, 241, 0.3)' }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            marginBottom: '12px',
            boxShadow: '0 0 24px rgba(99, 102, 241, 0.5)'
          }}>
            <Layers size={28} />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>DealFlow360</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Quote-to-Cash (Q2C) & Deal Lifecycle Engine
          </p>
        </div>

        {/* Demo Fast Login Switcher */}
        <div style={{ marginBottom: '24px', background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: 'var(--radius-md)', border: 'var(--glass-border)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>
            ⚡ Demo Instant Login as:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              onClick={() => handleQuickRole(ROLES.SALES_REP, '/dashboard/sales')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', justifyContent: 'flex-start' }}
            >
              💼 Sales Rep
            </button>
            <button
              onClick={() => handleQuickRole(ROLES.SALES_MANAGER, '/dashboard/manager')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', justifyContent: 'flex-start' }}
            >
              👔 Manager
            </button>
            <button
              onClick={() => handleQuickRole(ROLES.OPERATIONS, '/dashboard/operations')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', justifyContent: 'flex-start' }}
            >
              📦 Operations
            </button>
            <button
              onClick={() => handleQuickRole(ROLES.CUSTOMER, '/portal')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', justifyContent: 'flex-start' }}
            >
              🌐 Buyer Portal
            </button>
          </div>
        </div>

        {/* Regular Login Form */}
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label className="input-label">Corporate Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }}>
            <span>Sign In to DealFlow360</span>
            <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
