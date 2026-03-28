import { useState, useEffect } from 'react';
import { AppLayout } from '../../components/ProtectedLayout';
import { getMyProjects } from '../../lib/api';
import { useNavigate } from 'react-router-dom';
import { FolderKanban, ChevronRight } from 'lucide-react';

const STATUS_BADGE = {
  PENDING: 'badge-gray', APPROVED: 'badge-blue',
  ONGOING: 'badge-green', COMPLETED: 'badge-violet',
  REJECTED: 'badge-red'
};

export default function MemberProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getMyProjects()
      .then(res => setProjects(res.data?.data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout>
      <div className="topbar">
        <div>
          <h1 className="page-title">My Projects</h1>
          <p className="page-subtitle">Projects you are a member of</p>
        </div>
      </div>

      {loading ? (
        <div className="loading-full"><div className="spinner" style={{ width: 32, height: 32 }} /></div>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📁</div>
          <h3>No Projects Yet</h3>
          <p>Ask your admin to add you to a project team</p>
        </div>
      ) : (
        <div className="grid-auto">
          {projects.map(p => {
            const project = p.projectDetails || p;
            return (
              <div key={project._id} className="card" style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/member/projects/${project._id}`)}>
                <div className="flex items-center gap-12" style={{ marginBottom: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 10,
                    background: 'rgba(124,58,237,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <FolderKanban size={20} color="var(--accent-secondary)" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ margin: 0 }} className="truncate">{project.title}</h4>
                    <span className={`badge ${STATUS_BADGE[project.status] || 'badge-gray'}`} style={{ marginTop: 4 }}>
                      {project.status}
                    </span>
                  </div>
                </div>
                {project.description && (
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 12 }}
                    className="truncate">{project.description}</p>
                )}
                {project.endDate && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Due: {new Date(project.endDate).toLocaleDateString()}
                  </div>
                )}
                <div className="flex items-center" style={{ marginTop: 12, color: 'var(--accent-secondary)', fontSize: '0.8125rem', fontWeight: 600 }}>
                  View Details <ChevronRight size={14} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}
