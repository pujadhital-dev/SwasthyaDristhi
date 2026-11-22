import { useRef } from 'react'

/**
 * Six single-digit boxes for an email code.
 * Typing moves forward, Backspace moves back, and pasting "123456" fills every box.
 */
export default function OtpInput({ value, onChange, onComplete, length = 6, error = false, disabled = false }) {
  const refs = useRef([])
  const digits = Array.from({ length }, (_, i) => value[i] || '')

  const focus = (i) => refs.current[Math.max(0, Math.min(length - 1, i))]?.focus()

  function update(next) {
    const clean = next.replace(/\D/g, '').slice(0, length)
    onChange(clean)
    if (clean.length === length) onComplete?.(clean)
  }

  function handleChange(i, e) {
    const typed = e.target.value.replace(/\D/g, '')
    if (!typed) return
    if (typed.length > 1) {
      // Autofill or paste into one box
      update(value.slice(0, i) + typed)
      focus(i + typed.length)
      return
    }
    const chars = digits.slice()
    chars[i] = typed
    update(chars.join(''))
    focus(i + 1)
  }

  function handleKeyDown(i, e) {
    if (e.key === 'Backspace') {
      e.preventDefault()
      const chars = digits.slice()
      if (chars[i]) {
        chars[i] = ''
      } else if (i > 0) {
        chars[i - 1] = ''
        focus(i - 1)
      }
      onChange(chars.join('').slice(0, length))
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      focus(i - 1)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      focus(i + 1)
    }
  }

  function handlePaste(e) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '')
    if (!pasted) return
    e.preventDefault()
    update(pasted)
    focus(pasted.length)
  }

  return (
    <div className="flex justify-between gap-2 sm:gap-3" role="group" aria-label="Verification code">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          value={d}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={length}
          disabled={disabled}
          autoFocus={i === 0}
          aria-label={`Digit ${i + 1}`}
          aria-invalid={error}
          className={`h-14 w-full min-w-0 rounded-xl border bg-white text-center text-2xl font-bold text-slate-900 shadow-xs transition focus:ring-4 focus:outline-none disabled:bg-slate-50 sm:h-16 ${
            error
              ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-500/15'
              : d
                ? 'border-brand-400 focus:border-brand-500 focus:ring-brand-500/15'
                : 'border-slate-300 focus:border-brand-500 focus:ring-brand-500/15'
          }`}
        />
      ))}
    </div>
  )
}
