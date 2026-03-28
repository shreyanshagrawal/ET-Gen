import { useState, useEffect } from 'react';
import { AppLayout } from '../../components/ProtectedLayout';
import { useAuth } from '../../contexts/AuthContext';
import { getMyTasks, getMyProjects } from '../../lib/api';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, CheckCircle, Clock, AlertCircle, ChevronRight } from 'lucide-react';

const STATUS_COLOR = {
  pending: 'var(--text-muted)', 'in-progress': 'var(--info)',
  review: 'var(--warning)', completed: 'var(--success)'
};
const STATUS_BADGE = {
  pending: 'badge-gray', 'in-progress': 'badge-blue',
  review: 'badge-amber', completed: 'badge-green'
};
const PRIORITY_BG = {
  critical: 'rgba(239,68,68,0.15)', high: 'rgba(245,158,11,0.15)',
  medium: 'rgba(59,130,246,0.1)', low: 'rgba(255,255,255,0.04)'
};

export default function MemberDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMyTasks(), getMyProjects()]).then(([t, p]) => {
      setTasks(t.data?.data || []);
      setProjects(p.data?.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const stats = {
    total: tasks.length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    review: tasks.filter(t => t.status === 'review').length,
    completed: tasks.filter(t => t.status === 'completed').length,
  };
  const completionRate = tasks.length ? Math.round((stats.completed / tasks.length) * 100) : 0;

  if (loading) return (
    <AppLayout>
      <div className="loading-full"><div className="spinner" style={{ width: 36, height: 36 }} /></div>
    </AppLayout>
  );

  const urgentTasks = tasks.filter(t => t.priority === 'critical' || t.priority === 'high').slice(0, 5);
  const recentTasks = tasks.filter(t => t.status !== 'completed').slice(0, 5);

  return (
    <AppLayout>
      <div className="topbar">
        <div>
          <h1 className="page-title">My Dashboard</h1>
          <p className="page-subtitle">Hey {user?.username} 👋 Here's what needs your attention today</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/member/tasks')}>
          <ClipboardList size={15} /> View All Tasks
        </button>
      </div>

      {/* Stats */}
      <div className="grid-4 mb-24">
        {[
          { label: 'Total Tasks', val: stats.total, icon: ClipboardList, cls: 'violet' },
          { label: 'In Progress', val: stats.inProgress, icon: Clock, cls: 'blue' },
          { label: 'In Review', val: stats.review, icon: AlertCircle, cls: 'amber' },
          { label: 'Completed', val: stats.completed, icon: CheckCircle, cls: 'green' },
        ].map(({ label, val, icon: Icon, cls }) => (
          <div key={label} className="stat-card">
            <div className={`stat-icon ${cls}`}><Icon size={20} /></div>
            <div>
              <div className="stat-value">{val}</div>
              <div className="stat-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Completion ring + Recent tasks */}
      <div className="grid-2" style={{ gap: 24 }}>
        {/* Performance */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">My Performance</div>
          </div>
          <div className="flex items-center gap-24">
            {/* SVG Ring */}
            <div style={{ position: 'relative', width: 100, height: 100, flexShrink: 0 }}>
              <svg width="100" height="100" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                <circle cx="50" cy="50" r="40" fill="none"
                  stroke="url(#ringGrad)" strokeWidth="10"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - completionRate / 100)}`}
                  strokeLinecap="round" />
                <defs>
                  <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#7c3aed" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </svg>
              <div style={{
                position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center'
              }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 900 }}>{completionRate}%</div>
                <div style={{ fontSize: '0.5625rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>done</div>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              {[
                { label: 'Tasks Completed', val: stats.completed, color: 'var(--success)' },
                { label: 'In Progress', val: stats.inProgress, color: 'var(--info)' },
                { label: 'In Review', val: stats.review, color: 'var(--warning)' },
                { label: 'Pending', val: stats.total - stats.completed - stats.inProgress - stats.review, color: 'var(--text-muted)' },
              ].map(({ label, val, color }) => (
                <div key={label} className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                  <div className="flex items-center gap-8">
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{label}</span>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Active Tasks */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Active Tasks</div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/member/tasks')}>
              View all <ChevronRight size={14} />
            </button>
          </div>
          {recentTasks.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 20px' }}>
              <div className="empty-state-icon">🎉</div>
              <h3>All caught up!</h3>
              <p>No active tasks at the moment</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentTasks.map(task => (
                <div key={task._id} style={{
                  padding: '12px 14px',
                  background: PRIORITY_BG[task.priority] || 'rgba(255,255,255,0.03)',
                  borderRadius: 'var(--radius)', border: '1px solid var(--border-subtle)',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
                  onClick={() => navigate('/member/tasks')}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-accent)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                >
                  <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}
                      className="truncate" title={task.title}>
                      {task.title}
                    </span>
                    <span className={`badge ${STATUS_BADGE[task.status] || 'badge-gray'}`} style={{ marginLeft: 8, flexShrink: 0 }}>
                      {task.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {task.projectID?.title || 'Unknown project'} • Priority: {task.priority}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Urgent tasks */}
      {urgentTasks.length > 0 && (
        <div className="card" style={{ marginTop: 24, borderColor: 'rgba(239,68,68,0.3)' }}>
          <div className="card-header">
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={16} color="var(--danger)" /> High Priority Tasks
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {urgentTasks.map(task => (
              <div key={task._id} className="flex items-center gap-12" style={{
                padding: '10px 14px', background: 'rgba(239,68,68,0.06)',
                borderRadius: 'var(--radius)', border: '1px solid rgba(239,68,68,0.15)'
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                  background: task.priority === 'critical' ? 'var(--danger)' : 'var(--warning)'
                }} />
                <span style={{ flex: 1, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{task.title}</span>
                <span className={`badge ${task.priority === 'critical' ? 'badge-red' : 'badge-amber'}`}>
                  {task.priority}
                </span>
                <span className={`badge ${STATUS_BADGE[task.status] || 'badge-gray'}`}>{task.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
