import { useState, useEffect } from 'react';
import { AppLayout } from '../../components/ProtectedLayout';
import { getMyTasks, updateTaskStatus, submitWork, getTaskSubmissions, aiReviewSubmission } from '../../lib/api';
import { Bot, Send, ExternalLink, X } from 'lucide-react';
import { Toast, useToast } from '../../components/Toast';

const STATUS_COLS = ['pending', 'in-progress', 'review', 'completed'];
const PRIORITY_CLASS = { critical: 'priority-critical', high: 'priority-high', medium: 'priority-medium', low: 'priority-low' };
const STATUS_BADGE = {
  pending: 'badge-gray', 'in-progress': 'badge-blue',
  review: 'badge-amber', completed: 'badge-green'
};

const COL_CONFIG = {
  'pending':     { label: 'Pending',     dotClass: 'col-dot-pending' },
  'in-progress': { label: 'In Progress', dotClass: 'col-dot-inprogress' },
  'review':      { label: 'In Review',   dotClass: 'col-dot-review' },
  'completed':   { label: 'Completed',   dotClass: 'col-dot-completed' },
};

export default function MemberTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [submitForm, setSubmitForm] = useState({ content: '', repoLink: '' });
  const [submitting, setSubmitting] = useState(false);
  const [reviewing, setReviewing] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const { toasts, showToast, dismissToast } = useToast();

  const fetchTasks = async () => {
    try {
      const res = await getMyTasks();
      setTasks(res.data?.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchTasks(); }, []);

  const openTask = async (task) => {
    setSelectedTask(task);
    setSubmitForm({ content: '', repoLink: '' });
    try {
      const res = await getTaskSubmissions(task._id);
      setSubmissions(res.data?.data || []);
    } catch { setSubmissions([]); }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus);
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
      if (selectedTask?._id === taskId) setSelectedTask(t => ({ ...t, status: newStatus }));
    } catch (e) { showToast(e.response?.data?.message || 'Error updating status', 'error'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!submitForm.content && !submitForm.repoLink) {
      showToast('Please enter a description or a repo link before submitting.', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      await submitWork(selectedTask._id, submitForm);
      await handleStatusChange(selectedTask._id, 'review');
      const res = await getTaskSubmissions(selectedTask._id);
      setSubmissions(res.data?.data || []);
      setSubmitForm({ content: '', repoLink: '' });
      showToast('Work submitted! Task moved to In Review.', 'success');
    } catch (e) { showToast(e.response?.data?.message || 'Submit failed', 'error'); }
    setSubmitting(false);
  };

  const handleAIReview = async (submissionId) => {
    setReviewing(submissionId);
    try {
      const res = await aiReviewSubmission(submissionId);
      const updatedSub = res.data?.data;
      setSubmissions(prev => prev.map(s => s._id === submissionId ? updatedSub : s));
      showToast('AI review completed!', 'success');
    } catch (e) { showToast(e.response?.data?.message || 'AI review failed', 'error'); }
    setReviewing(null);
  };

  const filteredTasks = tasks.filter(t => filterType === 'all' || t.type === filterType);
  const tasksByStatus = STATUS_COLS.reduce((acc, s) => {
    acc[s] = filteredTasks.filter(t => t.status === s);
    return acc;
  }, {});

  if (loading) return (
    <AppLayout>
      <div className="loading-full"><div className="spinner" style={{ width: 36, height: 36 }} /></div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <Toast toasts={toasts} dismiss={dismissToast} />
      <div className="topbar">
        <div>
          <h1 className="page-title">My Tasks</h1>
          <p className="page-subtitle">{tasks.length} tasks assigned to you</p>
        </div>
        <div className="tabs">
          {['all', 'epic', 'task', 'subtask'].map(t => (
            <button key={t} className={`tab-btn${filterType === t ? ' active' : ''}`} onClick={() => setFilterType(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="kanban-board">
        {STATUS_COLS.map(status => {
          const col = COL_CONFIG[status];
          const colTasks = tasksByStatus[status] || [];
          return (
            <div key={status} className="kanban-column">
              <div className="kanban-column-header">
                <div className="kanban-col-title">
                  <div className={`kanban-col-dot ${col.dotClass}`} />
                  {col.label}
                </div>
                <div className="kanban-col-count">{colTasks.length}</div>
              </div>
              <div className="kanban-cards">
                {colTasks.length === 0 ? (
                  <div style={{ padding: '16px 8px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    No tasks
                  </div>
                ) : colTasks.map(task => (
                  <div key={task._id} className="task-card" onClick={() => openTask(task)}>
                    <div className="flex items-start gap-8">
                      <div className={`priority-indicator ${PRIORITY_CLASS[task.priority] || ''}`} style={{ marginTop: 3, width: 3, height: 60 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="flex items-center gap-6" style={{ marginBottom: 6 }}>
                          <span className={`task-type-badge ${task.type === 'epic' ? 'type-epic' : task.type === 'subtask' ? 'type-subtask' : 'type-task'}`}>
                            {task.type}
                          </span>
                        </div>
                        <div className="task-card-title">{task.title}</div>
                        {task.desc && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8 }} className="truncate">
                            {task.desc}
                          </div>
                        )}
                        <div className="task-card-meta">
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            📁 {task.projectID?.title || 'Project'}
                          </span>
                          {task.aiScore !== null && task.aiScore !== undefined && (
                            <span className="badge badge-violet" style={{ fontSize: '0.6875rem' }}>
                              🤖 {task.aiScore}/100
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setSelectedTask(null); }}>
          <div className="modal modal-lg">
            <div className="modal-header">
              <div>
                <div className="flex items-center gap-8" style={{ marginBottom: 4 }}>
                  <span className={`task-type-badge ${selectedTask.type === 'epic' ? 'type-epic' : selectedTask.type === 'subtask' ? 'type-subtask' : 'type-task'}`}>
                    {selectedTask.type}
                  </span>
                  <span className={`badge ${STATUS_BADGE[selectedTask.status] || 'badge-gray'}`}>
                    {selectedTask.status}
                  </span>
                </div>
                <h3 className="modal-title">{selectedTask.title}</h3>
              </div>
              <button className="modal-close btn btn-ghost btn-icon" onClick={() => setSelectedTask(null)}>
                <X size={18} />
              </button>
            </div>

            {selectedTask.desc && (
              <p style={{ fontSize: '0.875rem', marginBottom: 16 }}>{selectedTask.desc}</p>
            )}

            {/* Status changer */}
            <div className="form-group">
              <label className="form-label">Update Status</label>
              <div className="flex gap-8">
                {STATUS_COLS.map(s => (
                  <button key={s} className={`btn btn-sm ${selectedTask.status === s ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => handleStatusChange(selectedTask._id, s)}>
                    {s === 'in-progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="divider" />

            {/* Submit Work */}
            {selectedTask.status !== 'completed' && (
              <div>
                <h5 style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Send size={14} color="var(--accent-secondary)" /> Submit Work
                </h5>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="form-label">Work Description / Code Snippet</label>
                    <textarea className="textarea" rows={4} placeholder="Describe what you've done, paste code, or provide links..."
                      value={submitForm.content} onChange={e => setSubmitForm({ ...submitForm, content: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Repository / Demo Link</label>
                    <input className="input" type="url" placeholder="https://github.com/..."
                      value={submitForm.repoLink} onChange={e => setSubmitForm({ ...submitForm, repoLink: e.target.value })} />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Submitting...</> : <><Send size={14} /> Submit for Review</>}
                  </button>
                </form>
              </div>
            )}

            {/* Previous Submissions */}
            {submissions.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <div className="divider" />
                <h5 style={{ marginBottom: 12 }}>Submission History ({submissions.length})</h5>
                {submissions.map(sub => (
                  <div key={sub._id} style={{
                    background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius)', padding: '14px', marginBottom: 12
                  }}>
                    <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                        Version {sub.version} — {new Date(sub.createdAt).toLocaleDateString()}
                      </span>
                      <span className={`badge ${sub.status === 'approved' ? 'badge-green' : sub.status === 'reviewed' ? 'badge-blue' : 'badge-gray'}`}>
                        {sub.status}
                      </span>
                    </div>

                    {sub.content && (
                      <pre style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', marginBottom: 8 }}>
                        {sub.content.slice(0, 200)}{sub.content.length > 200 ? '...' : ''}
                      </pre>
                    )}

                    {sub.repoLink && (
                      <a href={sub.repoLink} target="_blank" rel="noreferrer"
                        className="flex items-center gap-6"
                        style={{ fontSize: '0.8125rem', color: 'var(--accent-secondary)' }}>
                        <ExternalLink size={12} /> {sub.repoLink}
                      </a>
                    )}

                    {/* AI Review Results */}
                    {sub.aiReview?.summary ? (
                      <div className="ai-panel" style={{ marginTop: 12, padding: 14 }}>
                        <div className="ai-label" style={{ marginBottom: 8 }}><Bot size={10} /> AI Review</div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                          {sub.aiReview.summary}
                        </div>
                        <div className="flex items-center gap-16">
                          <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Code Quality</div>
                            <div style={{ fontWeight: 800, color: sub.aiReview.score >= 80 ? 'var(--success)' : sub.aiReview.score >= 60 ? 'var(--warning)' : 'var(--danger)' }}>
                              {sub.aiReview.score}/100
                            </div>
                          </div>
                          {sub.aiReview.bugs?.length > 0 && (
                            <div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Issues Found</div>
                              <div style={{ fontWeight: 700, color: 'var(--danger)' }}>{sub.aiReview.bugs.length}</div>
                            </div>
                          )}
                        </div>
                        {sub.aiReview.suggestions?.length > 0 && (
                          <div style={{ marginTop: 10 }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6 }}>Suggestions</div>
                            {sub.aiReview.suggestions.map((s, i) => (
                              <div key={i} className="ai-suggestion">{s}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <button className="btn btn-secondary btn-sm" style={{ marginTop: 10 }}
                        disabled={reviewing === sub._id} onClick={() => handleAIReview(sub._id)}>
                        {reviewing === sub._id ? <><div className="spinner" style={{ width: 12, height: 12 }} /> Reviewing...</> : <><Bot size={12} /> Get AI Review</>}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
