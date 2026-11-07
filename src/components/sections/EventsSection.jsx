import { events } from '../../data/weddingData.js'
import Reveal from '../common/Reveal.jsx'
import SectionHeading from '../common/SectionHeading.jsx'
import EventCard from './EventCard.jsx'

export default function EventsSection({ showHeading = true }) {
  return (
    <section id="events" className="scroll-mt-20">
      {showHeading ? (
        <div className="px-4 pb-4 pt-20 sm:px-6 sm:pt-28">
          <Reveal>
            <SectionHeading eyebrow="The celebration" title="Two gatherings">
              The church ceremony and the wedding reception are held as two separate events.
            </SectionHeading>
          </Reveal>
        </div>
      ) : null}
      <div className={showHeading ? 'mt-8' : ''}>
        {events.map((event) => (
          <Reveal key={event.id}>
            <EventCard event={event} />
          </Reveal>
        ))}
      </div>
    </section>
  )
}
