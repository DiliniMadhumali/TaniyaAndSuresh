import { useEffect } from 'react'
import EventsSection from '../components/sections/EventsSection.jsx'
import HeroSection from '../components/sections/HeroSection.jsx'
import ClosingSection from '../components/sections/ClosingSection.jsx'
import InvitationMessage from '../components/sections/InvitationMessage.jsx'
import Countdown from '../components/sections/Countdown.jsx'
import RSVPSection from '../components/sections/RSVPSection.jsx'

export default function Home() {
  useEffect(() => {
    document.title = 'Taniya & Suresh'
  }, [])

  return (
    <>
      <HeroSection />
      <InvitationMessage />
      <Countdown />
      <EventsSection />
      <ClosingSection />
      <RSVPSection />
    </>
  )
}
