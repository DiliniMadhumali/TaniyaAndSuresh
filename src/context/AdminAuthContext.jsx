import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase, supabaseConfigured } from '../lib/supabase.js'

const AdminAuthContext = createContext(null)

async function userIsAdmin(userId) {
  const { data, error } = await supabase.from('admin_users').select('id').eq('user_id', userId).maybeSingle()
  if (error) {
    throw new Error('The admin list could not be checked. Confirm the database migration has been run.')
  }
  return Boolean(data)
}

export function AdminAuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(supabaseConfigured)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return undefined
    }

    let active = true

    async function applySession(nextSession) {
      if (!nextSession) {
        if (active) {
          setSession(null)
          setIsAdmin(false)
          setLoading(false)
        }
        return
      }

      try {
        const allowed = await userIsAdmin(nextSession.user.id)
        if (!active) {
          return
        }

        if (!allowed) {
          setSession(null)
          setIsAdmin(false)
          setLoading(false)
          await supabase.auth.signOut()
          return
        }

        setSession(nextSession)
        setIsAdmin(true)
        setLoading(false)
      } catch {
        if (active) {
          setSession(null)
          setIsAdmin(false)
          setLoading(false)
        }
      }
    }

    supabase.auth.getSession().then(({ data }) => {
      if (active) {
        applySession(data.session)
      }
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      // Defer so this does not run inside the Supabase auth lock.
      setTimeout(() => {
        if (active) {
          applySession(nextSession)
        }
      }, 0)
    })

    return () => {
      active = false
      subscription.subscription.unsubscribe()
    }
  }, [])

  async function signIn(email, password) {
    if (!supabase) {
      throw new Error('Add the Supabase URL and anon key to .env before signing in.')
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (error) {
      if (error.message.toLowerCase().includes('invalid login')) {
        throw new Error('The email or password is incorrect.')
      }
      throw new Error(error.message)
    }

    const allowed = await userIsAdmin(data.user.id)
    if (!allowed) {
      await supabase.auth.signOut()
      throw new Error('This account is not authorised to manage the guest list.')
    }
  }

  async function signOut() {
    if (!supabase) {
      return
    }
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw new Error(error.message)
    }
  }

  const value = useMemo(
    () => ({ session, isAdmin, loading, configured: supabaseConfigured, signIn, signOut }),
    [session, isAdmin, loading],
  )

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth() {
  const value = useContext(AdminAuthContext)
  if (!value) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider')
  }
  return value
}
