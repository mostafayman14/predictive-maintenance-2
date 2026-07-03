import { useEffect, useState } from 'react'

import { formatClockTime } from '../lib/formatTime'

function useClock(intervalMs = 1000) {
  const [time, setTime] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTime(new Date())
    }, intervalMs)

    return () => window.clearInterval(timer)
  }, [intervalMs])

  return formatClockTime(time)
}

export { useClock }
