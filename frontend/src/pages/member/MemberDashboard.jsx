import { useState, useEffect } from 'react';
import { AppLayout } from '../../components/ProtectedLayout';
import { useAuth } from '../../contexts/AuthContext';
import { getMyTasks, getMyProjects, getMyTeam } from '../../lib/api';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList, CheckCircle, Clock, AlertCircle,
  ChevronRight, Users, Crown, Zap, FolderKanban, Star
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";


const STATUS_BADGE = {
  pending: 'badge-gray', 'in-progress': 'badge-blue',
  review: 'badge-amber', completed: 'badge-green'
};
const PRIORITY_BG = {
  critical: 'rgba(239,68,68,0.15)', high: 'rgba(245,158,11,0.15)',
  medium: 'rgba(59,130,246,0.1)', low: 'rgba(255,255,255,0.04)'
};
const PRIORITY_DOT = {
  critical: 'var(--danger)', high: 'var(--warning)',
  medium: 'var(--info)', low: 'var(--text-muted)'
};

export default function MemberDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMyTasks(), getMyProjects(), getMyTeam()]).then(([t, p, tm]) => {
      setTasks(t.data?.data || []);
      setProjects(p.data?.data || []);
      setTeam(tm.data?.data || null);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const stats = {
    total: tasks.length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    review: tasks.filter(t => t.status === 'review').length,
    completed: tasks.filter(t => t.status === 'completed').length,
  };
  const completionRate = tasks.length ? Math.round((stats.completed / tasks.length) * 100) : 0;
  const urgentTasks = tasks.filter(t => (t.priority === 'critical' || t.priority === 'high') && t.status !== 'completed').slice(0, 5);
  const recentTasks = tasks.filter(t => t.status !== 'completed').slice(0, 5);

  if (loading) return (
    <AppLayout>
      <div className="loading-full"><div className="spinner" style={{ width: 36, height: 36 }} /></div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="topbar">
        <div>
          <h1 className="page-title">My Dashboard</h1>
          <p className="page-subtitle">Hey {user?.username} 👋 Here's your workspace overview</p>
        </div>
        <div className="flex gap-8">
          <button className="btn btn-primary" onClick={() => navigate('/member/tasks')}>
            <ClipboardList size={15} /> View All Tasks
          </button>

          <Avatar size={40} onClick={() => navigate('/member/profile')} className="cursor-pointer">
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>
              {user?.username?.slice(0, 2).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>


        </div>
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

      {/* Row 1 — Performance ring + Active tasks */}
      <div className="grid-2" style={{ gap: 24, marginBottom: 24 }}>
        {/* Performance */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">My Performance</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Task completion rate</span>
          </div>
          <div className="flex items-center gap-24">
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
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 900 }}>{completionRate}%</div>
                <div style={{ fontSize: '0.5625rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>done</div>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              {[
                { label: 'Completed', val: stats.completed, color: 'var(--success)' },
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentTasks.map(task => (
                <div key={task._id} style={{
                  padding: '11px 13px',
                  background: PRIORITY_BG[task.priority] || 'rgba(255,255,255,0.03)',
                  borderRadius: 'var(--radius)', border: '1px solid var(--border-subtle)',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
                  onClick={() => navigate('/member/tasks')}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-accent)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                >
                  <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
                    <div className="flex items-center gap-8">
                      <div style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, background: PRIORITY_DOT[task.priority] || 'var(--text-muted)' }} />
                      <span style={{ fontSize: '0.875rem', fontWeight: 600 }} className="truncate" title={task.title}>
                        {task.title}
                      </span>
                    </div>
                    <span className={`badge ${STATUS_BADGE[task.status] || 'badge-gray'}`} style={{ marginLeft: 8, flexShrink: 0 }}>
                      {task.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', paddingLeft: 15 }}>
                    📁 {task.projectID?.title || 'Unknown project'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Row 2 — My Team + My Projects */}
      <div className="grid-2" style={{ gap: 24, marginBottom: 24 }}>

        {/* My Team */}
        <div className="card">
          <div className="card-header">
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={14} /> My Team
            </div>
          </div>
          {!team ? (
            <div className="empty-state" style={{ padding: '28px 16px' }}>
              <div className="empty-state-icon">👥</div>
              <h3 style={{ fontSize: '1rem' }}>Not in a team yet</h3>
              <p style={{ fontSize: '0.8125rem' }}>Ask your admin to add you to a team</p>
            </div>
          ) : (
            <div>
              {/* Team header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16,
                padding: '12px 14px',
                background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(168,85,247,0.06))',
                borderRadius: 'var(--radius)', border: '1px solid rgba(124,58,237,0.2)'
              }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                  background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 900, color: '#fff', fontSize: '0.875rem'
                }}>
                  {team.name?.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{team.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {team.members?.length || 0} members
                  </div>
                </div>
              </div>

              {/* Manager */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                background: 'rgba(245,158,11,0.08)', borderRadius: 'var(--radius)',
                border: '1px solid rgba(245,158,11,0.2)', marginBottom: 12
              }}>
                <Crown size={13} color="var(--warning)" />
                <span style={{ fontSize: '0.8125rem', color: 'var(--warning)', fontWeight: 600 }}>
                  {team.managerId?.username || 'No manager'}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>Manager</span>
              </div>

              {/* Members */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {(team.members || []).slice(0, 6).map(m => {
                  const isMe = m._id === user?._id || m.username === user?.username;
                  return (
                    <div key={m._id} className="flex items-center gap-8">
                      <div className="avatar" style={{
                        width: 28, height: 28, fontSize: '0.6875rem',
                        ...(isMe ? { background: 'linear-gradient(135deg,#7c3aed,#a855f7)', color: '#fff' } : {})
                      }}>
                        {m.username?.slice(0, 2).toUpperCase()}
                      </div>
                      <span style={{ flex: 1, fontSize: '0.8125rem', color: isMe ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: isMe ? 700 : 400 }}>
                        {m.username} {isMe && <span style={{ color: 'var(--accent-secondary)', fontSize: '0.6875rem' }}>(you)</span>}
                      </span>
                      {m.skills?.slice(0, 2).map(s => (
                        <span key={s} className="badge badge-gray" style={{ fontSize: '0.6rem' }}>{s}</span>
                      ))}
                      <span className={`badge ${m.role === 'manager' ? 'badge-amber' : 'badge-gray'}`} style={{ fontSize: '0.625rem' }}>
                        {m.role}
                      </span>
                    </div>
                  );
                })}
                {team.members?.length > 6 && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', paddingLeft: 36 }}>
                    +{team.members.length - 6} more members
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* My Projects */}
        <div className="card">
          <div className="card-header">
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FolderKanban size={14} /> My Projects
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/member/projects')}>
              All <ChevronRight size={14} />
            </button>
          </div>
          {projects.length === 0 ? (
            <div className="empty-state" style={{ padding: '28px 16px' }}>
              <div className="empty-state-icon">📂</div>
              <h3 style={{ fontSize: '1rem' }}>No projects yet</h3>
              <p style={{ fontSize: '0.8125rem' }}>You'll see projects once assigned</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {projects.slice(0, 5).map((p, idx) => {
                // getMyProjects returns { projectID, projectDetails: { _id, title, status... } }
                const proj = p.projectDetails || p;
                const projId = proj._id?.toString() || p.projectID?.toString();
                // Count tasks for this project
                const projectTasks = tasks.filter(t => {
                  const tid = t.projectID?._id?.toString() || t.projectID?.toString();
                  return tid === projId;
                });
                const done = projectTasks.filter(t => t.status === 'completed').length;
                const pct = projectTasks.length ? Math.round((done / projectTasks.length) * 100) : 0;
                return (
                  <div key={projId || idx} style={{
                    padding: '12px 14px', background: 'rgba(255,255,255,0.03)',
                    borderRadius: 'var(--radius)', border: '1px solid var(--border-subtle)',
                  }}>
                    <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem' }} className="truncate">{proj.title || 'Unnamed'}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', flexShrink: 0, marginLeft: 8 }}>
                        {done}/{projectTasks.length} tasks
                      </span>
                    </div>
                    <div className="progress" style={{ height: 5 }}>
                      <div className="progress-bar" style={{ width: `${pct}%`, transition: 'width 0.5s ease' }} />
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: 5 }}>
                      {projectTasks.length === 0 ? 'No tasks assigned yet' : `${pct}% complete`}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Urgent Tasks */}
      {urgentTasks.length > 0 && (
        <div className="card" style={{ borderColor: 'rgba(239,68,68,0.3)' }}>
          <div className="card-header">
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={16} color="var(--danger)" /> High Priority Tasks
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/member/tasks')}>
              View <ChevronRight size={14} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {urgentTasks.map(task => (
              <div key={task._id} className="flex items-center gap-12" style={{
                padding: '10px 14px', background: 'rgba(239,68,68,0.06)',
                borderRadius: 'var(--radius)', border: '1px solid rgba(239,68,68,0.15)',
                cursor: 'pointer',
              }}
                onClick={() => navigate('/member/tasks')}
              >
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                  background: task.priority === 'critical' ? 'var(--danger)' : 'var(--warning)'
                }} />
                <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 500 }}>{task.title}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  📁 {task.projectID?.title}
                </span>
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
