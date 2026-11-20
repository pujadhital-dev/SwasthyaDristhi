import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/auth/AuthLayout'
import { login, getDashboardPath } from '../../services/authService'

const points = [
  { icon: 'timeline', text: 'Your full medical timeline in one place' },
  { icon: 'trendingUp', text: 'Trends and explainable risk flags' },
  { icon: 'shield', text: 'Only doctor-approved prescriptions' },
]

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
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to view your medical timeline, review patient cases or manage your care plan."
      points={points}
      note="Patients, doctors and administrators use the same secure login."
    >
      <form onSubmit={handleSubmit} noValidate className="w-full max-w-sm">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Log in to your account</h2>
        <p className="mt-2 text-slate-500">Enter your details to continue.</p>

        {error && (
          <div role="alert" className="mt-6 flex gap-2.5 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="mt-8 space-y-5">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
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
              className="input input-ok"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-baseline justify-between">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">
                Password
              </label>
              <a href="#" className="text-sm font-medium text-brand-600 hover:text-brand-700">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
                className="input input-ok pr-16"
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
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary btn-lg mt-8 w-full">
          {loading ? 'Logging in…' : 'Log in'}
        </button>

        <p className="mt-8 text-center text-sm text-slate-600">
          New patient?{' '}
          <Link to="/signup" className="font-semibold text-brand-600 hover:text-brand-700">
            Create an account
          </Link>
        </p>
        <p className="mt-2 text-center text-xs text-slate-400">Doctor accounts are created by the administrator.</p>
      </form>
    </AuthLayout>
  )
}
