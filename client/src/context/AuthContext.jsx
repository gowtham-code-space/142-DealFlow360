import React, { createContext, useContext, useState, useEffect } from 'react';
import { ROLES } from '../utils/constants';

const AuthContext = createContext(null);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1';

// Role mapping helper between Backend Enum and Frontend UI constants
export function mapBackendRoleToFrontend(backendRole) {
  switch (backendRole) {
    case 'ADMIN':
      return ROLES.ADMIN;
    case 'SALES_MANAGER':
      return ROLES.SALES_MANAGER;
    case 'FINANCE_OPS':
    case 'OPERATIONS':
      return ROLES.OPERATIONS;
    case 'CUSTOMER':
      return ROLES.CUSTOMER;
    case 'SALES_REP':
    default:
      return ROLES.SALES_REP;
  }
}

export function mapFrontendRoleToBackend(frontendRole) {
  switch (frontendRole) {
    case ROLES.ADMIN:
      return 'ADMIN';
    case ROLES.SALES_MANAGER:
      return 'SALES_MANAGER';
    case ROLES.OPERATIONS:
      return 'FINANCE_OPS';
    case ROLES.CUSTOMER:
      return 'CUSTOMER';
    case ROLES.SALES_REP:
    default:
      return 'SALES_REP';
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('dealflow_token') || null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Sync token in localStorage only (NEVER user data)
  useEffect(() => {
    localStorage.removeItem('dealflow_user'); // Clean up any legacy storage
    if (token) {
      localStorage.setItem('dealflow_token', token);
    } else {
      localStorage.removeItem('dealflow_token');
    }
  }, [token]);

  // Initial load: verify token & load user profile into memory state
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      const savedToken = localStorage.getItem('dealflow_token');
      if (!savedToken) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${savedToken}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        const data = await res.json();
        if (res.ok && data.success && data.data) {
          if (isMounted) {
            const backendUser = data.data;
            setUser({
              ...backendUser,
              role: mapBackendRoleToFrontend(backendUser.role || backendUser.roleId),
              roleId: backendUser.roleId || backendUser.role,
              avatar: backendUser.avatar || getAvatarForRole(backendUser.role || backendUser.roleId)
            });
          }
        } else {
          // Attempt silent token refresh via cookie
          const refRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            credentials: 'include'
          });
          const refData = await refRes.json();
          if (refRes.ok && refData.success && refData.data?.accessToken) {
            const newToken = refData.data.accessToken;
            if (isMounted) setToken(newToken);
            localStorage.setItem('dealflow_token', newToken);

            const meRes = await fetch(`${API_BASE_URL}/auth/me`, {
              headers: {
                'Authorization': `Bearer ${newToken}`,
                'Content-Type': 'application/json'
              },
              credentials: 'include'
            });
            const meData = await meRes.json();
            if (meRes.ok && meData.success && meData.data && isMounted) {
              const u = meData.data;
              setUser({
                ...u,
                role: mapBackendRoleToFrontend(u.role || u.roleId),
                roleId: u.roleId || u.role,
                avatar: u.avatar || getAvatarForRole(u.role || u.roleId)
              });
            }
          } else {
            if (isMounted) {
              setToken(null);
              setUser(null);
              localStorage.removeItem('dealflow_token');
            }
          }
        }
      } catch (err) {
        console.warn('[AuthContext] Session restore error:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  function getAvatarForRole(role) {
    switch (role) {
      case 'ADMIN':
        return 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80';
      case 'SALES_MANAGER':
        return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80';
      case 'FINANCE_OPS':
      case 'OPERATIONS':
        return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
      case 'CUSTOMER':
        return 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80';
      case 'SALES_REP':
      default:
        return 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80';
    }
  }

  // Unified Email + Password Login
  const loginWithEmail = async (email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        const errorMsg = data.message || 'Invalid email or password';
        setAuthError(errorMsg);
        return {
          success: false,
          notFound: data.notFound || res.status === 404,
          message: errorMsg
        };
      }

      const backendUser = data.data.user;
      const userProfile = {
        ...backendUser,
        role: mapBackendRoleToFrontend(backendUser.role || backendUser.roleId),
        roleId: backendUser.roleId || backendUser.role,
        avatar: backendUser.avatar || getAvatarForRole(backendUser.role || backendUser.roleId)
      };

      setToken(data.data.accessToken);
      setUser(userProfile);
      return { success: true, user: userProfile };
    } catch (err) {
      console.warn('[Auth] Login request error:', err.message);
      return { success: false, message: 'Could not connect to authentication server.' };
    } finally {
      setLoading(false);
    }
  };

  // Sign Up Customer Account
  const signupCustomer = async ({ name, email, password, phone }) => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, password, phone })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          conflict: Boolean(data.conflict),
          isEmployee: Boolean(data.isEmployee),
          role: data.role,
          message: data.message || 'Signup failed'
        };
      }

      const backendUser = data.data.user;
      const userProfile = {
        ...backendUser,
        role: ROLES.CUSTOMER,
        roleId: 'CUSTOMER',
        avatar: getAvatarForRole('CUSTOMER')
      };

      setToken(data.data.accessToken);
      setUser(userProfile);
      return { success: true, user: userProfile };
    } catch (err) {
      console.warn('[Auth] Server signup error:', err.message);
      return {
        success: false,
        message: 'Network issue. Could not complete signup.'
      };
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth Login & Registration
  const loginWithGoogle = async (credentialOrToken, mode = 'login') => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          credential: credentialOrToken,
          token: credentialOrToken,
          mode
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        const errorMsg = data.message || (mode === 'signup' ? 'Google registration failed' : 'Google sign-in failed');
        setAuthError(errorMsg);
        return {
          success: false,
          notFound: Boolean(data.notFound) || res.status === 404,
          conflict: Boolean(data.conflict) || res.status === 409,
          isEmployee: Boolean(data.isEmployee),
          role: data.role,
          message: errorMsg
        };
      }

      const backendUser = data.data.user;
      const userProfile = {
        ...backendUser,
        role: mapBackendRoleToFrontend(backendUser.role || backendUser.roleId),
        roleId: backendUser.roleId || backendUser.role,
        avatar: backendUser.avatar || getAvatarForRole(backendUser.role || backendUser.roleId)
      };

      setToken(data.data.accessToken);
      setUser(userProfile);
      return { success: true, user: userProfile };
    } catch (err) {
      console.warn('[Auth] Google OAuth request error:', err.message);
      return {
        success: false,
        message: 'Could not connect to authentication server.'
      };
    } finally {
      setLoading(false);
    }
  };

  const switchRole = (newRole) => {
    const roleId = mapFrontendRoleToBackend(newRole);
    const mockProfile = {
      id: `USR-${roleId}`,
      name: `${newRole} Demo User`,
      email: `${roleId.toLowerCase()}@dealflow360.internal`,
      role: newRole,
      roleId,
      avatar: getAvatarForRole(roleId)
    };
    setUser(mockProfile);
  };

  const login = (userData) => setUser(userData);

  const logout = async () => {
    try {
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include'
        });
      }
    } catch {
      // Ignore
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem('dealflow_token');
    localStorage.removeItem('dealflow_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      token,
      loading,
      authError,
      setAuthError,
      login,
      loginWithEmail,
      signupCustomer,
      loginWithGoogle,
      logout,
      switchRole
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
