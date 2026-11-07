import { useInvite } from '../../context/InviteContext.jsx'

export default function InviteNotice() {
  const { code, status, message } = useInvite()

  if (!code || status === 'idle' || status === 'loading' || status === 'ready' || !message) {
    return null
  }

  return (
    <p className="border-b border-gold/40 bg-burgundy px-4 py-3 text-center text-sm font-light text-ivory" role="status">
      {message}
    </p>
  )
}
