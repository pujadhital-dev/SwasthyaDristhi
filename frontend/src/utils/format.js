// Display helpers for dates and enums coming from the API.

export function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function genderLabel(g) {
  return { MALE: 'Male', FEMALE: 'Female', OTHER: 'Other' }[g] || '—'
}
