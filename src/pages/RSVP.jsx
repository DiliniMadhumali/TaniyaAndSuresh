import { useEffect } from 'react'
import RsvpContacts from '../components/common/RsvpContacts.jsx'
import SectionHeading from '../components/common/SectionHeading.jsx'
import GuestRsvpForm from '../components/rsvp/GuestRsvpForm.jsx'
import { useInvite } from '../context/InviteContext.jsx'
import { rsvpOptions, rsvpPrompt } from '../data/weddingData.js'

export default function RSVP() {
  const { code, status, guest } = useInvite()

  useEffect(() => {
    document.title = 'RSVP · Taniya & Suresh'
  }, [])

  const waiting = Boolean(code) && (status === 'idle' || status === 'loading')

  return (
    <section className="bg-burgundy px-4 py-16 text-ivory sm:px-6 sm:py-20">
      <SectionHeading light eyebrow="Kindly reply" title="Your reply">
        {rsvpPrompt}
      </SectionHeading>

      <RsvpContacts light />

      {waiting ? (
        <p className="mx-auto mt-8 max-w-xl text-center text-sm font-light leading-relaxed text-ivory/80">
          Opening your invitation…
        </p>
      ) : null}

      {status === 'ready' && guest ? <GuestRsvpForm /> : null}

      {!code ? (
        <>
          <p className="mx-auto mt-8 max-w-xl text-center text-sm font-light leading-relaxed text-ivory/80">
            A personal invitation link will let each guest choose one of the options below, then update
            that reply later. Attendance for the church ceremony and the wedding reception will be saved
            separately. This page is a preview and does not submit a response.
          </p>

          <ul className="mx-auto mt-12 grid max-w-5xl gap-4 md:grid-cols-3">
            {rsvpOptions.map((option, index) => (
              <li key={option.id} className="min-w-0 border border-gold px-5 py-8 text-center transition-colors hover:bg-ivory/10">
                <p className="text-[0.62rem] uppercase tracking-[0.28em] text-ivory">0{index + 1}</p>
                <h2 className="mt-4 text-balance font-serif text-3xl leading-tight text-ivory">{option.title}</h2>
                <p className="mt-4 text-sm font-light leading-relaxed text-ivory/75">{option.description}</p>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  )
}
