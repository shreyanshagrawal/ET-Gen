import { useState, useEffect } from 'react';
import { AppLayout } from '../../components/ProtectedLayout';
import { useAuth } from '../../contexts/AuthContext';
import { getMyManagedTeams } from '../../lib/api';
import {
  Users, Crown, UserCircle, ChevronDown, ChevronUp, Shield
} from 'lucide-react';

const SKILL_COLORS = [
  'badge-violet', 'badge-blue', 'badge-green', 'badge-amber'
];

function TeamCard({ team, currentUser }) {
  const [expanded, setExpanded] = useState(true);

  const members = team.members || [];
  // Exclude manager from member list for the count display
  const regularMembers = members.filter(
    m => m._id?.toString() !== team.managerId?._id?.toString()
  );

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      {/* Team header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '16px 20px',
        background: 'linear-gradient(135deg, rgba(124,58,237,0.14), rgba(168,85,247,0.07))',
        borderRadius: 'var(--radius)',
        border: '1px solid rgba(124,58,237,0.25)',
        marginBottom: 20,
      }}>
        {/* Avatar */}
        <div style={{
          width: 52, height: 52, borderRadius: 14, flexShrink: 0,
          background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 900, color: '#fff', fontSize: '1.1rem',
          boxShadow: '0 4px 14px rgba(124,58,237,0.35)',
        }}>
          {team.name?.slice(0, 2).toUpperCase()}
        </div>

        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800 }}>{team.name}</h2>
          {team.description && (
            <p style={{ margin: '2px 0 0', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              {team.description}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="badge badge-violet" style={{ fontSize: '0.75rem' }}>
            {members.length} member{members.length !== 1 ? 's' : ''}
          </span>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setExpanded(e => !e)}
            style={{ padding: '4px 8px' }}
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Manager row */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 14px',
        background: 'rgba(245,158,11,0.07)',
        borderRadius: 'var(--radius)',
        border: '1px solid rgba(245,158,11,0.2)',
        marginBottom: 16,
      }}>
        <Crown size={15} color="var(--warning)" />
        <div style={{ flex: 1 }}>
          <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--warning)' }}>
            {team.managerId?.username || 'Unknown'}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 8 }}>
            {team.managerId?.email}
          </span>
        </div>
        <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>Manager</span>
        {team.managerId?._id?.toString() === currentUser?._id?.toString() && (
          <span style={{ fontSize: '0.7rem', color: 'var(--accent-secondary)' }}>(you)</span>
        )}
      </div>

      {/* Members list */}
      {expanded && (
        <div>
          <div style={{
            fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)',
            textTransform: 'uppercase', letterSpacing: '0.06em',
            marginBottom: 10, paddingLeft: 4,
          }}>
            Team Members ({regularMembers.length})
          </div>

          {regularMembers.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px 16px' }}>
              <div className="empty-state-icon">👥</div>
              <h3 style={{ fontSize: '0.9375rem' }}>No members yet</h3>
              <p style={{ fontSize: '0.8125rem' }}>Ask an admin to add members to this team</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {regularMembers.map((member, idx) => {
                const isMe = member._id?.toString() === currentUser?._id?.toString();
                return (
                  <div key={member._id || idx} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 14px',
                    background: isMe ? 'rgba(124,58,237,0.07)' : 'rgba(255,255,255,0.025)',
                    borderRadius: 'var(--radius)',
                    border: `1px solid ${isMe ? 'rgba(124,58,237,0.25)' : 'var(--border-subtle)'}`,
                    transition: 'all 0.2s',
                  }}>
                    {/* Avatar */}
                    <div className="avatar" style={{
                      width: 36, height: 36, fontSize: '0.8125rem', flexShrink: 0,
                      ...(isMe ? {
                        background: 'linear-gradient(135deg,#7c3aed,#a855f7)',
                        color: '#fff',
                      } : {}),
                    }}>
                      {member.username?.slice(0, 2).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{
                          fontWeight: isMe ? 700 : 500,
                          fontSize: '0.875rem',
                          color: isMe ? 'var(--text-primary)' : 'var(--text-secondary)',
                        }}>
                          {member.username}
                        </span>
                        {isMe && (
                          <span style={{ fontSize: '0.6875rem', color: 'var(--accent-secondary)' }}>
                            (you)
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {member.email}
                      </div>
                    </div>

                    {/* Skills */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'flex-end' }}>
                      {(member.skills || []).slice(0, 3).map((skill, i) => (
                        <span key={skill} className={`badge ${SKILL_COLORS[i % SKILL_COLORS.length]}`}
                          style={{ fontSize: '0.6rem' }}>
                          {skill}
                        </span>
                      ))}
                      {member.skills?.length > 3 && (
                        <span className="badge badge-gray" style={{ fontSize: '0.6rem' }}>
                          +{member.skills.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Score & role */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                      <span className={`badge ${member.role === 'manager' ? 'badge-amber' : 'badge-gray'}`}
                        style={{ fontSize: '0.625rem' }}>
                        {member.role}
                      </span>
                      {member.performanceScore > 0 && (
                        <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                          ⭐ {member.performanceScore}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ManagerTeams() {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getMyManagedTeams()
      .then(res => setTeams(res.data?.data || []))
      .catch(err => setError(err?.response?.data?.message || 'Failed to load teams'))
      .finally(() => setLoading(false));
  }, []);

  const totalMembers = teams.reduce((sum, t) => {
    // Count unique members excluding manager
    const count = (t.members || []).filter(
      m => m._id?.toString() !== t.managerId?._id?.toString()
    ).length;
    return sum + count;
  }, 0);

  return (
    <AppLayout>
      <div className="topbar">
        <div>
          <h1 className="page-title">My Teams</h1>
          <p className="page-subtitle">Teams you are managing</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div className="stat-card" style={{ padding: '10px 20px', minWidth: 0 }}>
            <div className={`stat-icon violet`}><Users size={16} /></div>
            <div>
              <div className="stat-value" style={{ fontSize: '1.125rem' }}>{teams.length}</div>
              <div className="stat-label" style={{ fontSize: '0.7rem' }}>Teams</div>
            </div>
          </div>
          <div className="stat-card" style={{ padding: '10px 20px', minWidth: 0 }}>
            <div className={`stat-icon blue`}><UserCircle size={16} /></div>
            <div>
              <div className="stat-value" style={{ fontSize: '1.125rem' }}>{totalMembers}</div>
              <div className="stat-label" style={{ fontSize: '0.7rem' }}>Members</div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-full">
          <div className="spinner" style={{ width: 36, height: 36 }} />
        </div>
      ) : error ? (
        <div className="empty-state">
          <div className="empty-state-icon">⚠️</div>
          <h3>Error loading teams</h3>
          <p>{error}</p>
        </div>
      ) : teams.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <h3>No Teams Yet</h3>
          <p>You are not managing any teams. Ask an admin to assign you as a team manager.</p>
        </div>
      ) : (
        <div>
          {teams.map(team => (
            <TeamCard key={team._id} team={team} currentUser={user} />
          ))}
        </div>
      )}
    </AppLayout>
  );
}
