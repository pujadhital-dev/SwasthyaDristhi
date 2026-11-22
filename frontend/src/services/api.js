// Authenticated fetch wrapper for the Django API.
// Adds the JWT, refreshes it once on a 401, and logs the user out if refresh fails.

export const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

export class ApiError extends Error {
  constructor(message, status, fields = {}) {
    super(message)
    this.status = status
    this.fields = fields
  }
}

let refreshPromise = null

async function refreshAccessToken() {
  const refresh = localStorage.getItem('refresh')
  if (!refresh) return null
  try {
    const res = await fetch(`${API_URL}/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    })
    if (!res.ok) return null
    const data = await res.json()
    localStorage.setItem('access', data.access)
    return data.access
  } catch {
    return null
  }
}

function endSession() {
  localStorage.removeItem('access')
  localStorage.removeItem('refresh')
  localStorage.removeItem('user')
  window.location.assign('/login')
}

function buildUrl(path, params) {
  const url = new URL(`${API_URL}${path}`)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value)
    }
  }
  return url
}

export async function apiFetch(path, { method = 'GET', body, params } = {}, canRetry = true) {
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = localStorage.getItem('access')
  if (token) headers.Authorization = `Bearer ${token}`

  let res
  try {
    res = await fetch(buildUrl(path, params), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('Cannot reach the server. Please check your connection.', 0)
  }

  if (res.status === 401 && canRetry) {
    refreshPromise ??= refreshAccessToken().finally(() => {
      refreshPromise = null
    })
    if (await refreshPromise) return apiFetch(path, { method, body, params }, false)
    endSession()
    throw new ApiError('Your session has expired. Please log in again.', 401)
  }

  const data = res.status === 204 ? null : await res.json().catch(() => ({}))

  if (!res.ok) {
    const fields = {}
    if (data && typeof data === 'object') {
      for (const [key, value] of Object.entries(data)) {
        if (key !== 'detail') fields[key] = Array.isArray(value) ? value[0] : String(value)
      }
    }
    const fallback =
      res.status === 403
        ? 'You do not have permission to do this.'
        : res.status === 404
          ? 'Not found.'
          : 'Something went wrong. Please try again.'
    throw new ApiError(data?.detail || fallback, res.status, fields)
  }

  return data
}
