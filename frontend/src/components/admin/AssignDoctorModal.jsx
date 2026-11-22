import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../common/Icon'
import { getDoctorOptions, updatePatient } from '../../services/adminService'
import { useToast } from '../../context/ToastContext'
import { Avatar, EmptyState, Modal, Spinner } from './ui'

/** Pick (or clear) the doctor assigned to a patient. Render with a `key` per patient. */
export default function AssignDoctorModal({ open, onClose, patient, onSaved }) {
  const toast = useToast()
  const [doctors, setDoctors] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(patient?.assigned_doctor?.id || '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    let ignore = false
    getDoctorOptions()
      .then((list) => !ignore && setDoctors(list))
      .catch((err) => !ignore && setLoadError(err.message))
    return () => {
      ignore = true
    }
  }, [open])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!doctors || !q) return doctors || []
    return doctors.filter((d) => `${d.name} ${d.specialization}`.toLowerCase().includes(q))
  }, [doctors, query])

  if (!patient) return null
  const current = patient.assigned_doctor?.id || ''

  async function save() {
    setSaving(true)
    try {
      const saved = await updatePatient(patient.id, { assigned_doctor: selected || null })
      toast(
        saved.assigned_doctor
          ? `${saved.full_name} is now assigned to Dr. ${saved.assigned_doctor.name}.`
          : `${saved.full_name} no longer has an assigned doctor.`,
      )
      onSaved?.(saved)
      onClose()
    } catch (err) {
      toast(err.fields?.assigned_doctor || err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={saving ? () => {} : onClose}
      title={current ? 'Change assigned doctor' : 'Assign a doctor'}
      description={`Choose who will review ${patient.full_name}'s records.`}
      footer={
        <>
          {current && (
            <button
              type="button"
              onClick={() => setSelected('')}
              disabled={saving || !selected}
              className="btn mr-auto px-3 text-rose-600 hover:bg-rose-50"
            >
              Remove assignment
            </button>
          )}
          <button type="button" onClick={onClose} disabled={saving} className="btn btn-secondary">
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving || selected === current}
            className="btn btn-primary"
          >
            {saving && <Spinner />}
            Save
          </button>
        </>
      }
    >
      {loadError ? (
        <p className="rounded-lg bg-rose-50 p-3 text-base text-rose-700">{loadError}</p>
      ) : !doctors ? (
        <div className="grid place-items-center py-10 text-slate-400">
          <Spinner className="size-6" />
        </div>
      ) : doctors.length === 0 ? (
        <EmptyState
          icon="stethoscope"
          title="No active doctors yet"
          description="Add a doctor first, then assign patients to them."
          action={
            <Link to="/admin/doctors?new=1" onClick={onClose} className="btn btn-primary">
              <Icon name="userPlus" className="size-4" />
              Add a doctor
            </Link>
          }
        />
      ) : (
        <>
          <div className="relative">
            <Icon name="search" className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or specialization"
              aria-label="Search doctors"
              className="input input-ok pl-9"
              autoFocus
            />
          </div>
          <ul className="mt-3 max-h-80 space-y-1.5 overflow-y-auto" role="radiogroup" aria-label="Doctors">
            {filtered.map((d) => {
              const active = selected === d.id
              return (
                <li key={d.id}>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setSelected(d.id)}
                    className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border p-3 text-left transition ${
                      active
                        ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-500/15'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <Avatar name={d.name} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-base font-semibold text-slate-900">Dr. {d.name}</span>
                      <span className="block truncate text-sm text-slate-500">
                        {d.specialization || 'No specialization set'} · {d.patient_count}{' '}
                        {d.patient_count === 1 ? 'patient' : 'patients'}
                      </span>
                    </span>
                    {current === d.id && <span className="text-sm font-medium text-slate-400">Current</span>}
                    <span
                      className={`grid size-5 flex-none place-items-center rounded-full border ${
                        active ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300'
                      }`}
                    >
                      {active && <Icon name="check" className="size-3" strokeWidth={3} />}
                    </span>
                  </button>
                </li>
              )
            })}
            {filtered.length === 0 && (
              <li className="py-8 text-center text-base text-slate-500">No doctor matches “{query}”.</li>
            )}
          </ul>
          {current && !selected && (
            <p className="mt-3 rounded-lg bg-amber-50 p-3 text-base text-amber-800">
              Saving will leave this patient without a doctor.
            </p>
          )}
        </>
      )}
    </Modal>
  )
}
