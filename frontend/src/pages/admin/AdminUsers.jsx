import { useState, useEffect } from 'react';
import { AppLayout } from '../../components/ProtectedLayout';
import { adminGetAllUsers } from '../../lib/api';
import { Search, Shield, User, Users } from 'lucide-react';

const ROLE_BADGE = { admin: 'badge-violet', manager: 'badge-amber', member: 'badge-gray' };

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminGetAllUsers()
      .then(res => {
        const data = res.data?.data || [];
        setUsers(data);
        setFiltered(data);
      }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(users.filter(u =>
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.includes(q)
    ));
  }, [search, users]);

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    managers: users.filter(u => u.role === 'manager').length,
    members: users.filter(u => u.role === 'member').length,
  };

  return (
    <AppLayout>
      <div className="topbar">
        <div>
          <h1 className="page-title">All Users</h1>
          <p className="page-subtitle">View and manage all platform users</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4 mb-24">
        {[
          { label: 'Total Users', val: stats.total, icon: Users, cls: 'violet' },
          { label: 'Admins', val: stats.admins, icon: Shield, cls: 'violet' },
          { label: 'Managers', val: stats.managers, icon: User, cls: 'amber' },
          { label: 'Members', val: stats.members, icon: User, cls: 'blue' },
        ].map(({ label, val, icon: Icon, cls }) => (
          <div key={label} className="stat-card">
            <div className={`stat-icon ${cls}`}><Icon size={20} /></div>
            <div><div className="stat-value">{val}</div><div className="stat-label">{label}</div></div>
          </div>
        ))}
      </div>

      <div className="input-group" style={{ maxWidth: 360, marginBottom: 20 }}>
        <Search size={16} className="input-icon" />
        <input className="input" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="loading-full"><div className="spinner" style={{ width: 32, height: 32 }} /></div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Team</th>
                <th>Skills</th>
                <th>Performance Score</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user._id}>
                  <td className="td-bold">
                    <div className="flex items-center gap-10">
                      <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                        {user.username.slice(0, 2).toUpperCase()}
                      </div>
                      {user.username}
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge ${ROLE_BADGE[user.role] || 'badge-gray'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{user.teamId ? <span className="badge badge-blue">In team</span> : <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                  <td>
                    <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
                      {user.skills?.length > 0
                        ? user.skills.slice(0, 3).map(s => <span key={s} className="badge badge-gray" style={{ fontSize: '0.6875rem' }}>{s}</span>)
                        : <span style={{ color: 'var(--text-muted)' }}>—</span>
                      }
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-8">
                      <div className="progress" style={{ width: 80, height: 6 }}>
                        <div className="progress-bar" style={{ width: `${user.performanceScore || 0}%` }} />
                      </div>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{user.performanceScore || 0}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppLayout>
  );
}
