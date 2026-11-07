import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { AdminBar } from '../../components/admin/AdminShell.jsx'
import { useAdminAuth } from '../../context/AdminAuthContext.jsx'

export default function AdminLogin() {
  const { configured, session, isAdmin, loading, signIn } = useAdminAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    document.title = 'Admin login · Taniya & Suresh'
  }, [])

  if (!loading && session && isAdmin) {
    return <Navigate to="/admin" replace />
  }

  async function onSubmit(event) {
    event.preventDefault()
    if (!email.trim() || !password) {
      setError('Enter your email and password.')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      await signIn(email, password)
    } catch (signInError) {
      setError(signInError.message)
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-ivory text-brown">
      <AdminBar />
      <main className="mx-auto flex max-w-md flex-col px-4 py-16">
        <p className="text-center text-[0.68rem] uppercase tracking-[0.28em] text-burgundy">Private</p>
        <h1 className="mt-3 text-center font-serif text-5xl text-brown">Admin login</h1>
        {loading ? (
          <p className="mt-8 text-center text-sm text-brown/70">Checking your session…</p>
        ) : !configured ? (
          <div className="mt-8 border border-gold/70 px-5 py-6 text-sm leading-relaxed">
            <p>Add your Supabase project URL and anon key to <span className="font-medium">.env</span>, then restart the site.</p>
            <p className="mt-3">Use the names in <span className="font-medium">.env.example</span>. Do not put the service role key in the website.</p>
          </div>
        ) : (
          <form className="mt-8 grid gap-4 border border-gold/70 px-5 py-6" onSubmit={onSubmit}>
            <label className="block text-sm">
              <span className="text-[0.62rem] uppercase tracking-[0.18em] text-burgundy">Email</span>
              <input className="admin-field mt-2" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} />
            </label>
            <label className="block text-sm">
              <span className="text-[0.62rem] uppercase tracking-[0.18em] text-burgundy">Password</span>
              <input className="admin-field mt-2" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} />
            </label>
            {error ? <p className="text-sm text-burgundy" role="alert">{error}</p> : null}
            <button type="submit" className="admin-button" disabled={submitting || loading}>
              {submitting ? 'Signing in…' : 'Log in'}
            </button>
          </form>
        )}
      </main>
    </div>
  )
}
