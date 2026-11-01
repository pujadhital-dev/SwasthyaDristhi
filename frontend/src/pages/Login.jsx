import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import { login, getDashboardPath } from '../services/authService'

const inputClass =
  'w-full rounded-[10px] border-[1.5px] border-line bg-white px-3.5 py-3 text-ink transition placeholder:text-accent focus:border-accent focus:ring-4 focus:ring-accent/20 focus:outline-none'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('Please enter your email and password.')
      return
    }

    setLoading(true)
    try {
      const user = await login(form.email.trim(), form.password)
      navigate(getDashboardPath(user.role), { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      {/* ===== Left: brand panel (hidden on mobile) ===== */}
      <aside className="hidden flex-col justify-between bg-linear-160 from-primary to-secondary px-14 py-10 text-white md:flex">
        <Logo light />
        <div>
          <h1 className="mb-3.5 text-4xl font-extrabold lg:text-5xl">Welcome back</h1>
          <p className="max-w-md text-lg opacity-90">
            Log in to view your medical timeline, review patient cases, or manage
            your care plan.
          </p>
          <ul className="mt-7 grid gap-3">
            {['📄 All your reports in one place', '🗓️ Clear chronological timeline', '✅ Doctor-approved prescriptions'].map(
              (item) => (
                <li
                  key={item}
                  className="max-w-sm rounded-[10px] border border-accent-light/35 bg-accent-light/20 px-4 py-3"
                >
                  {item}
                </li>
              ),
            )}
          </ul>
        </div>
        <small className="opacity-75">Patients, doctors and administrators share this login.</small>
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
          <h2 className="text-2xl font-bold text-primary">Login to your account</h2>
          <p className="mt-1.5 mb-6 text-muted">Enter your details to continue</p>

          {error && (
            <div role="alert" className="mb-4 rounded-[10px] border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
              {error}
            </div>
          )}

          <label htmlFor="email" className="mb-1.5 text-sm font-semibold">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            required
            className={`${inputClass} mb-4`}
          />

          <div className="mb-1.5 flex items-baseline justify-between">
            <label htmlFor="password" className="text-sm font-semibold">
              Password
            </label>
            <a href="#" className="text-sm text-secondary hover:text-primary hover:underline">
              Forgot password?
            </a>
          </div>
          <div className="relative mb-6">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
              className={`${inputClass} pr-18`}
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

          <button type="submit" disabled={loading} className="btn btn-primary w-full py-3 text-base">
            {loading ? 'Logging in…' : 'Login'}
          </button>

          <p className="mt-5 mb-1 text-center text-[0.95rem]">
            New patient?{' '}
            <Link to="/signup" className="font-semibold text-primary hover:underline">
              Create an account
            </Link>
          </p>
          <p className="text-center text-sm text-muted">
            Doctors: your account is created by the administrator.
          </p>

          <Link to="/" className="mt-5 text-center text-sm text-secondary hover:text-primary">
            ← Back to home
          </Link>
        </form>
      </main>
    </div>
  )
}
