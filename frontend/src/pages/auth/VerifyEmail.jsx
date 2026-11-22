import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/auth/AuthLayout'
import OtpInput from '../../components/auth/OtpInput'
import Icon from '../../components/common/Icon'
import useCountdown from '../../hooks/useCountdown'
import { resendRegistrationCode, verifyRegistration } from '../../services/authService'

const points = [
  { icon: 'mail', text: 'We sent a 6-digit code to your email' },
  { icon: 'clock', text: 'The code is valid for 10 minutes' },
  { icon: 'lock', text: 'Never share your code with anyone' },
]

export default function VerifyEmail() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email || new URLSearchParams(location.search).get('email') || ''

  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendIn, setResendIn] = useCountdown(location.state?.resendIn ?? 60)

  if (!email) return <Navigate to="/signup" replace />

  async function submit(value = code) {
    if (value.length !== 6) {
      setError('Enter all 6 digits of the code.')
      return
    }
    setVerifying(true)
    setError('')
    setNotice('')
    try {
      const res = await verifyRegistration(email, value)
      navigate('/login', { replace: true, state: { email, notice: res.detail } })
    } catch (err) {
      if (err.status === 409) {
        navigate('/login', { replace: true, state: { email, notice: err.message } })
        return
      }
      setError(err.fields?.code || err.message)
      setCode('')
    } finally {
      setVerifying(false)
    }
  }

  async function resend() {
    setResending(true)
    setError('')
    setNotice('')
    try {
      const res = await resendRegistrationCode(email)
      setNotice(res.detail)
      setResendIn(res.resend_in ?? 60)
      setCode('')
    } catch (err) {
      if (err.resendIn) setResendIn(err.resendIn)
      setError(err.message)
    } finally {
      setResending(false)
    }
  }

  return (
    <AuthLayout
      title="Check your inbox"
      subtitle="One last step. Confirm your email address so your medical records stay safe."
      points={points}
      note="Your account is created only after your email is verified."
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
        noValidate
        className="w-full max-w-md"
      >
        <span className="grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
          <Icon name="mail" className="size-7" />
        </span>
        <h2 className="mt-6 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Verify your email</h2>
        <p className="mt-2 text-base text-slate-600">
          Enter the 6-digit code we sent to <span className="font-semibold break-all text-slate-900">{email}</span>
        </p>

        {error && (
          <div role="alert" className="mt-6 flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-[0.95rem] text-rose-700">
            <Icon name="alert" className="mt-0.5 size-5 flex-none" />
            {error}
          </div>
        )}
        {notice && !error && (
          <div role="status" className="mt-6 flex items-start gap-2.5 rounded-lg border border-health-100 bg-health-50 px-4 py-3 text-[0.95rem] text-health-700">
            <Icon name="checkCircle" className="mt-0.5 size-5 flex-none" />
            {notice}
          </div>
        )}

        <div className="mt-8">
          <OtpInput
            value={code}
            onChange={(v) => {
              setCode(v)
              setError('')
            }}
            onComplete={submit}
            error={Boolean(error)}
            disabled={verifying}
          />
        </div>

        <button type="submit" disabled={verifying || code.length !== 6} className="btn btn-primary btn-lg mt-8 w-full">
          {verifying ? 'Verifying…' : 'Verify and create account'}
        </button>

        <div className="mt-6 flex flex-col items-center gap-2 text-[0.95rem] text-slate-600">
          <p>
            Didn&apos;t get the code?{' '}
            {resendIn > 0 ? (
              <span className="font-medium text-slate-500">Resend in {resendIn}s</span>
            ) : (
              <button
                type="button"
                onClick={resend}
                disabled={resending}
                className="cursor-pointer font-semibold text-brand-600 hover:text-brand-700 disabled:opacity-60"
              >
                {resending ? 'Sending…' : 'Resend code'}
              </button>
            )}
          </p>
          <p className="text-sm text-slate-500">Check your spam folder too.</p>
          <Link to="/signup" className="mt-2 text-sm font-medium text-slate-500 hover:text-slate-900">
            Wrong email? Go back to sign up
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}
