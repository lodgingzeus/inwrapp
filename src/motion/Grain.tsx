import { useId } from 'react'

/** Static film grain over the slide so flat colour blocks don't look cheap. */
export function Grain({ opacity = 0.22 }: { opacity?: number }) {
  const id = `grain${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  return (
    <svg aria-hidden className="pointer-events-none absolute inset-0 z-10 h-full w-full mix-blend-overlay" style={{ opacity }}>
      <filter id={id}>
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#${id})`} />
    </svg>
  )
}
