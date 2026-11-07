import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabaseConfigured } from '../lib/supabase.js'
import { lookupInvitation } from '../services/invitations.js'

const InviteContext = createContext(null)

export function InviteProvider({ children }) {
  const [params] = useSearchParams()
  const code = params.get('invite')?.trim() ?? ''
  const [state, setState] = useState({ status: 'idle', guest: null, message: '' })

  const reload = useCallback(async ({ quiet = false } = {}) => {
    if (!code) {
      setState({ status: 'idle', guest: null, message: '' })
      return
    }

    if (!supabaseConfigured) {
      setState({
        status: 'unconfigured',
        guest: null,
        message: 'Personal invitations are not available until the site is connected.',
      })
      return
    }

    if (!quiet) {
      setState({ status: 'loading', guest: null, message: '' })
    }

    try {
      const guest = await lookupInvitation(code)
      if (!guest) {
        setState({
          status: 'invalid',
          guest: null,
          message: 'This invitation link is not recognised. Please open the personal link you were sent, or contact Taniya or Menuka.',
        })
        return
      }

      setState({ status: 'ready', guest, message: '' })
    } catch (error) {
      const limited = error?.message === 'Please wait a moment and try again.'
      setState({
        status: 'error',
        guest: null,
        message: limited
          ? 'Please wait a moment and try this invitation link again.'
          : 'We could not open this invitation just now. Please try the link again in a moment.',
      })
    }
  }, [code])

  useEffect(() => {
    reload()
  }, [reload])

  const value = useMemo(() => ({ code, ...state, reload }), [code, reload, state])

  return <InviteContext.Provider value={value}>{children}</InviteContext.Provider>
}

export function useInvite() {
  const value = useContext(InviteContext)
  if (!value) {
    throw new Error('useInvite must be used within InviteProvider')
  }
  return value
}
