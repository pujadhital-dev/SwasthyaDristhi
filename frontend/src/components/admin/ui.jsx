// Small building blocks shared by the Super Admin pages.
import { useEffect } from 'react'
import Icon from '../common/Icon'

function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || '?'
}

const avatarTones = [
  'bg-brand-100 text-brand-700',
  'bg-health-100 text-health-700',
  'bg-amber-100 text-amber-700',
  'bg-violet-100 text-violet-700',
  'bg-sky-100 text-sky-700',
  'bg-rose-100 text-rose-700',
]

export function Avatar({ name, size = 'size-10', className = '' }) {
  const tone = avatarTones[[...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % avatarTones.length]
  return (
    <span
      className={`grid flex-none place-items-center rounded-full text-sm font-bold ${size} ${tone} ${className}`}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  )
}

const badgeTones = {
  green: 'bg-health-50 text-health-700 ring-health-600/20',
  gray: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  amber: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  blue: 'bg-brand-50 text-brand-700 ring-brand-600/20',
  red: 'bg-rose-50 text-rose-700 ring-rose-600/20',
}

export function Badge({ tone = 'gray', children, dot = false }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold whitespace-nowrap ring-1 ring-inset ${badgeTones[tone]}`}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}

export function StatusBadge({ active }) {
  return active ? (
    <Badge tone="green" dot>
      Active
    </Badge>
  ) : (
    <Badge tone="gray" dot>
      Deactivated
    </Badge>
  )
}

export function Card({ className = '', children }) {
  return <div className={`rounded-2xl border border-slate-200/80 bg-white shadow-soft ${className}`}>{children}</div>
}

export function PageHeader({ title, description, actions }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-[1.75rem] leading-tight font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 text-base text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

const statTones = {
  blue: 'bg-brand-50 text-brand-600',
  green: 'bg-health-50 text-health-600',
  amber: 'bg-amber-50 text-amber-600',
  violet: 'bg-violet-50 text-violet-600',
}

export function StatCard({ icon, label, value, hint, tone = 'blue', loading }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-base font-semibold text-slate-600">{label}</p>
        <span className={`grid size-12 flex-none place-items-center rounded-xl ${statTones[tone]}`}>
          <Icon name={icon} className="size-6" />
        </span>
      </div>
      {loading ? (
        <div className="mt-2 h-9 w-16 animate-pulse rounded-lg bg-slate-100" />
      ) : (
        <p className="mt-1 text-4xl font-bold tracking-tight text-slate-900 tabular-nums">{value}</p>
      )}
      {hint && <p className="mt-1.5 text-sm text-slate-500">{hint}</p>}
    </Card>
  )
}

export function Spinner({ className = 'size-4' }) {
  return (
    <svg viewBox="0 0 24 24" className={`animate-spin ${className}`} fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export function EmptyState({ icon = 'search', title, description, action }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-400">
        <Icon name={icon} className="size-6" />
      </span>
      <p className="mt-4 font-semibold text-slate-900">{title}</p>
      {description && <p className="mt-1 max-w-sm text-base text-slate-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-rose-50 text-rose-500">
        <Icon name="alert" className="size-6" />
      </span>
      <p className="mt-4 font-semibold text-slate-900">Could not load data</p>
      <p className="mt-1 text-base text-slate-500">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn btn-secondary mt-5">
          <Icon name="refresh" className="size-4" />
          Try again
        </button>
      )}
    </div>
  )
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="divide-y divide-slate-100">
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="flex items-center gap-4 px-5 py-4">
          <div className="size-9 animate-pulse rounded-full bg-slate-100" />
          {Array.from({ length: cols - 1 }, (_, c) => (
            <div key={c} className="h-3.5 flex-1 animate-pulse rounded bg-slate-100" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function Pagination({ page, pageSize, count, onChange }) {
  const pages = Math.max(1, Math.ceil(count / pageSize))
  if (count === 0) return null
  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, count)
  return (
    <div className="flex items-center justify-between gap-4 border-t border-slate-100 px-5 py-3.5">
      <p className="text-base text-slate-500">
        <span className="font-medium text-slate-700">{from}</span>–<span className="font-medium text-slate-700">{to}</span>{' '}
        of <span className="font-medium text-slate-700">{count}</span>
      </p>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="btn btn-secondary px-3 py-2"
        >
          <Icon name="chevronLeft" className="size-4" />
        </button>
        <span className="px-2 text-base text-slate-600 tabular-nums">
          {page} / {pages}
        </span>
        <button
          type="button"
          onClick={() => onChange(page + 1)}
          disabled={page >= pages}
          aria-label="Next page"
          className="btn btn-secondary px-3 py-2"
        >
          <Icon name="chevronRight" className="size-4" />
        </button>
      </div>
    </div>
  )
}

export function Modal({ open, onClose, title, description, children, footer, size = 'max-w-lg' }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
    }
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`relative flex max-h-[92vh] w-full flex-col rounded-t-2xl bg-white shadow-lift sm:rounded-2xl ${size}`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <h2 id="modal-title" className="text-xl font-bold text-slate-900">
              {title}
            </h2>
            {description && <p className="mt-0.5 text-base text-slate-500">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-m-1 cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <Icon name="close" className="size-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">{footer}</div>}
      </div>
    </div>
  )
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel, danger, busy }) {
  return (
    <Modal
      open={open}
      onClose={busy ? () => {} : onClose}
      title={title}
      size="max-w-md"
      footer={
        <>
          <button type="button" onClick={onClose} disabled={busy} className="btn btn-secondary">
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`btn ${danger ? 'bg-rose-600 text-white hover:bg-rose-700' : 'btn-primary'}`}
          >
            {busy && <Spinner />}
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-base leading-relaxed text-slate-600">{message}</p>
    </Modal>
  )
}

export function Field({ id, label, error, hint, optional, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 flex items-baseline justify-between text-base font-medium text-slate-700">
        {label}
        {optional && <span className="text-sm font-normal text-slate-400">Optional</span>}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-sm font-medium text-rose-600">{error}</p>
      ) : (
        hint && <p className="mt-1.5 text-sm text-slate-500">{hint}</p>
      )}
    </div>
  )
}
