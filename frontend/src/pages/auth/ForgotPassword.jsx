import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/auth/AuthLayout'
import OtpInput from '../../components/auth/OtpInput'
import PasswordStrength from '../../components/auth/PasswordStrength'
import Icon from '../../components/common/Icon'
import useCountdown from '../../hooks/useCountdown'
import { forgotPassword, resetPassword, verifyResetCode } from '../../services/authService'

const points = [
  { icon: 'mail', text: 'Get a 6-digit code by email' },
  { icon: 'key', text: 'Choose a new, strong password' },
  { icon: 'shield', text: 'Your records stay safe the whole time' },
]

const STEPS = ['Email', 'Code', 'New password']

function Steps({ current }) {
  return (
    <ol className="mb-8 flex items-center gap-2" aria-label="Progress">
      {STEPS.map((label, i) => (
        <li key={label} className="flex flex-1 items-center gap-2">
          <span
            className={`grid size-8 flex-none place-items-center rounded-full text-sm font-bold ${
              i < current
                ? 'bg-health-500 text-white'
                : i === current
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 text-slate-400'
            }`}
            aria-current={i === current ? 'step' : undefined}
          >
            {i < current ? <Icon name="check" className="size-4" strokeWidth={3} /> : i + 1}
          </span>
          <span className={`hidden text-sm font-medium sm:inline ${i === current ? 'text-slate-900' : 'text-slate-400'}`}>
            {label}
          </span>
          {i < STEPS.length - 1 && <span className="h-px flex-1 bg-slate-200" />}
        </li>
      ))}
    </ol>
  )
}

function Alert({ tone = 'error', children }) {
  const styles =
    tone === 'error'
      ? 'border-rose-200 bg-rose-50 text-rose-700'
      : 'border-health-100 bg-health-50 text-health-700'
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`mb-6 flex items-start gap-2.5 rounded-lg border px-4 py-3 text-[0.95rem] ${styles}`}
    >
      <Icon name={tone === 'error' ? 'alert' : 'checkCircle'} className="mt-0.5 size-5 flex-none" />
      <span>{children}</span>
    </div>
  )
}

export default function ForgotPassword() {
  const navigate = useNavigate()
  const location = useLocation()
  const [step, setStep] = useState(0)
  const [email, setEmail] = useState(location.state?.email || '')
  const [code, setCode] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendIn, setResendIn] = useCountdown(0)

  async function sendCode(e) {
    e?.preventDefault()
    const value = email.trim().toLowerCase()
    if (!/^\S+@\S+\.\S+$/.test(value)) {
      setError('Enter the email address you registered with.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await forgotPassword(value)
      setEmail(value)
      setNotice(res.detail)
      setResendIn(res.resend_in ?? 60)
      setCode('')
      setStep(1)
    } catch (err) {
      setError(err.fields?.email || err.message)
    } finally {
      setLoading(false)
    }
  }

  async function checkCode(value = code) {
    if (value.length !== 6) {
      setError('Enter all 6 digits of the code.')
      return
    }
    setLoading(true)
    setError('')
    setNotice('')
    try {
      const res = await verifyResetCode(email, value)
      setResetToken(res.reset_token)
      setStep(2)
    } catch (err) {
      setError(err.fields?.code || err.message)
      setCode('')
    } finally {
      setLoading(false)
    }
  }

  async function savePassword(e) {
    e.preventDefault()
    const errs = {}
    if (password.length < 8) errs.password = 'Use at least 8 characters.'
    if (confirm !== password) errs.confirm = 'The passwords do not match.'
    setFieldErrors(errs)
    if (Object.keys(errs).length) return

    setLoading(true)
    setError('')
    try {
      const res = await resetPassword(resetToken, password)
      navigate('/login', { replace: true, state: { email, notice: res.detail } })
    } catch (err) {
      if (err.fields?.password) setFieldErrors({ password: err.fields.password })
      else setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="It happens. Verify your email and set a new password in under a minute."
      points={points}
      note="For your safety, reset codes expire after 10 minutes."
    >
      <div className="w-full max-w-md">
        <Steps current={step} />

        {step === 0 && (
          <form onSubmit={sendCode} noValidate>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Reset your password</h2>
            <p className="mt-2 mb-8 text-base text-slate-600">
              Enter the email address you use to log in. We&apos;ll send you a 6-digit code.
            </p>
            {error && <Alert>{error}</Alert>}
            <label htmlFor="email" className="mb-1.5 block text-[0.95rem] font-medium text-slate-700">
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError('')
              }}
              className={`input ${error ? 'input-error' : 'input-ok'}`}
            />
            <button type="submit" disabled={loading} className="btn btn-primary btn-lg mt-8 w-full">
              {loading ? 'Sending code…' : 'Send code'}
            </button>
          </form>
        )}

        {step === 1 && (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              checkCode()
            }}
            noValidate
          >
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Enter the code</h2>
            <p className="mt-2 mb-8 text-base text-slate-600">
              If <span className="font-semibold break-all text-slate-900">{email}</span> has an account, a 6-digit code
              is on its way.
            </p>
            {error ? <Alert>{error}</Alert> : notice && <Alert tone="success">Code sent. Check your inbox and spam folder.</Alert>}
            <OtpInput
              value={code}
              onChange={(v) => {
                setCode(v)
                setError('')
              }}
              onComplete={checkCode}
              error={Boolean(error)}
              disabled={loading}
            />
            <button type="submit" disabled={loading || code.length !== 6} className="btn btn-primary btn-lg mt-8 w-full">
              {loading ? 'Checking…' : 'Continue'}
            </button>
            <div className="mt-6 flex flex-col items-center gap-2 text-[0.95rem] text-slate-600">
              <p>
                Didn&apos;t get it?{' '}
                {resendIn > 0 ? (
                  <span className="font-medium text-slate-500">Resend in {resendIn}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => sendCode()}
                    disabled={loading}
                    className="cursor-pointer font-semibold text-brand-600 hover:text-brand-700"
                  >
                    Resend code
                  </button>
                )}
              </p>
              <button
                type="button"
                onClick={() => {
                  setStep(0)
                  setError('')
                }}
                className="cursor-pointer text-sm font-medium text-slate-500 hover:text-slate-900"
              >
                Use a different email
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={savePassword} noValidate>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Choose a new password</h2>
            <p className="mt-2 mb-8 text-base text-slate-600">Use at least 8 characters with a mix of letters, numbers and symbols.</p>
            {error && <Alert>{error}</Alert>}
            <div className="space-y-5">
              <div>
                <label htmlFor="new-password" className="mb-1.5 block text-[0.95rem] font-medium text-slate-700">
                  New password
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    autoFocus
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setFieldErrors((x) => ({ ...x, password: undefined }))
                    }}
                    className={`input pr-16 ${fieldErrors.password ? 'input-error' : 'input-ok'}`}
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
                {fieldErrors.password && <p className="mt-1.5 text-sm text-rose-600">{fieldErrors.password}</p>}
                <PasswordStrength password={password} />
              </div>
              <div>
                <label htmlFor="confirm-password" className="mb-1.5 block text-[0.95rem] font-medium text-slate-700">
                  Confirm new password
                </label>
                <input
                  id="confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => {
                    setConfirm(e.target.value)
                    setFieldErrors((x) => ({ ...x, confirm: undefined }))
                  }}
                  className={`input ${fieldErrors.confirm ? 'input-error' : 'input-ok'}`}
                />
                {fieldErrors.confirm && <p className="mt-1.5 text-sm text-rose-600">{fieldErrors.confirm}</p>}
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary btn-lg mt-8 w-full">
              {loading ? 'Saving…' : 'Save new password'}
            </button>
          </form>
        )}

        <p className="mt-10 text-center text-[0.95rem] text-slate-600">
          Remembered it?{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
            Back to log in
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
