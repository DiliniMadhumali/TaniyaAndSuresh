import { useEffect, useState } from 'react'

function splitRemaining(targetIso, now) {
  const target = new Date(targetIso).getTime()

  if (Number.isNaN(target)) {
    return null
  }

  const totalSeconds = Math.max(0, Math.floor((target - now) / 1000))

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    complete: totalSeconds === 0,
  }
}

export default function useCountdown(targetIso) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  if (!targetIso) {
    return { ready: false, days: 0, hours: 0, minutes: 0, seconds: 0, complete: false }
  }

  const parts = splitRemaining(targetIso, now)

  if (!parts) {
    return { ready: false, days: 0, hours: 0, minutes: 0, seconds: 0, complete: false }
  }

  return { ready: true, ...parts }
}
