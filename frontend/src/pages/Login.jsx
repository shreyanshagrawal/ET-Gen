import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { login as apiLogin } from '../lib/api';
import { Sparkles, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiLogin(form);
      const userData = res.data?.data;
      login(userData);
      // Redirect based on role
      if (userData.role === 'admin') navigate('/admin/dashboard');
      else if (userData.role === 'manager') navigate('/manager/dashboard');
      else navigate('/member/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-glow" />
      
      {/* Floating orbs */}
      <div style={{
        position: 'absolute', width: 300, height: 300,
        background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)',
        bottom: -100, right: -100, borderRadius: '50%'
      }} />

      <div className="auth-card">
        {/* Logo */}
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
          <h1 style={{ fontSize: '1.75rem', marginBottom: 6 }}>Welcome back</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Sign in to your ProjectAI workspace
          </p>
        </div>

        {/* Demo credentials hint */}
        <div style={{
          background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)',
          borderRadius: 'var(--radius)', padding: '10px 14px', marginBottom: 24,
          fontSize: '0.8125rem', color: 'var(--text-accent)', lineHeight: 1.5
        }}>
          <strong>Demo:</strong> Register a new account and set role via MongoDB.
          Admin role shows full AI features.
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

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              id="login-email"
              className="input"
              type="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                className="input"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                style={{ paddingRight: 44 }}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)'
                }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
            style={{ marginTop: 8, height: 44, fontSize: '0.9375rem' }}
          >
            {loading ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Signing in...</> : 'Sign In'}
          </button>
        </form>

        <div className="divider" style={{ margin: '24px 0' }} />

        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Don&apos;t have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--accent-secondary)', fontWeight: 600 }}>
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
