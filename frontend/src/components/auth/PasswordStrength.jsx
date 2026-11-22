import { passwordStrength } from '../../utils/password'

const labels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong']
const colors = ['bg-rose-500', 'bg-rose-500', 'bg-amber-500', 'bg-health-500', 'bg-health-600']

export default function PasswordStrength({ password }) {
  if (!password) return null
  const strength = passwordStrength(password)
  return (
    <div className="mt-2 flex items-center gap-3" aria-live="polite">
      <div className="grid flex-1 grid-cols-4 gap-1.5">
        {[1, 2, 3, 4].map((i) => (
          <span key={i} className={`h-1.5 rounded-full ${i <= strength ? colors[strength] : 'bg-slate-200'}`} />
        ))}
      </div>
      <small className="w-16 text-right text-xs font-medium text-slate-500">{labels[strength]}</small>
    </div>
  )
}
