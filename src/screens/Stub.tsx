import { useApp } from '../store'

// Placeholder until the real screen is built.
export default function Stub({ title, phase }: { title: string; phase: string }) {
  const go = useApp((s) => s.go)
  return (
    <main className="flex min-h-full flex-col justify-end gap-6 bg-ink p-4 pb-12 text-lime sm:p-10">
      <p className="font-mono text-xs uppercase tracking-widest">{phase}</p>
      <h1 className="text-[clamp(3rem,14vw,8rem)] leading-[0.9] font-extrabold tracking-tight">{title}</h1>
      <p className="font-serif text-2xl italic text-bone">Not built yet.</p>
      <button
        type="button"
        onClick={() => go('landing')}
        className="self-start font-mono text-sm underline underline-offset-4"
      >
        ← back
      </button>
    </main>
  )
}
