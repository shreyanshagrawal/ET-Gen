import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/ProtectedLayout';
import {
  getProjectById, getProjectTasks, aiGenerateTasks, aiAssignTasks,
  adminApproveProject, aiGenerateDocs, getAllTeams
} from '../../lib/api';
import { Bot, Sparkles, Users, ArrowLeft, FileText, X, AlertTriangle } from 'lucide-react';

// ─── Persistent In-Page Toast System ──────────────────────────────────────────
function Toast({ toasts, dismiss }) {
  if (!toasts.length) return null;
  return (
    <div style={{
      position: 'fixed', top: 24, right: 24, zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 440, minWidth: 320
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          display: 'flex', alignItems: 'flex-start', gap: 12, padding: '16px 18px',
          borderRadius: 14,
          background: t.type === 'error'
            ? 'rgba(20,2,2,0.92)'
            : t.type === 'warning'
              ? 'rgba(20,15,2,0.92)'
              : 'rgba(2,20,10,0.92)',
          border: `1.5px solid ${t.type === 'error' ? 'rgba(239,68,68,0.5)' : t.type === 'warning' ? 'rgba(245,158,11,0.5)' : 'rgba(16,185,129,0.5)'}`,
          backdropFilter: 'blur(20px)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
        }}>
          <div style={{ fontSize: '1.2rem', flexShrink: 0, marginTop: 1 }}>
            {t.type === 'error' ? '❌' : t.type === 'warning' ? '⚠️' : '✅'}
          </div>
          <div style={{ flex: 1, fontSize: '0.875rem', color: '#fff', lineHeight: 1.6 }}>
            {t.message}
          </div>
          <button onClick={() => dismiss(t.id)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.5)', flexShrink: 0, padding: 2, marginTop: 1
          }}>
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

const STATUS_COLOR = {
  pending: 'var(--text-muted)', 'in-progress': 'var(--info)',
  review: 'var(--warning)', completed: 'var(--success)'
};
const PRIORITY_CLASS = {
  critical: 'priority-critical', high: 'priority-high',
  medium: 'priority-medium', low: 'priority-low'
};

export default function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [docs, setDocs] = useState('');
  const [toasts, setToasts] = useState([]);

  // ── Toast helpers ──────────────────────────────────────────────────────────
  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    // Error toasts stay until dismissed; others auto-dismiss after 7s
    if (type !== 'error') {
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 7000);
    }
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // ── Data fetching ─────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      const [projRes, taskRes, teamRes] = await Promise.all([
        getProjectById(projectId),
        getProjectTasks(projectId),
        getAllTeams()
      ]);
      setProject(projRes.data?.data?.project || projRes.data?.data);
      setTasks(taskRes.data?.data || []);
      const teamsData = teamRes.data?.data || [];
      setTeams(teamsData);
    } catch (e) {
      console.error('fetchData error:', e);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── AI actions ─────────────────────────────────────────────────────────────
  const handleGenerateTasks = async () => {
    setAiLoading('generate');
    try {
      await aiGenerateTasks(projectId);
      await fetchData();
      setActiveTab('tasks');
      showToast('AI successfully generated the task hierarchy! Switched to Tasks tab.', 'success');
    } catch (e) {
      const msg = e.response?.data?.message || e.message || 'AI generation failed.';
      showToast(`Generation failed: ${msg}`, 'error');
    } finally { setAiLoading(''); }
  };

  const handleAssignTasks = async () => {
    if (!selectedTeam) {
      showToast('Please select a team from the dropdown first.', 'warning');
      return;
    }
    setAiLoading('assign');
    try {
      const res = await aiAssignTasks(projectId, selectedTeam);
      const count = res.data?.data?.totalTasks || 0;
      await fetchData();
      showToast(`✅ AI assigned ${count} tasks to team members! View the Tasks tab to see assignments.`, 'success');
    } catch (e) {
      const msg = e.response?.data?.message || e.message || 'Assignment failed.';
      showToast(`Assignment failed: ${msg}`, 'error');
    } finally { setAiLoading(''); }
  };

  const handleGenerateDocs = async () => {
    setAiLoading('docs');
    try {
      const res = await aiGenerateDocs(projectId);
      setDocs(res.data?.data?.documentation || '');
      setActiveTab('docs');
      showToast('Final documentation generated!', 'success');
    } catch (e) {
      const msg = e.response?.data?.message || e.message || 'Doc generation failed.';
      showToast(`Doc generation failed: ${msg}`, 'error');
    } finally { setAiLoading(''); }
  };

  // ── Derived state ─────────────────────────────────────────────────────────
  const epics = tasks.filter(t => t.type === 'epic');
  const childTasks = tasks.filter(t => t.type === 'task');
  const subtasks = tasks.filter(t => t.type === 'subtask');
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const progressPct = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const selectedTeamObj = teams.find(t => t._id === selectedTeam);
  const assignableTasks = tasks.filter(t => t.type !== 'epic').length;

  if (loading) return (
    <AppLayout>
      <div className="loading-full"><div className="spinner" style={{ width: 36, height: 36 }} /></div>
    </AppLayout>
  );

  if (!project) return (
    <AppLayout>
      <div className="empty-state"><h3>Project not found</h3></div>
    </AppLayout>
  );

  return (
    <AppLayout>
      {/* Persistent Toast Notifications */}
      <Toast toasts={toasts} dismiss={dismissToast} />

      {/* ── Header ── */}
      <div className="topbar">
        <div className="flex items-center gap-12">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="page-title">{project.title}</h1>
            <div className="flex items-center gap-8" style={{ marginTop: 4 }}>
              <span className="badge badge-green">{project.status}</span>
              <span className="badge badge-violet">{project.approvalStatus}</span>
              {project.aiTasksGenerated && (
                <span className="badge badge-blue"><Bot size={10} /> AI Tasks</span>
              )}
            </div>
          </div>
        </div>
        <button className="btn btn-secondary btn-sm" disabled={aiLoading === 'docs'} onClick={handleGenerateDocs}>
          {aiLoading === 'docs' ? <div className="spinner" style={{ width: 14, height: 14 }} /> : <FileText size={14} />}
          Generate Docs
        </button>
      </div>

      {/* ── Tabs ── */}
      <div className="tabs mb-24">
        {['overview', 'tasks', 'ai', docs ? 'docs' : null].filter(Boolean).map(t => (
          <button key={t} className={`tab-btn${activeTab === t ? ' active' : ''}`} onClick={() => setActiveTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
            {t === 'tasks' && tasks.length > 0 && (
              <span style={{
                marginLeft: 6, background: 'rgba(124,58,237,0.3)',
                borderRadius: 99, padding: '0 7px', fontSize: '0.7rem', fontWeight: 700
              }}>
                {tasks.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Overview Tab ── */}
      {activeTab === 'overview' && (
        <div className="grid-2" style={{ gap: 24 }}>
          <div className="card">
            <h4 style={{ marginBottom: 16 }}>Project Details</h4>
            <div className="form-group">
              <div className="form-label">Description</div>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.7 }}>{project.description}</p>
            </div>
            {project.requirements && (
              <div className="form-group">
                <div className="form-label">Requirements</div>
                <p style={{ fontSize: '0.875rem', lineHeight: 1.7 }}>{project.requirements}</p>
              </div>
            )}
            {project.techStack?.length > 0 && (
              <div>
                <div className="form-label">Tech Stack</div>
                <div className="flex gap-8" style={{ flexWrap: 'wrap', marginTop: 8 }}>
                  {project.techStack.map(t => <span key={t} className="badge badge-violet">{t}</span>)}
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <h4 style={{ marginBottom: 16 }}>Progress</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.8125rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>{completedTasks}/{tasks.length} tasks done</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-secondary)' }}>{progressPct}%</span>
              </div>
              <div className="progress" style={{ height: 10 }}>
                <div className="progress-bar" style={{ width: `${progressPct}%` }} />
              </div>
              <div className="grid-2" style={{ marginTop: 16, gap: 10 }}>
                {[
                  { label: 'Total', val: tasks.length, color: 'var(--text-primary)' },
                  { label: 'Done', val: completedTasks, color: 'var(--success)' },
                  { label: 'In Progress', val: tasks.filter(t => t.status === 'in-progress').length, color: 'var(--info)' },
                  { label: 'In Review', val: tasks.filter(t => t.status === 'review').length, color: 'var(--warning)' },
                ].map(({ label, val, color }) => (
                  <div key={label} style={{
                    background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius)',
                    padding: '10px 12px', textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color }}>{val}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h4 style={{ marginBottom: 12 }}>Timeline</h4>
              {[
                { label: 'Start Date', val: project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A' },
                { label: 'End Date', val: project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A' },
                { label: 'Created', val: new Date(project.createdAt).toLocaleDateString() },
                { label: 'Team', val: project.teamId?.name || 'Not assigned' },
              ].map(({ label, val }) => (
                <div key={label} className="flex items-center justify-between" style={{
                  padding: '8px 0', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.875rem'
                }}>
                  <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                  <span style={{ fontWeight: 600 }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Tasks Tab ── */}
      {activeTab === 'tasks' && (
        <div>
          {tasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><Bot size={40} /></div>
              <h3>No Tasks Yet</h3>
              <p>Go to the <strong>AI</strong> tab and click "Generate AI Tasks"</p>
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setActiveTab('ai')}>
                <Bot size={14} /> Go to AI Center
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                {epics.length} Epics · {childTasks.length} Tasks · {subtasks.length} Subtasks
              </div>
              {epics.map(epic => (
                <div key={epic._id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  {/* Epic header */}
                  <div style={{
                    padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12,
                    background: 'rgba(124,58,237,0.08)', borderBottom: '1px solid var(--border-subtle)'
                  }}>
                    <div style={{ width: 4, height: 22, background: 'var(--accent-primary)', borderRadius: 99 }} />
                    <span className="task-type-badge type-epic">Epic</span>
                    <h4 style={{ flex: 1, margin: 0, fontSize: '0.95rem' }}>{epic.title}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>~{epic.estimatedHours}h</span>
                  </div>
                  <div style={{ padding: '4px 0 8px' }}>
                    {childTasks.filter(t => t.parentTaskId?.toString() === epic._id.toString()).map(task => (
                      <div key={task._id} style={{ padding: '8px 20px 8px 40px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <div className="flex items-center gap-10">
                          <div className={`priority-indicator ${PRIORITY_CLASS[task.priority]}`} style={{ width: 3, height: 16 }} />
                          <span className="task-type-badge type-task">Task</span>
                          <span style={{ flex: 1, fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                            {task.title}
                          </span>
                          {task.assignedTo ? (
                            <span style={{
                              fontSize: '0.72rem', color: 'var(--info)', fontWeight: 600,
                              background: 'rgba(59,130,246,0.12)', padding: '2px 8px', borderRadius: 99, whiteSpace: 'nowrap'
                            }}>
                              👤 {task.assignedTo.username || 'Assigned'}
                            </span>
                          ) : (
                            <span className="badge badge-gray">Unassigned</span>
                          )}
                          <span style={{
                            fontSize: '0.72rem', fontWeight: 600,
                            color: STATUS_COLOR[task.status] || 'var(--text-muted)', whiteSpace: 'nowrap'
                          }}>
                            {task.status}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>~{task.estimatedHours}h</span>
                        </div>
                        {subtasks.filter(s => s.parentTaskId?.toString() === task._id.toString()).map(sub => (
                          <div key={sub._id} style={{ paddingLeft: 28, paddingTop: 5, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>└</span>
                            <span className="task-type-badge type-subtask" style={{ fontSize: '0.6rem' }}>Sub</span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{sub.title}</span>
                            {sub.assignedTo && (
                              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                                👤 {sub.assignedTo.username}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── AI Tab ── */}
      {activeTab === 'ai' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 740 }}>

          {/* Step 1 */}
          <div className="ai-panel">
            <div className="ai-label"><Sparkles size={12} /> Step 1: Generate Tasks</div>
            <h3 style={{ marginBottom: 8 }}>AI Task Generation</h3>
            <p style={{ fontSize: '0.875rem', marginBottom: 16, color: 'var(--text-secondary)' }}>
              AI analyzes your project description, requirements, and tech stack to produce:
              <strong> Epics → Tasks → Subtasks</strong> with time estimates.
            </p>
            {project.approvalStatus !== 'approved' ? (
              <div style={{
                background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
                borderRadius: 'var(--radius)', padding: '12px 16px',
                color: 'var(--warning)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 8
              }}>
                <AlertTriangle size={16} /> Project must be <strong>approved</strong> first (currently: {project.approvalStatus}).
              </div>
            ) : project.aiTasksGenerated ? (
              <div style={{
                background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)',
                borderRadius: 'var(--radius)', padding: '12px 16px',
                color: 'var(--success)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 12
              }}>
                <span>✅ Tasks already generated — <strong>{tasks.length} tasks</strong> ready</span>
                <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab('tasks')}
                  style={{ marginLeft: 'auto', color: 'var(--accent-secondary)' }}>
                  View Tasks →
                </button>
              </div>
            ) : (
              <button className="btn btn-primary" disabled={aiLoading === 'generate'} onClick={handleGenerateTasks}
                id="generate-tasks-btn">
                {aiLoading === 'generate'
                  ? <><div className="spinner" style={{ width: 14, height: 14 }} /> AI is thinking...</>
                  : <><Bot size={15} /> Generate AI Tasks</>}
              </button>
            )}
          </div>

          {/* Step 2 */}
          <div className="ai-panel" style={{ opacity: project.aiTasksGenerated ? 1 : 0.55 }}>
            <div className="ai-label"><Users size={12} /> Step 2: Assign to Team</div>
            <h3 style={{ marginBottom: 8 }}>Smart Task Assignment</h3>
            <p style={{ fontSize: '0.875rem', marginBottom: 16, color: 'var(--text-secondary)' }}>
              AI distributes <strong>{assignableTasks} tasks</strong> across team members with workload balancing.
              {!project.aiTasksGenerated && (
                <span style={{ color: 'var(--warning)', fontWeight: 600 }}> Complete Step 1 first.</span>
              )}
            </p>

            {teams.length === 0 ? (
              <div style={{
                background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
                borderRadius: 'var(--radius)', padding: '16px'
              }}>
                <div style={{ fontWeight: 700, color: 'var(--warning)', marginBottom: 6 }}>⚠️ No teams exist yet</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  Create a team first, add members to it, then return here.
                  <button className="btn btn-secondary btn-sm" onClick={() => navigate('/admin/teams')}>
                    Go to Teams
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="flex items-center gap-12" style={{ flexWrap: 'wrap' }}>
                  <select
                    className="select"
                    value={selectedTeam}
                    onChange={e => setSelectedTeam(e.target.value)}
                    disabled={!project.aiTasksGenerated}
                    style={{ flex: 1, maxWidth: 320 }}
                    id="assign-team-select"
                  >
                    <option value="">— Pick a team —</option>
                    {teams.map(t => (
                      <option key={t._id} value={t._id}>
                        {t.name} ({t.members?.length || 0} member{t.members?.length !== 1 ? 's' : ''})
                      </option>
                    ))}
                  </select>
                  <button
                    className="btn btn-primary"
                    id="assign-tasks-btn"
                    disabled={aiLoading === 'assign' || !selectedTeam || !project.aiTasksGenerated}
                    onClick={handleAssignTasks}
                  >
                    {aiLoading === 'assign'
                      ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Assigning...</>
                      : <><Sparkles size={14} /> Auto-Assign</>}
                  </button>
                </div>

                {/* Live team info preview */}
                {selectedTeamObj && (
                  <div style={{
                    padding: '12px 16px',
                    background: 'rgba(255,255,255,0.03)',
                    border: `1px solid ${selectedTeamObj.members?.length === 0 ? 'rgba(239,68,68,0.3)' : 'var(--border-subtle)'}`,
                    borderRadius: 'var(--radius)',
                    display: 'flex', gap: 24, flexWrap: 'wrap', fontSize: '0.8125rem'
                  }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Team  </span>
                      <strong>{selectedTeamObj.name}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Members  </span>
                      <strong style={{ color: selectedTeamObj.members?.length === 0 ? 'var(--danger)' : 'var(--success)' }}>
                        {selectedTeamObj.members?.length || 0}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Tasks to distribute  </span>
                      <strong>{assignableTasks}</strong>
                    </div>
                    {selectedTeamObj.members?.length === 0 && (
                      <div style={{ color: 'var(--danger)', fontWeight: 700, width: '100%' }}>
                        ⛔ This team has no members — add members first on the Teams page.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Step 3 */}
          <div className="ai-panel" style={{ opacity: tasks.length > 0 ? 1 : 0.55 }}>
            <div className="ai-label"><FileText size={12} /> Step 3: Final Docs</div>
            <h3 style={{ marginBottom: 8 }}>Generate Documentation</h3>
            <p style={{ fontSize: '0.875rem', marginBottom: 16, color: 'var(--text-secondary)' }}>
              AI creates a final project report: task breakdown, team performance, and architecture summary.
            </p>
            <button className="btn btn-primary" disabled={aiLoading === 'docs'} onClick={handleGenerateDocs} id="generate-docs-btn">
              {aiLoading === 'docs'
                ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Generating Report...</>
                : <><FileText size={14} /> Generate Documentation</>}
            </button>
          </div>
        </div>
      )}

      {/* ── Docs Tab ── */}
      {activeTab === 'docs' && docs && (
        <div className="card">
          <h4 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={16} color="var(--accent-secondary)" /> Final Documentation
          </h4>
          <pre style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius)', padding: '20px', overflowX: 'auto',
            fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.9,
            fontFamily: '"Fira Code", monospace', whiteSpace: 'pre-wrap'
          }}>{docs}</pre>
        </div>
      )}
    </AppLayout>
  );
}
