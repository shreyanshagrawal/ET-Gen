import { useState, useEffect } from 'react';
import { AppLayout } from '../../components/ProtectedLayout';
import { useAuth } from '../../contexts/AuthContext';
import { adminGetAllProjects, adminGetAllUsers, getAllTeams } from '../../lib/api';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban, Users, CheckCircle, Clock, TrendingUp,
  Plus, ChevronRight, Bot, AlertCircle, Activity
} from 'lucide-react';

function StatusDot({ status }) {
  const colorMap = {
    PENDING: 'var(--text-muted)', APPROVED: 'var(--info)',
    ONGOING: 'var(--success)', COMPLETED: 'var(--accent-secondary)',
    REJECTED: 'var(--danger)'
  };
  return (
    <span style={{
      display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
      background: colorMap[status] || 'var(--text-muted)', marginRight: 6
    }} />
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminGetAllProjects(), adminGetAllUsers(), getAllTeams()])
      .then(([proj, usr, tms]) => {
        setProjects(proj.data?.data || []);
        setUsers(usr.data?.data || []);
        setTeams(tms.data?.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total: projects.length,
    ongoing: projects.filter(p => p.status === 'ONGOING').length,
    completed: projects.filter(p => p.status === 'COMPLETED').length,
    pending: projects.filter(p => p.approvalStatus === 'pending').length,
  };

  const statusBadge = (status) => {
    const map = {
      ONGOING: 'badge-green', COMPLETED: 'badge-violet',
      PENDING: 'badge-gray', APPROVED: 'badge-blue', REJECTED: 'badge-red', DROPPED: 'badge-gray'
    };
    return <span className={`badge ${map[status] || 'badge-gray'}`}><StatusDot status={status} />{status}</span>;
  };

  if (loading) return (
    <AppLayout>
      <div className="loading-full">
        <div className="spinner" style={{ width: 36, height: 36 }} />
        <span>Loading dashboard...</span>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      {/* Header */}
      <div className="topbar">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Welcome back, {user?.username} 👋 Here's your workspace overview</p>
        </div>
        <div className="topbar-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/admin/teams')}>
            <Users size={15} /> Manage Teams
          </button>
          <button id="create-project-btn" className="btn btn-primary" onClick={() => navigate('/admin/projects/new')}>
            <Plus size={15} /> New Project
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4 mb-24">
        <div className="stat-card">
          <div className="stat-icon violet"><FolderKanban size={22} color="var(--accent-secondary)" /></div>
          <div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Projects</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><Activity size={22} color="var(--success)" /></div>
          <div>
            <div className="stat-value">{stats.ongoing}</div>
            <div className="stat-label">Active Projects</div>
            <div className="stat-delta">↑ In Progress</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber"><AlertCircle size={22} color="var(--warning)" /></div>
          <div>
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">Awaiting Approval</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><Users size={22} color="var(--info)" /></div>
          <div>
            <div className="stat-value">{users.length}</div>
            <div className="stat-label">Total Users</div>
          </div>
        </div>
      </div>

      {/* Pending Approvals Banner */}
      {stats.pending > 0 && (
        <div style={{
          background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: 'var(--radius-lg)', padding: '16px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 24
        }}>
          <div className="flex items-center gap-12">
            <AlertCircle size={20} color="var(--warning)" />
            <div>
              <div style={{ fontWeight: 600, color: 'var(--warning)' }}>
                {stats.pending} project{stats.pending > 1 ? 's' : ''} awaiting your approval
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Review and approve to unlock AI task generation
              </div>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/admin/projects')}>
            Review Now <ChevronRight size={14} />
          </button>
        </div>
      )}

      <div className="grid-2" style={{ gap: 24 }}>
        {/* Recent Projects */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Recent Projects</div>
              <div className="card-subtitle">{projects.length} total projects</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/projects')}>
              View all <ChevronRight size={14} />
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📁</div>
              <h3>No Projects Yet</h3>
              <p>Create your first project to get started</p>
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/admin/projects/new')}>
                <Plus size={14} /> Create Project
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {projects.slice(0, 5).map(project => (
                <div
                  key={project._id}
                  className="flex items-center gap-12"
                  style={{
                    padding: '12px 14px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: 'var(--radius)',
                    cursor: 'pointer', transition: 'background 0.2s',
                    border: '1px solid var(--border-subtle)'
                  }}
                  onClick={() => navigate(`/admin/projects/${project._id}`)}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                    background: 'rgba(124,58,237,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <FolderKanban size={16} color="var(--accent-secondary)" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}
                      className="truncate">{project.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {project.endDate ? `Due ${new Date(project.endDate).toLocaleDateString()}` : 'No deadline'}
                    </div>
                  </div>
                  {statusBadge(project.status)}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Teams Overview */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Teams</div>
              <div className="card-subtitle">{teams.length} active teams</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/teams')}>
              Manage <ChevronRight size={14} />
            </button>
          </div>

          {teams.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <h3>No Teams Yet</h3>
              <p>Create a team to assign members and projects</p>
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/admin/teams')}>
                Create Team
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {teams.slice(0, 5).map(team => (
                <div key={team._id} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '12px 14px',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(168,85,247,0.1))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: '0.875rem', color: 'var(--accent-secondary)'
                  }}>
                    {team.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{team.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {team.members?.length || 0} members • Manager: {team.managerId?.username || 'N/A'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI Feature Panel */}
      <div className="ai-panel" style={{ marginTop: 24 }}>
        <div className="ai-label"><Bot size={12} /> AI Features</div>
        <h3 style={{ marginBottom: 8 }}>AI-Powered Project Intelligence</h3>
        <p style={{ fontSize: '0.875rem', marginBottom: 20 }}>
          Leverage AI to automatically generate task breakdowns, smart assignments, code reviews, and final documentation.
        </p>
        <div className="grid-3">
          {[
            { icon: '🧠', title: 'Task Generation', desc: 'AI breaks down projects into Epics → Tasks → Subtasks automatically', action: () => navigate('/admin/projects') },
            { icon: '⚡', title: 'Smart Assignment', desc: 'AI distributes tasks based on roles and balances workload across the team', action: () => navigate('/admin/ai') },
            { icon: '🔍', title: 'Code Review', desc: 'AI reviews submissions, detects bugs, and scores team performance', action: () => navigate('/admin/ai') },
          ].map(({ icon, title, desc, action }) => (
            <div key={title} style={{
              background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius)',
              padding: '16px', display: 'flex', flexDirection: 'column', gap: 8,
              border: '1px solid var(--border-subtle)', cursor: 'pointer', transition: 'all 0.2s'
            }} onClick={action}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ fontSize: '1.5rem' }}>{icon}</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{title}</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
