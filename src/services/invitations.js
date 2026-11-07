import { supabase, supabaseConfigured } from '../lib/supabase.js'

function toPublicGuest(row) {
  if (!row) {
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

  return toPublicGuest(Array.isArray(data) ? data[0] : data)
}
