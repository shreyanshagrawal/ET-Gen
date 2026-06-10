import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Auth
import Login from './pages/Login';
import Signup from './pages/Signup';
import LandingPage from './pages/LandingPage';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProjects from './pages/admin/AdminProjects';
import NewProject from './pages/admin/NewProject';
import ProjectDetail from './pages/admin/ProjectDetail';
import AdminTeams from './pages/admin/AdminTeams';
import AdminUsers from './pages/admin/AdminUsers';

// Member
import MemberDashboard from './pages/member/MemberDashboard';
import MemberTasks from './pages/member/MemberTasks';
import MemberProjects from './pages/member/MemberProjects';
import Performance from './pages/member/Performance';
import UserProfile from './pages/member/UserProfile';

// Manager
import ManagerTeams from './pages/manager/ManagerTeams';
import ManagerProjects from './pages/manager/ManagerProjects';

// Shared
import Notifications from './pages/Notifications';

function RoleRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'manager') return <Navigate to="/member/dashboard" replace />;
  return <Navigate to="/member/dashboard" replace />;
}

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Root redirect */}
      <Route path="/dashboard" element={<RoleRedirect />} />

      {/* Admin routes */}
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/projects" element={<AdminProjects />} />
      <Route path="/admin/projects/new" element={<NewProject />} />
      <Route path="/admin/projects/:projectId" element={<ProjectDetail />} />
      <Route path="/admin/teams" element={<AdminTeams />} />
      <Route path="/admin/users" element={<AdminUsers />} />

      {/* Member/Manager routes */}
      <Route path="/member/dashboard" element={<MemberDashboard />} />
      <Route path="/member/tasks" element={<MemberTasks />} />
      <Route path="/member/projects" element={<MemberProjects />} />
      <Route path="/member/performance" element={<Performance />} />
      <Route path="/member/profile" element={<UserProfile />} />

      {/* Manager routes */}
      <Route path="/manager/dashboard" element={<MemberDashboard />} />
      <Route path="/manager/team" element={<ManagerTeams />} />
      <Route path="/manager/projects" element={<ManagerProjects />} />

      {/* Admin AI redirect to projects (AI lives inside project detail) */}
      <Route path="/admin/ai" element={<Navigate to="/admin/projects" replace />} />

      {/* Shared */}
      <Route path="/notifications" element={<Notifications />} />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
