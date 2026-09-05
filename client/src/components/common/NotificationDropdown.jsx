import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';

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
      return { background: 'rgba(16, 185, 129, 0.1)', color: '#047857', border: '1px solid rgba(16, 185, 129, 0.25)', label: 'Success', icon: 'check_circle' };
    case 'WARNING':
      return { background: 'rgba(245, 158, 11, 0.1)', color: '#b45309', border: '1px solid rgba(245, 158, 11, 0.25)', label: 'Warning', icon: 'warning' };
    default:
      return { background: 'rgba(59, 130, 246, 0.1)', color: '#1d4ed8', border: '1px solid rgba(59, 130, 246, 0.25)', label: 'Info', icon: 'info' };
  }
}

export default function NotificationDropdown({ isOpen, onClose }) {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const { userNotifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const topNotifications = userNotifications.slice(0, 5);

  const handleItemClick = (notif) => {
    markAsRead(notif.id);
    onClose();
    if (notif.targetUrl) {
      navigate(notif.targetUrl);
    }
  };

  const handleViewAll = () => {
    onClose();
    navigate('/notifications');
  };

  return (
    <div
      ref={dropdownRef}
      style={{
        position: 'absolute',
        top: 'calc(100% + 8px)',
        right: 0,
        width: 360,
        maxHeight: 480,
        background: '#ffffff',
        borderRadius: 12,
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        border: '1px solid var(--border-color, rgba(209,195,202,0.4))',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid rgba(209,195,202,0.25)',
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        background: 'var(--surface-container-lowest, #fff)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--on-surface)' }}>Notifications</span>
          {unreadCount > 0 && (
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              padding: '1px 6px',
              borderRadius: 99,
              background: 'var(--error, #ef4444)',
              color: '#fff'
            }}>
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              padding: '2px 6px'
            }}
          >
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div style={{ overflowY: 'auto', flex: 1, padding: '4px 0' }}>
        {userNotifications.length === 0 ? (
          <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--outline)' }}>
            <MS icon="notifications_paused" size={28} />
            <p style={{ fontSize: 12, marginTop: 8 }}>No notifications right now.</p>
          </div>
        ) : (
          topNotifications.map(notif => {
            const badge = getPriorityBadgeStyle(notif.priority);

            return (
              <div
                key={notif.id}
                onClick={() => handleItemClick(notif)}
                style={{
                  padding: '12px 16px',
                  display: 'flex',
                  gap: 12,
                  alignItems: 'flex-start',
                  cursor: 'pointer',
                  borderBottom: '1px solid rgba(209,195,202,0.15)',
                  background: notif.isRead ? 'transparent' : 'rgba(87,52,79,0.03)',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-container-low, #f8f9fa)'}
                onMouseLeave={e => e.currentTarget.style.background = notif.isRead ? 'transparent' : 'rgba(87,52,79,0.03)'}
              >
                {/* Unread indicator dot & Icon */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  {!notif.isRead ? (
                    <span style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: 'var(--primary)',
                      flexShrink: 0
                    }} />
                  ) : (
                    <span style={{ width: 8, height: 8, flexShrink: 0 }} />
                  )}
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    background: badge.background,
                    color: badge.color,
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'center',
                    flexShrink: 0
                  }}>
                    <MS icon={badge.icon} size={16} />
                  </div>
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                    <h5 style={{
                      fontSize: 13,
                      fontWeight: notif.isRead ? 600 : 700,
                      color: 'var(--on-surface)',
                      margin: 0,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {notif.title}
                    </h5>
                    <span style={{ fontSize: 10, color: 'var(--outline)', flexShrink: 0 }}>
                      {formatTimeAgo(notif.createdAt)}
                    </span>
                  </div>
                  <p style={{
                    fontSize: 11,
                    color: 'var(--on-surface-variant)',
                    margin: '3px 0 0 0',
                    lineHeight: 1.3,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {notif.message}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '10px 16px',
        borderTop: '1px solid rgba(209,195,202,0.25)',
        textAlign: 'center',
        background: 'var(--surface-container-lowest, #fff)'
      }}>
        <button
          onClick={handleViewAll}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--primary)',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            width: '100%'
          }}
        >
          View All Notifications ({userNotifications.length})
        </button>
      </div>
    </div>
  );
}
