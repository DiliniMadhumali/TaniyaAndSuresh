import { useState } from 'react'
import { events, googleMapsUrl } from '../../data/weddingData.js'
import GoldDivider from '../common/GoldDivider.jsx'
import Reveal from '../common/Reveal.jsx'

function calendarFile() {
  const [ceremony, reception] = events
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Taniya and Suresh//Wedding Invitation//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    'UID:ceremony-taniya-suresh@invitation',
    'DTSTART;TZID=Asia/Colombo:20261210T080000',
    'DURATION:PT2H',
    'SUMMARY:Church Ceremony – Taniya & Suresh',
    `LOCATION:${ceremony.venue}\\, ${ceremony.location}`,
    'END:VEVENT',
    'BEGIN:VEVENT',
    'UID:reception-taniya-suresh@invitation',
    'DTSTART;TZID=Asia/Colombo:20261212T190000',
    'DTEND;TZID=Asia/Colombo:20261213T000000',
    'SUMMARY:Wedding Reception – Taniya & Suresh',
    `LOCATION:${reception.venue}\\, ${reception.location}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

function saveDate() {
  const file = new Blob([calendarFile()], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = 'taniya-and-suresh.ics'
  link.click()
  URL.revokeObjectURL(url)
}

export default function ClosingSection() {
  const [note, setNote] = useState('')
  const ceremony = events[0]
  const reception = events[1]

  async function shareInvitation() {
    const url = window.location.origin
    const payload = {
      title: 'Taniya & Suresh',
      text: 'You are invited to the wedding of Taniya & Suresh.',
      url,
    }

    if (navigator.share) {
      try {
        await navigator.share(payload)
        setNote('')
        return
      } catch (error) {
        if (error?.name === 'AbortError') {
          return
        }
      }
    }

    await navigator.clipboard.writeText(url)
    setNote('Invitation link copied')
  }

  return (
    <section id="closing" className="scroll-mt-20 px-4 py-20 text-center sm:px-6 sm:py-28">
      <Reveal>
        <p className="text-[0.68rem] font-medium uppercase tracking-[0.34em] text-burgundy">With love</p>
        <h2 className="mx-auto mt-3 max-w-2xl font-script text-4xl text-brown sm:text-5xl">
          We look forward to celebrating with you!
        </h2>
        <GoldDivider className="mt-6" />
        <div className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-3">
          <a className="invite-action" href={googleMapsUrl(ceremony.mapsQuery)} target="_blank" rel="noreferrer">
            Church · Google Maps
          </a>
          <a className="invite-action" href={googleMapsUrl(reception.mapsQuery)} target="_blank" rel="noreferrer">
            Reception · Google Maps
          </a>
          <button type="button" className="invite-action" onClick={saveDate}>
            Save the Date
          </button>
          <button type="button" className="invite-action" onClick={shareInvitation}>
            Share
          </button>
        </div>
        {note ? <p className="mt-4 text-sm text-olive">{note}</p> : null}
      </Reveal>
    </section>
  )
}
