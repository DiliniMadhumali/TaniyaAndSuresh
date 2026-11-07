import { formatEventDate, googleMapsUrl } from '../../data/weddingData.js'

function ChurchMark() {
  return (
    <svg viewBox="0 0 48 48" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
      <path d="M24 4v8M20 8h8" />
      <path d="M8 44V22L24 12l16 10v22" />
      <path d="M20 44V30h8v14" />
    </svg>
  )
}

function ReceptionMark() {
  return (
    <svg viewBox="0 0 48 48" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
      <path d="M10 20h28" />
      <path d="M14 20c0 8 4 12 10 12s10-4 10-12" />
      <path d="M24 32v8" />
      <path d="M16 40h16" />
      <path d="M24 8c2 3 2 6 0 8" />
    </svg>
  )
}

const details = [
  { key: 'date', label: 'Date', value: (event) => formatEventDate(event.date) },
  { key: 'time', label: 'Time', value: (event) => event.time },
  { key: 'location', label: 'Location', value: (event) => event.location },
]

export default function EventCard({ event }) {
  const reception = event.tone === 'reception'

  return (
    <article className={reception ? 'bg-olive/10' : 'bg-ivory'}>
      <div className="mx-auto grid max-w-5xl items-center gap-8 px-4 py-16 sm:px-6 sm:py-20 md:grid-cols-[7rem_minmax(0,1fr)]">
        <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-gold md:mx-0 ${reception ? 'text-burgundy' : 'text-olive'}`}>
          {reception ? <ReceptionMark /> : <ChurchMark />}
        </div>
        <div className="w-full text-center md:text-left">
          <p className="text-[0.66rem] font-medium uppercase tracking-[0.32em] text-burgundy">
            {reception ? 'Event two' : 'Event one'}
          </p>
          <h3 className="mt-3 font-serif text-4xl font-medium leading-none text-brown sm:text-5xl">{event.title}</h3>
          <p className="mt-4 font-serif text-2xl italic text-brown">{event.venue}</p>
          <dl className="mt-8 grid gap-5 text-center sm:grid-cols-3 md:text-left">
            {details.map((detail) => (
              <div key={detail.key} className="flex flex-col items-center text-center md:items-start md:text-left">
                <dt className="text-[0.62rem] uppercase tracking-[0.24em] text-burgundy">{detail.label}</dt>
                <dd className="mt-1 max-w-[16rem] font-serif text-lg leading-relaxed text-brown sm:max-w-none">
                  {detail.value(event)}
                </dd>
              </div>
            ))}
          </dl>
          <a
            href={googleMapsUrl(event.mapsQuery)}
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex items-center justify-center gap-2 text-[0.68rem] uppercase tracking-[0.22em] text-burgundy md:justify-start"
          >
            Open in Google Maps
            <span aria-hidden="true" className="text-gold">→</span>
          </a>
        </div>
      </div>
    </article>
  )
}
