import { useState, useCallback } from 'react';
import { X } from 'lucide-react';

// ── Shared Toast Component ────────────────────────────────────────────────────
export function Toast({ toasts, dismiss }) {
  if (!toasts.length) return null;
  return (
    <div style={{
      position: 'fixed', top: 24, right: 24, zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 420, minWidth: 300
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 18px',
          borderRadius: 14,
          background: t.type === 'error'
            ? 'rgba(20,2,2,0.95)' : t.type === 'warning'
            ? 'rgba(20,15,2,0.95)' : 'rgba(2,18,10,0.95)',
          border: `1.5px solid ${t.type === 'error'
            ? 'rgba(239,68,68,0.5)' : t.type === 'warning'
            ? 'rgba(245,158,11,0.5)' : 'rgba(16,185,129,0.5)'}`,
          backdropFilter: 'blur(20px)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
        }}>
          <div style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: 1 }}>
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

// ── useToast hook ─────────────────────────────────────────────────────────────
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    if (type !== 'error') {
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 6000);
    }
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, showToast, dismissToast };
}
