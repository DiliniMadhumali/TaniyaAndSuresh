import { useEffect, useMemo, useState } from 'react'
import { ATTENDANCE_LABELS, copyText, generateInvitationCode, invitationLink } from '../../lib/invitation.js'
import { createGuest, deleteGuest, listGuests, updateGuest } from '../../services/adminGuests.js'
import { AdminBar } from '../../components/admin/AdminShell.jsx'
import { useAdminAuth } from '../../context/AdminAuthContext.jsx'

const PAGE_SIZE = 8

const ATTENDANCE_FILTERS = [
  ['all', 'All'],
  ['pending', 'Pending'],
  ['attending', 'Attending'],
  ['not_attending', 'Not attending'],
]

export default function AdminDashboard() {
  const { session, signOut } = useAdminAuth()
  const [guests, setGuests] = useState([])
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState(null)
  const [query, setQuery] = useState('')
  const [churchFilter, setChurchFilter] = useState('all')
  const [receptionFilter, setReceptionFilter] = useState('all')
  const [invitationFilter, setInvitationFilter] = useState('all')
  const [sort, setSort] = useState('newest')
  const [loadError, setLoadError] = useState(false)
  const [page, setPage] = useState(0)
  const [dialog, setDialog] = useState(null)

  useEffect(() => {
    document.title = 'Admin · Taniya & Suresh'
  }, [])

  async function refresh() {
    setLoading(true)
    try {
      setGuests(await listGuests())
      setLoadError(false)
    } catch (error) {
      setLoadError(true)
      setNotice({ type: 'error', text: error.message || 'The guest list could not be loaded.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  useEffect(() => {
    setPage(0)
  }, [query, churchFilter, receptionFilter, invitationFilter, sort])

  const stats = useMemo(() => ({
    total: guests.length,
    church: guests.filter((guest) => guest.churchAttendance === 'attending').length,
    reception: guests.filter((guest) => guest.receptionAttendance === 'attending').length,
    pending: guests.filter((guest) => guest.churchAttendance === 'pending' || guest.receptionAttendance === 'pending').length,
    absent: guests.filter((guest) => guest.churchAttendance === 'not_attending' && guest.receptionAttendance === 'not_attending').length,
  }), [guests])

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase()
    const filtered = guests.filter((guest) => {
      const haystack = `${guest.fullName} ${guest.invitationCode}`.toLowerCase()
      return (!term || haystack.includes(term)) && matchesFilters(guest, churchFilter, receptionFilter, invitationFilter)
    })
    return filtered.sort((a, b) => compareGuests(a, b, sort))
  }, [guests, query, churchFilter, receptionFilter, invitationFilter, sort])

  const pages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE))
  const currentPage = Math.min(page, pages - 1)
  const rows = visible.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE)

  async function onSignOut() {
    try {
      await signOut()
    } catch (error) {
      setNotice({ type: 'error', text: error.message || 'Could not log out.' })
    }
  }

  async function onCopy(guest) {
    try {
      await copyText(invitationLink(guest.invitationCode))
      setNotice({ type: 'success', text: `Invitation link copied for ${guest.fullName}.` })
    } catch {
      setNotice({ type: 'error', text: 'The link could not be copied.' })
    }
  }

  async function onSave(input) {
    try {
      if (dialog.mode === 'edit') {
        await updateGuest(dialog.guest.id, input)
        setNotice({ type: 'success', text: 'Guest details were updated.' })
      } else {
        await createGuest(input)
        setNotice({ type: 'success', text: 'Guest added. A personal invitation link is ready to copy.' })
      }
      setDialog(null)
      await refresh()
    } catch (error) {
      const duplicate = error.code === '23505'
      throw new Error(duplicate ? 'That invitation code is already in use.' : error.message || 'The guest could not be saved.')
    }
  }

  async function onDelete(guest) {
    try {
      await deleteGuest(guest.id)
      setDialog(null)
      setNotice({ type: 'success', text: `${guest.fullName} was removed.` })
      await refresh()
    } catch (error) {
      setNotice({ type: 'error', text: error.message || 'The guest could not be removed.' })
    }
  }

  return (
    <div className="min-h-screen bg-ivory text-brown">
      <AdminBar email={session?.user?.email} onSignOut={onSignOut} />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.28em] text-burgundy">Guest book</p>
            <h1 className="mt-2 font-serif text-4xl text-brown sm:text-5xl">Admin dashboard</h1>
          </div>
          <button type="button" className="admin-button" onClick={() => setDialog({ mode: 'create' })}>
            Add guest
          </button>
        </div>

        {notice ? (
          <p className={`mt-6 border px-4 py-3 text-sm ${notice.type === 'error' ? 'border-burgundy text-burgundy' : 'border-olive text-olive'}`} role="status">
            {notice.text}
          </p>
        ) : null}

        <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Stat label="Total guests" value={stats.total} />
          <Stat label="Church confirmed" value={stats.church} />
          <Stat label="Reception confirmed" value={stats.reception} />
          <Stat label="Pending RSVPs" value={stats.pending} />
          <Stat label="Not attending" value={stats.absent} />
        </section>

        <section className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <label className="block text-sm xl:col-span-1">
            <span className="text-[0.62rem] uppercase tracking-[0.18em] text-burgundy">Search</span>
            <input
              className="admin-field mt-2"
              value={query}
              placeholder="Name or invitation code"
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <FilterSelect label="Church RSVP" value={churchFilter} onChange={setChurchFilter} options={ATTENDANCE_FILTERS} />
          <FilterSelect label="Reception RSVP" value={receptionFilter} onChange={setReceptionFilter} options={ATTENDANCE_FILTERS} />
          <FilterSelect
            label="Invitation status"
            value={invitationFilter}
            onChange={setInvitationFilter}
            options={[
              ['all', 'All'],
              ['sent', 'Sent'],
              ['not_sent', 'Not sent'],
            ]}
          />
          <label className="block text-sm">
            <span className="text-[0.62rem] uppercase tracking-[0.18em] text-burgundy">Sort</span>
            <select className="admin-field mt-2" value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="newest">Newest</option>
              <option value="name">Name A–Z</option>
              <option value="name-desc">Name Z–A</option>
              <option value="church">Church RSVP</option>
              <option value="reception">Reception RSVP</option>
            </select>
          </label>
        </section>

        {loading && guests.length === 0 ? <p className="mt-10 text-center text-sm text-brown/70">Loading guests…</p> : null}
        {loading && guests.length > 0 ? <p className="mt-4 text-sm text-brown/70">Refreshing guests…</p> : null}

        {!loading && loadError && guests.length === 0 ? (
          <p className="mt-10 border border-burgundy/40 px-4 py-10 text-center text-sm text-burgundy">The guest list could not be loaded.</p>
        ) : null}

        {!loading && !loadError && rows.length === 0 ? (
          <p className="mt-10 border border-gold/50 px-4 py-10 text-center text-sm text-brown/80">No guests match this view.</p>
        ) : null}

        {rows.length > 0 ? (
          <>
            <div className="mt-6 hidden overflow-x-auto md:block">
              <table className="w-full min-w-[860px] border-collapse text-left text-sm">
                <thead className="text-[0.62rem] uppercase tracking-[0.16em] text-burgundy">
                  <tr className="border-b border-gold/50">
                    <th className="px-3 py-3 font-medium">Guest</th>
                    <th className="px-3 py-3 font-medium">Code</th>
                    <th className="px-3 py-3 font-medium">Phone</th>
                    <th className="px-3 py-3 font-medium">Invited events</th>
                    <th className="px-3 py-3 font-medium">Church</th>
                    <th className="px-3 py-3 font-medium">Reception</th>
                    <th className="px-3 py-3 font-medium">Invitation</th>
                    <th className="px-3 py-3 font-medium">Created</th>
                    <th className="px-3 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((guest) => (
                    <tr key={guest.id} className="border-b border-gold/30">
                      <td className="px-3 py-4 font-medium">{guest.fullName}</td>
                      <td className="px-3 py-4 tracking-wide">{guest.invitationCode}</td>
                      <td className="px-3 py-4">{guest.phoneNumber || '—'}</td>
                      <td className="px-3 py-4">{describeInvitationPermissions(guest)}</td>
                      <td className="px-3 py-4">{ATTENDANCE_LABELS[guest.churchAttendance]}</td>
                      <td className="px-3 py-4">{ATTENDANCE_LABELS[guest.receptionAttendance]}</td>
                      <td className="px-3 py-4">{guest.invitationSent ? 'Sent' : 'Not sent'}</td>
                      <td className="px-3 py-4">{formatDate(guest.createdAt)}</td>
                      <td className="px-3 py-4">
                        <RowActions guest={guest} onOpen={setDialog} onCopy={onCopy} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 grid gap-3 md:hidden">
              {rows.map((guest) => (
                <article key={guest.id} className="border border-gold/60 p-4">
                  <h2 className="font-serif text-2xl">{guest.fullName}</h2>
                  <p className="mt-1 text-xs tracking-[0.16em] text-burgundy">{guest.invitationCode}</p>
                  <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <Detail label="Phone" value={guest.phoneNumber || '—'} />
                    <Detail label="Church" value={ATTENDANCE_LABELS[guest.churchAttendance]} />
                    <Detail label="Reception" value={ATTENDANCE_LABELS[guest.receptionAttendance]} />
                    <Detail label="Invitation" value={guest.invitationSent ? 'Sent' : 'Not sent'} />
                    <Detail label="Created" value={formatDate(guest.createdAt)} />
                  </dl>
                  <div className="mt-4">
                    <RowActions guest={guest} onOpen={setDialog} onCopy={onCopy} />
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : null}

        {visible.length > PAGE_SIZE ? (
          <div className="mt-6 flex items-center justify-between text-sm">
            <button type="button" className="admin-button" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>
              Previous
            </button>
            <p>
              {currentPage + 1} / {pages}
            </p>
            <button type="button" className="admin-button" disabled={currentPage + 1 >= pages} onClick={() => setPage(currentPage + 1)}>
              Next
            </button>
          </div>
        ) : null}
      </main>

      {dialog?.mode === 'view' ? (
        <GuestDetails guest={dialog.guest} onClose={() => setDialog(null)} onCopy={onCopy} />
      ) : null}
      {dialog?.mode === 'create' || dialog?.mode === 'edit' ? (
        <GuestEditor guest={dialog.guest} onClose={() => setDialog(null)} onSave={onSave} />
      ) : null}
      {dialog?.mode === 'delete' ? (
        <ConfirmDelete guest={dialog.guest} onClose={() => setDialog(null)} onConfirm={onDelete} />
      ) : null}
    </div>
  )
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <label className="block text-sm">
      <span className="text-[0.62rem] uppercase tracking-[0.18em] text-burgundy">{label}</span>
      <select className="admin-field mt-2" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map(([option, text]) => (
          <option key={option} value={option}>{text}</option>
        ))}
      </select>
    </label>
  )
}

function Stat({ label, value }) {
  return (
    <article className="border border-gold/70 px-4 py-4">
      <p className="text-[0.62rem] uppercase tracking-[0.16em] text-burgundy">{label}</p>
      <p className="mt-2 font-serif text-4xl text-brown">{value}</p>
    </article>
  )
}

function Detail({ label, value }) {
  return (
    <div>
      <dt className="text-[0.62rem] uppercase tracking-[0.16em] text-burgundy">{label}</dt>
      <dd className="mt-1">{value}</dd>
    </div>
  )
}

function RowActions({ guest, onOpen, onCopy }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" className="admin-text" onClick={() => onOpen({ mode: 'view', guest })}>View</button>
      <button type="button" className="admin-text" onClick={() => onOpen({ mode: 'edit', guest })}>Edit</button>
      <button type="button" className="admin-text" onClick={() => onCopy(guest)}>Copy link</button>
      <button type="button" className="admin-text" onClick={() => onOpen({ mode: 'delete', guest })}>Delete</button>
    </div>
  )
}

function GuestDetails({ guest, onClose, onCopy }) {
  const link = invitationLink(guest.invitationCode)
  return (
    <Dialog title={guest.fullName} onClose={onClose}>
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <Detail label="Invitation code" value={guest.invitationCode} />
        <Detail label="Phone" value={guest.phoneNumber || '—'} />
        <Detail label="Email" value={guest.email || '—'} />
        <Detail label="Category" value={guest.guestCategory || '—'} />
        <Detail label="Invited events" value={describeInvitationPermissions(guest)} />
        <Detail label="Church RSVP" value={ATTENDANCE_LABELS[guest.churchAttendance]} />
        <Detail label="Reception RSVP" value={ATTENDANCE_LABELS[guest.receptionAttendance]} />
        <Detail label="Invitation" value={guest.invitationSent ? 'Sent' : 'Not sent'} />
        <Detail label="Created" value={formatDate(guest.createdAt)} />
      </dl>
      <p className="mt-4 break-all text-sm text-brown/80">{link}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" className="admin-button" onClick={() => onCopy(guest)}>Copy invitation link</button>
        <button type="button" className="admin-button" onClick={onClose}>Close</button>
      </div>
    </Dialog>
  )
}

function GuestEditor({ guest, onClose, onSave }) {
  const [form, setForm] = useState(() => guest ? { ...guest } : emptyGuest())
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function updateInvitationMode(mode) {
    const church = mode === 'church' || mode === 'both'
    const reception = mode === 'reception' || mode === 'both'
    setForm((current) => ({
      ...current,
      invitedToChurch: church,
      invitedToReception: reception,
    }))
  }

  async function onSubmit(event) {
    event.preventDefault()
    const problem = validateGuest(form)
    if (problem) {
      setError(problem)
      return
    }
    setSaving(true)
    setError('')
    try {
      await onSave({ ...form, invitationCode: form.invitationCode.toUpperCase() })
    } catch (saveError) {
      setError(saveError.message)
      setSaving(false)
    }
  }

  const invitationMode = getInvitationMode(form.invitedToChurch, form.invitedToReception)

  return (
    <Dialog title={guest ? 'Edit guest' : 'Add guest'} onClose={onClose}>
      <form className="grid gap-4" onSubmit={onSubmit}>
        <Field label="Full name" value={form.fullName} onChange={(value) => update('fullName', value)} required />
        <div className="grid gap-2">
          <Field label="Invitation code" value={form.invitationCode} onChange={(value) => update('invitationCode', value.toUpperCase())} required />
          <button type="button" className="admin-text justify-self-start" onClick={() => update('invitationCode', generateInvitationCode())}>
            Generate a new code
          </button>
        </div>
        <Field label="Phone number" value={form.phoneNumber} onChange={(value) => update('phoneNumber', value)} />
        <Field label="Email" type="email" value={form.email} onChange={(value) => update('email', value)} />
        <Field label="Guest category" value={form.guestCategory} onChange={(value) => update('guestCategory', value)} />
        <label className="block text-sm">
          <span className="text-[0.62rem] uppercase tracking-[0.18em] text-burgundy">Invited events</span>
          <select
            className="admin-field mt-2"
            value={invitationMode}
            onChange={(event) => updateInvitationMode(event.target.value)}
          >
            <option value="both">Both Church and Reception</option>
            <option value="church">Church only</option>
            <option value="reception">Reception only</option>
          </select>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Church RSVP" value={form.churchAttendance} onChange={(value) => update('churchAttendance', value)} />
          <Select label="Reception RSVP" value={form.receptionAttendance} onChange={(value) => update('receptionAttendance', value)} />
        </div>
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" checked={form.invitationSent} onChange={(event) => update('invitationSent', event.target.checked)} />
          Invitation sent
        </label>
        {error ? <p className="text-sm text-burgundy">{error}</p> : null}
        <div className="flex justify-end gap-3">
          <button type="button" className="admin-button" onClick={onClose}>Cancel</button>
          <button type="submit" className="admin-button" disabled={saving}>{saving ? 'Saving…' : 'Save guest'}</button>
        </div>
      </form>
    </Dialog>
  )
}

function ConfirmDelete({ guest, onClose, onConfirm }) {
  const [saving, setSaving] = useState(false)

  return (
    <Dialog title="Remove guest" onClose={onClose}>
      <p className="text-sm leading-relaxed">
        Remove {guest.fullName} and their invitation code? This cannot be undone.
      </p>
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" className="admin-button" onClick={onClose}>Cancel</button>
        <button
          type="button"
          className="admin-button"
          disabled={saving}
          onClick={async () => {
            setSaving(true)
            await onConfirm(guest)
            setSaving(false)
          }}
        >
          {saving ? 'Removing…' : 'Delete guest'}
        </button>
      </div>
    </Dialog>
  )
}

function Dialog({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-brown/40 p-4 sm:items-center" role="presentation" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto border border-gold bg-ivory p-5 sm:p-7"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="font-serif text-3xl text-burgundy">{title}</h2>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', required = false }) {
  return (
    <label className="block text-sm">
      <span className="text-[0.62rem] uppercase tracking-[0.18em] text-burgundy">{label}</span>
      <input className="admin-field mt-2" type={type} value={value} required={required} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}

function Select({ label, value, onChange }) {
  return (
    <label className="block text-sm">
      <span className="text-[0.62rem] uppercase tracking-[0.18em] text-burgundy">{label}</span>
      <select className="admin-field mt-2" value={value} onChange={(event) => onChange(event.target.value)}>
        {Object.entries(ATTENDANCE_LABELS).map(([option, text]) => (
          <option key={option} value={option}>{text}</option>
        ))}
      </select>
    </label>
  )
}

function emptyGuest() {
  return {
    fullName: '',
    invitationCode: generateInvitationCode(),
    phoneNumber: '',
    email: '',
    guestCategory: '',
    invitedToChurch: true,
    invitedToReception: true,
    churchAttendance: 'pending',
    receptionAttendance: 'pending',
    invitationSent: false,
  }
}

function getInvitationMode(invitedToChurch, invitedToReception) {
  if (invitedToChurch && invitedToReception) return 'both'
  if (invitedToChurch) return 'church'
  if (invitedToReception) return 'reception'
  return 'both'
}

function describeInvitationPermissions(guest) {
  const church = guest.invitedToChurch ?? true
  const reception = guest.invitedToReception ?? true
  if (church && reception) return 'Church + reception'
  if (church) return 'Church only'
  if (reception) return 'Reception only'
  return 'No events'
}

function validateGuest(form) {
  if (form.fullName.trim().length < 2 || form.fullName.trim().length > 120) {
    return 'Enter the guest’s full name, using 2 to 120 characters.'
  }
  if (!/^[A-Z0-9]{6,16}$/.test(form.invitationCode.trim().toUpperCase())) {
    return 'The invitation code must be 6 to 16 letters or numbers.'
  }
  if (form.phoneNumber.trim().length > 40) {
    return 'The phone number must be 40 characters or fewer.'
  }
  if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    return 'Enter a valid email address, or leave it blank.'
  }
  if (form.guestCategory.trim().length > 80) {
    return 'The guest category must be 80 characters or fewer.'
  }
  if (!['pending', 'attending', 'not_attending'].includes(form.churchAttendance)) {
    return 'Choose a church attendance status.'
  }
  if (!['pending', 'attending', 'not_attending'].includes(form.receptionAttendance)) {
    return 'Choose a reception attendance status.'
  }
  if (!form.invitedToChurch && !form.invitedToReception) {
    return 'Choose at least one invited event.'
  }
  return ''
}

function matchesFilters(guest, churchFilter, receptionFilter, invitationFilter) {
  if (churchFilter !== 'all' && guest.churchAttendance !== churchFilter) {
    return false
  }
  if (receptionFilter !== 'all' && guest.receptionAttendance !== receptionFilter) {
    return false
  }
  if (invitationFilter === 'sent' && !guest.invitationSent) {
    return false
  }
  if (invitationFilter === 'not_sent' && guest.invitationSent) {
    return false
  }
  return true
}

function compareGuests(a, b, sort) {
  if (sort === 'name') return a.fullName.localeCompare(b.fullName)
  if (sort === 'name-desc') return b.fullName.localeCompare(a.fullName)
  if (sort === 'church') return a.churchAttendance.localeCompare(b.churchAttendance) || a.fullName.localeCompare(b.fullName)
  if (sort === 'reception') return a.receptionAttendance.localeCompare(b.receptionAttendance) || a.fullName.localeCompare(b.fullName)
  return new Date(b.createdAt) - new Date(a.createdAt)
}

function formatDate(iso) {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso))
}
