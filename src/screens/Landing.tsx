import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'
import { useApp } from '../store'
import { CARDS } from './cards'
import StoryCard from './StoryCard'

const NAME = 'inwrap'

type Step = { title: string; body: ReactNode; settings?: [string, string][] }

// Meta renames these menus from time to time, so each step names the variants we know of.
const STEPS: Step[] = [
  {
    title: 'Open Accounts Center',
    body: (
      <>
        In the Instagram app, go to your profile, tap the ☰ menu, then <b className="font-medium text-[#1d1d1f]">Accounts Center</b> →{' '}
        <b className="font-medium text-[#1d1d1f]">Your information and permissions</b>. On a computer, open
        accountscenter.instagram.com.
      </>
    ),
  },
  {
    title: 'Start an export',
    body: (
      <>
        Tap <b className="font-medium text-[#1d1d1f]">Download your information</b> (on some versions it is called{' '}
        <b className="font-medium text-[#1d1d1f]">Export your information</b>), then{' '}
        <b className="font-medium text-[#1d1d1f]">Download or transfer information</b> or{' '}
        <b className="font-medium text-[#1d1d1f]">Create export</b>. Pick your Instagram account and choose all available
        information.
      </>
    ),
  },
  {
    title: 'Pick these settings',
    body: 'Choose to download it to your device, then set:',
    settings: [
      ['Format', 'JSON, not HTML'],
      ['Date range', 'Last year'],
      ['Media quality', 'Lower, for a smaller file'],
    ],
  },
  {
    title: 'Download and drop it here',
    body: 'Meta emails or notifies you when it is ready. That can take a few minutes or a couple of days. Go back to the same screen, open Available downloads, and download the .zip. Drop it in as it is. No need to unzip.',
  },
]

const FAQ: { q: string; a: ReactNode }[] = [
  {
    q: 'Is my data uploaded anywhere?',
    a: 'No. The zip is opened and counted inside this browser tab, in a background worker. There is no server, no account and no analytics. Close the tab and it is gone.',
  },
  {
    q: 'Why JSON and not HTML?',
    a: 'The JSON export is structured data we can read reliably. The HTML version is made for people to browse, not for apps to count.',
  },
  {
    q: 'The file is huge. Will it work?',
    a: 'Yes. Photos and videos inside the zip are skipped without being unpacked, so only the small data files are read. Leaving media out of the export makes the download faster too.',
  },
  {
    q: 'Why do some stats cover only a few weeks?',
    a: 'Instagram keeps some history, like story views and watched videos, for a short window only. Those slides say so, and any yearly figure is clearly marked as an estimate.',
  },
  {
    q: 'Does it work on my phone?',
    a: 'Yes. The story is made for a phone screen. Tap to go forward, tap the left side to go back, hold to pause.',
  },
  {
    q: 'Is this made by Instagram?',
    a: `No. ${NAME} is an independent project and is not affiliated with or endorsed by Instagram or Meta.`,
  },
]

const ease = [0.16, 1, 0.3, 1] as const

function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const still = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={still ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, delay, ease }}
    >
      {children}
    </motion.div>
  )
}

function PrimaryButton({ children, onClick, inverted = false }: { children: ReactNode; onClick: () => void; inverted?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-12 items-center rounded-full px-6 text-[15px] font-medium transition-[opacity,transform] hover:opacity-85 active:scale-[0.97] ${
        inverted ? 'bg-white text-[#1d1d1f]' : 'bg-[#1d1d1f] text-white'
      }`}
    >
      {children}
    </button>
  )
}

/** Fanned stack of story previews, like a hand of cards. */
function CardFan() {
  const still = useReducedMotion()
  const fan = [
    { r: -14, y: 48 },
    { r: -7, y: 14 },
    { r: 0, y: 0 },
    { r: 7, y: 14 },
    { r: 14, y: 48 },
  ]
  // middle card on top
  const order = [3, 1, 0, 2, 4]

  return (
    <div className="relative flex justify-center [--card-w:150px] sm:[--card-w:210px] lg:[--card-w:240px]">
      {fan.map((f, i) => (
        <motion.div
          key={i}
          className="-mx-[calc(var(--card-w)*0.22)]"
          style={{ zIndex: 10 - Math.abs(i - 2) }}
          initial={still ? false : { opacity: 0, y: 140, rotate: 0 }}
          animate={{ opacity: 1, y: f.y, rotate: f.r }}
          transition={{ type: 'spring', stiffness: 60, damping: 15, delay: 0.35 + Math.abs(i - 2) * 0.09 }}
          whileHover={still ? undefined : { y: f.y - 16, transition: { duration: 0.3 } }}
        >
          <StoryCard spec={CARDS[order[i]]} />
        </motion.div>
      ))}
    </div>
  )
}

function CheckMark() {
  return (
    <svg viewBox="0 0 20 20" className="mt-[3px] size-4 shrink-0" aria-hidden="true">
      <circle cx="10" cy="10" r="10" fill="#d4ff3a" />
      <path d="M6 10.2l2.6 2.6L14 7.4" fill="none" stroke="#0a0a0a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function Landing() {
  const go = useApp((s) => s.go)
  const still = useReducedMotion()

  return (
    <div className="min-h-full bg-[#f4f4f4] text-[#1d1d1f]">
      {/* ── Header ───────────────────────────────────────── */}
      <header className="absolute inset-x-0 top-0 z-50 flex items-center justify-between px-4 py-3 sm:px-8 sm:py-4">
        <span className="text-[15px] font-semibold tracking-tight">{NAME}</span>
        <button
          type="button"
          onClick={() => go('demo')}
          className="rounded-full bg-[#1d1d1f] px-4 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-85"
        >
          Try the demo
        </button>
      </header>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="overflow-hidden px-4 pt-28 pb-24 text-center sm:pt-36 sm:pb-32">
        <motion.div
          initial={still ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease }}
        >
          <p className="text-sm font-medium text-[#86868b] lg:text-base">Your Instagram year, as a story</p>
          <h1 className="mt-4 text-[3.5rem] leading-[0.95] font-light tracking-[-0.035em] sm:text-7xl lg:text-[6.5rem]">
            Your year,
            <br />
            <span className="font-serif italic">unfiltered.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-balance text-[#6e6e73] lg:text-xl">
            Drop in your Instagram data export and get a tap-through story of your likes, DMs, late nights and
            favourite people. It all runs on your device.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <PrimaryButton onClick={() => go('dropzone')}>Choose your export</PrimaryButton>
            <button
              type="button"
              onClick={() => go('demo')}
              className="text-[15px] font-medium text-[#2340ff] hover:underline"
            >
              Try it with demo data →
            </button>
          </div>
        </motion.div>

        <div className="mt-16 sm:mt-20">
          <CardFan />
        </div>
      </section>

      {/* ── How to get your export ──────────────────────── */}
      <section className="border-t border-black/[0.06] bg-white px-4 py-24 sm:py-32">
        <div className="mx-auto max-w-5xl">
          <Reveal className="text-center">
            <p className="text-sm font-medium text-[#86868b] lg:text-base">Before you start</p>
            <h2 className="mt-3 text-4xl leading-[1.05] font-light tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Get your export in four steps.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-pretty text-[#6e6e73] lg:text-lg">
              Instagram lets you download a copy of your own data. It takes a few taps to ask for it.
            </p>
          </Reveal>

          <ol className="mt-14 grid gap-4 sm:mt-20 sm:grid-cols-2 sm:gap-6">
            {STEPS.map((s, i) => (
              <li key={s.title}>
                <Reveal delay={(i % 2) * 0.08} className="h-full rounded-3xl bg-[#f4f4f4] p-6 sm:p-8">
                  <span className="grid size-9 place-items-center rounded-full bg-[#1d1d1f] text-sm font-medium text-white">
                    {i + 1}
                  </span>
                  <h3 className="mt-6 text-xl font-normal tracking-tight sm:text-2xl">{s.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-[#6e6e73]">{s.body}</p>
                  {s.settings && (
                    <dl className="mt-4 divide-y divide-black/[0.06] rounded-2xl bg-white px-4 text-[15px]">
                      {s.settings.map(([label, value]) => (
                        <div key={label} className="flex items-baseline justify-between gap-4 py-3">
                          <dt className="text-[#6e6e73]">{label}</dt>
                          <dd className="text-right font-medium">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </Reveal>
              </li>
            ))}
          </ol>
          <Reveal>
            <p className="mx-auto mt-8 max-w-2xl text-center text-sm leading-relaxed text-pretty text-[#86868b]">
              Menu names move around between app versions. If a label doesn’t match exactly, pick the closest one. The
              one setting that matters is JSON: the HTML export can’t be read.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Privacy ─────────────────────────────────────── */}
      <section className="bg-[#0a0a0a] px-4 py-28 text-white sm:py-36">
        <div className="mx-auto grid max-w-5xl items-center gap-16 lg:grid-cols-[1fr_auto]">
          <Reveal>
            <p className="text-sm font-medium text-[#86868b] lg:text-base">Private by design</p>
            <h2 className="mt-4 text-5xl leading-[1] font-light tracking-tight sm:text-6xl lg:text-7xl">
              Your zip never leaves <span className="font-serif italic">this tab.</span>
            </h2>
            <ul className="mt-8 max-w-md space-y-3 text-[17px] leading-snug text-[#a1a1a6]">
              <li className="flex gap-3">
                <CheckMark />
                Read and counted on your device, in a background worker.
              </li>
              <li className="flex gap-3">
                <CheckMark />
                No server, no account, no tracking.
              </li>
              <li className="flex gap-3">
                <CheckMark />
                Close the tab and everything is gone.
              </li>
            </ul>
          </Reveal>

          <Reveal delay={0.1} className="justify-self-center [--card-w:220px] sm:[--card-w:250px]">
            <div className="rotate-[4deg]">
              <StoryCard
                spec={{
                  base: '#06231b',
                  blobs: [
                    { color: '#d4ff3a', x: '30%', y: '30%', size: '85%' },
                    { color: '#7cf5c4', x: '85%', y: '75%', size: '75%' },
                  ],
                  eyebrow: 'Uploaded',
                  value: '0 bytes',
                  label: 'of your data, ever',
                  step: 4,
                }}
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────── */}
      <section className="px-4 py-24 sm:py-32">
        <div className="mx-auto max-w-2xl">
          <Reveal>
            <h2 className="text-center text-4xl leading-[1.05] font-light tracking-tight sm:text-5xl lg:text-6xl">
              Good to know.
            </h2>
          </Reveal>
          <div className="mt-12 divide-y divide-black/[0.08] border-y border-black/[0.08]">
            {FAQ.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-lg font-normal tracking-tight [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <svg
                    viewBox="0 0 16 16"
                    aria-hidden="true"
                    className="mt-1.5 size-4 shrink-0 text-[#86868b] transition-transform duration-300 group-open:rotate-45"
                  >
                    <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </summary>
                <p className="mt-3 pr-10 text-[15px] leading-relaxed text-[#6e6e73]">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────── */}
      <section className="overflow-hidden bg-[#2340ff] px-4 pt-24 pb-28 text-center text-white sm:pt-28 sm:pb-36">
        <Reveal className="flex flex-col items-center">
          <div className="-rotate-[5deg] [--card-w:180px] sm:[--card-w:210px]">
            <StoryCard spec={CARDS[2]} />
          </div>
          <h2 className="mt-14 text-5xl leading-[1] font-light tracking-tight sm:text-6xl lg:text-7xl">
            See your year.
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-white/80 lg:text-lg">
            Get your export, drop it in, and tap through.
          </p>
          <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
            <PrimaryButton inverted onClick={() => go('dropzone')}>
              Choose your export
            </PrimaryButton>
            <button type="button" onClick={() => go('demo')} className="text-[15px] font-medium text-white hover:underline">
              Try the demo →
            </button>
          </div>
        </Reveal>
      </section>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="flex flex-col gap-2 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="font-semibold">{NAME}</p>
        <p className="text-sm text-[#86868b]">Independent project. Not affiliated with Instagram or Meta.</p>
      </footer>
    </div>
  )
}
