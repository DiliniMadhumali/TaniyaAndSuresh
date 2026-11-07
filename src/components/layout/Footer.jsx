import { coupleNames, wedding } from '../../data/weddingData.js'
import FloralSprig from '../common/FloralSprig.jsx'
import GoldDivider from '../common/GoldDivider.jsx'

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-gold/50 px-4 py-16 text-center sm:px-6 sm:py-20">
      <FloralSprig className="pointer-events-none absolute bottom-4 left-4 h-12 w-12 text-olive/70 sm:left-8" />
      <FloralSprig className="pointer-events-none absolute bottom-4 right-4 h-12 w-12 -scale-x-100 text-olive/70 sm:right-8" />
      <p className="font-script text-5xl text-burgundy sm:text-6xl">{coupleNames}</p>
      <p className="mt-3 font-script text-3xl text-gold sm:text-4xl">
        {wedding.tagline} <span className="text-burgundy">♥</span>
      </p>
      <GoldDivider className="mt-8" />
    </footer>
  )
}
