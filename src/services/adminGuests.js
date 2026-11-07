import { generateInvitationCode } from '../lib/invitation.js'
import { supabase } from '../lib/supabase.js'

function emptyToNull(value) {
  const trimmed = value?.trim() ?? ''
  return trimmed ? trimmed : null
}

export function toGuest(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    invitationCode: row.invitation_code,
    phoneNumber: row.phone_number ?? '',
    email: row.email ?? '',
    guestCategory: row.guest_category ?? '',
    churchAttendance: row.church_attendance,
    receptionAttendance: row.reception_attendance,
    invitationSent: row.invitation_sent,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function toRow(input) {
  return {
    full_name: input.fullName.trim(),
    invitation_code: input.invitationCode.trim().toUpperCase(),
    phone_number: emptyToNull(input.phoneNumber),
    email: emptyToNull(input.email),
    guest_category: emptyToNull(input.guestCategory),
    church_attendance: input.churchAttendance,
    reception_attendance: input.receptionAttendance,
    invitation_sent: Boolean(input.invitationSent),
  }
}

export async function listGuests() {
  const { data, error } = await supabase.from('guests').select('*').order('created_at', { ascending: false })
  if (error) {
    throw error
  }
  return data.map(toGuest)
}

export async function createGuest(input) {
  let attempt = { ...input }

  for (let tryNumber = 0; tryNumber < 5; tryNumber += 1) {
    const { data, error } = await supabase.from('guests').insert(toRow(attempt)).select('*').single()
    if (!error) {
      return toGuest(data)
    }
    if (error.code !== '23505' || tryNumber === 4) {
      throw error
    }
    attempt = { ...attempt, invitationCode: generateInvitationCode() }
  }

  throw new Error('Could not create a unique invitation code')
}

export async function updateGuest(id, input) {
  const { data, error } = await supabase.from('guests').update(toRow(input)).eq('id', id).select('*').single()
  if (error) {
    throw error
  }
  return toGuest(data)
}

export async function deleteGuest(id) {
  const { error } = await supabase.from('guests').delete().eq('id', id)
  if (error) {
    throw error
  }
}
