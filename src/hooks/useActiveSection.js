import { useEffect, useState } from 'react'

export default function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0] ?? '')
  const sectionKey = ids.join('|')

  useEffect(() => {
    const elements = sectionKey
      .split('|')
      .filter(Boolean)
      .map((id) => document.getElementById(id))
      .filter(Boolean)

    if (!elements.length) {
      return undefined
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

        if (visible?.target?.id) {
          setActive(visible.target.id)
        }
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5] },
    )

    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [sectionKey])

  return active
}
