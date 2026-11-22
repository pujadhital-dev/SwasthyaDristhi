import { useState } from 'react'
import Icon from '../common/Icon'
import { createDoctor, updateDoctor } from '../../services/adminService'
import { useToast } from '../../context/ToastContext'
import { Field, Modal, Spinner } from './ui'

const EMPTY = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  specialization: '',
  license_number: '',
  password: '',
}

const SPECIALIZATIONS = [
  'General Physician',
  'Cardiology',
  'Endocrinology',
  'Nephrology',
  'Neurology',
  'Pulmonology',
  'Gastroenterology',
  'Internal Medicine',
  'Pediatrics',
  'Gynecology',
  'Orthopedics',
  'Dermatology',
]

function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  const bytes = crypto.getRandomValues(new Uint32Array(12))
  const core = Array.from(bytes, (n) => chars[n % chars.length]).join('')
  return `${core.slice(0, 6)}-${core.slice(6)}!`
}

function validate(form, isEdit) {
  const e = {}
  if (!form.first_name.trim()) e.first_name = 'First name is required.'
  if (!isEdit) {
    if (!form.email.trim()) e.email = 'Email is required.'
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) e.email = 'Enter a valid email address.'
    if (!form.password) e.password = 'Set a temporary password.'
    else if (form.password.length < 8) e.password = 'Use at least 8 characters.'
  }
  const phone = form.phone.replace(/[\s-]/g, '')
  if (phone && !/^(\+977)?9\d{9}$/.test(phone)) e.phone = 'Enter a valid 10-digit mobile number.'
  return e
}

/**
 * Add a doctor (doctor = null) or edit an existing one.
 * Render it with a `key` so the form resets when the doctor changes.
 */
export default function DoctorFormModal({ open, onClose, onSaved, doctor = null }) {
  const isEdit = Boolean(doctor)
  const toast = useToast()
  const [form, setForm] = useState(() =>
    doctor
      ? {
          ...EMPTY,
          first_name: doctor.first_name,
          last_name: doctor.last_name,
          email: doctor.email,
          phone: doctor.phone || '',
          specialization: doctor.specialization || '',
          license_number: doctor.license_number || '',
        }
      : { ...EMPTY, password: generatePassword() },
  )
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(true)
  const [created, setCreated] = useState(null) // credentials to hand over after creating

  const set = (name) => (e) => {
    setForm((f) => ({ ...f, [name]: e.target.value }))
    if (errors[name]) setErrors((x) => ({ ...x, [name]: undefined }))
  }

  const inputProps = (name) => ({
    id: `doc-${name}`,
    name,
    value: form[name],
    onChange: set(name),
    'aria-invalid': Boolean(errors[name]),
    className: `input ${errors[name] ? 'input-error' : 'input-ok'}`,
  })

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')
    const v = validate(form, isEdit)
    setErrors(v)
    if (Object.keys(v).length) return

    const body = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      phone: form.phone.replace(/[\s-]/g, ''),
      specialization: form.specialization.trim(),
      license_number: form.license_number.trim(),
    }
    setSaving(true)
    try {
      if (isEdit) {
        const saved = await updateDoctor(doctor.id, body)
        toast(`Dr. ${saved.first_name}'s details were updated.`)
        onSaved?.(saved)
        onClose()
      } else {
        const saved = await createDoctor({ ...body, email: form.email.trim().toLowerCase(), password: form.password })
        onSaved?.(saved)
        setCreated({ name: `${saved.first_name} ${saved.last_name}`.trim(), email: saved.email, password: form.password })
      }
    } catch (err) {
      if (err.fields && Object.keys(err.fields).length) setErrors(err.fields)
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (created) {
    return (
      <Modal
        open={open}
        onClose={onClose}
        title="Doctor account created"
        size="max-w-md"
        footer={
          <button type="button" onClick={onClose} className="btn btn-primary">
            Done
          </button>
        }
      >
        <div className="flex items-center gap-3 rounded-xl bg-health-50 p-4 text-health-700">
          <Icon name="checkCircle" className="size-6 flex-none" />
          <p className="text-base font-medium">Dr. {created.name} can now log in with these details.</p>
        </div>
        <dl className="mt-5 space-y-3 rounded-xl border border-slate-200 p-4 text-base">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Email</dt>
            <dd className="font-medium break-all text-slate-900">{created.email}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Temporary password</dt>
            <dd className="font-mono font-medium text-slate-900">{created.password}</dd>
          </div>
        </dl>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard
              ?.writeText(`Email: ${created.email}\nPassword: ${created.password}`)
              .then(() => toast('Login details copied.'))
              .catch(() => toast('Could not copy. Please copy them by hand.', 'error'))
          }}
          className="btn btn-secondary mt-3 w-full"
        >
          <Icon name="clipboard" className="size-4" />
          Copy login details
        </button>
        <p className="mt-4 text-sm leading-relaxed text-slate-500">
          This password is shown only once. Share it with the doctor privately.
        </p>
      </Modal>
    )
  }

  return (
    <Modal
      open={open}
      onClose={saving ? () => {} : onClose}
      title={isEdit ? 'Edit doctor' : 'Add a doctor'}
      description={
        isEdit ? 'Update this doctor’s profile details.' : 'Create a login for a doctor at your clinic.'
      }
      footer={
        <>
          <button type="button" onClick={onClose} disabled={saving} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" form="doctor-form" disabled={saving} className="btn btn-primary">
            {saving ? <Spinner /> : <Icon name={isEdit ? 'check' : 'userPlus'} className="size-4" />}
            {isEdit ? 'Save changes' : 'Create doctor'}
          </button>
        </>
      }
    >
      <form id="doctor-form" onSubmit={handleSubmit} noValidate className="space-y-4">
        {formError && (
          <div role="alert" className="flex items-start gap-2 rounded-lg bg-rose-50 p-3 text-base text-rose-700">
            <Icon name="alert" className="mt-0.5 size-4 flex-none" />
            {formError}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="doc-first_name" label="First name" error={errors.first_name}>
            <input {...inputProps('first_name')} autoFocus autoComplete="off" placeholder="Sita" />
          </Field>
          <Field id="doc-last_name" label="Last name" error={errors.last_name} optional>
            <input {...inputProps('last_name')} autoComplete="off" placeholder="Sharma" />
          </Field>
        </div>

        <Field
          id="doc-email"
          label="Email address"
          error={errors.email}
          hint={isEdit ? 'The login email cannot be changed.' : 'The doctor logs in with this email.'}
        >
          <input
            {...inputProps('email')}
            type="email"
            autoComplete="off"
            placeholder="doctor@clinic.com"
            disabled={isEdit}
            className={`${inputProps('email').className} disabled:bg-slate-50 disabled:text-slate-500`}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="doc-specialization" label="Specialization" error={errors.specialization} optional>
            <input
              {...inputProps('specialization')}
              list="doc-specializations"
              autoComplete="off"
              placeholder="e.g. Cardiology"
            />
            <datalist id="doc-specializations">
              {SPECIALIZATIONS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </Field>
          <Field id="doc-phone" label="Mobile number" error={errors.phone} optional>
            <input {...inputProps('phone')} type="tel" inputMode="tel" autoComplete="off" placeholder="98XXXXXXXX" />
          </Field>
        </div>

        <Field id="doc-license_number" label="NMC license number" error={errors.license_number} optional>
          <input {...inputProps('license_number')} autoComplete="off" placeholder="e.g. 12345" />
        </Field>

        {!isEdit && (
          <Field
            id="doc-password"
            label="Temporary password"
            error={errors.password}
            hint="Generated for you. You can change it before saving."
          >
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  {...inputProps('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`${inputProps('password').className} pr-16 font-mono`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer rounded px-2 py-1 text-base font-medium text-slate-500 hover:text-slate-900"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  setForm((f) => ({ ...f, password: generatePassword() }))
                  setErrors((x) => ({ ...x, password: undefined }))
                }}
                aria-label="Generate a new password"
                title="Generate a new password"
                className="btn btn-secondary px-3"
              >
                <Icon name="refresh" className="size-4" />
              </button>
            </div>
          </Field>
        )}
      </form>
    </Modal>
  )
}
