import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { ROLES } from '../utils/constants';

const NotificationContext = createContext(null);

const INITIAL_NOTIFICATIONS = [
  // Sales Rep Notifications
  {
    id: 'NTF-REP-001',
    recipientRole: ROLES.SALES_REP,
    type: 'NEGOTIATION_REQUEST',
    priority: 'ACTION_REQUIRED',
    title: 'Negotiation request received',
    message: 'Nexus HyperScale requested a change to Quote Q-2026-002.',
    relatedEntity: 'quote',
    relatedId: 'Q-2026-002',
    targetUrl: '/negotiation/NEG-2026-002',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString() // 18m ago
  },
  {
    id: 'NTF-REP-002',
    recipientRole: ROLES.SALES_REP,
    type: 'QUOTE_APPROVED',
    priority: 'SUCCESS',
    title: 'Quote approved',
    message: 'Quote Q-2026-001 has been approved by the Sales Manager.',
    relatedEntity: 'quote',
    relatedId: 'Q-2026-001',
    targetUrl: '/quotations/Q-2026-001',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString() // 1h ago
  },
  {
    id: 'NTF-REP-003',
    recipientRole: ROLES.SALES_REP,
    type: 'ORDER_CREATED',
    priority: 'SUCCESS',
    title: 'Order created',
    message: 'Order ORD-2026-0041 was created from Quote Q-2026-001.',
    relatedEntity: 'order',
    relatedId: 'ORD-2026-0041',
    targetUrl: '/quotations/Q-2026-001',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString() // 3h ago
  },
  {
    id: 'NTF-REP-004',
    recipientRole: ROLES.SALES_REP,
    type: 'PAYMENT_RECEIVED',
    priority: 'INFO',
    title: 'Payment received',
    message: 'Payment for Invoice INV-2026-001 has been received.',
    relatedEntity: 'invoice',
    relatedId: 'INV-2026-001',
    targetUrl: '/billing',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString() // 6h ago
  },

  // Sales Manager Notifications
  {
    id: 'NTF-MGR-001',
    recipientRole: ROLES.SALES_MANAGER,
    type: 'APPROVAL_REQUIRED',
    priority: 'ACTION_REQUIRED',
    title: 'Approval required',
    message: 'Quote Q-2026-002 requires your approval because the requested discount exceeds the Sales Representative limit.',
    relatedEntity: 'quote',
    relatedId: 'Q-2026-002',
    targetUrl: '/approvals/Q-2026-002',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString() // 5m ago
  },
  {
    id: 'NTF-MGR-002',
    recipientRole: ROLES.SALES_MANAGER,
    type: 'NEGOTIATION_REVIEW',
    priority: 'ACTION_REQUIRED',
    title: 'Negotiation requires review',
    message: 'Nexus HyperScale submitted a counter-offer for Quote Q-2026-002.',
    relatedEntity: 'quote',
    relatedId: 'Q-2026-002',
    targetUrl: '/negotiation/NEG-2026-002',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString() // 25m ago
  },
  {
    id: 'NTF-MGR-003',
    recipientRole: ROLES.SALES_MANAGER,
    type: 'MARGIN_EXCEPTION',
    priority: 'WARNING',
    title: 'Margin exception requires review',
    message: 'Quote Q-2026-004 requires additional review before approval.',
    relatedEntity: 'quote',
    relatedId: 'Q-2026-004',
    targetUrl: '/approvals/Q-2026-004',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString() // 2h ago
  },
  {
    id: 'NTF-MGR-004',
    recipientRole: ROLES.SALES_MANAGER,
    type: 'FINANCE_ESCALATION',
    priority: 'INFO',
    title: 'Finance escalation',
    message: 'Quote Q-2026-005 requires Finance / Operations review.',
    relatedEntity: 'quote',
    relatedId: 'Q-2026-005',
    targetUrl: '/approvals/Q-2026-005',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString() // 4h ago
  },

  // Operations Notifications
  {
    id: 'NTF-OPS-001',
    recipientRole: ROLES.OPERATIONS,
    type: 'FINANCE_APPROVAL_REQUIRED',
    priority: 'ACTION_REQUIRED',
    title: 'Finance approval required',
    message: 'Quote Q-2026-005 requires Finance / Operations approval.',
    relatedEntity: 'quote',
    relatedId: 'Q-2026-005',
    targetUrl: '/finance/approvals',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString() // 15m ago
  },
  {
    id: 'NTF-OPS-002',
    recipientRole: ROLES.OPERATIONS,
    type: 'FULFILLMENT_ATTENTION',
    priority: 'WARNING',
    title: 'Fulfillment attention required',
    message: 'Order ORD-2026-0041 requires operations review.',
    relatedEntity: 'order',
    relatedId: 'ORD-2026-0041',
    targetUrl: '/inventory',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString() // 45m ago
  },
  {
    id: 'NTF-OPS-003',
    recipientRole: ROLES.OPERATIONS,
    type: 'STOCK_ISSUE',
    priority: 'WARNING',
    title: 'Stock allocation issue',
    message: 'Order ORD-2026-0041 cannot currently be fully fulfilled.',
    relatedEntity: 'order',
    relatedId: 'ORD-2026-0041',
    targetUrl: '/inventory',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 200).toISOString()
  },
  {
    id: 'NTF-OPS-004',
    recipientRole: ROLES.OPERATIONS,
    type: 'INVOICE_GENERATED',
    priority: 'SUCCESS',
    title: 'Invoice generated',
    message: 'Invoice INV-2026-001 is ready for processing.',
    relatedEntity: 'invoice',
    relatedId: 'INV-2026-001',
    targetUrl: '/billing',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 300).toISOString()
  },

  // Admin Notifications
  {
    id: 'NTF-ADM-001',
    recipientRole: ROLES.ADMIN,
    type: 'USER_ADDED',
    priority: 'INFO',
    title: 'New user added',
    message: 'A new user has been added to DealFlow360.',
    relatedEntity: 'user',
    relatedId: 'USR-502',
    targetUrl: '/admin/users-and-roles',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  },
  {
    id: 'NTF-ADM-002',
    recipientRole: ROLES.ADMIN,
    type: 'APPROVAL_RULE_UPDATED',
    priority: 'INFO',
    title: 'Approval rule updated',
    message: 'An approval rule has been modified.',
    relatedEntity: 'rule',
    relatedId: 'ARULE-102',
    targetUrl: '/admin/approval-rules',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString()
  },
  {
    id: 'NTF-ADM-003',
    recipientRole: ROLES.ADMIN,
    type: 'POLICY_UPDATED',
    priority: 'INFO',
    title: 'Discount policy updated',
    message: 'A discount governance policy has changed.',
    relatedEntity: 'policy',
    relatedId: 'POL-001',
    targetUrl: '/admin/discount-policies',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 210).toISOString()
  },
  {
    id: 'NTF-ADM-004',
    recipientRole: ROLES.ADMIN,
    type: 'WAREHOUSE_UPDATED',
    priority: 'INFO',
    title: 'Warehouse configuration updated',
    message: 'Regional resource configuration has changed.',
    relatedEntity: 'warehouse',
    relatedId: 'WH-WEST',
    targetUrl: '/admin/resources-warehouses',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 400).toISOString()
  },

  // Customer Notifications (Completely Customer Facing, No Internal Metrics)
  {
    id: 'NTF-CUST-001',
    recipientRole: ROLES.CUSTOMER,
    type: 'NEW_QUOTE',
    priority: 'INFO',
    title: 'New quote available',
    message: 'Quote Q-2026-001 is ready for your review.',
    relatedEntity: 'quote',
    relatedId: 'Q-2026-001',
    targetUrl: '/portal/quotes/Q-2026-001',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString()
  },
  {
    id: 'NTF-CUST-002',
    recipientRole: ROLES.CUSTOMER,
    type: 'COUNTER_OFFER',
    priority: 'ACTION_REQUIRED',
    title: 'Counter-offer received',
    message: 'A revised offer is available for Quote Q-2026-002.',
    relatedEntity: 'quote',
    relatedId: 'Q-2026-002',
    targetUrl: '/portal/quotes/Q-2026-002',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 50).toISOString()
  },
  {
    id: 'NTF-CUST-003',
    recipientRole: ROLES.CUSTOMER,
    type: 'ORDER_SHIPPED',
    priority: 'SUCCESS',
    title: 'Order shipped',
    message: 'Your order ORD-2026-0041 has shipped.',
    relatedEntity: 'order',
    relatedId: 'ORD-2026-0041',
    targetUrl: '/portal/orders',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 150).toISOString()
  },
  {
    id: 'NTF-CUST-004',
    recipientRole: ROLES.CUSTOMER,
    type: 'INVOICE_AVAILABLE',
    priority: 'INFO',
    title: 'Invoice available',
    message: 'Invoice INV-2026-001 is ready to view.',
    relatedEntity: 'invoice',
    relatedId: 'INV-2026-001',
    targetUrl: '/portal/invoices',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 320).toISOString()
  },
  {
    id: 'NTF-CUST-005',
    recipientRole: ROLES.CUSTOMER,
    type: 'RESERVATION_EXPIRING',
    priority: 'WARNING',
    title: 'Stock reservation expiring',
    message: 'Your reserved inventory will be released soon.',
    relatedEntity: 'quote',
    relatedId: 'Q-2026-002',
    targetUrl: '/portal/quotes/Q-2026-002',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 110).toISOString()
  }
];

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('dealflow_notifications_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved notifications', e);
      }
    }
    return INITIAL_NOTIFICATIONS;
  });

  useEffect(() => {
    localStorage.setItem('dealflow_notifications_v1', JSON.stringify(notifications));
  }, [notifications]);

  // Active role based on user state or default to SALES_REP
  const activeRole = user?.role || ROLES.SALES_REP;

  // Filter notifications for the current active user role
  const userNotifications = useMemo(() => {
    return notifications.filter(n => n.recipientRole === activeRole);
  }, [notifications, activeRole]);

  // Unread count for active role
  const unreadCount = useMemo(() => {
    return userNotifications.filter(n => !n.isRead).length;
  }, [userNotifications]);

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => {
      if (n.id === id) {
        return { ...n, isRead: true };
      }
      return n;
    }));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => {
      if (n.recipientRole === activeRole) {
        return { ...n, isRead: true };
      }
      return n;
    }));
  };

  const addNotification = (notif) => {
    const newNotif = {
      id: `NTF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
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
