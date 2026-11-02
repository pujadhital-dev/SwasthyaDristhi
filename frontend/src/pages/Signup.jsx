import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import { register, getDashboardPath } from '../services/authService'

const inputClass =
  'w-full rounded-[10px] border-[1.5px] bg-white px-3.5 py-3 text-ink transition placeholder:text-accent focus:ring-4 focus:outline-none'
const okBorder = 'border-line focus:border-accent focus:ring-accent/20'
const errBorder = 'border-red-300 focus:border-red-400 focus:ring-red-100'

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

const benefits = ['📄 Upload reports, scans and X-rays', '🗓️ Your full history in one timeline', '✅ Only doctor-approved prescriptions']

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
const strengthColors = ['bg-red-500', 'bg-red-500', 'bg-amber-500', 'bg-accent', 'bg-primary']

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
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-ink">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-600">
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
    className: `${inputClass} ${errors[name] ? errBorder : okBorder}`,
  })

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      {/* ===== Left: brand panel (hidden on mobile) ===== */}
      <aside className="sticky top-0 hidden h-screen flex-col justify-between bg-linear-160 from-primary to-secondary px-14 py-10 text-white md:flex">
        <Logo light />
        <div>
          <h1 className="mb-3.5 text-4xl font-extrabold lg:text-5xl">Join SwasthyaDrishti</h1>
          <p className="max-w-md text-lg opacity-90">
            Create a free patient account to keep all your medical records in one secure place.
          </p>
          <ul className="mt-7 grid gap-3">
            {benefits.map((item) => (
              <li
                key={item}
                className="max-w-sm rounded-[10px] border border-accent-light/35 bg-accent-light/20 px-4 py-3"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
        <small className="opacity-75">Your records are private and only shared with your doctor.</small>
      </aside>

      {/* ===== Right: form ===== */}
      <main className="flex flex-col items-center justify-center bg-light px-6 py-10">
        <div className="mb-6 md:hidden">
          <Logo />
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex w-full max-w-md flex-col rounded-2xl bg-white px-6 py-8 shadow-card sm:px-9 sm:py-10"
        >
          <h2 className="text-2xl font-bold text-primary">Create your account</h2>
          <p className="mt-1.5 mb-6 text-muted">Patient registration · takes a minute</p>

          {formError && (
            <div role="alert" className="mb-4 rounded-[10px] border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
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
              <legend className="mb-1.5 text-sm font-semibold text-ink">Gender</legend>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { value: 'MALE', label: 'Male' },
                  { value: 'FEMALE', label: 'Female' },
                  { value: 'OTHER', label: 'Other' },
                ].map((g) => (
                  <label
                    key={g.value}
                    className={`flex cursor-pointer items-center justify-center rounded-[10px] border-[1.5px] px-3 py-2.5 text-sm font-medium transition has-focus-visible:ring-4 has-focus-visible:ring-accent/20 ${
                      form.gender === g.value
                        ? 'border-primary bg-primary text-white'
                        : errors.gender
                          ? 'border-red-300 text-ink hover:border-primary/50'
                          : 'border-line text-ink hover:border-primary/50'
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
              {errors.gender && <p className="mt-1 text-xs text-red-600">{errors.gender}</p>}
            </fieldset>

            <div className="sm:col-span-2">
              <Field id="password" label="Password" error={errors.password}>
                <div className="relative">
                  <input
                    {...inputProps('password')}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    className={`${inputProps('password').className} pr-18`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer px-2 py-1.5 text-sm font-semibold text-secondary hover:text-primary"
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
                        className={`h-1.5 rounded-full ${i <= strength ? strengthColors[strength] : 'bg-line'}`}
                      />
                    ))}
                  </div>
                  <small className="w-16 text-right text-xs font-semibold text-muted">{strengthLabels[strength]}</small>
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

          <label htmlFor="agree" className="mt-5 flex cursor-pointer items-start gap-2.5 text-sm text-ink">
            <input
              id="agree"
              name="agree"
              type="checkbox"
              checked={form.agree}
              onChange={handleChange}
              className="mt-0.5 size-4 flex-none cursor-pointer accent-primary"
            />
            <span>
              I agree to the{' '}
              <a href="#" className="font-semibold text-primary hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="font-semibold text-primary hover:underline">
                Privacy Policy
              </a>
              , and consent to my medical records being reviewed by my doctor.
            </span>
          </label>
          {errors.agree && <p className="mt-1 ml-6.5 text-xs text-red-600">{errors.agree}</p>}

          <button type="submit" disabled={loading} className="btn btn-primary mt-6 w-full py-3 text-base">
            {loading ? 'Creating account…' : 'Create account'}
          </button>

          <p className="mt-5 mb-1 text-center text-[0.95rem]">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Login
            </Link>
          </p>
          <p className="text-center text-sm text-muted">Doctors: your account is created by the administrator.</p>

          <Link to="/" className="mt-5 text-center text-sm text-secondary hover:text-primary">
            ← Back to home
          </Link>
        </form>
      </main>
    </div>
  )
}
