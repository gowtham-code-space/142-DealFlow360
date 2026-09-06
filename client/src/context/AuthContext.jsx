import React, { createContext, useContext, useState, useEffect } from 'react';
import { ROLES } from '../utils/constants';

const AuthContext = createContext(null);

<<<<<<< Updated upstream
=======
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

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

>>>>>>> Stashed changes
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('dealflow_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('dealflow_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('dealflow_user');
    }
  }, [user]);

  const switchRole = (newRole) => {
    let mockProfile = {
      id: 'USR-101',
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@dealflow360.internal',
      role: newRole || ROLES.SALES_REP,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
    };

    if (newRole === ROLES.SALES_MANAGER) {
      mockProfile = {
        id: 'USR-201',
        name: 'David K. Vance',
        email: 'david.vance@dealflow360.internal',
        role: newRole,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
      };
    } else if (newRole === ROLES.OPERATIONS) {
      mockProfile = {
        id: 'USR-301',
        name: 'Elena Rostova (Finance/Ops)',
        email: 'elena.rostova@dealflow360.internal',
        role: newRole,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      };
    } else if (newRole === ROLES.ADMIN) {
      mockProfile = {
        id: 'USR-401',
        name: 'Victoria Stone (System Admin)',
        email: 'victoria.stone@dealflow360.internal',
        role: newRole,
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
      };
    } else if (newRole === ROLES.CUSTOMER) {
      mockProfile = {
        id: 'CUST-002-USR',
        name: 'Marcus Vance (Nexus HyperScale)',
        email: 'procurement@nexushyperscale.com',
        role: newRole,
        customerId: 'CUST-002',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
      };
    }

    setUser(mockProfile);
  };

  const login = (userData) => setUser(userData);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
