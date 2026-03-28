import { useState } from 'react';
import { AppLayout } from '../../components/ProtectedLayout';
import { adminCreateProject } from '../../lib/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, X, ArrowLeft, Sparkles } from 'lucide-react';

export default function NewProject() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [techInput, setTechInput] = useState('');
  const [form, setForm] = useState({
    title: '', description: '', requirements: '',
    techStack: [], startDate: '', endDate: '',
    status: 'ONGOING', projectLeadID: user?._id || ''
  });

  const addTech = () => {
    const t = techInput.trim();
    if (t && !form.techStack.includes(t)) {
      setForm(f => ({ ...f, techStack: [...f.techStack, t] }));
    }
    setTechInput('');
  };

  const removeTech = (t) => setForm(f => ({ ...f, techStack: f.techStack.filter(x => x !== t) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.startDate || !form.endDate) {
      setError('Please fill in all required fields.'); return;
    }
    setError('');
    setLoading(true);
    try {
      await adminCreateProject(form);
      navigate('/admin/projects');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project.');
    } finally { setLoading(false); }
  };

  return (
    <AppLayout>
      <div className="topbar">
        <div className="flex items-center gap-12">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="page-title">New Project</h1>
            <p className="page-subtitle">Create a project — AI will generate tasks once approved</p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        {/* AI hint */}
        <div className="ai-panel" style={{ marginBottom: 24 }}>
          <div className="ai-label"><Sparkles size={12} /> AI Ready</div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Once your project is submitted and approved, the AI will automatically analyze your description and requirements
            to generate a full task hierarchy: <strong>Epics → Tasks → Subtasks</strong> with estimated timelines.
          </p>
        </div>

        <div className="card">
          {error && (
            <div style={{
              background: 'var(--danger-bg)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 'var(--radius)', padding: '12px 16px', color: 'var(--danger)',
              fontSize: '0.875rem', marginBottom: 20
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Project Title <span className="form-required">*</span></label>
              <input id="proj-title" className="input" placeholder="e.g., E-Commerce Platform v2.0"
                value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            </div>

            <div className="form-group">
              <label className="form-label">Description <span className="form-required">*</span></label>
              <textarea id="proj-desc" className="textarea" rows={4}
                placeholder="Describe what this project is about, its goals, and expected outcomes..."
                value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
            </div>

            <div className="form-group">
              <label className="form-label">Requirements</label>
              <textarea id="proj-reqs" className="textarea" rows={3}
                placeholder="List any specific requirements, constraints, or technical specifications..."
                value={form.requirements} onChange={e => setForm({ ...form, requirements: e.target.value })} />
            </div>

            <div className="form-group">
              <label className="form-label">Tech Stack</label>
              <div className="flex gap-8" style={{ marginBottom: 8 }}>
                <input id="proj-tech-input" className="input" placeholder="e.g., React, Node.js, MongoDB"
                  value={techInput} onChange={e => setTechInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTech())} />
                <button type="button" className="btn btn-secondary btn-sm" onClick={addTech} style={{ flexShrink: 0 }}>
                  <Plus size={14} /> Add
                </button>
              </div>
              {form.techStack.length > 0 && (
                <div className="flex gap-8" style={{ flexWrap: 'wrap', marginTop: 8 }}>
                  {form.techStack.map(t => (
                    <span key={t} className="badge badge-violet" style={{ cursor: 'pointer' }}
                      onClick={() => removeTech(t)}>
                      {t} <X size={10} />
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Start Date <span className="form-required">*</span></label>
                <input id="proj-start" className="input" type="date"
                  value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">End Date <span className="form-required">*</span></label>
                <input id="proj-end" className="input" type="date"
                  value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} required />
              </div>
            </div>

            <div className="divider" />

            <div className="flex items-center justify-between" style={{ marginTop: 8 }}>
              <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
              <button id="submit-project-btn" type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Creating...</> : <><Plus size={14} /> Create Project</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
