import { useEffect, useState } from 'react'

// SplitText measures lines, so slides must not mount before the real fonts are
// in. Loading them explicitly also covers faces the landing page never used.
const FACES = [
  '800 1em "Bricolage Grotesque Variable"',
  'italic 400 1em "Instrument Serif"',
  '500 1em "JetBrains Mono Variable"',
]
const TIMEOUT_MS = 3000

let ready: Promise<void> | null = null

function loadFonts() {
  ready ??= Promise.race([
    Promise.all(FACES.map((f) => document.fonts.load(f))).then(() => undefined),
    new Promise<void>((resolve) => setTimeout(resolve, TIMEOUT_MS)),
  ]).catch(() => undefined)
  return ready
}

export function useFontsReady() {
  const [isReady, setReady] = useState(false)
  useEffect(() => {
    let alive = true
    void loadFonts().then(() => alive && setReady(true))
    return () => {
      alive = false
    }
  }, [])
  return isReady
}
