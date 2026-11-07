export default function AdminShell({ children }) {
  return <div className="min-h-screen bg-ivory text-brown">{children}</div>
}

export function AdminBar({ email, onSignOut }) {
  return (
    <header className="border-b border-gold/40 bg-ivory">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <p className="font-script text-3xl leading-none text-burgundy">T & S</p>
        <div className="flex items-center gap-4">
          {email ? <p className="hidden text-xs tracking-wide text-brown/80 sm:block">{email}</p> : null}
          {onSignOut ? (
            <button
              type="button"
              className="text-[0.68rem] uppercase tracking-[0.22em] text-burgundy"
              onClick={onSignOut}
            >
              Log out
            </button>
          ) : null}
        </div>
      </div>
    </header>
  )
}
