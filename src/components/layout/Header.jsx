import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useInvite } from '../../context/InviteContext.jsx'
import useActiveSection from '../../hooks/useActiveSection.js'
import { withInvite } from '../../lib/invitation.js'

const links = [
  { id: 'home', label: 'Home', to: '/#home' },
  { id: 'events', label: 'Events', to: '/#events' },
  { id: 'rsvp', label: 'RSVP', to: '/rsvp' },
]

const sectionIds = ['home', 'events', 'rsvp']
const noSections = []

export default function Header() {
  const { pathname, hash } = useLocation()
  const { code } = useInvite()
  const [open, setOpen] = useState(false)
  const section = useActiveSection(pathname === '/' ? sectionIds : noSections)

  useEffect(() => {
    setOpen(false)
  }, [pathname, hash])

  useEffect(() => {
    if (!open) {
      return undefined
    }

    const onKey = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  function activeId() {
    if (pathname === '/rsvp') {
      return 'rsvp'
    }

    if (pathname === '/events') {
      return 'events'
    }

    return section || 'home'
  }

  const current = activeId()

  return (
    <header className="sticky top-0 z-50 border-b border-gold/40 bg-ivory">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to={withInvite('/#home', code)} className="font-script text-2xl leading-none text-burgundy">
          T & S
        </Link>

        <nav className="hidden items-center md:flex" aria-label="Primary">
          {links.map((link, index) => (
            <span key={link.id} className="flex items-center">
              {index > 0 ? <span className="mx-4 h-3 w-px bg-gold" aria-hidden="true" /> : null}
              <Link
                to={withInvite(link.to, code)}
                className={navClass(current === link.id)}
                aria-current={current === link.id ? 'page' : undefined}
              >
                {link.label}
              </Link>
            </span>
          ))}
        </nav>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center text-espresso md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((value) => !value)}
        >
          <MenuIcon open={open} />
        </button>
      </div>

      {open ? (
        <nav id="mobile-nav" className="border-t border-gold/30 px-4 py-3 md:hidden" aria-label="Mobile">
          {links.map((link) => (
            <Link
              key={link.id}
              to={withInvite(link.to, code)}
              onClick={() => setOpen(false)}
              className={`flex min-h-11 items-center px-2 text-[0.72rem] uppercase tracking-[0.24em] ${
                current === link.id ? 'text-burgundy' : 'text-brown'
              }`}
              aria-current={current === link.id ? 'page' : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  )
}

function navClass(active) {
  return `border-b text-[0.68rem] uppercase tracking-[0.22em] transition-colors ${
    active ? 'border-burgundy text-burgundy' : 'border-transparent text-brown hover:text-olive'
  }`
}

function MenuIcon({ open }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      {open ? (
        <path d="M6 6l12 12M18 6L6 18" />
      ) : (
        <>
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </>
      )}
    </svg>
  )
}
