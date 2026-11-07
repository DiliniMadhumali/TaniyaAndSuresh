import { supabase, supabaseConfigured } from '../lib/supabase.js'

function toPublicGuest(row) {
  if (!row) {
    return null
  }

  if (row.outcome === 'rate_limited') {
    throw new Error('Please wait a moment and try again.')
  }

  if (row.outcome === 'validation') {
    throw new Error('Please choose attending or not attending for both events.')
  }

  if (row.outcome === 'invalid' || !row.full_name) {
    return null
  }

  return {
    fullName: row.full_name,
    churchAttendance: row.church_attendance,
    receptionAttendance: row.reception_attendance,
  }
}

export async function lookupInvitation(code) {
  if (!supabaseConfigured) {
    throw new Error('Supabase is not configured')
  }

  const { data, error } = await supabase.rpc('lookup_invitation', { code })
  if (error) {
    throw error
  }

  return toPublicGuest(Array.isArray(data) ? data[0] : data)
}

export async function submitRsvp(code, church, reception) {
  if (!supabaseConfigured) {
    throw new Error('Supabase is not configured')
  }

  const { data, error } = await supabase.rpc('submit_rsvp', { code, church, reception })
  if (error) {
    throw error
  }

  const guest = toPublicGuest(Array.isArray(data) ? data[0] : data)
  if (!guest) {
    throw new Error('This invitation link is not recognised.')
  }

  return guest
}
