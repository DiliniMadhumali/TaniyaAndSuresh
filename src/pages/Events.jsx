import { useEffect } from 'react'
import EventsSection from '../components/sections/EventsSection.jsx'
import SectionHeading from '../components/common/SectionHeading.jsx'

export default function Events() {
  useEffect(() => {
    document.title = 'Events · Taniya & Suresh'
  }, [])

  return (
    <div className="pb-4">
      <div className="px-4 pb-4 pt-16 sm:px-6 sm:pt-20">
        <SectionHeading eyebrow="The celebration" title="Two gatherings">
          The church ceremony and the wedding reception are held as two separate events.
        </SectionHeading>
      </div>
      <EventsSection showHeading={false} />
    </div>
  )
}
