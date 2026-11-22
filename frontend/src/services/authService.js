import { API_URL, ApiError } from './api'

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

// POST to a public (no login needed) auth endpoint. Throws ApiError with field errors.
async function publicPost(path, body) {
  let res
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    throw new ApiError('Cannot reach the server. Please try again later.', 0)
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const fields = {}
    for (const [key, value] of Object.entries(data)) {
      if (key !== 'detail' && key !== 'resend_in') fields[key] = Array.isArray(value) ? value[0] : String(value)
    }
    const err = new ApiError(
      data.detail || Object.values(fields)[0] || 'Something went wrong. Please check the form.',
      res.status,
      fields,
    )
    err.resendIn = data.resend_in
    throw err
  }
  return data
}

/**
 * Step 1 of patient sign-up: checks the form and emails a 6-digit code.
 *   POST /api/auth/register/ -> { detail, email, resend_in }
 * The account is created only after verifyRegistration() succeeds.
 */
export const register = (payload) => publicPost('/auth/register/', payload)

/** Step 2: POST /api/auth/register/verify/ { email, code } -> account created. */
export const verifyRegistration = (email, code) => publicPost('/auth/register/verify/', { email, code })

export const resendRegistrationCode = (email) => publicPost('/auth/register/resend/', { email })

/** Forgot password: emails a code (same answer whether or not the email exists). */
export const forgotPassword = (email) => publicPost('/auth/password/forgot/', { email })

/** Checks the reset code -> { reset_token } used to set the new password. */
export const verifyResetCode = (email, code) => publicPost('/auth/password/verify/', { email, code })

export const resetPassword = (resetToken, password) =>
  publicPost('/auth/password/reset/', { reset_token: resetToken, password })

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

/** The logged-in user saved at login, or null. */
export function getCurrentUser() {
  try {
    return localStorage.getItem('access') ? JSON.parse(localStorage.getItem('user')) : null
  } catch {
    return null
  }
}
