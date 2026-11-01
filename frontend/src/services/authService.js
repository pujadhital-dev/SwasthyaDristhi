const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

/**
 * Logs the user in.
 *
 * Expected Django response (to be built in the backend):
 *   POST /api/auth/login/  { email, password }
 *   200 -> { access, refresh, user: { id, email, first_name, role } }
 *   role is one of "SUPERADMIN" | "DOCTOR" | "PATIENT"
 */
export async function login(email, password) {
  let res
  try {
    res = await fetch(`${API_URL}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
  } catch {
    throw new Error('Cannot reach the server. Please try again later.')
  }

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data.detail || 'Invalid email or password.')
  }

  localStorage.setItem('access', data.access)
  localStorage.setItem('refresh', data.refresh)
  localStorage.setItem('user', JSON.stringify(data.user))
  return data.user
}

export function logout() {
  localStorage.removeItem('access')
  localStorage.removeItem('refresh')
  localStorage.removeItem('user')
}

export function getDashboardPath(role) {
  switch (role) {
    case 'SUPERADMIN':
      return '/admin/dashboard'
    case 'DOCTOR':
      return '/doctor/dashboard'
    case 'PATIENT':
      return '/patient/dashboard'
    default:
      return '/'
  }
}
