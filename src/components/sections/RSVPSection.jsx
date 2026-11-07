import { Link } from 'react-router-dom'
import { useInvite } from '../../context/InviteContext.jsx'
import { rsvpPrompt } from '../../data/weddingData.js'
import { withInvite } from '../../lib/invitation.js'
import Reveal from '../common/Reveal.jsx'
import RsvpContacts from '../common/RsvpContacts.jsx'
import SectionHeading from '../common/SectionHeading.jsx'

export default function RSVPSection() {
  const { code } = useInvite()

  return (
    <section id="rsvp" className="scroll-mt-20 bg-burgundy px-4 py-20 text-center text-ivory sm:px-6 sm:py-28">
      <Reveal>
        <SectionHeading light eyebrow="Kindly reply" title="RSVP">
          {rsvpPrompt}
        </SectionHeading>
        <RsvpContacts light />
        <Link
          to={withInvite('/rsvp', code)}
          className="mt-10 inline-flex min-h-11 items-center justify-center border border-gold px-10 text-[0.68rem] uppercase tracking-[0.28em] text-ivory transition-colors hover:bg-ivory hover:text-burgundy"
        >
          RSVP
        </Link>
      </Reveal>
    </section>
  )
}
