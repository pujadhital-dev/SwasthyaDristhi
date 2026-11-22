import { createContext, useCallback, useContext, useRef, useState } from 'react'
import Icon from '../components/common/Icon'

const ToastContext = createContext(() => {})

export const useToast = () => useContext(ToastContext)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const nextId = useRef(0)

  const dismiss = useCallback((id) => setToasts((all) => all.filter((t) => t.id !== id)), [])

  const toast = useCallback(
    (message, type = 'success') => {
      const id = ++nextId.current
      setToasts((all) => [...all, { id, message, type }])
      setTimeout(() => dismiss(id), 4000)
    },
    [dismiss],
  )

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-lift"
          >
            <span
              className={`mt-0.5 grid size-6 flex-none place-items-center rounded-full ${
                t.type === 'error' ? 'bg-rose-100 text-rose-600' : 'bg-health-100 text-health-600'
              }`}
            >
              <Icon name={t.type === 'error' ? 'alert' : 'check'} className="size-3.5" strokeWidth={2.5} />
            </span>
            <p className="flex-1 text-base font-medium text-slate-800">{t.message}</p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="cursor-pointer rounded p-0.5 text-slate-400 hover:text-slate-700"
            >
              <Icon name="close" className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
