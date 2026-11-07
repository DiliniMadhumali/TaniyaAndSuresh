import { useEffect, useRef, useState } from 'react'

// Soft piano pavane, CC0: Thoinot Arbeau, performed by Membeth.
// https://commons.wikimedia.org/wiki/File:Pavane.Thoinot.Arbeau.meantone.temperament.ogg
const TRACK = '/audio/wedding-music.mp3'
const SOFT_VOLUME = 0.28

export default function MusicToggle() {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) {
      return undefined
    }

    audio.volume = SOFT_VOLUME

    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onError = () => setMissing(true)

    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('error', onError)

    return () => {
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('error', onError)
    }
  }, [])

  function toggle() {
    const audio = audioRef.current
    if (!audio || missing) {
      return
    }

    if (audio.paused) {
      audio.volume = SOFT_VOLUME
      audio.play().catch(() => {})
      return
    }

    audio.pause()
  }

  return (
    <>
      <audio ref={audioRef} src={TRACK} loop preload="none" />
      <button
        type="button"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={toggle}
        aria-pressed={playing}
        aria-label={playing ? 'Pause wedding music' : 'Play wedding music'}
        title={missing ? 'Add public/audio/wedding-music.mp3' : undefined}
        className={`fixed right-3 top-[4.75rem] z-50 inline-flex h-12 w-12 items-center justify-center rounded-full border border-gold bg-ivory text-burgundy transition-colors hover:bg-gold hover:text-brown ${
          playing ? 'music-live' : ''
        }`}
      >
        {playing ? <PauseIcon /> : <NoteIcon />}
      </button>
    </>
  )
}

function NoteIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M9 18a3 3 0 1 1-2-2.83V6l10-2v8" />
      <circle cx="17" cy="14" r="2.2" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <rect x="7" y="5" width="3.2" height="14" />
      <rect x="13.8" y="5" width="3.2" height="14" />
    </svg>
  )
}
