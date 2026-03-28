import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from './Sidebar';

export default function ProtectedLayout({ allowedRoles }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their appropriate dashboard
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'manager') return <Navigate to="/manager/dashboard" replace />;
    return <Navigate to="/member/dashboard" replace />;
  }

  return null; // Rendering is handled by the page itself
}

export function AppLayout({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
