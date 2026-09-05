import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { ROLES } from '../utils/constants';
import { api } from '../services/api';

const NotificationContext = createContext(null);

// Normalize a backend notification record to the frontend shape
function normalizeBackendNotification(n, activeRole) {
  return {
    id: n.id,
    recipientRole: activeRole,
    type: n.type || 'SYSTEM',
    priority: n.type?.includes('REQUIRED') ? 'ACTION_REQUIRED' : 'INFO',
    title: n.type ? n.type.replace(/_/g, ' ') : 'System Notification',
    message: n.message || '',
    relatedEntity: n.relatedQuoteId ? 'quote' : 'system',
    relatedId: n.relatedQuoteId || '',
    targetUrl: n.relatedQuoteId ? `/quotations/${n.relatedQuoteId}` : '/notifications',
    isRead: Boolean(n.isRead),
    createdAt: n.createdAt || new Date().toISOString()
  };
}

export function NotificationProvider({ children }) {
  const { user } = useAuth();

  // Start with an empty array — notifications come only from the real backend.
  // No mock/seed data. If backend returns [], the badge shows 0 and the panel is empty.
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoaded, setNotificationsLoaded] = useState(false);

  const activeRole = user?.role || ROLES.SALES_REP;

  // Filter to the current user's role
  const userNotifications = useMemo(() => {
    return notifications.filter(n => n.recipientRole === activeRole);
  }, [notifications, activeRole]);

  const unreadCount = useMemo(() => {
    return userNotifications.filter(n => !n.isRead).length;
  }, [userNotifications]);

  // Load notifications from the real backend whenever the authenticated user changes
  useEffect(() => {
    async function loadBackendNotifications() {
      if (!user) {
        setNotifications([]);
        setNotificationsLoaded(true);
        return;
      }
      try {
        const res = await api.getNotifications();
        if (res.success && Array.isArray(res.data)) {
          // Always replace local state with the backend truth, even if [] (empty state is valid)
          const normalized = res.data.map(n => normalizeBackendNotification(n, activeRole));
          setNotifications(normalized);
        } else if (res.success && res.data?.items) {
          const normalized = res.data.items.map(n => normalizeBackendNotification(n, activeRole));
          setNotifications(normalized);
        }
        // If res.success === false, keep the existing local state (user-added in-session notifications)
      } catch (e) {
        // Network error — keep existing state, don't crash the app
        console.warn('[NotificationContext] Backend notifications unavailable:', e.message);
      } finally {
        setNotificationsLoaded(true);
      }
    }
    loadBackendNotifications();
  }, [user?.id, activeRole]); // re-run only on user change, not on every activeRole string change

  const markAsRead = async (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    try {
      await api.markNotificationRead(id);
    } catch {
      // Optimistic update already applied; ignore backend failure
    }
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n =>
      n.recipientRole === activeRole ? { ...n, isRead: true } : n
    ));
    try {
      await api.markAllNotificationsRead();
    } catch {
      // Optimistic update already applied; ignore backend failure
    }
  };

  /**
   * Add a transient in-session notification (used after manager approve/reject/return actions).
   * These are NOT persisted to the backend — they are UI feedback events.
   */
  const addNotification = (notif) => {
    const newNotif = {
      id: `NTF-SESSION-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      recipientRole: notif.recipientRole,
      type: notif.type || 'BUSINESS_EVENT',
      priority: notif.priority || 'INFO',
      title: notif.title,
      message: notif.message,
      relatedEntity: notif.relatedEntity || 'system',
      relatedId: notif.relatedId || '',
      targetUrl: notif.targetUrl || '/notifications',
      isRead: false,
      createdAt: notif.createdAt || new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);
    return newNotif;
  };

  const clearNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      userNotifications,
      unreadCount,
      activeRole,
      notificationsLoaded,
      markAsRead,
      markAllAsRead,
      addNotification,
      clearNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
