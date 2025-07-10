import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

function ProtectedRoute() {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  // If no user in Redux, redirect to login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Restrict /admin to admin users
  if (location.pathname === '/admin' && !user.is_staff) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;