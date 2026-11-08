import type { CSSProperties } from 'react'
import type { CardSpec } from './cards'

/** A 9:16 story-slide preview with a soft colour swirl behind it. */
export default function StoryCard({ spec, className = '', style }: { spec: CardSpec; className?: string; style?: CSSProperties }) {
  const ink = spec.dark ? 'text-[#1d1d1f]' : 'text-white'
  const muted = spec.dark ? 'text-black/50' : 'text-white/65'
  const bar = spec.dark ? 'bg-black' : 'bg-white'

  return (
    <div
      className={`relative aspect-[9/16] w-[var(--card-w)] shrink-0 overflow-hidden rounded-[calc(var(--card-w)*0.085)] shadow-[0_28px_40px_-24px_rgb(0_0_0/0.35)] ${ink} ${className}`}
      style={{ background: spec.base, ...style }}
    >
      {/* the swirl: blurred discs of colour */}
      <div aria-hidden="true" className="absolute inset-0">
        {spec.blobs.map((b, i) => (
          <span
            key={i}
            className="absolute rounded-full blur-[calc(var(--card-w)*0.14)]"
            style={{ background: b.color, left: b.x, top: b.y, width: b.size, height: b.size, transform: 'translate(-50%,-50%)' }}
          />
        ))}
      </div>

      <div className="relative flex h-full flex-col p-[calc(var(--card-w)*0.07)]">
        <div className="flex gap-1" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className={`h-[2px] flex-1 rounded-full ${bar} ${i <= spec.step ? 'opacity-90' : 'opacity-25'}`} />
          ))}
        </div>
        <p className={`mt-[calc(var(--card-w)*0.07)] font-mono text-[calc(var(--card-w)*0.048)] tracking-wide uppercase ${muted}`}>
          {spec.eyebrow}
        </p>
        <div className="mt-auto">
          <p className="text-[calc(var(--card-w)*0.19)] leading-[0.95] font-light tracking-[-0.04em]">{spec.value}</p>
          <p className={`mt-[calc(var(--card-w)*0.025)] text-[calc(var(--card-w)*0.062)] font-light ${muted}`}>{spec.label}</p>
        </div>
      </div>
    </div>
  )
}
