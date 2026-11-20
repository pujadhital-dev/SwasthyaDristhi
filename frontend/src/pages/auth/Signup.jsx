import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/auth/AuthLayout'
import { register, getDashboardPath } from '../../services/authService'


// Local date as YYYY-MM-DD (used as the max for date of birth)
const todayISO = () => new Date().toLocaleDateString('en-CA')

const initialForm = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  date_of_birth: '',
  gender: '',
  password: '',
  confirm_password: '',
  agree: false,
}

const points = [
  { icon: 'upload', text: 'Upload reports, scans and X-rays' },
  { icon: 'timeline', text: 'Your full history in one timeline' },
  { icon: 'shield', text: 'Only doctor-approved prescriptions' },
]

// 0–4 score: length, lowercase+uppercase, number, symbol
function passwordStrength(pw) {
  if (!pw) return 0
  let score = 0
  if (pw.length >= 8) score++
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return score
}

const strengthLabels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong']
const strengthColors = ['bg-rose-500', 'bg-rose-500', 'bg-amber-500', 'bg-health-500', 'bg-health-600']

function validate(form) {
  const e = {}
  const today = todayISO()

  if (!form.first_name.trim()) e.first_name = 'First name is required.'
  if (!form.last_name.trim()) e.last_name = 'Last name is required.'

  if (!form.email.trim()) e.email = 'Email is required.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'Enter a valid email address.'

  const phone = form.phone.replace(/[\s-]/g, '')
  if (!phone) e.phone = 'Phone number is required.'
  else if (!/^(\+977)?9\d{9}$/.test(phone)) e.phone = 'Enter a valid 10-digit mobile number (e.g. 98XXXXXXXX).'

  if (!form.date_of_birth) e.date_of_birth = 'Date of birth is required.'
  else if (form.date_of_birth > today) e.date_of_birth = 'Date of birth cannot be in the future.'

  if (!form.gender) e.gender = 'Please select an option.'

  if (!form.password) e.password = 'Password is required.'
  else if (form.password.length < 8) e.password = 'Use at least 8 characters.'
  else if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password))
    e.password = 'Include at least one letter and one number.'

  if (!form.confirm_password) e.confirm_password = 'Please confirm your password.'
  else if (form.confirm_password !== form.password) e.confirm_password = 'Passwords do not match.'

  if (!form.agree) e.agree = 'You must accept the terms to continue.'
  return e
}

function Field({ id, label, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-rose-600">
          {error}
        </p>
      )}
    </div>
  )
}

export default function Signup() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const strength = passwordStrength(form.password)
  const [today] = useState(todayISO)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
    if (errors[name]) setErrors((errs) => ({ ...errs, [name]: undefined }))
    setFormError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const found = validate(form)
    setErrors(found)
    if (Object.keys(found).length) {
      document.getElementById(Object.keys(found)[0])?.focus()
      return
    }

    setLoading(true)
    try {
      const user = await register({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.replace(/[\s-]/g, ''),
        date_of_birth: form.date_of_birth,
        gender: form.gender,
        password: form.password,
      })
      navigate(getDashboardPath(user.role), { replace: true })
    } catch (err) {
      if (err.fields && Object.keys(err.fields).length) setErrors(err.fields)
      setFormError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // shared props for text inputs
  const inputProps = (name) => ({
    id: name,
    name,
    value: form[name],
    onChange: handleChange,
    'aria-invalid': !!errors[name],
    'aria-describedby': errors[name] ? `${name}-error` : undefined,
    className: `input ${errors[name] ? 'input-error' : 'input-ok'}`,
  })

  return (
    <AuthLayout
      title="Join SwasthyaDrishti"
      subtitle="Create a free patient account and keep every medical record in one secure place."
      points={points}
      note="Your records are private and shared only with your doctor."
    >
    <form
        onSubmit={handleSubmit}
        noValidate
        className="flex w-full max-w-lg flex-col py-4"
      >
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Create your account</h2>
        <p className="mt-2 mb-8 text-slate-500">Free patient registration. It takes about a minute.</p>

        {formError && (
          <div role="alert" className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700">
            {formError}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="first_name" label="First name" error={errors.first_name}>
            <input {...inputProps('first_name')} autoComplete="given-name" placeholder="Ram" />
          </Field>
          <Field id="last_name" label="Last name" error={errors.last_name}>
            <input {...inputProps('last_name')} autoComplete="family-name" placeholder="Sharma" />
          </Field>

          <div className="sm:col-span-2">
            <Field id="email" label="Email address" error={errors.email}>
              <input {...inputProps('email')} type="email" autoComplete="email" placeholder="you@example.com" />
            </Field>
          </div>

          <Field id="phone" label="Mobile number" error={errors.phone}>
            <input {...inputProps('phone')} type="tel" autoComplete="tel" inputMode="tel" placeholder="98XXXXXXXX" />
          </Field>
          <Field id="date_of_birth" label="Date of birth" error={errors.date_of_birth}>
            <input {...inputProps('date_of_birth')} type="date" max={today} autoComplete="bday" />
          </Field>

          <fieldset className="sm:col-span-2">
            <legend className="mb-1.5 text-sm font-medium text-slate-700">Gender</legend>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { value: 'MALE', label: 'Male' },
                { value: 'FEMALE', label: 'Female' },
                { value: 'OTHER', label: 'Other' },
              ].map((g) => (
                <label
                  key={g.value}
                  className={`flex cursor-pointer items-center justify-center rounded-lg border px-3 py-2.5 text-sm font-medium transition has-focus-visible:ring-4 has-focus-visible:ring-brand-500/15 ${
                    form.gender === g.value
                      ? 'border-brand-600 bg-brand-50 text-brand-700 ring-1 ring-brand-600'
                      : errors.gender
                        ? 'border-rose-300 text-slate-700 hover:border-slate-400'
                        : 'border-slate-300 text-slate-700 hover:border-slate-400'
                  }`}
                >
                  <input
                    type="radio"
                    id={g.value === 'MALE' ? 'gender' : undefined}
                    name="gender"
                    value={g.value}
                    checked={form.gender === g.value}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  {g.label}
                </label>
              ))}
            </div>
            {errors.gender && <p className="mt-1.5 text-xs text-rose-600">{errors.gender}</p>}
          </fieldset>

          <div className="sm:col-span-2">
            <Field id="password" label="Password" error={errors.password}>
              <div className="relative">
                <input
                  {...inputProps('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  className={`${inputProps('password').className} pr-16`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer rounded px-2 py-1 text-sm font-medium text-slate-500 hover:text-slate-900"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </Field>
            {form.password && (
              <div className="mt-2 flex items-center gap-3" aria-live="polite">
                <div className="grid flex-1 grid-cols-4 gap-1.5">
                  {[1, 2, 3, 4].map((i) => (
                    <span
                      key={i}
                      className={`h-1.5 rounded-full ${i <= strength ? strengthColors[strength] : 'bg-slate-200'}`}
                    />
                  ))}
                </div>
                <small className="w-16 text-right text-xs font-medium text-slate-500">{strengthLabels[strength]}</small>
              </div>
            )}
          </div>

          <div className="sm:col-span-2">
            <Field id="confirm_password" label="Confirm password" error={errors.confirm_password}>
              <input
                {...inputProps('confirm_password')}
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Re-enter your password"
              />
            </Field>
          </div>
        </div>

        <label htmlFor="agree" className="mt-6 flex cursor-pointer items-start gap-2.5 text-sm text-slate-600">
          <input
            id="agree"
            name="agree"
            type="checkbox"
            checked={form.agree}
            onChange={handleChange}
            className="mt-0.5 size-4 flex-none cursor-pointer accent-brand-600"
          />
          <span>
            I agree to the{' '}
            <a href="#" className="font-semibold text-brand-600 hover:text-brand-700">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="font-semibold text-brand-600 hover:text-brand-700">
              Privacy Policy
            </a>
            , and consent to my medical records being reviewed by my doctor.
          </span>
        </label>
        {errors.agree && <p className="mt-1.5 ml-6.5 text-xs text-rose-600">{errors.agree}</p>}

        <button type="submit" disabled={loading} className="btn btn-primary btn-lg mt-8 w-full">
          {loading ? 'Creating account…' : 'Create account'}
        </button>

        <p className="mt-8 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
            Log in
          </Link>
        </p>
        <p className="mt-2 text-center text-xs text-slate-400">Doctor accounts are created by the administrator.</p>
      </form>
    </AuthLayout>
  )
}
