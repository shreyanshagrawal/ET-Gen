import { useState, useEffect } from 'react';
import { AppLayout } from '../../components/ProtectedLayout';
import { useAuth } from '../../contexts/AuthContext';
import { getMyProfile, updateMyProfile } from '../../lib/api';
import { Toast, useToast } from '../../components/Toast';
import {
  User, Mail, Shield, Tag, Star, Save, Edit2, X, Check,
  Users, Zap
} from 'lucide-react';

const SKILL_SUGGESTIONS = [
  'React', 'Node.js', 'Python', 'MongoDB', 'TypeScript', 'AWS', 'Docker',
  'GraphQL', 'Vue.js', 'PostgreSQL', 'Redis', 'Kubernetes', 'Machine Learning',
  'Java', 'Go', 'Rust', 'Flutter', 'Firebase', 'Next.js', 'Django',
];

const ROLE_CONFIG = {
  admin:   { label: '⚡ Admin',   cls: 'badge-violet', bg: 'rgba(124,58,237,0.15)', border: 'rgba(124,58,237,0.3)' },
  manager: { label: '👥 Manager', cls: 'badge-amber',  bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
  member:  { label: '🔧 Member',  cls: 'badge-blue',   bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)' },
};

export default function UserProfile() {
  const { user: authUser, login } = useAuth();
  const { toasts, showToast, dismissToast } = useToast();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [skillInput, setSkillInput] = useState('');
  const [editSkills, setEditSkills] = useState([]);
  const [editUsername, setEditUsername] = useState('');

  const fetchProfile = async () => {
    try {
      const res = await getMyProfile();
      setProfile(res.data?.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchProfile(); }, []);

  const startEdit = () => {
    setEditSkills(profile?.skills || []);
    setEditUsername(profile?.username || '');
    setSkillInput('');
    setEditing(true);
  };

  const cancelEdit = () => { setEditing(false); setSkillInput(''); };

  const addSkill = (skill) => {
    const s = skill.trim();
    if (!s || editSkills.includes(s)) return;
    setEditSkills(prev => [...prev, s]);
    setSkillInput('');
  };

  const removeSkill = (s) => setEditSkills(prev => prev.filter(x => x !== s));

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill(skillInput);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateMyProfile({ skills: editSkills, username: editUsername });
      const updated = res.data?.data;
      setProfile(updated);
      // Update auth context so sidebar reflects username change
      if (authUser) login({ ...authUser, username: updated.username });
      setEditing(false);
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile', 'error');
    }
    setSaving(false);
  };

  const roleConf = ROLE_CONFIG[profile?.role] || ROLE_CONFIG.member;
  const initials = profile?.username?.slice(0, 2).toUpperCase() || '??';

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
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your profile, skills and account details</p>
        </div>
        {!editing ? (
          <button className="btn btn-primary" onClick={startEdit}>
            <Edit2 size={15} /> Edit Profile
          </button>
        ) : (
          <div className="flex gap-8">
            <button className="btn btn-ghost" onClick={cancelEdit}>
              <X size={15} /> Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <div className="spinner" style={{ width: 14, height: 14 }} /> : <Save size={15} />}
              Save Changes
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24 }}>

        {/* Left — Avatar card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ textAlign: 'center' }}>
            {/* Large Avatar */}
            <div style={{
              width: 96, height: 96, borderRadius: '50%', margin: '0 auto 16px',
              background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', fontWeight: 900, color: '#fff',
              boxShadow: '0 0 30px rgba(124,58,237,0.5)',
            }}>
              {initials}
            </div>

            <h3 style={{ margin: '0 0 4px', fontSize: '1.125rem' }}>{profile?.username}</h3>
            <p style={{ margin: '0 0 16px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              {profile?.email}
            </p>

            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 20,
              background: roleConf.bg, border: `1px solid ${roleConf.border}`,
            }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700 }}>{roleConf.label}</span>
            </div>

            {profile?.teamId && (
              <div style={{
                marginTop: 16, padding: '10px 14px',
                background: 'rgba(59,130,246,0.08)', borderRadius: 'var(--radius)',
                border: '1px solid rgba(59,130,246,0.2)',
                display: 'flex', alignItems: 'center', gap: 8
              }}>
                <Users size={14} color="var(--info)" />
                <span style={{ fontSize: '0.8125rem', color: 'var(--info)', fontWeight: 600 }}>
                  {profile.teamId.name}
                </span>
              </div>
            )}
          </div>

          {/* Performance */}
          <div className="card">
            <div className="card-header">
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Star size={14} color="var(--warning)" /> Performance Score
              </div>
            </div>
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--accent-secondary)' }}>
                {profile?.performanceScore ?? 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>out of 100</div>
              <div className="progress" style={{ margin: '12px 0 0', height: 6 }}>
                <div className="progress-bar" style={{ width: `${profile?.performanceScore ?? 0}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Right — Details + Skills */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Account Info */}
          <div className="card">
            <div className="card-header">
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <User size={14} /> Account Information
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Username</label>
                {editing ? (
                  <input
                    className="input"
                    value={editUsername}
                    onChange={e => setEditUsername(e.target.value)}
                    placeholder="Enter username"
                  />
                ) : (
                  <div style={{
                    padding: '10px 14px', background: 'rgba(255,255,255,0.04)',
                    borderRadius: 'var(--radius)', fontSize: '0.9rem', fontWeight: 600
                  }}>
                    {profile?.username}
                  </div>
                )}
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Email</label>
                <div style={{
                  padding: '10px 14px', background: 'rgba(255,255,255,0.04)',
                  borderRadius: 'var(--radius)', fontSize: '0.9rem',
                  color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8
                }}>
                  <Mail size={14} color="var(--text-muted)" />
                  {profile?.email}
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Role</label>
                <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius)' }}>
                  <span className={`badge ${roleConf.cls}`}>{profile?.role}</span>
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Member Since</label>
                <div style={{
                  padding: '10px 14px', background: 'rgba(255,255,255,0.04)',
                  borderRadius: 'var(--radius)', fontSize: '0.875rem', color: 'var(--text-secondary)'
                }}>
                  {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                </div>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="card">
            <div className="card-header">
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap size={14} color="var(--accent-secondary)" /> Skills & Expertise
              </div>
              {!editing && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  AI uses these to match tasks to you
                </span>
              )}
            </div>

            {editing ? (
              <div>
                {/* Current skills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16, minHeight: 40 }}>
                  {editSkills.map(s => (
                    <div key={s} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '4px 10px 4px 12px',
                      background: 'rgba(124,58,237,0.2)', borderRadius: 20,
                      border: '1px solid rgba(124,58,237,0.4)',
                      fontSize: '0.8125rem', fontWeight: 600, color: 'var(--accent-secondary)'
                    }}>
                      {s}
                      <button onClick={() => removeSkill(s)} style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'rgba(168,85,247,0.6)', display: 'flex', padding: 0
                      }}>
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  {editSkills.length === 0 && (
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
                      Add skills below...
                    </span>
                  )}
                </div>

                {/* Input */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <input
                    className="input"
                    placeholder="Type a skill and press Enter..."
                    value={skillInput}
                    onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={handleSkillKeyDown}
                  />
                  <button className="btn btn-secondary" onClick={() => addSkill(skillInput)} disabled={!skillInput.trim()}>
                    <Check size={14} />
                  </button>
                </div>

                {/* Suggestions */}
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>
                    QUICK ADD
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {SKILL_SUGGESTIONS.filter(s => !editSkills.includes(s)).map(s => (
                      <button key={s} onClick={() => addSkill(s)} style={{
                        background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)',
                        borderRadius: 20, padding: '3px 10px', cursor: 'pointer',
                        fontSize: '0.75rem', color: 'var(--text-secondary)',
                        transition: 'all 0.15s'
                      }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-secondary)'; e.currentTarget.style.color = 'var(--accent-secondary)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                      >
                        + {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {profile?.skills?.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {profile.skills.map(s => (
                      <span key={s} style={{
                        padding: '5px 14px',
                        background: 'rgba(124,58,237,0.15)', borderRadius: 20,
                        border: '1px solid rgba(124,58,237,0.3)',
                        fontSize: '0.8125rem', fontWeight: 600, color: 'var(--accent-secondary)'
                      }}>
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    padding: '32px 20px', textAlign: 'center',
                    background: 'rgba(124,58,237,0.04)', borderRadius: 'var(--radius)',
                    border: '1px dashed rgba(124,58,237,0.2)'
                  }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>🎯</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: 4 }}>No skills added yet</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      Add skills so the AI can match you with relevant tasks
                    </div>
                    <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={startEdit}>
                      <Zap size={14} /> Add Skills Now
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Team Info */}
          {profile?.teamId && (
            <div className="card">
              <div className="card-header">
                <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Users size={14} /> My Team
                </div>
              </div>
              <div style={{
                padding: '14px 16px', background: 'rgba(59,130,246,0.06)',
                borderRadius: 'var(--radius)', border: '1px solid rgba(59,130,246,0.15)'
              }}>
                <div style={{ fontWeight: 700, marginBottom: 4, fontSize: '1rem' }}>
                  {profile.teamId.name}
                </div>
                {profile.teamId.description && (
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    {profile.teamId.description}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
