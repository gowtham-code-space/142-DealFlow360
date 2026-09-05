import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

const MS = ({ icon, size = 18 }) => (
  <span className="material-symbols-outlined" style={{ fontSize: size, color: 'inherit' }}>{icon}</span>
);

function formatTimeAgo(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

function getPriorityBadgeStyle(priority) {
  switch (priority) {
    case 'ACTION_REQUIRED':
      return { background: 'rgba(239, 68, 68, 0.1)', color: '#b91c1c', border: '1px solid rgba(239, 68, 68, 0.25)', label: 'Action Required', icon: 'error_outline' };
    case 'SUCCESS':
      return { background: 'rgba(16, 185, 129, 0.1)', color: '#047857', border: '1px solid rgba(16, 185, 129, 0.25)', label: 'Approved / Success', icon: 'check_circle' };
    case 'WARNING':
      return { background: 'rgba(245, 158, 11, 0.1)', color: '#b45309', border: '1px solid rgba(245, 158, 11, 0.25)', label: 'Attention Needed', icon: 'warning' };
    default:
      return { background: 'rgba(59, 130, 246, 0.1)', color: '#1d4ed8', border: '1px solid rgba(59, 130, 246, 0.25)', label: 'Information', icon: 'info' };
  }
}

export default function Notifications() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userNotifications, unreadCount, markAsRead, markAllAsRead, clearNotification } = useNotifications();

  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'UNREAD' | 'APPROVALS' | 'QUOTES' | 'ORDERS'
  const [searchQuery, setSearchQuery] = useState('');

  // Filter logic
  const filteredNotifications = userNotifications.filter(notif => {
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = notif.title.toLowerCase().includes(q);
      const matchMsg = notif.message.toLowerCase().includes(q);
      const matchId = (notif.relatedId || '').toLowerCase().includes(q);
      if (!matchTitle && !matchMsg && !matchId) return false;
    }

    // Category tab filter
    if (activeTab === 'UNREAD') return !notif.isRead;
    if (activeTab === 'APPROVALS') {
      return notif.priority === 'ACTION_REQUIRED' || notif.type.includes('APPROVAL') || notif.type.includes('MARGIN') || notif.type.includes('ESCALATION');
    }
    if (activeTab === 'QUOTES') {
      return notif.relatedEntity === 'quote' || notif.type.includes('QUOTE') || notif.type.includes('NEGOTIATION');
    }
    if (activeTab === 'ORDERS') {
      return notif.relatedEntity === 'order' || notif.relatedEntity === 'invoice' || notif.type.includes('ORDER') || notif.type.includes('INVOICE') || notif.type.includes('PAYMENT');
    }
    return true;
  });

  const handleNotificationClick = (notif) => {
    markAsRead(notif.id);
    if (notif.targetUrl) {
      navigate(notif.targetUrl);
    }
  };

  return (
    <div className="flex-col gap-4" style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* Header Bar */}
      <div className="flex-between" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 className="headline-lg" style={{ margin: 0 }}>Notifications Inbox</h1>
            {unreadCount > 0 && (
              <span className="badge badge-danger" style={{ fontSize: 11 }}>
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="body-md text-secondary" style={{ margin: '4px 0 0 0' }}>
            System alerts, approval updates, and negotiation statuses for <strong>{user?.name || 'Current Role'}</strong>
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            className="btn btn-outline btn-sm"
            onClick={markAllAsRead}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <MS icon="done_all" size={16} />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {/* Filter Toolbar & Tabs */}
      <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button
              className={`btn btn-sm ${activeTab === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('ALL')}
            >
              All ({userNotifications.length})
            </button>

            <button
              className={`btn btn-sm ${activeTab === 'UNREAD' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('UNREAD')}
            >
              Unread ({unreadCount})
            </button>

            <button
              className={`btn btn-sm ${activeTab === 'APPROVALS' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('APPROVALS')}
            >
              Approvals
            </button>

            <button
              className={`btn btn-sm ${activeTab === 'QUOTES' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('QUOTES')}
            >
              Quotes & Negotiations
            </button>

            <button
              className={`btn btn-sm ${activeTab === 'ORDERS' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('ORDERS')}
            >
              Orders & Billing
            </button>
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative', minWidth: 240 }}>
            <span className="material-symbols-outlined" style={{
              position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
              fontSize: 16, color: 'var(--outline)', pointerEvents: 'none'
            }}>search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search notifications..."
              style={{
                width: '100%',
                height: 34,
                paddingLeft: 32,
                paddingRight: 12,
                borderRadius: 'var(--radius-md)',
                background: 'var(--surface-container-low)',
                border: '1px solid rgba(209,195,202,0.3)',
                color: 'var(--on-surface)',
                fontSize: 12,
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Notifications List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
          {filteredNotifications.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--outline)' }}>
              <span style={{ opacity: 0.4, display: 'inline-block', marginBottom: 12 }}>
                <MS icon="notifications_off" size={48} />
              </span>
              <h3 className="headline-sm text-primary" style={{ margin: 0 }}>No notifications found</h3>
              <p className="body-md" style={{ marginTop: 4 }}>
                {searchQuery ? `No alerts matching "${searchQuery}"` : activeTab === 'UNREAD' ? 'You are all caught up! No unread alerts.' : 'No notification records in this category.'}
              </p>
            </div>
          ) : (
            filteredNotifications.map(notif => {
              const badge = getPriorityBadgeStyle(notif.priority);

              return (
                <div
                  key={notif.id}
                  style={{
                    padding: '16px 20px',
                    borderRadius: 'var(--radius-md)',
                    border: notif.isRead ? '1px solid rgba(209,195,202,0.25)' : '1px solid var(--primary)',
                    background: notif.isRead ? '#ffffff' : 'rgba(87,52,79,0.03)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justify: 'space-between',
                    gap: 16,
                    transition: 'all 0.15s ease',
                    boxShadow: notif.isRead ? 'none' : '0 2px 8px rgba(87,52,79,0.05)'
                  }}
                >
                  {/* Left Column: Icon & Details */}
                  <div style={{ display: 'flex', gap: 14, flex: 1, minWidth: 0 }}>
                    {/* Unread indicator & Icon */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                      <span style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: notif.isRead ? 'transparent' : 'var(--primary)',
                        flexShrink: 0
                      }} />
                      <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: badge.background,
                        color: badge.color,
                        display: 'flex',
                        alignItems: 'center',
                        justify: 'center',
                        flexShrink: 0
                      }}>
                        <MS icon={badge.icon} size={20} />
                      </div>
                    </div>

                    {/* Text Details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <h4 style={{
                          fontSize: 14,
                          fontWeight: notif.isRead ? 600 : 700,
                          color: 'var(--on-surface)',
                          margin: 0
                        }}>
                          {notif.title}
                        </h4>

                        <span style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: 99,
                          background: badge.background,
                          color: badge.color,
                          border: badge.border
                        }}>
                          {badge.label}
                        </span>

                        {notif.relatedId && (
                          <span style={{
                            fontSize: 11,
                            fontWeight: 500,
                            padding: '2px 8px',
                            borderRadius: 4,
                            background: 'var(--surface-container-high)',
                            color: 'var(--on-surface-variant)',
                            fontFamily: 'monospace'
                          }}>
                            {notif.relatedId}
                          </span>
                        )}
                      </div>

                      <p style={{
                        fontSize: 13,
                        color: 'var(--on-surface-variant)',
                        margin: '6px 0 0 0',
                        lineHeight: 1.4
                      }}>
                        {notif.message}
                      </p>

                      <div style={{ fontSize: 11, color: 'var(--outline)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span><MS icon="schedule" size={14} /> {formatTimeAgo(notif.createdAt)}</span>
                        <span>•</span>
                        <span>{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Action Buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    {!notif.isRead && (
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notif.id);
                        }}
                        title="Mark as read"
                      >
                        <MS icon="check" size={16} />
                        <span>Read</span>
                      </button>
                    )}

                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleNotificationClick(notif)}
                      style={{ gap: 4 }}
                    >
                      <span>View</span>
                      <MS icon="arrow_forward" size={16} />
                    </button>

                    <button
                      className="btn-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearNotification(notif.id);
                      }}
                      title="Dismiss notification"
                      style={{ color: 'var(--outline)', width: 28, height: 28 }}
                    >
                      <MS icon="close" size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
