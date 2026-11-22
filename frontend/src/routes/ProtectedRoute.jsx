import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getCurrentUser, getDashboardPath } from '../services/authService'

// Lets the route render only for a logged-in user with the given role.
// Not logged in -> /login. Wrong role -> that user's own dashboard.
export default function ProtectedRoute({ role }) {
  const location = useLocation()
  const user = getCurrentUser()

  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  if (role && user.role !== role) return <Navigate to={getDashboardPath(user.role)} replace />
  return <Outlet />
}
