import { useEffect, useState } from 'react'

/** Seconds left on a countdown; call restart(n) to start again from n. */
export default function useCountdown(initial = 0) {
  const [seconds, setSeconds] = useState(initial)

  useEffect(() => {
    if (seconds <= 0) return
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => clearTimeout(id)
  }, [seconds])

  return [seconds, setSeconds]
}
