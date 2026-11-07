/**
 * Confirmed details from the printed invitation.
 * Ceremony and reception are separate events with their own dates.
 * Times use Asia/Colombo (UTC+05:30).
 */
export const TIMEZONE = 'Asia/Colombo'

export const wedding = {
  bride: 'Taniya',
  groom: 'Suresh',
  brideParents: ['Mr. & Mrs.', 'Gnanarajah'],
  groomParents: ['Mr. & Mrs.', 'Kodikara'],
  tagline: 'We Decided on Forever',
  together: 'Together with their families',
  ceremonyAt: '2026-12-10T08:00:00+05:30',
}

export const coupleNames = `${wedding.bride} & ${wedding.groom}`

export const invitationMessage =
  'With the blessings of our families, we joyfully invite you to celebrate the beginning of our new journey together.'

export const invitationHeading = 'REQUEST THE PLEASURE OF YOUR PRESENCE'
export const invitationOccasion = 'TO CELEBRATE OUR MARRIAGE'
export const invitationClosingMessage = 'We would be truly delighted to have you join us and share in our special day.'

export const rsvpPrompt =
  'We would be delighted to celebrate our special day with you.'

export const rsvp = {
  deadline: '2026-11-25T12:00:00+05:30',
  contacts: [
    { name: 'Taniya', phone: '076 770 3015' },
    { name: 'Menuka', phone: '077 134 7247' },
  ],
}

export const events = [
  {
    id: 'ceremony',
    title: 'Church Ceremony',
    venue: 'Our Lady of Sorrows Church',
    location: 'Pallansena, Kochchikade',
    date: '2026-12-10T08:00:00+05:30',
    time: '8:00 AM',
    mapsQuery: 'Our Lady of Sorrows Church, Pallansena, Kochchikade',
    tone: 'ceremony',
  },
  {
    id: 'reception',
    title: 'Wedding Reception',
    venue: 'Grandeza Hotel',
    location: 'Negombo',
    date: '2026-12-12T19:00:00+05:30',
    time: '7:00 PM – 12:00 AM',
    mapsQuery: 'Grandeza Hotel, Negombo',
    tone: 'reception',
  },
]

export const rsvpOptions = [
  {
    id: 'ceremony',
    title: 'Church Ceremony Only',
    description: `${events[0].venue}, ${events[0].location}`,
  },
  {
    id: 'reception',
    title: 'Wedding Reception Only',
    description: `${events[1].venue}, ${events[1].location}`,
  },
  {
    id: 'both',
    title: 'Both Events',
    description: 'Church ceremony and wedding reception',
  },
]

export const photos = [
  {
    id: 'portrait',
    src: null,
    alt: 'Portrait of Taniya and Suresh',
    caption: 'Portrait',
  },
  {
    id: 'together',
    src: null,
    alt: 'Taniya and Suresh together',
    caption: 'Together',
  },
  {
    id: 'celebration',
    src: null,
    alt: 'Celebration photograph of Taniya and Suresh',
    caption: 'Celebration',
  },
]

export function formatEventDate(iso) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: TIMEZONE,
  }).format(new Date(iso))
}

export function weddingDatesLabel() {
  const ceremony = new Date(events[0].date)
  const reception = new Date(events[1].date)
  const day = new Intl.DateTimeFormat('en-GB', { day: 'numeric', timeZone: TIMEZONE })
  const monthYear = new Intl.DateTimeFormat('en-GB', {
    month: 'long',
    year: 'numeric',
    timeZone: TIMEZONE,
  })

  if (monthYear.format(ceremony) === monthYear.format(reception)) {
    return `${day.format(ceremony)} & ${day.format(reception)} ${monthYear.format(ceremony)}`
  }

  return `${formatEventDate(events[0].date)} & ${formatEventDate(events[1].date)}`
}

export function countdownTarget() {
  return wedding.ceremonyAt
}

export function googleMapsUrl(query) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}
