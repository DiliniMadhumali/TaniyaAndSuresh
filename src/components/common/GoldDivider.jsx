export default function GoldDivider({ className = '' }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden="true">
      <span className="h-px w-12 bg-gold/80 sm:w-16" />
      <span className="h-1.5 w-1.5 rotate-45 border border-gold" />
      <span className="h-px w-12 bg-gold/80 sm:w-16" />
    </div>
  )
}
