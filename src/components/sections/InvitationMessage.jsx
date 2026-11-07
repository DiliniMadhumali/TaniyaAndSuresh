import { useInvite } from '../../context/InviteContext.jsx'
import { TIMEZONE, coupleNames, invitationMessage, wedding } from '../../data/weddingData.js'
import FloralSprig from '../common/FloralSprig.jsx'
import GoldDivider from '../common/GoldDivider.jsx'
import Reveal from '../common/Reveal.jsx'

export default function InvitationMessage() {
  const { status, guest } = useInvite()

  return (
    <section id="invitation" className="relative scroll-mt-20 overflow-hidden border-y border-gold/40 bg-ivory px-4 py-20 text-center sm:px-6 sm:py-28">
      <FloralSprig className="pointer-events-none absolute left-4 top-8 h-12 w-12 text-olive/60 sm:left-10" />
      <FloralSprig className="pointer-events-none absolute bottom-8 right-4 h-12 w-12 -scale-x-100 text-olive/60 sm:right-10" />
      <Reveal>
        {status === 'ready' && guest ? (
          <p className="mb-6 font-script text-4xl text-burgundy sm:text-5xl">Dear {guest.fullName}</p>
        ) : null}
        <p className="text-[0.68rem] font-medium uppercase tracking-[0.32em] text-burgundy">
          Request the pleasure of the presence of
        </p>
        <GoldDivider className="mt-6" />
        <blockquote className="mx-auto mt-8 max-w-3xl font-serif text-3xl font-medium leading-snug text-brown sm:text-5xl">
          {invitationMessage}
        </blockquote>
        <p className="mt-8 text-[0.68rem] font-medium uppercase tracking-[0.28em] text-burgundy">
          To celebrate their marriage
        </p>
        <GoldDivider className="mt-6" />
        <CeremonyDate />
        <p className="mt-8 font-script text-5xl text-burgundy">{coupleNames}</p>
      </Reveal>
    </section>
  )
}

function CeremonyDate() {
  const date = new Date(wedding.ceremonyAt)
  const part = (options) =>
    new Intl.DateTimeFormat('en-GB', { timeZone: TIMEZONE, ...options }).format(date)

  return (
    <time
      dateTime={wedding.ceremonyAt.slice(0, 10)}
      className="mx-auto mt-8 flex max-w-xl items-center justify-center border border-gold/70 px-5 py-5 sm:px-10"
    >
      <span className="font-serif text-4xl font-medium tracking-wide text-brown sm:text-5xl">{part({ day: 'numeric' })}</span>
      <span className="mx-4 h-8 w-px bg-gold sm:mx-8" aria-hidden="true" />
      <span className="text-[0.72rem] font-medium uppercase tracking-[0.32em] text-burgundy sm:text-sm">
        {part({ month: 'long' })}
      </span>
      <span className="mx-4 h-8 w-px bg-gold sm:mx-8" aria-hidden="true" />
      <span className="font-serif text-4xl font-medium tracking-wide text-brown sm:text-5xl">{part({ year: 'numeric' })}</span>
    </time>
  )
}
