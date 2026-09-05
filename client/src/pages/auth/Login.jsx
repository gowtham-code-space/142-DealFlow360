import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ROLES } from '../../utils/constants';
import DealFlowLogo from '../../components/common/DealFlowLogo';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '513783597794-g3e1dc4gu7i29f4093e5lulfnf7hbkcd.apps.googleusercontent.com';

const MS = ({ icon, size = 18 }) => (
  <span className="material-symbols-outlined" style={{ fontSize: size, color: 'inherit' }}>{icon}</span>
);

export default function Login() {
  const navigate = useNavigate();
  const { user, loading: authLoading, loginWithEmail, signupCustomer, loginWithGoogle } = useAuth();
  const { toast } = useToast();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const googleBtnRef = useRef(null);

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (user && !authLoading) {
      redirectToDashboard(user.role);
    }
  }, [user, authLoading]);

  // Initialize Google Identity Services (GIS) SDK
  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true
          });

          if (googleBtnRef.current) {
            googleBtnRef.current.innerHTML = '';
            window.google.accounts.id.renderButton(googleBtnRef.current, {
              theme: 'outline',
              size: 'large',
              type: 'standard',
              shape: 'rectangular',
              text: 'signin_with',
              logo_alignment: 'center',
              width: 380
            });
          }
        } catch (err) {
          console.warn('[Google GIS] Initialization notice:', err.message);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initializeGoogleSignIn();
    } else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleSignIn;
      document.body.appendChild(script);
    }
  }, [isSignUp]);

  // Route redirect based on verified user role
  const redirectToDashboard = (userRole) => {
    switch (userRole) {
      case ROLES.ADMIN:
      case 'ADMIN':
        navigate('/admin/dashboard');
        break;
      case ROLES.SALES_MANAGER:
      case 'SALES_MANAGER':
        navigate('/dashboard/manager');
        break;
      case ROLES.OPERATIONS:
      case 'FINANCE_OPS':
        navigate('/dashboard/operations');
        break;
      case ROLES.CUSTOMER:
      case 'CUSTOMER':
        navigate('/portal');
        break;
      case ROLES.SALES_REP:
      case 'SALES_REP':
      default:
        navigate('/dashboard/sales');
        break;
    }
  };

  // Google OAuth Callback handler
  const handleGoogleCredentialResponse = async (response) => {
    if (!response.credential) return;
    setSubmitting(true);
    setError(null);
    try {
      const mode = isSignUp ? 'signup' : 'login';
      const res = await loginWithGoogle(response.credential, mode);

      if (res.success && res.user) {
        if (mode === 'signup') {
          toast.success(`Welcome to DealFlow360, ${res.user.name || 'User'}!`, 'Account Created');
        } else {
          toast.success(`Welcome back, ${res.user.name || 'User'}!`, 'Google Authentication');
        }
        redirectToDashboard(res.user.role);
      } else if (res.notFound) {
        // User not found in DB on login -> restrict and direct to signup
        const errorMsg = res.message || 'No account found with this Google email. Please register on the Sign Up tab first.';
        setError(errorMsg);
        toast.warning(errorMsg, 'Account Not Found');
        setIsSignUp(true);
      } else if (res.isEmployee) {
        // Employee account detected during signup attempt
        const warnMsg = 'This email is an internal employee account created by Administrator. Please sign in instead.';
        setError(warnMsg);
        toast.warning(warnMsg, 'Corporate Employee Account');
        setIsSignUp(false);
      } else if (res.conflict) {
        // Account already exists during signup attempt
        const infoMsg = res.message || 'An account with this email already exists. Please sign in.';
        setError(infoMsg);
        toast.info(infoMsg, 'Account Exists');
        setIsSignUp(false);
      } else {
        const errorMsg = res.message || 'Google authentication failed';
        setError(errorMsg);
        toast.error(errorMsg, 'Authentication Error');
      }
    } catch (err) {
      setError(err.message || 'Google authentication failed');
      toast.error(err.message, 'Sign-In Error');
    } finally {
      setSubmitting(false);
    }
  };

  // Form Submit Handler (Sign In / Sign Up)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (isSignUp) {
      // Sign Up flow (Customer Registration)
      if (!name || !email || !password) {
        setError('Please fill in all required fields.');
        return;
      }

      setSubmitting(true);
      const res = await signupCustomer({ name, email, password, phone });

      if (res.success && res.user) {
        toast.success(`Welcome to DealFlow360, ${res.user.name}!`, 'Account Created');
        redirectToDashboard(ROLES.CUSTOMER);
      } else if (res.isEmployee) {
        // Internal employee account detected
        toast.warning(
          'This email is an internal employee account created by Administrator. Please sign in instead.',
          'Corporate Employee Account'
        );
        setIsSignUp(false);
      } else if (res.conflict) {
        toast.info(res.message || 'An account with this email already exists. Please sign in.', 'Account Exists');
        setIsSignUp(false);
      } else {
        setError(res.message || 'Signup failed. Please try again.');
        toast.error(res.message || 'Registration failed', 'Error');
      }
      setSubmitting(false);
    } else {
      // Sign In flow (Unified for both Employees & Customers)
      if (!email || !password) {
        setError('Please enter both email and password.');
        return;
      }

      setSubmitting(true);
      const res = await loginWithEmail(email, password);

      if (res.success && res.user) {
        toast.success(`Authenticated as ${res.user.role}`, `Welcome, ${res.user.name}`);
        redirectToDashboard(res.user.role);
      } else {
        const msg = res.message || 'Authentication failed. Please check your credentials.';
        setError(msg);
        toast.error(msg, 'Sign-In Failed');
        if (res.notFound) {
          toast.info('No account found with this email. You can sign up for a Customer Account below.', 'New User');
        }
      }
      setSubmitting(false);
    }
  };

  // Demo email selector helper
  const fillDemoEmail = (demoEmail) => {
    setIsSignUp(false);
    setEmail(demoEmail);
    setError(null);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f8f9fa 0%, #ede9ec 100%)',
      padding: '24px 16px',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{
        maxWidth: '460px',
        width: '100%',
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 12px 36px rgba(87, 52, 79, 0.08)',
        padding: '36px 32px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        
        {/* Brand Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '20px' }}>
          <DealFlowLogo variant="login" />
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#57344f', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '6px' }}>
            Enterprise Q2C Deal Engine
          </div>
          <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '6px 0 0 0' }}>
            {isSignUp ? 'Create a new Customer Portal account' : 'Sign in with your email or Google OAuth'}
          </p>
        </div>

        {/* Tab Switcher: Sign In vs Sign Up */}
        <div style={{
          display: 'flex',
          background: '#f3f4f6',
          borderRadius: '8px',
          padding: '3px',
          marginBottom: '20px'
        }}>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(false);
              setError(null);
            }}
            style={{
              flex: 1,
              padding: '7px 12px',
              borderRadius: '6px',
              border: 'none',
              background: !isSignUp ? '#ffffff' : 'transparent',
              color: !isSignUp ? '#57344f' : '#6b7280',
              fontWeight: !isSignUp ? 700 : 500,
              fontSize: '0.82rem',
              cursor: 'pointer',
              boxShadow: !isSignUp ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(true);
              setError(null);
            }}
            style={{
              flex: 1,
              padding: '7px 12px',
              borderRadius: '6px',
              border: 'none',
              background: isSignUp ? '#ffffff' : 'transparent',
              color: isSignUp ? '#57344f' : '#6b7280',
              fontWeight: isSignUp ? 700 : 500,
              fontSize: '0.82rem',
              cursor: 'pointer',
              boxShadow: isSignUp ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Sign Up
          </button>
        </div>

        {/* In-Card Error Alert */}
        {error && (
          <div style={{
            padding: '10px 14px',
            borderRadius: '8px',
            background: '#fee2e2',
            border: '1px solid #f87171',
            color: '#991b1b',
            fontSize: '0.8rem',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <MS icon="error" size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Google OAuth Section */}
        <div style={{ marginBottom: '18px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div
            ref={googleBtnRef}
            style={{
              minHeight: '44px',
              width: '100%',
              display: 'flex',
              justifyContent: 'center'
            }}
          />
        </div>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '18px',
          color: '#9ca3af',
          fontSize: '0.78rem'
        }}>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
          <span>{isSignUp ? 'or register with email' : 'or sign in with email'}</span>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
        </div>

        {/* Dynamic Form: Sign In vs Sign Up */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {isSignUp && (
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>
                Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Marcus Vance"
                style={{
                  width: '100%',
                  height: '38px',
                  padding: '0 12px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  background: '#f9fafb',
                  fontSize: '0.88rem',
                  color: '#111827',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
                required
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>
              Work / Account Email *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@dealflow360.internal"
              style={{
                width: '100%',
                height: '38px',
                padding: '0 12px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                background: '#f9fafb',
                fontSize: '0.88rem',
                color: '#111827',
                outline: 'none',
                fontFamily: 'inherit'
              }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>
              Password *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isSignUp ? 'Minimum 6 characters' : 'Enter your password'}
              style={{
                width: '100%',
                height: '38px',
                padding: '0 12px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                background: '#f9fafb',
                fontSize: '0.88rem',
                color: '#111827',
                outline: 'none',
                fontFamily: 'inherit'
              }}
              required
            />
          </div>

          {isSignUp && (
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 019-2834"
                style={{
                  width: '100%',
                  height: '38px',
                  padding: '0 12px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  background: '#f9fafb',
                  fontSize: '0.88rem',
                  color: '#111827',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              height: '42px',
              width: '100%',
              marginTop: '4px',
              borderRadius: '8px',
              background: submitting ? '#9ca3af' : '#57344f',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(87, 52, 79, 0.2)',
              transition: 'background 0.15s ease'
            }}
          >
            <span>{submitting ? 'Authenticating...' : (isSignUp ? 'Create Customer Account' : 'Sign In to Workspace')}</span>
            <MS icon="arrow_forward" size={17} />
          </button>
        </form>

        {/* Footer */}
        <div style={{ fontSize: '0.7rem', color: '#9ca3af', textAlign: 'center', marginTop: '24px' }}>
          DealFlow360 &copy; 2026 • Enterprise Q2C Platform
        </div>

      </div>
    </div>
  );
}
