import { useState, useEffect } from 'react';
import { AppLayout } from '../components/ProtectedLayout';
import { useAuth } from '../contexts/AuthContext';
import { markNotificationsRead } from '../lib/api';
import { Bell, CheckCheck } from 'lucide-react';

const TYPE_ICON = {
  task_assigned: '📋',
  submission_reviewed: '🤖',
  project_approved: '✅',
  project_rejected: '❌',
  ai_complete: '⚡',
  general: '🔔'
};

export default function Notifications() {
  const { notifications, fetchNotifications } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleMarkRead = async () => {
    setLoading(true);
    try {
      await markNotificationsRead();
      await fetchNotifications();
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const unread = notifications.filter(n => !n.read).length;

  return (
    <AppLayout>
      <div className="topbar">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">{notifications.length} notifications, {unread} unread</p>
        </div>
        {unread > 0 && (
          <button className="btn btn-secondary" onClick={handleMarkRead} disabled={loading}>
            <CheckCheck size={15} /> Mark All Read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Bell size={40} /></div>
          <h3>No Notifications</h3>
          <p>You're all caught up! Notifications will appear here as you work.</p>
        </div>
      ) : (
        <div style={{ maxWidth: 680, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {notifications.map(notif => (
            <div key={notif._id} style={{
              display: 'flex', alignItems: 'flex-start', gap: 14,
              padding: '16px 20px',
              background: notif.read ? 'var(--bg-card)' : 'rgba(124,58,237,0.08)',
              border: `1px solid ${notif.read ? 'var(--border-subtle)' : 'var(--border-accent)'}`,
              borderRadius: 'var(--radius-lg)',
              transition: 'all 0.2s'
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: notif.read ? 'rgba(255,255,255,0.04)' : 'rgba(124,58,237,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.1rem'
              }}>
                {TYPE_ICON[notif.type] || '🔔'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '0.9rem', fontWeight: notif.read ? 400 : 600,
                  color: notif.read ? 'var(--text-secondary)' : 'var(--text-primary)',
                  marginBottom: 4
                }}>
                  {notif.message}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {new Date(notif.createdAt).toLocaleString()}
                </div>
              </div>
              {!notif.read && (
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-primary)', marginTop: 6, flexShrink: 0 }} />
              )}
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
