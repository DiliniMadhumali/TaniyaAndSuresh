import { countdownTarget, wedding } from '../../data/weddingData.js'
import useCountdown from '../../hooks/useCountdown.js'

const units = [
  { key: 'days', label: 'Days' },
  { key: 'hours', label: 'Hours' },
  { key: 'minutes', label: 'Minutes' },
  { key: 'seconds', label: 'Seconds' },
]

function pad(value) {
  return String(value).padStart(2, '0')
}

export default function Countdown() {
  const remaining = useCountdown(countdownTarget())
  const message = remaining.complete ? 'Today is the day!' : `${wedding.tagline} ♥`

  return (
    <section id="countdown" className="relative scroll-mt-20 overflow-hidden bg-olive px-4 py-16 text-center text-ivory sm:px-6 sm:py-24">
      <span className="sparkle pointer-events-none absolute left-[8%] top-8 text-gold" aria-hidden="true">✦</span>
      <span className="sparkle pointer-events-none absolute right-[10%] top-16 text-sm text-ivory" style={{ animationDelay: '0.7s' }} aria-hidden="true">✦</span>
      <span className="sparkle pointer-events-none absolute bottom-10 left-[18%] text-xs text-gold" style={{ animationDelay: '1.1s' }} aria-hidden="true">✦</span>
      <span className="sparkle pointer-events-none absolute bottom-14 right-[14%] text-gold" style={{ animationDelay: '0.4s' }} aria-hidden="true">✦</span>

      <p className="text-[0.68rem] font-medium uppercase tracking-[0.32em] sm:text-sm sm:tracking-[0.42em]">
        Counting down to our special day
      </p>
      <div
        className="mx-auto mt-10 grid max-w-5xl grid-cols-2 gap-4 md:grid-cols-4 md:gap-6"
        role="timer"
        aria-label="Countdown to the church ceremony on 10 December 2026 at 8:00 AM Sri Lanka time"
      >
        {units.map((unit) => (
          <div key={unit.key} className="min-w-0 border border-gold/80 bg-[#4a1e2c]/70 px-3 py-6 sm:py-8">
            <span className="block font-serif text-5xl leading-none text-gold sm:text-7xl">{pad(remaining[unit.key])}</span>
            <span className="mt-3 block text-[0.62rem] uppercase tracking-[0.22em] text-ivory sm:text-xs">{unit.label}</span>
          </div>
        ))}
      </div>
      <p className="mt-10 font-script text-4xl text-ivory sm:text-5xl">{message}</p>
    </section>
  )
}
