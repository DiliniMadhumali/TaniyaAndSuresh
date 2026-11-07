export default function FloralSprig({ className = '' }) {
  return (
    <svg viewBox="0 0 84 84" className={className} fill="none" aria-hidden="true">
      <path d="M8 74c16-4 28-20 30-42" stroke="currentColor" strokeWidth="0.9" />
      <path d="M8 74c8-20 24-34 46-38" stroke="#C5A66A" strokeWidth="0.8" />
      <path d="M34 36c8 1 14 8 14 16" stroke="currentColor" strokeWidth="0.7" />
      <ellipse cx="34" cy="30" rx="8" ry="3.6" transform="rotate(-28 34 30)" stroke="currentColor" strokeWidth="0.8" />
      <ellipse cx="22" cy="46" rx="7" ry="3" transform="rotate(-55 22 46)" stroke="currentColor" strokeWidth="0.8" />
      <ellipse cx="46" cy="44" rx="6" ry="2.6" transform="rotate(18 46 44)" stroke="currentColor" strokeWidth="0.8" />
      <circle cx="50" cy="20" r="3" stroke="#8B3449" strokeWidth="0.8" />
      <circle cx="16" cy="62" r="1.7" stroke="#C5A66A" strokeWidth="0.8" />
    </svg>
  )
}
