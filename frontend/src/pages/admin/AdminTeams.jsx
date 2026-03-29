import { useState, useEffect } from 'react';
import { AppLayout } from '../../components/ProtectedLayout';
import { getAllTeams, adminGetAllUsers, createTeam, addMemberToTeam, removeMemberFromTeam } from '../../lib/api';
import { Plus, X, Users, Crown, AlertTriangle } from 'lucide-react';
import { Toast, useToast } from '../../components/Toast';

export default function AdminTeams() {
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddMember, setShowAddMember] = useState(null); // teamId
  const [createForm, setCreateForm] = useState({ name: '', description: '', managerId: '' });
  const [addUserId, setAddUserId] = useState('');
  const [actionLoading, setActionLoading] = useState('');
  const [confirmRemove, setConfirmRemove] = useState(null); // { teamId, userId, username }
  const { toasts, showToast, dismissToast } = useToast();

  const fetchData = async () => {
    try {
      const [teamsRes, usersRes] = await Promise.all([getAllTeams(), adminGetAllUsers()]);
      setTeams(teamsRes.data?.data || []);
      setUsers(usersRes.data?.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setActionLoading('creating');
    try {
      await createTeam(createForm);
      setShowCreateModal(false);
      setCreateForm({ name: '', description: '', managerId: '' });
      fetchData();
      showToast(`Team "${createForm.name}" created successfully!`, 'success');
    } catch (err) { showToast(err.response?.data?.message || 'Error creating team', 'error'); }
    setActionLoading('');
  };

  const handleAddMember = async (teamId) => {
    if (!addUserId) return;
    setActionLoading('adding');
    try {
      await addMemberToTeam(teamId, addUserId);
      setShowAddMember(null);
      setAddUserId('');
      fetchData();
      showToast('Member added to team!', 'success');
    } catch (err) { showToast(err.response?.data?.message || 'Error adding member', 'error'); }
    setActionLoading('');
  };

  const handleRemoveMember = async (teamId, userId, username) => {
    setConfirmRemove({ teamId, userId, username });
  };

  const confirmAndRemove = async () => {
    if (!confirmRemove) return;
    const { teamId, userId, username } = confirmRemove;
    setConfirmRemove(null);
    try {
      await removeMemberFromTeam(teamId, userId);
      fetchData();
      showToast(`${username} has been removed from the team.`, 'success');
    } catch (err) { showToast(err.response?.data?.message || 'Error removing member', 'error'); }
  };

  return (
    <AppLayout>
      <Toast toasts={toasts} dismiss={dismissToast} />
      <div className="topbar">
        <div>
          <h1 className="page-title">Teams</h1>
          <p className="page-subtitle">Manage teams, assign managers, and add members</p>
        </div>
        <button id="create-team-btn" className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={15} /> Create Team
        </button>
      </div>

      {loading ? (
        <div className="loading-full"><div className="spinner" style={{ width: 32, height: 32 }} /></div>
      ) : teams.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <h3>No Teams Yet</h3>
          <p>Create your first team to start organizing members and projects</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowCreateModal(true)}>Create Team</button>
        </div>
      ) : (
        <div className="grid-auto">
          {teams.map(team => (
            <div key={team._id} className="card">
              <div className="flex items-center gap-12" style={{ marginBottom: 16 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: 'linear-gradient(135deg, rgba(124,58,237,0.4), rgba(168,85,247,0.15))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 900, fontSize: '1rem', color: 'var(--accent-secondary)'
                }}>
                  {team.name.slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ margin: 0 }} className="truncate">{team.name}</h4>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{team.members?.length || 0} members</div>
                </div>
              </div>

              {team.description && (
                <p style={{ fontSize: '0.8125rem', marginBottom: 16 }}>{team.description}</p>
              )}

              {/* Manager */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 12px', background: 'rgba(245,158,11,0.08)',
                borderRadius: 'var(--radius)', marginBottom: 12,
                border: '1px solid rgba(245,158,11,0.2)'
              }}>
                <Crown size={14} color="var(--warning)" />
                <span style={{ fontSize: '0.8125rem', color: 'var(--warning)', fontWeight: 600 }}>
                  {team.managerId?.username || 'No manager'}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>Manager</span>
              </div>

              {/* Members */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>
                  MEMBERS
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {(team.members || []).slice(0, 5).map(member => (
                    <div key={member._id} className="flex items-center gap-8">
                      <div className="avatar" style={{ width: 28, height: 28, fontSize: '0.75rem' }}>
                        {member.username?.slice(0, 2).toUpperCase()}
                      </div>
                      <span style={{ flex: 1, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        {member.username}
                      </span>
                      <span className={`badge ${member.role === 'manager' ? 'badge-amber' : 'badge-gray'}`}
                        style={{ fontSize: '0.625rem' }}>
                        {member.role}
                      </span>
                      {member._id?.toString() !== team.managerId?._id?.toString() && (
                        <button className="btn btn-ghost btn-icon"
                          style={{ width: 24, height: 24 }}
                          onClick={() => handleRemoveMember(team._id, member._id, member.username)}>
                          <X size={12} color="var(--danger)" />
                        </button>
                      )}
                    </div>
                  ))}
                  {team.members?.length > 5 && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', paddingLeft: 36 }}>
                      +{team.members.length - 5} more members
                    </div>
                  )}
                </div>
              </div>

              {/* Add Member */}
              {showAddMember === team._id ? (
                <div className="flex gap-8">
                  <select className="select" value={addUserId} onChange={e => setAddUserId(e.target.value)}>
                    <option value="">Select user...</option>
                    {users.filter(u => !team.members?.find(m => m._id === u._id)).map(u => (
                      <option key={u._id} value={u._id}>{u.username} ({u.role})</option>
                    ))}
                  </select>
                  <button className="btn btn-success btn-sm" disabled={!addUserId || actionLoading === 'adding'}
                    onClick={() => handleAddMember(team._id)}>Add</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => { setShowAddMember(null); setAddUserId(''); }}>
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button className="btn btn-secondary btn-sm w-full" onClick={() => setShowAddMember(team._id)}>
                  <Plus size={14} /> Add Member
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Create New Team</h3>
              <button className="modal-close btn btn-ghost btn-icon" onClick={() => setShowCreateModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateTeam}>
              <div className="form-group">
                <label className="form-label">Team Name <span className="form-required">*</span></label>
                <input className="input" placeholder="e.g., Alpha Squad" required
                  value={createForm.name} onChange={e => setCreateForm({ ...createForm, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="textarea" rows={2} placeholder="What does this team work on?"
                  value={createForm.description} onChange={e => setCreateForm({ ...createForm, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Team Manager <span className="form-required">*</span></label>
                <select className="select" required
                  value={createForm.managerId} onChange={e => setCreateForm({ ...createForm, managerId: e.target.value })}>
                  <option value="">Select a user to be manager...</option>
                  {users.map(u => <option key={u._id} value={u._id}>{u.username} ({u.email})</option>)}
                </select>
              </div>
              <div className="flex items-center justify-between" style={{ marginTop: 8 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={actionLoading === 'creating'}>
                  {actionLoading === 'creating' ? <div className="spinner" style={{ width: 14, height: 14 }} /> : null}
                  Create Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Remove Modal */}
      {confirmRemove && (
        <div className="modal-overlay" onClick={() => setConfirmRemove(null)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '8px 0 0' }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%', marginBottom: 16,
                background: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <AlertTriangle size={24} color="var(--danger)" />
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem' }}>Remove Member?</h3>
              <p style={{ margin: '0 0 24px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Are you sure you want to remove <strong style={{ color: 'var(--text-primary)' }}>{confirmRemove.username}</strong> from this team?
                They will lose team access.
              </p>
              <div className="flex gap-10" style={{ width: '100%' }}>
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setConfirmRemove(null)}>
                  Cancel
                </button>
                <button className="btn btn-danger" style={{ flex: 1, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: 'var(--danger)' }}
                  onClick={confirmAndRemove}>
                  <X size={14} /> Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
