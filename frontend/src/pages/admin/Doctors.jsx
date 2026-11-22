import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Icon from '../../components/common/Icon'
import DoctorFormModal from '../../components/admin/DoctorFormModal'
import {
  Avatar,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  PageHeader,
  Pagination,
  StatusBadge,
  TableSkeleton,
} from '../../components/admin/ui'
import { formatDate } from '../../utils/format'
import { useToast } from '../../context/ToastContext'
import useDebounce from '../../hooks/useDebounce'
import { listDoctors, updateDoctor } from '../../services/adminService'

const PAGE_SIZE = 10

const fullName = (d) => `${d.first_name} ${d.last_name}`.trim()

function PatientCountLink({ doctor }) {
  return (
    <Link
      to={`/admin/patients?doctor=${doctor.id}`}
      title="View this doctor's patients"
      className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-base font-semibold whitespace-nowrap text-slate-800 hover:bg-brand-50 hover:text-brand-700"
    >
      <Icon name="users" className="size-4 text-slate-400" />
      {doctor.patient_count}{' '}
      <span className="font-normal text-slate-500 xl:hidden">{doctor.patient_count === 1 ? 'patient' : 'patients'}</span>
    </Link>
  )
}

function DoctorActions({ doctor: d, onEdit, onToggle }) {
  return (
    <div className="flex flex-none justify-end gap-1.5">
      <button type="button" onClick={() => onEdit(d)} className="btn btn-secondary px-3.5 py-2 text-sm">
        <Icon name="edit" className="size-4" />
        Edit
      </button>
      <button
        type="button"
        onClick={() => onToggle(d)}
        aria-label={d.is_active ? `Deactivate Dr. ${fullName(d)}` : `Reactivate Dr. ${fullName(d)}`}
        title={d.is_active ? 'Deactivate account' : 'Reactivate account'}
        className={`btn px-2.5 py-2 text-slate-400 ${
          d.is_active ? 'hover:bg-rose-50 hover:text-rose-600' : 'hover:bg-health-50 hover:text-health-600'
        }`}
      >
        <Icon name={d.is_active ? 'ban' : 'checkCircle'} className="size-5" />
      </button>
    </div>
  )
}

export default function Doctors() {
  const toast = useToast()
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search.trim())
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)

  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [formDoctor, setFormDoctor] = useState(params.get('new') ? 'new' : null) // 'new' | doctor | null
  const [toggling, setToggling] = useState(null)
  const [busy, setBusy] = useState(false)

  // /admin/doctors?new=1 opens the "Add doctor" form; drop the flag from the URL.
  useEffect(() => {
    if (params.get('new')) setParams({}, { replace: true })
  }, [params, setParams])

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    return listDoctors({ search: debouncedSearch, status, page, page_size: PAGE_SIZE })
      .then(setData)
      .catch((err) => {
        if (err.status === 404 && page > 1) setPage(1)
        else setError(err.message)
      })
      .finally(() => setLoading(false))
  }, [debouncedSearch, status, page])

  useEffect(() => {
    load()
  }, [load])

  async function confirmToggle() {
    setBusy(true)
    try {
      const saved = await updateDoctor(toggling.id, { is_active: !toggling.is_active })
      setData((d) => d && { ...d, results: d.results.map((x) => (x.id === saved.id ? saved : x)) })
      toast(saved.is_active ? `Dr. ${saved.first_name}'s account was reactivated.` : `Dr. ${saved.first_name}'s account was deactivated.`)
      setToggling(null)
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  const hasFilters = Boolean(debouncedSearch || status)
  const name = fullName

  return (
    <div className="space-y-6">
      <PageHeader
        title="Doctors"
        description={
          data ? `${data.count} ${data.count === 1 ? 'doctor' : 'doctors'}${hasFilters ? ' match your filters' : ' at your clinic'}` : 'Doctor accounts at your clinic'
        }
        actions={
          <button type="button" onClick={() => setFormDoctor('new')} className="btn btn-primary">
            <Icon name="userPlus" className="size-4" />
            Add doctor
          </button>
        }
      />

      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Icon name="search" className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Search by name, email or specialization"
              aria-label="Search doctors"
              className="input input-ok pl-9"
            />
          </div>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(1)
            }}
            aria-label="Filter by status"
            className="input input-ok sm:w-44"
          >
            <option value="">Any status</option>
            <option value="active">Active</option>
            <option value="inactive">Deactivated</option>
          </select>
        </div>

        {error ? (
          <ErrorState message={error} onRetry={load} />
        ) : loading && !data ? (
          <TableSkeleton rows={5} cols={5} />
        ) : data.results.length === 0 ? (
          hasFilters ? (
            <EmptyState title="No doctors match" description="Try a different search or status." />
          ) : (
            <EmptyState
              icon="stethoscope"
              title="No doctors yet"
              description="Add your clinic's doctors so patients can be assigned to them."
              action={
                <button type="button" onClick={() => setFormDoctor('new')} className="btn btn-primary">
                  <Icon name="userPlus" className="size-4" />
                  Add your first doctor
                </button>
              }
            />
          )
        ) : (
          <div className={`transition-opacity ${loading ? 'opacity-60' : ''}`}>
            {/* Phones and tablets: stacked cards */}
            <ul className="divide-y divide-slate-100 xl:hidden">
              {data.results.map((d) => (
                <li key={d.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar name={name(d)} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate font-semibold text-slate-900">Dr. {name(d)}</p>
                        <StatusBadge active={d.is_active} />
                      </div>
                      <p className="truncate text-sm text-slate-500">{d.email}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {[d.specialization, d.phone, d.license_number && `NMC ${d.license_number}`]
                          .filter(Boolean)
                          .join(' · ') || 'No profile details yet'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3 pl-12">
                    <PatientCountLink doctor={d} />
                    <DoctorActions doctor={d} onEdit={setFormDoctor} onToggle={setToggling} />
                  </div>
                </li>
              ))}
            </ul>

            {/* Desktop: table */}
            <table className="hidden w-full text-left text-base xl:table">
              <thead>
                <tr className="border-b border-slate-100 text-[0.8rem] font-semibold tracking-wide whitespace-nowrap text-slate-500 uppercase">
                  <th className="px-5 py-3 font-semibold">Doctor</th>
                  <th className="px-5 py-3 font-semibold">Specialization</th>
                  <th className="px-5 py-3 font-semibold">Contact</th>
                  <th className="px-5 py-3 font-semibold">Patients</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="hidden px-5 py-3 font-semibold 2xl:table-cell">Added</th>
                  <th className="px-5 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.results.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/60">
                    <td className="max-w-72 px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={name(d)} />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">Dr. {name(d)}</p>
                          <p className="truncate text-sm text-slate-500">{d.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-slate-700">{d.specialization || '—'}</p>
                      {d.license_number && <p className="text-sm text-slate-500">NMC {d.license_number}</p>}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-slate-600 tabular-nums">{d.phone || '—'}</td>
                    <td className="px-5 py-3.5">
                      <PatientCountLink doctor={d} />
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge active={d.is_active} />
                    </td>
                    <td className="hidden px-5 py-3.5 whitespace-nowrap text-slate-600 2xl:table-cell">
                      {formatDate(d.date_joined)}
                    </td>
                    <td className="px-5 py-3.5">
                      <DoctorActions doctor={d} onEdit={setFormDoctor} onToggle={setToggling} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && !error && <Pagination page={page} pageSize={PAGE_SIZE} count={data.count} onChange={setPage} />}
      </Card>

      {formDoctor && (
        <DoctorFormModal
          key={formDoctor === 'new' ? 'new' : formDoctor.id}
          open
          doctor={formDoctor === 'new' ? null : formDoctor}
          onClose={() => setFormDoctor(null)}
          onSaved={load}
        />
      )}

      <ConfirmDialog
        open={Boolean(toggling)}
        onClose={() => setToggling(null)}
        onConfirm={confirmToggle}
        busy={busy}
        danger={toggling?.is_active}
        title={toggling?.is_active ? 'Deactivate this doctor?' : 'Reactivate this doctor?'}
        confirmLabel={toggling?.is_active ? 'Deactivate' : 'Reactivate'}
        message={
          toggling?.is_active
            ? `Dr. ${toggling && name(toggling)} will not be able to log in.${
                toggling?.patient_count
                  ? ` Their ${toggling.patient_count} assigned ${toggling.patient_count === 1 ? 'patient stays' : 'patients stay'} assigned until you move them to another doctor.`
                  : ''
              }`
            : `Dr. ${toggling && name(toggling)} will be able to log in and be assigned patients again.`
        }
      />
    </div>
  )
}
