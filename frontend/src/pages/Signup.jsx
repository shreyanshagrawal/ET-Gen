import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register as apiRegister } from '../lib/api';
import { Sparkles, Eye, EyeOff } from 'lucide-react';

export default function Signup() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await apiRegister(form);
      setSuccess('Account created! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-glow" />
      <div style={{
        position: 'absolute', width: 250, height: 250,
        background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)',
        top: '60%', left: -80, borderRadius: '50%'
      }} />

      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56,
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            borderRadius: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 0 32px rgba(124,58,237,0.4)'
          }}>
            <Sparkles size={24} color="white" />
          </div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: 6 }}>Create account</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Join your AI-powered workspace
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{
              background: 'var(--danger-bg)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 'var(--radius)', padding: '10px 14px',
              color: 'var(--danger)', fontSize: '0.875rem', marginBottom: 18
            }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{
              background: 'var(--success-bg)', border: '1px solid rgba(16,185,129,0.3)',
              borderRadius: 'var(--radius)', padding: '10px 14px',
              color: 'var(--success)', fontSize: '0.875rem', marginBottom: 18
            }}>
              {success}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Username</label>
            <input id="signup-username" className="input" type="text" placeholder="johndoe"
              value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input id="signup-email" className="input" type="email" placeholder="you@company.com"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input id="signup-password" className="input" type={showPass ? 'text' : 'password'}
                placeholder="Min. 6 characters" style={{ paddingRight: 44 }}
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)'
              }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius)', padding: '10px 14px', marginBottom: 18,
            fontSize: '0.8125rem', color: 'var(--text-muted)'
          }}>
            Role defaults to <strong style={{ color: 'var(--text-secondary)' }}>Member</strong>.
            Admins can promote users via the admin panel.
          </div>

          <button id="signup-submit" type="submit" className="btn btn-primary w-full"
            disabled={loading} style={{ height: 44, fontSize: '0.9375rem' }}>
            {loading ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Creating account...</> : 'Create Account'}
          </button>
        </form>

        <div className="divider" style={{ margin: '24px 0' }} />
        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-secondary)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
