import { formatEventDate, rsvp } from '../../data/weddingData.js'

export default function RsvpContacts({ light = false }) {
  return (
    <div className="mx-auto mt-8 max-w-md text-center">
      <p className={`text-[0.68rem] font-medium uppercase tracking-[0.26em] ${light ? 'text-gold' : 'text-burgundy'}`}>
        RSVP before {formatEventDate(rsvp.deadline)}
      </p>
      <ul className="mt-4 space-y-1">
        {rsvp.contacts.map((contact) => (
          <li key={contact.phone}>
            <a
              href={`tel:${contact.phone.replace(/\s/g, '')}`}
              className={`inline-flex min-h-11 items-center justify-center gap-2 text-sm font-light tracking-wide transition-colors ${
                light ? 'text-ivory hover:text-gold' : 'text-brown hover:text-burgundy'
              }`}
            >
              <span className="font-medium">{contact.name}</span>
              <span>{contact.phone}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
