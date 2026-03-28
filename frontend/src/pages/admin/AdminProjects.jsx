import { useState, useEffect } from 'react';
import { AppLayout } from '../../components/ProtectedLayout';
import { adminGetAllProjects, adminApproveProject, adminRejectProject, adminDeleteProject } from '../../lib/api';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, CheckCircle, XCircle, Trash2, Eye, Bot, X
} from 'lucide-react';
import { Toast, useToast } from '../../components/Toast';

const STATUS_BADGE = {
  PENDING:   'badge-gray', APPROVED: 'badge-blue',
  ONGOING:   'badge-green', COMPLETED: 'badge-violet',
  REJECTED:  'badge-red', DROPPED: 'badge-gray'
};
const APPROVAL_BADGE = {
  pending: 'badge-amber', approved: 'badge-green', rejected: 'badge-red'
};

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null); // { id, reason }
  const { toasts, showToast, dismissToast } = useToast();
  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      const res = await adminGetAllProjects();
      const data = res.data?.data || [];
      setProjects(data);
      setFiltered(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProjects(); }, []);

  useEffect(() => {
    let result = projects;
    if (search) result = result.filter(p =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
    );
    if (filterStatus !== 'all') result = result.filter(p => p.approvalStatus === filterStatus);
    setFiltered(result);
  }, [search, filterStatus, projects]);

  const handleApprove = async (id) => {
    setActionLoading(id + '_approve');
    try {
      await adminApproveProject(id);
      fetchProjects();
      showToast('Project approved!', 'success');
    } catch (e) { showToast(e.response?.data?.message || 'Error approving project', 'error'); }
    finally { setActionLoading(null); }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    setActionLoading(rejectTarget.id + '_reject');
    try {
      await adminRejectProject(rejectTarget.id, rejectTarget.reason);
      fetchProjects();
      setRejectTarget(null);
      showToast('Project rejected.', 'success');
    } catch (e) { showToast(e.response?.data?.message || 'Error rejecting project', 'error'); }
    finally { setActionLoading(null); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project? This cannot be undone.')) return;
    setActionLoading(id + '_delete');
    try {
      await adminDeleteProject(id);
      fetchProjects();
      showToast('Project deleted.', 'success');
    } catch (e) { showToast(e.response?.data?.message || 'Error deleting project', 'error'); }
    finally { setActionLoading(null); }
  };

  return (
    <AppLayout>
      <Toast toasts={toasts} dismiss={dismissToast} />

      {/* Inline Reject Modal */}
      {rejectTarget && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Reject Project</h3>
              <button className="modal-close btn btn-ghost btn-icon" onClick={() => setRejectTarget(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="form-group">
              <label className="form-label">Rejection Reason (optional)</label>
              <textarea className="textarea" rows={3}
                placeholder="Explain why this project is being rejected..."
                value={rejectTarget.reason}
                onChange={e => setRejectTarget(r => ({ ...r, reason: e.target.value }))}
              />
            </div>
            <div className="flex items-center justify-between" style={{ marginTop: 8 }}>
              <button className="btn btn-ghost" onClick={() => setRejectTarget(null)}>Cancel</button>
              <button className="btn btn-danger" disabled={actionLoading === rejectTarget.id + '_reject'}
                onClick={handleReject}>
                {actionLoading === rejectTarget.id + '_reject'
                  ? <div className="spinner" style={{ width: 14, height: 14 }} />
                  : <XCircle size={14} />} Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="topbar">
        <div>
          <h1 className="page-title">All Projects</h1>
          <p className="page-subtitle">{projects.length} total projects — manage, approve, and launch AI tasks</p>
        </div>
        <div className="topbar-actions">
          <button id="new-project-btn" className="btn btn-primary" onClick={() => navigate('/admin/projects/new')}>
            <Plus size={15} /> New Project
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-12 mb-24" style={{ flexWrap: 'wrap' }}>
        <div className="input-group" style={{ maxWidth: 320, flex: 1 }}>
          <Search size={16} className="input-icon" />
          <input className="input" placeholder="Search projects..." value={search}
            onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="tabs">
          {['all', 'pending', 'approved', 'rejected'].map(s => (
            <button key={s} className={`tab-btn${filterStatus === s ? ' active' : ''}`}
              onClick={() => setFilterStatus(s)}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading-full"><div className="spinner" style={{ width: 32, height: 32 }} /><span>Loading projects...</span></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📂</div>
          <h3>No projects found</h3>
          <p>Try adjusting your search or create a new project</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(project => (
            <div key={project._id} className="card" style={{ padding: '20px 24px' }}>
              <div className="flex items-center gap-16">
                <div style={{
                  width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                  background: 'rgba(124,58,237,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <span style={{ fontSize: '1.25rem' }}>📁</span>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="flex items-center gap-8">
                    <h4 style={{ marginBottom: 0 }} className="truncate">{project.title}</h4>
                    <span className={`badge ${STATUS_BADGE[project.status] || 'badge-gray'}`}>{project.status}</span>
                    <span className={`badge ${APPROVAL_BADGE[project.approvalStatus] || 'badge-gray'}`}>
                      {project.approvalStatus}
                    </span>
                    {project.aiTasksGenerated && (
                      <span className="badge badge-violet"><Bot size={10} /> AI Generated</span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.8125rem', marginTop: 4, color: 'var(--text-muted)' }}
                    className="truncate">
                    {project.description}
                  </p>
                  <div className="flex gap-16" style={{ marginTop: 6 }}>
                    {project.techStack?.length > 0 && (
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {project.techStack.map(t => (
                          <span key={t} className="badge badge-gray" style={{ fontSize: '0.6875rem' }}>{t}</span>
                        ))}
                      </div>
                    )}
                    {project.endDate && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Due: {new Date(project.endDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  {project.approvalStatus === 'pending' && (
                    <>
                      <button className="btn btn-success btn-sm"
                        disabled={actionLoading === project._id + '_approve'}
                        onClick={() => handleApprove(project._id)}>
                        {actionLoading === project._id + '_approve' ? <div className="spinner" style={{ width: 14, height: 14 }} /> : <CheckCircle size={14} />}
                        Approve
                      </button>
                      <button className="btn btn-danger btn-sm"
                        disabled={actionLoading === project._id + '_reject'}
                        onClick={() => setRejectTarget({ id: project._id, reason: '' })}>
                        {actionLoading === project._id + '_reject' ? <div className="spinner" style={{ width: 14, height: 14 }} /> : <XCircle size={14} />}
                        Reject
                      </button>
                    </>
                  )}
                  {project.approvalStatus === 'approved' && !project.aiTasksGenerated && (
                    <button className="btn btn-primary btn-sm" onClick={() => navigate(`/admin/projects/${project._id}`)}>
                      <Bot size={14} /> Generate AI Tasks
                    </button>
                  )}
                  <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/admin/projects/${project._id}`)}>
                    <Eye size={14} /> View
                  </button>
                  <button className="btn btn-ghost btn-sm btn-icon"
                    disabled={actionLoading === project._id + '_delete'}
                    onClick={() => handleDelete(project._id)}>
                    <Trash2 size={14} color="var(--danger)" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
