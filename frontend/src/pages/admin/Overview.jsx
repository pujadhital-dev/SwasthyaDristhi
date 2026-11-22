import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../../components/common/Icon'
import AssignDoctorModal from '../../components/admin/AssignDoctorModal'
import DoctorFormModal from '../../components/admin/DoctorFormModal'
import {
  Avatar,
  Badge,
  Card,
  EmptyState,
  ErrorState,
  PageHeader,
  StatCard,
  TableSkeleton,
} from '../../components/admin/ui'
import { formatDate } from '../../utils/format'
import { getStats } from '../../services/adminService'
import { getCurrentUser } from '../../services/authService'

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

export default function Overview() {
  const user = getCurrentUser()
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [assigning, setAssigning] = useState(null)

  const load = useCallback(() => {
    setError('')
    return getStats()
      .then(setStats)
      .catch((err) => setError(err.message))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const loading = !stats && !error
  const unassigned = stats?.patients.unassigned ?? 0
  const maxLoad = Math.max(1, ...(stats?.doctor_workload.map((d) => d.patient_count) ?? [0]))

  return (
    <div className="space-y-8">
      <PageHeader
        title={`${greeting()}, ${user?.first_name || 'Admin'}`}
        description={new Date().toLocaleDateString('en-GB', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}
        actions={
          <>
            <Link to="/admin/patients" className="btn btn-secondary">
              <Icon name="users" className="size-4" />
              View patients
            </Link>
            <button type="button" onClick={() => setAddOpen(true)} className="btn btn-primary">
              <Icon name="userPlus" className="size-4" />
              Add doctor
            </button>
          </>
        }
      />

      {error ? (
        <Card>
          <ErrorState message={error} onRetry={load} />
        </Card>
      ) : (
        <>
          {unassigned > 0 && (
            <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center">
              <span className="grid size-10 flex-none place-items-center rounded-xl bg-amber-100 text-amber-600">
                <Icon name="alert" className="size-5" />
              </span>
              <div className="flex-1">
                <p className="text-base font-semibold text-amber-900">
                  {unassigned} {unassigned === 1 ? 'patient is' : 'patients are'} waiting for a doctor
                </p>
                <p className="text-base text-amber-800">
                  Their uploaded reports will not be reviewed until a doctor is assigned.
                </p>
              </div>
              <Link to="/admin/patients?doctor=unassigned" className="btn btn-white border-amber-300 text-amber-900">
                Assign now
                <Icon name="arrowRight" className="size-4" />
              </Link>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon="users"
              label="Total patients"
              value={stats?.patients.total}
              hint={stats && `+${stats.patients.new_this_week} registered this week`}
              loading={loading}
            />
            <StatCard
              icon="stethoscope"
              tone="green"
              label="Active doctors"
              value={stats?.doctors.active}
              hint={stats && `${stats.doctors.total} doctor accounts in total`}
              loading={loading}
            />
            <StatCard
              icon="link"
              tone="amber"
              label="Unassigned patients"
              value={stats?.patients.unassigned}
              hint="Active patients without a doctor"
              loading={loading}
            />
            <StatCard
              icon="activity"
              tone="violet"
              label="Active patients"
              value={stats?.patients.active}
              hint={stats && `${stats.patients.total - stats.patients.active} deactivated`}
              loading={loading}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-5">
            <Card className="lg:col-span-3">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h2 className="font-bold text-slate-900">Recent registrations</h2>
                  <p className="text-base text-slate-500">The newest patients to sign up</p>
                </div>
                <Link to="/admin/patients" className="text-base font-semibold text-brand-600 hover:text-brand-700">
                  View all
                </Link>
              </div>
              {loading ? (
                <TableSkeleton rows={5} cols={3} />
              ) : stats.recent_patients.length === 0 ? (
                <EmptyState
                  icon="users"
                  title="No patients yet"
                  description="Patients appear here as soon as they create an account."
                />
              ) : (
                <ul className="divide-y divide-slate-100">
                  {stats.recent_patients.map((p) => (
                    <li key={p.id} className="flex items-center gap-3 px-5 py-3.5">
                      <Avatar name={p.full_name} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-base font-semibold text-slate-900">{p.full_name}</p>
                        <p className="truncate text-sm text-slate-500">
                          Joined {formatDate(p.date_joined)} · {p.email}
                        </p>
                      </div>
                      {p.assigned_doctor ? (
                        <span className="hidden truncate text-right text-sm text-slate-500 sm:block">
                          Dr. {p.assigned_doctor.name}
                        </span>
                      ) : p.is_active ? (
                        <button
                          type="button"
                          onClick={() => setAssigning(p)}
                          className="btn btn-secondary px-3.5 py-2 text-sm"
                        >
                          Assign doctor
                        </button>
                      ) : (
                        <Badge>Deactivated</Badge>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card className="lg:col-span-2">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h2 className="font-bold text-slate-900">Doctor workload</h2>
                  <p className="text-base text-slate-500">Patients assigned to each doctor</p>
                </div>
                <Link to="/admin/doctors" className="text-base font-semibold text-brand-600 hover:text-brand-700">
                  Manage
                </Link>
              </div>
              {loading ? (
                <TableSkeleton rows={4} cols={2} />
              ) : stats.doctor_workload.length === 0 ? (
                <EmptyState
                  icon="stethoscope"
                  title="No doctors yet"
                  description="Add your first doctor so patients can be assigned."
                  action={
                    <button type="button" onClick={() => setAddOpen(true)} className="btn btn-primary">
                      <Icon name="userPlus" className="size-4" />
                      Add doctor
                    </button>
                  }
                />
              ) : (
                <ul className="space-y-4 px-5 py-5">
                  {stats.doctor_workload.map((d) => (
                    <li key={d.id}>
                      <div className="flex items-center gap-3">
                        <Avatar name={d.name} size="size-8" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-base font-semibold text-slate-900">
                            Dr. {d.name}
                            {!d.is_active && <span className="ml-2 text-sm font-medium text-slate-400">(deactivated)</span>}
                          </p>
                          <p className="truncate text-sm text-slate-500">{d.specialization || 'General'}</p>
                        </div>
                        <Link
                          to={`/admin/patients?doctor=${d.id}`}
                          className="text-base font-bold text-slate-900 tabular-nums hover:text-brand-600"
                        >
                          {d.patient_count}
                        </Link>
                      </div>
                      <div className="mt-2 ml-11 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-brand-500"
                          style={{ width: `${(d.patient_count / maxLoad) * 100}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </>
      )}

      {addOpen && <DoctorFormModal open onClose={() => setAddOpen(false)} onSaved={load} />}
      {assigning && (
        <AssignDoctorModal
          key={assigning.id}
          open
          patient={assigning}
          onClose={() => setAssigning(null)}
          onSaved={load}
        />
      )}
    </div>
  )
}
