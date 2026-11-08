import type { ReactNode } from 'react'

/** The small mono label at the top left of every slide. */
export function Kicker({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p className={`absolute left-[6cqw] top-[9cqh] font-mono text-[3.4cqw] uppercase tracking-[0.18em] ${className}`}>
      {children}
    </p>
  )
}
