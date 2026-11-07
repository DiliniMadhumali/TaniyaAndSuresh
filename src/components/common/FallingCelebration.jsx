import { useEffect, useState } from 'react'

const MAX_PIECES = 22
let nextId = 1

function reducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function random(min, max) {
  return min + Math.random() * (max - min)
}

function createPiece(origin, mode) {
  const roll = Math.random()
  const kind = roll > 0.88 ? 'sparkle' : roll > 0.46 ? 'petal' : 'heart'
  const fall = mode === 'ambient' || Math.random() > 0.5
  const tones = ['text-burgundy', 'text-gold', 'text-olive']

  return {
    id: nextId++,
    kind,
    fall,
    x: origin ? origin.x + random(-6, 6) : random(4, 96),
    y: origin ? origin.y : -8,
    size: random(11, kind === 'sparkle' ? 13 : 20),
    duration: fall ? random(8, 14) : random(2.6, 4.4),
    rotate: random(-50, 50),
    drift: random(-36, 36),
    opacity: random(0.35, 0.7),
    tone: tones[Math.floor(Math.random() * tones.length)],
  }
}

export default function FallingCelebration() {
  const [pieces, setPieces] = useState([])

  useEffect(() => {
    if (reducedMotion()) {
      return undefined
    }

    const add = (items) => {
      setPieces((current) => [...current, ...items].slice(-MAX_PIECES))
    }

    const ambient = window.setInterval(() => {
      if (document.hidden) {
        return
      }
      add([createPiece(null, 'ambient')])
    }, 900)

    const onPointerDown = (event) => {
      if (!(event.target instanceof Element)) {
        return
      }
      if (event.target.closest('a, button, input, textarea, select, label')) {
        return
      }
      add(
        Array.from({ length: 6 }, () =>
          createPiece(
            {
              x: (event.clientX / window.innerWidth) * 100,
              y: (event.clientY / window.innerHeight) * 100,
            },
            'burst',
          ),
        ),
      )
    }

    window.addEventListener('pointerdown', onPointerDown)
    return () => {
      window.clearInterval(ambient)
      window.removeEventListener('pointerdown', onPointerDown)
    }
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-20 overflow-hidden" aria-hidden="true">
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className={`absolute leading-none ${piece.tone} ${piece.fall ? 'drift-fall' : 'drift-rise'}`}
          style={{
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            fontSize: `${piece.size}px`,
            opacity: piece.opacity,
            animationDuration: `${piece.duration}s`,
            '--dx': `${piece.drift}px`,
            '--rot': `${piece.rotate}deg`,
          }}
          onAnimationEnd={() => {
            setPieces((current) => current.filter((item) => item.id !== piece.id))
          }}
        >
          {piece.kind === 'heart' ? '♥' : piece.kind === 'petal' ? '❀' : '✦'}
        </span>
      ))}
    </div>
  )
}
