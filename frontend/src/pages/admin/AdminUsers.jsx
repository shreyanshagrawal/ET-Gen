import { useState, useEffect } from 'react';
import { AppLayout } from '../../components/ProtectedLayout';
import { adminGetAllUsers, getUserProgress } from '../../lib/api';
import { Search, Shield, User, Users, X, TrendingUp, CheckCircle, Clock, AlertCircle, Star, FolderKanban, ChevronDown, ChevronRight } from 'lucide-react';
import { Toast, useToast } from '../../components/Toast';

const ROLE_BADGE = { admin: 'badge-violet', manager: 'badge-amber', member: 'badge-gray' };

const STATUS_BADGE = {
  pending: 'badge-gray', 'in-progress': 'badge-blue',
  review: 'badge-amber', completed: 'badge-green'
};

function UserProgressModal({ userId, username, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedProject, setExpandedProject] = useState(null);

  useEffect(() => {
    getUserProgress(userId)
      .then(res => setData(res.data?.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  const user = data?.user;
  const progress = data?.projectProgress || [];

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal modal-lg" style={{ maxWidth: 760, maxHeight: '90vh', overflow: 'auto' }}>
        <div className="modal-header">
          <div>
            <div className="flex items-center gap-10" style={{ marginBottom: 4 }}>
              <div className="avatar" style={{ width: 36, height: 36, fontSize: '0.875rem' }}>
                {username?.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="modal-title" style={{ margin: 0 }}>{username}</h3>
                {user?.email && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>}
              </div>
            </div>
          </div>
          <button className="modal-close btn btn-ghost btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <div className="spinner" style={{ width: 32, height: 32, margin: '0 auto' }} />
          </div>
        ) : !data ? (
          <div className="empty-state">
            <div className="empty-state-icon">⚠️</div>
            <h3>Could not load data</h3>
          </div>
        ) : (
          <>
            {/* Overview stats */}
            <div className="grid-4 mb-24">
              {[
                { label: 'Total Tasks', val: data.totalTasks, icon: FolderKanban, cls: 'violet' },
                { label: 'Completed', val: data.completedTasks, icon: CheckCircle, cls: 'green' },
                { label: 'Projects', val: progress.length, icon: TrendingUp, cls: 'blue' },
                { label: 'Perf. Score', val: user?.performanceScore ?? 0, icon: Star, cls: 'amber' },
              ].map(({ label, val, icon: Icon, cls }) => (
                <div key={label} className="stat-card" style={{ padding: '14px 16px' }}>
                  <div className={`stat-icon ${cls}`}><Icon size={18} /></div>
                  <div>
                    <div className="stat-value" style={{ fontSize: '1.25rem' }}>{val}</div>
                    <div className="stat-label">{label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Skills */}
            {user?.skills?.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8 }}>SKILLS</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {user.skills.map(s => (
                    <span key={s} style={{
                      padding: '4px 12px', background: 'rgba(124,58,237,0.15)',
                      borderRadius: 20, border: '1px solid rgba(124,58,237,0.3)',
                      fontSize: '0.8125rem', fontWeight: 600, color: 'var(--accent-secondary)'
                    }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="divider" />

            {/* Per-project progress */}
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: 16 }}>
                Progress Per Project
              </div>

              {progress.length === 0 ? (
                <div className="empty-state" style={{ padding: '32px 16px' }}>
                  <div className="empty-state-icon">📋</div>
                  <h3>No project tasks yet</h3>
                </div>
              ) : progress.map(entry => {
                const pct = entry.taskCount ? Math.round((entry.completedCount / entry.taskCount) * 100) : 0;
                const isExpanded = expandedProject === entry.project?._id;
                return (
                  <div key={entry.project?._id} style={{ marginBottom: 12 }}>
                    {/* Project row */}
                    <div
                      style={{
                        padding: '12px 16px', background: 'rgba(255,255,255,0.04)',
                        borderRadius: 'var(--radius)', border: '1px solid var(--border-subtle)',
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}
                      onClick={() => setExpandedProject(isExpanded ? null : entry.project?._id)}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-accent)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                    >
                      <div className="flex items-center gap-12">
                        <div style={{
                          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                          background: 'linear-gradient(135deg,rgba(124,58,237,0.4),rgba(168,85,247,0.2))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 900, color: 'var(--accent-secondary)', fontSize: '0.75rem'
                        }}>
                          {entry.project?.title?.slice(0, 2)?.toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 6 }} className="truncate">
                            {entry.project?.title || 'Unknown'}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className="progress" style={{ flex: 1, height: 5 }}>
                              <div className="progress-bar" style={{ width: `${pct}%` }} />
                            </div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                              {entry.completedCount}/{entry.taskCount}
                            </span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                          <span style={{ fontWeight: 800, fontSize: '0.9rem', color: pct === 100 ? 'var(--success)' : 'var(--text-primary)' }}>
                            {pct}%
                          </span>
                          {entry.avgScore != null && (
                            <span className="badge badge-violet" style={{ fontSize: '0.625rem' }}>
                              AI: {entry.avgScore}/100
                            </span>
                          )}
                        </div>
                        <div style={{ color: 'var(--text-muted)' }}>
                          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </div>
                      </div>
                    </div>

                    {/* Expanded task list */}
                    {isExpanded && (
                      <div style={{
                        marginTop: 6, marginLeft: 12, padding: '10px 14px',
                        background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius)',
                        border: '1px solid var(--border-subtle)', borderLeft: '3px solid rgba(124,58,237,0.5)'
                      }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8 }}>
                          TASKS ({entry.tasks.length})
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {entry.tasks.map(task => (
                            <div key={task._id} className="flex items-center gap-10" style={{
                              padding: '8px 10px',
                              background: 'rgba(255,255,255,0.03)',
                              borderRadius: 8,
                            }}>
                              <span className={`task-type-badge ${task.type === 'epic' ? 'type-epic' : task.type === 'subtask' ? 'type-subtask' : 'type-task'}`} style={{ fontSize: '0.625rem' }}>
                                {task.type}
                              </span>
                              <span style={{ flex: 1, fontSize: '0.8125rem', fontWeight: 500 }} className="truncate">
                                {task.title}
                              </span>
                              {task.aiScore != null && (
                                <span className="badge badge-violet" style={{ fontSize: '0.625rem' }}>🤖 {task.aiScore}</span>
                              )}
                              <span className={`badge ${STATUS_BADGE[task.status] || 'badge-gray'}`} style={{ fontSize: '0.625rem' }}>
                                {task.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Recent submissions */}
            {data.submissions?.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div className="divider" />
                <div style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: 12 }}>
                  Recent Submissions ({data.submissions.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {data.submissions.slice(0, 5).map(sub => (
                    <div key={sub._id} style={{
                      padding: '10px 14px', background: 'rgba(255,255,255,0.03)',
                      borderRadius: 'var(--radius)', border: '1px solid var(--border-subtle)',
                      display: 'flex', alignItems: 'center', gap: 12
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600 }} className="truncate">
                          {sub.taskId?.title || 'Task'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          v{sub.version} · {new Date(sub.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      {sub.aiReview?.score != null && (
                        <span className="badge badge-violet">🤖 {sub.aiReview.score}/100</span>
                      )}
                      <span className={`badge ${sub.status === 'approved' ? 'badge-green' : sub.status === 'reviewed' ? 'badge-blue' : 'badge-gray'}`}>
                        {sub.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const { toasts, showToast, dismissToast } = useToast();

  useEffect(() => {
    adminGetAllUsers()
      .then(res => {
        const data = res.data?.data || [];
        setUsers(data);
        setFiltered(data);
      }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(users.filter(u =>
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.includes(q)
    ));
  }, [search, users]);

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    managers: users.filter(u => u.role === 'manager').length,
    members: users.filter(u => u.role === 'member').length,
  };

  return (
    <AppLayout>
      <Toast toasts={toasts} dismiss={dismissToast} />

      <div className="topbar">
        <div>
          <h1 className="page-title">All Users</h1>
          <p className="page-subtitle">Click any user to view their progress & task history</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4 mb-24">
        {[
          { label: 'Total Users', val: stats.total, icon: Users, cls: 'violet' },
          { label: 'Admins', val: stats.admins, icon: Shield, cls: 'violet' },
          { label: 'Managers', val: stats.managers, icon: User, cls: 'amber' },
          { label: 'Members', val: stats.members, icon: User, cls: 'blue' },
        ].map(({ label, val, icon: Icon, cls }) => (
          <div key={label} className="stat-card">
            <div className={`stat-icon ${cls}`}><Icon size={20} /></div>
            <div><div className="stat-value">{val}</div><div className="stat-label">{label}</div></div>
          </div>
        ))}
      </div>

      <div className="input-group" style={{ maxWidth: 360, marginBottom: 20 }}>
        <Search size={16} className="input-icon" />
        <input className="input" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="loading-full"><div className="spinner" style={{ width: 32, height: 32 }} /></div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Team</th>
                <th>Skills</th>
                <th>Perf. Score</th>
                <th>Progress</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user._id}
                  style={{ cursor: 'pointer', transition: 'background 0.15s' }}
                  onClick={() => setSelectedUser(user)}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.06)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}
                >
                  <td className="td-bold">
                    <div className="flex items-center gap-10">
                      <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                        {user.username.slice(0, 2).toUpperCase()}
                      </div>
                      {user.username}
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge ${ROLE_BADGE[user.role] || 'badge-gray'}`}>{user.role}</span>
                  </td>
                  <td>{user.teamId ? <span className="badge badge-blue">In team</span> : <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                  <td>
                    <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
                      {user.skills?.length > 0
                        ? user.skills.slice(0, 3).map(s => <span key={s} className="badge badge-gray" style={{ fontSize: '0.6875rem' }}>{s}</span>)
                        : <span style={{ color: 'var(--text-muted)' }}>—</span>
                      }
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-8">
                      <div className="progress" style={{ width: 70, height: 5 }}>
                        <div className="progress-bar" style={{ width: `${user.performanceScore || 0}%` }} />
                      </div>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{user.performanceScore || 0}</span>
                    </div>
                  </td>
                  <td>
                    <button className="btn btn-ghost btn-sm" style={{ fontSize: '0.75rem' }}
                      onClick={e => { e.stopPropagation(); setSelectedUser(user); }}>
                      <TrendingUp size={13} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* User Progress Modal */}
      {selectedUser && (
        <UserProgressModal
          userId={selectedUser._id}
          username={selectedUser.username}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </AppLayout>
  );
}
