import { useState } from 'react'
import { events } from '../../data/weddingData.js'
import { ATTENDANCE_LABELS } from '../../lib/invitation.js'
import { submitRsvp } from '../../services/invitations.js'
import { useInvite } from '../../context/InviteContext.jsx'

const ceremony = events[0]
const reception = events[1]

export default function GuestRsvpForm() {
  const { code, guest, reload } = useInvite()
  const replied = guest.churchAttendance !== 'pending' && guest.receptionAttendance !== 'pending'
  const [editing, setEditing] = useState(!replied)
  const [church, setChurch] = useState(guest.churchAttendance === 'pending' ? '' : guest.churchAttendance)
  const [receptionChoice, setReceptionChoice] = useState(
    guest.receptionAttendance === 'pending' ? '' : guest.receptionAttendance,
  )
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function onSubmit(event) {
    event.preventDefault()
    if (!church || !receptionChoice) {
      setError('Please choose attending or not attending for both events.')
      return
    }

    setSaving(true)
    setError('')

    try {
      await submitRsvp(code, church, receptionChoice)
      await reload({ quiet: true })
      setEditing(false)
    } catch (submitError) {
      const known = [
        'Please choose attending or not attending for both events.',
        'Please wait a moment and try again.',
        'This invitation link is not recognised.',
      ]
      setError(known.includes(submitError.message) ? submitError.message : 'Your reply could not be saved. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (!editing) {
    return (
      <div className="mx-auto mt-10 max-w-xl border border-gold px-6 py-8 text-center">
        <p className="font-serif text-3xl text-ivory">Thank you, {guest.fullName}.</p>
        <p className="mt-4 text-sm font-light leading-relaxed text-ivory/80">Your reply has been saved. You can update it at any time.</p>
        <dl className="mt-6 space-y-2 text-sm text-ivory">
          <div>
            <dt className="text-[0.62rem] uppercase tracking-[0.22em] text-gold">Church ceremony</dt>
            <dd className="mt-1">{ATTENDANCE_LABELS[guest.churchAttendance]}</dd>
          </div>
          <div>
            <dt className="text-[0.62rem] uppercase tracking-[0.22em] text-gold">Wedding reception</dt>
            <dd className="mt-1">{ATTENDANCE_LABELS[guest.receptionAttendance]}</dd>
          </div>
        </dl>
        <button
          type="button"
          className="mt-8 inline-flex min-h-11 items-center justify-center border border-gold px-8 text-[0.68rem] uppercase tracking-[0.28em] text-ivory transition-colors hover:bg-ivory hover:text-burgundy"
          onClick={() => setEditing(true)}
        >
          Update your reply
        </button>
      </div>
    )
  }

  return (
    <form className="mx-auto mt-10 max-w-3xl" onSubmit={onSubmit}>
      <p className="text-center font-serif text-3xl text-ivory">Dear {guest.fullName}</p>
      <div className="mt-8 grid gap-6">
        <ChoiceGroup
          legend={`${ceremony.title} · ${ceremony.venue}`}
          name="church"
          value={church}
          onChange={setChurch}
        />
        <ChoiceGroup
          legend={`${reception.title} · ${reception.venue}`}
          name="reception"
          value={receptionChoice}
          onChange={setReceptionChoice}
        />
      </div>
      {error ? <p className="mt-6 text-center text-sm text-gold">{error}</p> : null}
      <div className="mt-8 text-center">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex min-h-11 items-center justify-center border border-gold px-10 text-[0.68rem] uppercase tracking-[0.28em] text-ivory transition-colors hover:bg-ivory hover:text-burgundy disabled:opacity-60"
        >
          {saving ? 'Saving…' : replied ? 'Update reply' : 'Send reply'}
        </button>
      </div>
    </form>
  )
}

function ChoiceGroup({ legend, name, value, onChange }) {
  return (
    <fieldset>
      <legend className="text-center font-serif text-2xl text-ivory">{legend}</legend>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {[
          ['attending', 'Attending'],
          ['not_attending', 'Not attending'],
        ].map(([option, label]) => (
          <label
            key={option}
            className={`flex min-h-16 cursor-pointer items-center justify-center border px-4 text-[0.72rem] uppercase tracking-[0.22em] ${
              value === option ? 'border-ivory bg-ivory text-burgundy' : 'border-gold text-ivory'
            }`}
          >
            <input
              className="sr-only"
              type="radio"
              name={name}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
            />
            {label}
          </label>
        ))}
      </div>
    </fieldset>
  )
}
