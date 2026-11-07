const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export const ATTENDANCE_LABELS = {
  pending: 'Pending',
  attending: 'Attending',
  not_attending: 'Not attending',
}

export function generateInvitationCode(length = 8) {
  const values = crypto.getRandomValues(new Uint32Array(length))
  return Array.from(values, (value) => ALPHABET[value % ALPHABET.length]).join('')
}

export function invitationLink(code) {
  const url = new URL(window.location.origin)
  url.searchParams.set('invite', code)
  return url.toString()
}

export function withInvite(to, code) {
  if (!code) {
    return to
  }

  const hashIndex = to.indexOf('#')
  const hash = hashIndex >= 0 ? to.slice(hashIndex) : ''
  const beforeHash = hashIndex >= 0 ? to.slice(0, hashIndex) : to
  const [path, query = ''] = beforeHash.split('?')
  const params = new URLSearchParams(query)
  params.set('invite', code)
  return `${path}?${params.toString()}${hash}`
}

export async function copyText(value) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value)
    return
  }

  const field = document.createElement('textarea')
  field.value = value
  field.setAttribute('readonly', '')
  field.style.position = 'fixed'
  field.style.left = '-9999px'
  document.body.appendChild(field)
  field.select()
  document.execCommand('copy')
  field.remove()
}
