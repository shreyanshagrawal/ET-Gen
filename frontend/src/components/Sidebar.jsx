import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, FolderKanban, Users, Bot, Trophy,
  Bell, LogOut, Settings, ChevronRight, Sparkles, Shield, UserCheck, ClipboardList
} from 'lucide-react';

const ADMIN_NAV = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Projects', to: '/admin/projects', icon: FolderKanban },
  { label: 'Teams', to: '/admin/teams', icon: Users },
  { label: 'All Users', to: '/admin/users', icon: UserCheck },
];

const MANAGER_NAV = [
  { label: 'Dashboard', to: '/member/dashboard', icon: LayoutDashboard },
  { label: 'My Tasks', to: '/member/tasks', icon: ClipboardList },
  { label: 'My Projects', to: '/member/projects', icon: FolderKanban },
  { label: 'My Team', to: '/manager/team', icon: Users },
  { label: 'Performance', to: '/member/performance', icon: Trophy },
];

const MEMBER_NAV = [
  { label: 'Dashboard', to: '/member/dashboard', icon: LayoutDashboard },
  { label: 'My Tasks', to: '/member/tasks', icon: ClipboardList },
  { label: 'My Projects', to: '/member/projects', icon: FolderKanban },
  { label: 'Performance', to: '/member/performance', icon: Trophy },
];

export default function Sidebar() {
  const { user, logout, unreadCount } = useAuth();
  const navigate = useNavigate();

  const navItems = user?.role === 'admin' ? ADMIN_NAV :
    user?.role === 'manager' ? MANAGER_NAV : MEMBER_NAV;

  const roleLabel = user?.role === 'admin' ? '⚡ Admin' :
    user?.role === 'manager' ? '👥 Manager' : '🔧 Member';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = user?.username?.slice(0, 2).toUpperCase() || '??';

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Sparkles size={18} color="white" />
        </div>
        <div className="sidebar-logo-text">
          Project<span>AI</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Navigation</div>

        {navItems.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <Icon size={18} className="nav-icon" />
            {label}
            {label === 'Notifications' && unreadCount > 0 && (
              <span className="nav-badge">{unreadCount}</span>
            )}
          </NavLink>
        ))}

        <div className="nav-section-label" style={{ marginTop: 16 }}>More</div>

        <div className="nav-item" onClick={() => navigate('/notifications')} style={{ cursor: 'pointer' }}>
          <Bell size={18} className="nav-icon" />
          Notifications
          {unreadCount > 0 && <span className="nav-badge">{unreadCount}</span>}
        </div>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="user-avatar-card" onClick={handleLogout} title="Click to logout">
          <div className="avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name">{user?.username || 'User'}</div>
            <div className="user-role">{roleLabel}</div>
          </div>
          <LogOut size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        </div>
      </div>
    </aside>
  );
}
