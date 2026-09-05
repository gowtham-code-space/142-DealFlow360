import React, { createContext, useContext, useState, useEffect } from 'react';
import { ROLES } from '../utils/constants';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('dealflow_user');
    return saved ? JSON.parse(saved) : {
      id: 'USR-101',
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@dealflow360.internal',
      role: ROLES.SALES_REP,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
    };
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
      role: newRole,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
    };

    if (newRole === ROLES.SALES_MANAGER) {
      mockProfile = {
        id: 'USR-201',
        name: 'David Keller (VP Sales)',
        email: 'david.keller@dealflow360.internal',
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
