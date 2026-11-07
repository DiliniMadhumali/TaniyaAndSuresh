import GoldDivider from './GoldDivider.jsx'

export default function SectionHeading({ eyebrow, title, children, light = false }) {
  return (
    <header className="mx-auto max-w-2xl text-center">
      {eyebrow ? (
        <p className={`text-[0.68rem] font-medium uppercase tracking-[0.34em] ${light ? 'text-ivory' : 'text-burgundy'}`}>{eyebrow}</p>
      ) : null}
      <h2
        className={`mt-3 font-serif text-4xl font-medium leading-tight sm:text-5xl ${
          light ? 'text-ivory' : 'text-espresso'
        }`}
      >
        {title}
      </h2>
      <GoldDivider className="mt-6" />
      {children ? (
        <p
          className={`mt-6 text-sm font-light leading-relaxed sm:text-base ${
            light ? 'text-ivory/80' : 'text-brown/80'
          }`}
        >
          {children}
        </p>
      ) : null}
    </header>
  )
}
