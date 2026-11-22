import { apiFetch } from './api'

// Super Admin API (Django: apps/accounts/admin_views.py)

export const getStats = () => apiFetch('/admin/stats/')

// Patients
export const listPatients = (params) => apiFetch('/admin/patients/', { params })
export const updatePatient = (id, body) => apiFetch(`/admin/patients/${id}/`, { method: 'PATCH', body })

// Doctors
export const listDoctors = (params) => apiFetch('/admin/doctors/', { params })
export const getDoctorOptions = () => apiFetch('/admin/doctors/options/')
export const createDoctor = (body) => apiFetch('/admin/doctors/', { method: 'POST', body })
export const updateDoctor = (id, body) => apiFetch(`/admin/doctors/${id}/`, { method: 'PATCH', body })
