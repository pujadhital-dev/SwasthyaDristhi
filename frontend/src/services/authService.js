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

/**
 * Registers a new patient account and logs them in.
 *
 * Expected Django response (to be built in the backend):
 *   POST /api/auth/register/
 *     { first_name, last_name, email, phone, date_of_birth, gender, password }
 *   201 -> { access, refresh, user: { id, email, first_name, role: "PATIENT" } }
 *   400 -> { email: ["..."], password: ["..."], ... }   (field errors)
 *
 * On a 400, the thrown error has a `fields` object: { fieldName: "message" }.
 */
export async function register(payload) {
  let res
  try {
    res = await fetch(`${API_URL}/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    throw new Error('Cannot reach the server. Please try again later.')
  }

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const fields = {}
    for (const [key, value] of Object.entries(data)) {
      if (key !== 'detail') fields[key] = Array.isArray(value) ? value[0] : String(value)
    }
    const err = new Error(data.detail || 'Could not create your account. Please check the form.')
    err.fields = fields
    throw err
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
