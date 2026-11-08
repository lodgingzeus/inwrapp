import { useState } from 'react'
import { parseExport, type ParseResult, type Progress } from '../worker/client'

// Dev-only page (open /#dev while `npm run dev` is running). It parses a real
// export in the worker and prints the resulting WrappedStats. Nothing is sent
// anywhere and nothing is logged.

export default function DevParse() {
  const [progress, setProgress] = useState<Progress | null>(null)
  const [result, setResult] = useState<ParseResult | null>(null)
  const [ms, setMs] = useState<number | null>(null)
  const [ticks, setTicks] = useState(0)

  async function onFile(file: File | undefined) {
    if (!file) return
    setResult(null)
    setMs(null)
    const started = performance.now()
    // A ticking counter proves the main thread stays responsive while parsing.
    const timer = setInterval(() => setTicks((t) => t + 1), 100)
    try {
      setResult(await parseExport(file, setProgress))
    } finally {
      clearInterval(timer)
      setMs(Math.round(performance.now() - started))
    }
  }

  return (
    <main className="min-h-full bg-[#f4f4f4] p-6 font-mono text-sm text-[#1d1d1f]">
      <h1 className="text-lg font-semibold">Parser check</h1>
      <input
        type="file"
        accept=".zip,application/zip"
        className="mt-4 block"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
      <p className="mt-4">UI ticks: {ticks}</p>
      {progress && (
        <p>
          stage: {progress.stage} · files {progress.done}/{progress.total}
          {progress.count !== undefined && ` · ${progress.count.toLocaleString()} records`}
        </p>
      )}
      {ms !== null && <p>finished in {(ms / 1000).toFixed(1)} s</p>}
      {result && <pre className="mt-4 overflow-auto rounded-lg bg-white p-4">{JSON.stringify(result, null, 2)}</pre>}
    </main>
  )
}
