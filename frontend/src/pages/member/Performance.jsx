import { useState, useEffect } from 'react';
import { AppLayout } from '../../components/ProtectedLayout';
import { getMyTasks, getLeaderboard } from '../../lib/api';
import { Trophy, Star, TrendingUp } from 'lucide-react';

export default function Performance() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyTasks()
      .then(res => setTasks(res.data?.data || []))
      .finally(() => setLoading(false));
  }, []);

  const scoredTasks = tasks.filter(t => t.aiScore !== null && t.aiScore !== undefined);
  const avgScore = scoredTasks.length
    ? Math.round(scoredTasks.reduce((s, t) => s + t.aiScore, 0) / scoredTasks.length)
    : 0;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;

  const grades = [
    { min: 90, label: 'Outstanding', color: 'var(--accent-secondary)', emoji: '🌟' },
    { min: 80, label: 'Excellent', color: 'var(--success)', emoji: '✅' },
    { min: 70, label: 'Good', color: 'var(--info)', emoji: '👍' },
    { min: 60, label: 'Average', color: 'var(--warning)', emoji: '✔️' },
    { min: 0, label: 'Needs Improvement', color: 'var(--danger)', emoji: '⚠️' },
  ];
  const grade = grades.find(g => avgScore >= g.min) || grades[grades.length - 1];

  return (
    <AppLayout>
      <div className="topbar">
        <div>
          <h1 className="page-title">My Performance</h1>
          <p className="page-subtitle">AI-generated scores and insights based on your work</p>
        </div>
      </div>

      {loading ? (
        <div className="loading-full"><div className="spinner" style={{ width: 32, height: 32 }} /></div>
      ) : (
        <>
          {/* Performance Summary */}
          <div className="grid-3 mb-24">
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3.5rem', fontWeight: 900, background: 'linear-gradient(135deg, #7c3aed, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {avgScore}
              </div>
              <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                {grade.emoji} {grade.label}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 4 }}>Overall AI Score</div>
              <div className="progress" style={{ marginTop: 16, height: 8 }}>
                <div className="progress-bar" style={{ width: `${avgScore}%`,
                  background: `linear-gradient(90deg, ${grade.color}, ${grade.color}88)` }}
                />
              </div>
            </div>

            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--success)' }}>{completedTasks}</div>
              <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginTop: 4 }}>Tasks Completed</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 4 }}>Out of {tasks.length} total</div>
              <div className="progress" style={{ marginTop: 16, height: 8 }}>
                <div className="progress-bar green" style={{ width: `${tasks.length ? (completedTasks / tasks.length) * 100 : 0}%` }} />
              </div>
            </div>

            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--warning)' }}>{scoredTasks.length}</div>
              <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginTop: 4 }}>AI-Reviewed Tasks</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 4 }}>Submissions reviewed</div>
            </div>
          </div>

          {/* Task Score Breakdown */}
          {scoredTasks.length > 0 ? (
            <div className="card">
              <div className="card-header">
                <div className="card-title">Score Breakdown by Task</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {scoredTasks.sort((a, b) => b.aiScore - a.aiScore).map(task => (
                  <div key={task._id} className="flex items-center gap-16">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 6 }} className="truncate">
                        {task.title}
                      </div>
                      <div className="progress">
                        <div className="progress-bar"
                          style={{
                            width: `${task.aiScore}%`,
                            background: task.aiScore >= 80 ? 'linear-gradient(90deg, #059669, #10b981)'
                              : task.aiScore >= 60 ? 'linear-gradient(90deg, #d97706, #f59e0b)'
                              : 'linear-gradient(90deg, #dc2626, #ef4444)'
                          }}
                        />
                      </div>
                    </div>
                    <div style={{
                      width: 52, height: 52, borderRadius: '50%',
                      background: task.aiScore >= 80 ? 'rgba(16,185,129,0.15)' : task.aiScore >= 60 ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 900, fontSize: '1rem',
                      color: task.aiScore >= 80 ? 'var(--success)' : task.aiScore >= 60 ? 'var(--warning)' : 'var(--danger)',
                      flexShrink: 0
                    }}>
                      {task.aiScore}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon"><Star /></div>
              <h3>No AI Scores Yet</h3>
              <p>Submit your work and request AI review to see your performance scores here</p>
            </div>
          )}
        </>
      )}
    </AppLayout>
  );
}
