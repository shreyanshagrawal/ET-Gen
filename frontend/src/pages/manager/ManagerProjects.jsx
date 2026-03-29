import { useState, useEffect } from 'react';
import { AppLayout } from '../../components/ProtectedLayout';
import { getManagerProjects } from '../../lib/api';
import { FolderKanban, Calendar, Users, ChevronRight, AlertCircle } from 'lucide-react';

const STATUS_META = {
  PENDING:   { cls: 'badge-gray',   label: 'Pending',    dot: '#94a3b8' },
  APPROVED:  { cls: 'badge-blue',   label: 'Approved',   dot: '#3b82f6' },
  ONGOING:   { cls: 'badge-green',  label: 'Ongoing',    dot: '#22c55e' },
  COMPLETED: { cls: 'badge-violet', label: 'Completed',  dot: '#a855f7' },
  REJECTED:  { cls: 'badge-red',    label: 'Rejected',   dot: '#ef4444' },
  DROPPED:   { cls: 'badge-gray',   label: 'Dropped',    dot: '#64748b' },
};

const STACK_COLORS = ['badge-violet', 'badge-blue', 'badge-green', 'badge-amber'];

function ProjectCard({ project }) {
  const meta = STATUS_META[project.status] || STATUS_META.PENDING;
  const daysLeft = project.endDate
    ? Math.ceil((new Date(project.endDate) - new Date()) / (1000 * 60 * 60 * 24))
    : null;
  const isOverdue = daysLeft !== null && daysLeft < 0;
  const isUrgent  = daysLeft !== null && daysLeft >= 0 && daysLeft <= 7;

  return (
    <div className="card" style={{
      cursor: 'default',
      border: isOverdue
        ? '1px solid rgba(239,68,68,0.35)'
        : isUrgent
          ? '1px solid rgba(245,158,11,0.35)'
          : '1px solid var(--border-subtle)',
      transition: 'transform 0.2s, box-shadow 0.2s',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12, flexShrink: 0,
          background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(168,85,247,0.1))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <FolderKanban size={22} color="var(--accent-secondary)" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1rem' }} className="truncate">
              {project.title}
            </h3>
            <span className={`badge ${meta.cls}`} style={{ flexShrink: 0, fontSize: '0.7rem' }}>
              {meta.label}
            </span>
          </div>
          {project.teamId && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 3 }}>
              <Users size={11} style={{ display: 'inline', marginRight: 4 }} />
              Team: <strong style={{ color: 'var(--text-secondary)' }}>{project.teamId.name}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {project.description && (
        <p style={{
          fontSize: '0.8125rem', color: 'var(--text-muted)',
          marginBottom: 14, lineHeight: 1.6,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {project.description}
        </p>
      )}

      {/* Tech stack */}
      {project.techStack?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
          {project.techStack.slice(0, 5).map((tech, i) => (
            <span key={tech} className={`badge ${STACK_COLORS[i % STACK_COLORS.length]}`}
              style={{ fontSize: '0.6rem' }}>
              {tech}
            </span>
          ))}
          {project.techStack.length > 5 && (
            <span className="badge badge-gray" style={{ fontSize: '0.6rem' }}>
              +{project.techStack.length - 5} more
            </span>
          )}
        </div>
      )}

      {/* Footer: dates */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 12, borderTop: '1px solid var(--border-subtle)',
        fontSize: '0.75rem', color: 'var(--text-muted)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Calendar size={12} />
          {project.startDate
            ? `Started: ${new Date(project.startDate).toLocaleDateString()}`
            : 'No start date'}
        </div>
        {project.endDate && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            color: isOverdue ? 'var(--danger)' : isUrgent ? 'var(--warning)' : 'var(--text-muted)',
            fontWeight: isOverdue || isUrgent ? 600 : 400,
          }}>
            {(isOverdue || isUrgent) && <AlertCircle size={12} />}
            {isOverdue
              ? `Overdue by ${Math.abs(daysLeft)}d`
              : isUrgent
                ? `${daysLeft}d left`
                : `Due: ${new Date(project.endDate).toLocaleDateString()}`}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ManagerProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [filter, setFilter]     = useState('ALL');

  useEffect(() => {
    getManagerProjects()
      .then(res => setProjects(res.data?.data || []))
      .catch(err => setError(err?.response?.data?.message || 'Failed to load projects'))
      .finally(() => setLoading(false));
  }, []);

  const statuses = ['ALL', 'PENDING', 'APPROVED', 'ONGOING', 'COMPLETED', 'REJECTED'];
  const filtered = filter === 'ALL' ? projects : projects.filter(p => p.status === filter);

  const counts = statuses.reduce((acc, s) => {
    acc[s] = s === 'ALL' ? projects.length : projects.filter(p => p.status === s).length;
    return acc;
  }, {});

  return (
    <AppLayout>
      <div className="topbar">
        <div>
          <h1 className="page-title">My Projects</h1>
          <p className="page-subtitle">Projects linked to teams you manage</p>
        </div>
        <div className="stat-card" style={{ padding: '10px 20px', minWidth: 0 }}>
          <div className="stat-icon violet"><FolderKanban size={16} /></div>
          <div>
            <div className="stat-value" style={{ fontSize: '1.125rem' }}>{projects.length}</div>
            <div className="stat-label" style={{ fontSize: '0.7rem' }}>Total</div>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      {!loading && !error && projects.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          {statuses.map(s => {
            const cnt = counts[s];
            if (s !== 'ALL' && cnt === 0) return null;
            const meta = s === 'ALL' ? null : STATUS_META[s];
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 20,
                  border: `1px solid ${filter === s ? 'var(--accent-secondary)' : 'var(--border-subtle)'}`,
                  background: filter === s ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.03)',
                  color: filter === s ? 'var(--accent-secondary)' : 'var(--text-secondary)',
                  fontSize: '0.8125rem', fontWeight: filter === s ? 700 : 400,
                  cursor: 'pointer', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                {meta && (
                  <span style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: meta.dot, display: 'inline-block',
                  }} />
                )}
                {s === 'ALL' ? 'All' : STATUS_META[s].label}
                <span style={{
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: 10, padding: '1px 7px',
                  fontSize: '0.7rem', fontWeight: 700,
                }}>
                  {cnt}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {loading ? (
        <div className="loading-full">
          <div className="spinner" style={{ width: 36, height: 36 }} />
        </div>
      ) : error ? (
        <div className="empty-state">
          <div className="empty-state-icon">⚠️</div>
          <h3>Error loading projects</h3>
          <p>{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📂</div>
          <h3>{filter === 'ALL' ? 'No Projects Yet' : `No ${STATUS_META[filter]?.label} Projects`}</h3>
          <p>
            {filter === 'ALL'
              ? 'Projects assigned to your teams by an admin will appear here.'
              : 'Try selecting a different filter.'}
          </p>
        </div>
      ) : (
        <div className="grid-auto">
          {filtered.map(project => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      )}
    </AppLayout>
  );
}
