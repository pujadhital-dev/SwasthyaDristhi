import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Icon from '../../components/common/Icon'
import AssignDoctorModal from '../../components/admin/AssignDoctorModal'
import {
  Avatar,
  Badge,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  PageHeader,
  Pagination,
  StatusBadge,
  TableSkeleton,
} from '../../components/admin/ui'
import { formatDate, genderLabel } from '../../utils/format'
import { useToast } from '../../context/ToastContext'
import useDebounce from '../../hooks/useDebounce'
import { getDoctorOptions, listPatients, updatePatient } from '../../services/adminService'

const PAGE_SIZE = 10

function DoctorCell({ doctor }) {
  if (!doctor) return <Badge tone="amber">Unassigned</Badge>
  return (
    <div className="min-w-0">
      <p className="truncate text-base font-medium text-slate-800">Dr. {doctor.name}</p>
      <p className="truncate text-sm text-slate-500">
        {doctor.specialization || 'General'}
        {!doctor.is_active && ' · deactivated'}
      </p>
    </div>
  )
}

function RowActions({ patient: p, onAssign, onToggle }) {
  return (
    <div className="flex flex-none justify-end gap-1.5">
      <button
        type="button"
        onClick={() => onAssign(p)}
        disabled={!p.is_active}
        title={p.is_active ? undefined : 'Reactivate the account first'}
        className="btn btn-secondary px-3.5 py-2 text-sm"
      >
        <Icon name="stethoscope" className="size-4" />
        {p.assigned_doctor ? 'Change' : 'Assign'}
      </button>
      <button
        type="button"
        onClick={() => onToggle(p)}
        aria-label={p.is_active ? `Deactivate ${p.full_name}` : `Reactivate ${p.full_name}`}
        title={p.is_active ? 'Deactivate account' : 'Reactivate account'}
        className={`btn px-2.5 py-2 text-slate-400 ${
          p.is_active ? 'hover:bg-rose-50 hover:text-rose-600' : 'hover:bg-health-50 hover:text-health-600'
        }`}
      >
        <Icon name={p.is_active ? 'ban' : 'checkCircle'} className="size-5" />
      </button>
    </div>
  )
}

export default function Patients() {
  const toast = useToast()
  const [params, setParams] = useSearchParams()
  const doctor = params.get('doctor') || ''
  const status = params.get('status') || ''
  const page = Number(params.get('page')) || 1

  const [search, setSearch] = useState(params.get('search') || '')
  const debouncedSearch = useDebounce(search.trim())

  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [doctors, setDoctors] = useState([])
  const [assigning, setAssigning] = useState(null)
  const [toggling, setToggling] = useState(null)
  const [busy, setBusy] = useState(false)

  // Keep filters in the URL so links like ?doctor=unassigned work and refresh keeps state.
  const setParam = useCallback(
    (key, value) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (value) next.set(key, value)
          else next.delete(key)
          if (key !== 'page') next.delete('page')
          return next
        },
        { replace: true },
      )
    },
    [setParams],
  )

  useEffect(() => {
    if (debouncedSearch !== (params.get('search') || '')) setParam('search', debouncedSearch)
  }, [debouncedSearch, params, setParam])

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    return listPatients({ search: debouncedSearch, doctor, status, page, page_size: PAGE_SIZE })
      .then(setData)
      .catch((err) => {
        // A stale ?page= beyond the last page: go back to page 1.
        if (err.status === 404 && page > 1) setParam('page', '')
        else setError(err.message)
      })
      .finally(() => setLoading(false))
  }, [debouncedSearch, doctor, status, page, setParam])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    getDoctorOptions()
      .then(setDoctors)
      .catch(() => {})
  }, [])

  function replaceRow(saved) {
    setData((d) => d && { ...d, results: d.results.map((p) => (p.id === saved.id ? saved : p)) })
  }

  async function confirmToggle() {
    setBusy(true)
    try {
      const saved = await updatePatient(toggling.id, { is_active: !toggling.is_active })
      replaceRow(saved)
      toast(saved.is_active ? `${saved.full_name}'s account was reactivated.` : `${saved.full_name}'s account was deactivated.`)
      setToggling(null)
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  const hasFilters = Boolean(debouncedSearch || doctor || status)
  const doctorKnown = !doctor || doctor === 'unassigned' || doctors.some((d) => d.id === doctor)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patients"
        description={
          data ? `${data.count} ${data.count === 1 ? 'patient' : 'patients'}${hasFilters ? ' match your filters' : ' registered'}` : 'Everyone who has signed up as a patient'
        }
      />

      <Card>
        {/* Filters */}
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Icon name="search" className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email or phone"
              aria-label="Search patients"
              className="input input-ok pl-9"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 md:flex">
            <select
              value={doctor}
              onChange={(e) => setParam('doctor', e.target.value)}
              aria-label="Filter by doctor"
              className="input input-ok md:w-52"
            >
              <option value="">All doctors</option>
              <option value="unassigned">Unassigned only</option>
              {!doctorKnown && <option value={doctor}>Selected doctor</option>}
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  Dr. {d.name}
                </option>
              ))}
            </select>
            <select
              value={status}
              onChange={(e) => setParam('status', e.target.value)}
              aria-label="Filter by status"
              className="input input-ok md:w-40"
            >
              <option value="">Any status</option>
              <option value="active">Active</option>
              <option value="inactive">Deactivated</option>
            </select>
          </div>
        </div>

        {error ? (
          <ErrorState message={error} onRetry={load} />
        ) : loading && !data ? (
          <TableSkeleton rows={6} cols={5} />
        ) : data.results.length === 0 ? (
          hasFilters ? (
            <EmptyState
              title="No patients match"
              description="Try a different search or clear the filters."
              action={
                <button
                  type="button"
                  onClick={() => {
                    setSearch('')
                    setParams({}, { replace: true })
                  }}
                  className="btn btn-secondary"
                >
                  Clear filters
                </button>
              }
            />
          ) : (
            <EmptyState
              icon="users"
              title="No patients yet"
              description="Patients appear here as soon as they create an account on the sign-up page."
            />
          )
        ) : (
          <div className={`transition-opacity ${loading ? 'opacity-60' : ''}`}>
            {/* Phones and tablets: stacked cards */}
            <ul className="divide-y divide-slate-100 xl:hidden">
              {data.results.map((p) => (
                <li key={p.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar name={p.full_name} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate font-semibold text-slate-900">{p.full_name}</p>
                        <StatusBadge active={p.is_active} />
                      </div>
                      <p className="truncate text-sm text-slate-500">{p.email}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {p.phone} · {p.age ?? '—'} yrs · {genderLabel(p.gender)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3 pl-12">
                    <DoctorCell doctor={p.assigned_doctor} />
                    <RowActions patient={p} onAssign={setAssigning} onToggle={setToggling} />
                  </div>
                </li>
              ))}
            </ul>

            {/* Desktop: table */}
            <table className="hidden w-full text-left text-base xl:table">
              <thead>
                <tr className="border-b border-slate-100 text-[0.8rem] font-semibold tracking-wide whitespace-nowrap text-slate-500 uppercase">
                  <th className="px-5 py-3 font-semibold">Patient</th>
                  <th className="px-5 py-3 font-semibold">Details</th>
                  <th className="px-5 py-3 font-semibold">Assigned doctor</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="hidden px-5 py-3 font-semibold 2xl:table-cell">Joined</th>
                  <th className="px-5 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.results.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60">
                    <td className="max-w-72 px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={p.full_name} />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">{p.full_name}</p>
                          <p className="truncate text-sm text-slate-500">{p.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <p className="text-slate-700 tabular-nums">{p.phone}</p>
                      <p className="text-sm text-slate-500">
                        {p.age ?? '—'} yrs · {genderLabel(p.gender)}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <DoctorCell doctor={p.assigned_doctor} />
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge active={p.is_active} />
                    </td>
                    <td className="hidden px-5 py-3.5 whitespace-nowrap text-slate-600 2xl:table-cell">
                      {formatDate(p.date_joined)}
                    </td>
                    <td className="px-5 py-3.5">
                      <RowActions patient={p} onAssign={setAssigning} onToggle={setToggling} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && !error && (
          <Pagination page={page} pageSize={PAGE_SIZE} count={data.count} onChange={(n) => setParam('page', String(n))} />
        )}
      </Card>

      {assigning && (
        <AssignDoctorModal
          key={assigning.id}
          open
          patient={assigning}
          onClose={() => setAssigning(null)}
          onSaved={(saved) => {
            replaceRow(saved)
            getDoctorOptions().then(setDoctors).catch(() => {})
            // The row may no longer match the doctor filter.
            if (doctor) load()
          }}
        />
      )}

      <ConfirmDialog
        open={Boolean(toggling)}
        onClose={() => setToggling(null)}
        onConfirm={confirmToggle}
        busy={busy}
        danger={toggling?.is_active}
        title={toggling?.is_active ? 'Deactivate this patient?' : 'Reactivate this patient?'}
        confirmLabel={toggling?.is_active ? 'Deactivate' : 'Reactivate'}
        message={
          toggling?.is_active
            ? `${toggling?.full_name} will be logged out and will not be able to log in. Their records are kept, and you can reactivate the account at any time.`
            : `${toggling?.full_name} will be able to log in again.`
        }
      />
    </div>
  )
}
