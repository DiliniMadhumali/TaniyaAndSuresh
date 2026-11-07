import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import FallingCelebration from '../common/FallingCelebration.jsx'
import InviteNotice from '../invitation/InviteNotice.jsx'
import MusicToggle from '../common/MusicToggle.jsx'
import Footer from './Footer.jsx'
import Header from './Header.jsx'

export default function SiteLayout() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0)
      return
    }

    const frame = window.requestAnimationFrame(() => {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [pathname, hash])

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-ivory text-brown">
      <FallingCelebration />
      <MusicToggle />
      <Header />
      <InviteNotice />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
