import { wedding } from '../../data/weddingData.js'
import FloralSprig from '../common/FloralSprig.jsx'

export default function HeroSection() {
  return (
    <section id="home" className="relative scroll-mt-20 overflow-hidden bg-ivory px-4 py-16 text-brown sm:px-6 sm:py-24">
      <FloralSprig className="pointer-events-none absolute left-3 top-8 h-14 w-14 text-olive/80 sm:left-8 sm:h-16 sm:w-16" />
      <FloralSprig className="pointer-events-none absolute right-3 top-8 h-14 w-14 -scale-x-100 text-olive/80 sm:right-8 sm:h-16 sm:w-16" />
      <FloralSprig className="pointer-events-none absolute bottom-6 left-6 h-12 w-12 -scale-y-100 text-burgundy/50" />
      <FloralSprig className="pointer-events-none absolute bottom-6 right-6 h-12 w-12 -scale-x-100 -scale-y-100 text-burgundy/50" />
      <span className="sparkle pointer-events-none absolute left-[12%] top-24 text-sm text-gold" aria-hidden="true">✦</span>
      <span className="sparkle pointer-events-none absolute right-[14%] top-36 text-xs text-burgundy" style={{ animationDelay: '0.8s' }} aria-hidden="true">✦</span>
      <span className="hero-petal pointer-events-none absolute left-[8%] top-1/2 text-lg text-burgundy/60" aria-hidden="true">❀</span>
      <span className="hero-petal pointer-events-none absolute right-[9%] top-[42%] text-base text-gold" style={{ animationDelay: '1s' }} aria-hidden="true">❀</span>

      <div className="relative mx-auto max-w-6xl text-center">
        <p className="text-[0.68rem] font-medium uppercase tracking-[0.38em] text-burgundy sm:text-sm">
          The wedding of
        </p>
        <h1 className="mx-auto mt-4 flex max-w-full flex-wrap items-baseline justify-center gap-x-[0.2em] gap-y-1 font-script text-[clamp(3.2rem,8vw,7rem)] leading-none">
          <span className="name-shimmer name-taniya inline-block">{wedding.bride}</span>
          <span className="inline-block text-[0.55em] text-gold">&</span>
          <span className="name-shimmer name-suresh inline-block">{wedding.groom}</span>
        </h1>
        <div className="mx-auto mt-6 flex items-center justify-center gap-4" aria-hidden="true">
          <span className="h-px w-16 bg-gold sm:w-24" />
          <span className="font-serif text-2xl text-gold">♥</span>
          <span className="h-px w-16 bg-gold sm:w-24" />
        </div>

        <div className="mt-10 grid items-center gap-3 sm:gap-4 md:mt-14 md:grid-cols-[minmax(0,1fr)_minmax(8rem,13rem)_minmax(0,1fr)]">
          <FamilySide
            role="Bride"
            name={wedding.bride}
            nameClass="name-shimmer name-taniya"
            parents={wedding.brideParents}
            className="min-w-0 md:order-1"
          />
          <img
            src="/images/couple-flowers.png"
            alt=""
            width="935"
            height="1024"
            className="mx-auto h-auto w-full max-w-[8rem] object-contain sm:max-w-[10rem] md:max-w-sm md:order-2"
          />
          <FamilySide
            role="Groom"
            name={wedding.groom}
            nameClass="name-shimmer name-suresh"
            parents={wedding.groomParents}
            className="min-w-0 md:order-3"
          />
        </div>
      </div>
    </section>
  )
}

function FamilySide({ role, name, nameClass, parents, className = '' }) {
  return (
    <div className={className}>
      <p className="text-[0.62rem] font-medium uppercase tracking-[0.28em] text-burgundy">{role}</p>
      <p className={`mt-2 font-script text-5xl leading-none sm:text-6xl ${nameClass}`}>{name}</p>
      <p className="mt-5 text-[0.62rem] font-medium uppercase tracking-[0.24em] text-burgundy">Parents</p>
      <p className="mt-2 font-serif text-xl leading-snug text-brown">
        {parents.map((line) => (
          <span key={line} className="block">{line}</span>
        ))}
      </p>
    </div>
  )
}
