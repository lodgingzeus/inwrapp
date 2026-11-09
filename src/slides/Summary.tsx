import { useRef, useState, type PointerEvent } from 'react'
import { createPortal } from 'react-dom'
import { gsap, useSceneTimeline } from '../motion'
import { saveImage, STORY_H, STORY_W } from '../share/toImage'
import { useStory } from '../story/context'
import { fitCqw } from './fit'
import type { PosterItem } from './poster'

export interface SummaryProps {
  items: PosterItem[]
  username: string | null
  year: number
}

const LIME = 'var(--color-lime)'
const INK = 'var(--color-ink)'
const BONE = 'var(--color-bone)'

const chars = (s: string) => [...s].length

/**
 * The poster itself. Static markup sized in its own container units, so the
 * same component renders on screen and, off screen, at exactly 1080×1920 for the PNG.
 */
export function PosterArt({ items, username, year }: SummaryProps) {
  const [hero, ...rest] = items
  return (
    <div className="relative h-full w-full overflow-hidden" style={{ containerType: 'size', background: LIME, color: INK }}>
      <div
        data-p-circle
        className="absolute rounded-full"
        style={{ width: '48cqw', height: '48cqw', right: '-13cqw', top: '-13cqw', background: INK }}
      />
      <p data-p-fade className="absolute top-[11cqw] right-[8cqw] font-mono text-[4cqw] font-medium" style={{ color: LIME }}>
        {year}
      </p>

      <div className="absolute top-[7cqw] left-[7cqw]">
        <p data-p-rise className="text-[15cqw] leading-[0.85] font-extrabold tracking-[-0.03em]" style={{ fontStretch: '78%' }}>
          inwrap
        </p>
        <p data-p-fade className="mt-[2.4cqw] font-mono text-[3.3cqw] uppercase tracking-[0.16em]">
          {username ? `@${username}` : 'my year on the grid'}
        </p>
      </div>

      <div data-p-rise className="absolute top-[19cqh] left-[7cqw]">
        <p className="text-[10.5cqw] leading-[0.95] font-bold tracking-[-0.03em]">My year,</p>
        <p className="font-serif text-[14cqw] leading-[0.95] italic">unfiltered.</p>
      </div>

      {hero && (
        <div data-p-cell className="absolute inset-x-[7cqw] top-[39cqh] border-t-[0.6cqw] pt-[2.6cqw]" style={{ borderColor: INK }}>
          <p className="font-mono text-[3.2cqw] uppercase tracking-[0.16em]">{hero.label}</p>
          <p
            className="mt-[1cqw] leading-[0.9] font-extrabold tracking-[-0.045em] whitespace-nowrap"
            style={{ fontSize: fitCqw(chars(hero.value), 27, 86, 0.56) }}
          >
            {hero.value}
          </p>
        </div>
      )}

      <div className="absolute inset-x-[7cqw] top-[61cqh] grid grid-cols-2 gap-x-[6cqw] gap-y-[5cqw]">
        {rest.map((item) => (
          <div key={item.label} data-p-cell className="min-w-0 border-t-[0.6cqw] pt-[2.4cqw]" style={{ borderColor: INK }}>
            <p className="font-mono text-[2.9cqw] uppercase tracking-[0.14em]">{item.label}</p>
            {/* Long names wrap onto a second line rather than shrinking to nothing. */}
            <p
              className="mt-[1cqw] leading-[1] font-bold tracking-[-0.03em] text-balance [overflow-wrap:anywhere]"
              style={{ fontSize: `max(6.4cqw, ${fitCqw(chars(item.value), 10, 40, 0.58)})` }}
            >
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div
        data-p-fade
        className="absolute inset-x-0 bottom-0 flex items-center justify-between px-[7cqw] py-[4.5cqw] font-mono text-[2.9cqw] uppercase tracking-[0.16em]"
        style={{ background: INK, color: LIME }}
      >
        <span>Counted on my own device</span>
        <span>inwrap</span>
      </div>
    </div>
  )
}

// Buttons sit on top of the story's tap zones, so presses must not reach them.
const stop = (e: PointerEvent) => e.stopPropagation()

type SaveState = 'idle' | 'saving' | 'saved' | 'failed'

const SAVE_LABEL: Record<SaveState, string> = {
  idle: 'Save image',
  saving: 'Making it…',
  saved: 'Saved',
  failed: 'Try again',
}

export function Summary(props: SummaryProps) {
  const { exit } = useStory()
  const scene = useRef<HTMLDivElement>(null)
  const exportNode = useRef<HTMLDivElement>(null)
  const [save, setSave] = useState<SaveState>('idle')

  useSceneTimeline(scene, (tl, el) => {
    const q = gsap.utils.selector(el)
    tl.from(q('[data-poster]'), { yPercent: 22, rotation: -7, scale: 0.84, opacity: 0, duration: 1.1, ease: 'expo.out' }, 0.15)
      .from(q('[data-p-circle]'), { scale: 0, duration: 1.1, ease: 'elastic.out(1, 0.55)' }, 0.55)
      .from(q('[data-p-rise]'), { yPercent: 60, opacity: 0, duration: 0.8, ease: 'expo.out', stagger: 0.15 }, 0.7)
      .from(q('[data-p-cell]'), { yPercent: 50, opacity: 0, duration: 0.7, ease: 'back.out(1.6)', stagger: 0.12 }, 1.1)
      .from(q('[data-p-fade]'), { opacity: 0, duration: 0.6 }, 1.3)
      .from(q('[data-actions]'), { yPercent: 60, opacity: 0, duration: 0.7, ease: 'expo.out' }, 2)
  })

  async function onSave() {
    const node = exportNode.current
    if (!node || save === 'saving') return
    setSave('saving')
    try {
      const outcome = await saveImage(node, `inwrap-${props.year}.png`)
      setSave(outcome === 'cancelled' ? 'idle' : 'saved')
    } catch {
      setSave('failed')
    }
  }

  return (
    <div ref={scene} className="absolute inset-0 overflow-hidden" style={{ background: INK, color: BONE }}>
      <div className="absolute inset-x-0 top-[8cqh] bottom-[3cqh] flex flex-col items-center gap-[2.6cqh]">
        <div
          data-poster
          className="shrink-0 overflow-hidden rounded-[2.4cqw]"
          style={{ width: 'min(84cqw, calc(72cqh * 9 / 16))', aspectRatio: '9 / 16' }}
        >
          <PosterArt {...props} />
        </div>

        <div data-actions className="flex items-center gap-[5cqw]" onPointerDown={stop} onPointerUp={stop}>
          <button
            type="button"
            onClick={onSave}
            aria-live="polite"
            className="h-[max(44px,11cqw)] rounded-full px-[6cqw] text-[max(15px,4.2cqw)] font-semibold transition-transform active:scale-95"
            style={{ background: LIME, color: INK }}
          >
            {SAVE_LABEL[save]}
          </button>
          <button
            type="button"
            onClick={exit}
            className="h-[max(44px,11cqw)] px-[2cqw] font-mono text-[max(12px,3.4cqw)] uppercase tracking-[0.14em] underline underline-offset-4"
          >
            Start over
          </button>
        </div>
      </div>

      {createPortal(
        <div aria-hidden className="pointer-events-none fixed top-0 left-[-10000px]">
          <div ref={exportNode} style={{ width: STORY_W, height: STORY_H }}>
            <PosterArt {...props} />
          </div>
        </div>,
        document.body,
      )}
    </div>
  )
}
