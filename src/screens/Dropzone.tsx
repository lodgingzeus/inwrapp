import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useState, type DragEvent } from 'react'
import { useApp } from '../store'
import type { ExportErrorCode } from '../worker/errors'

type PickError = 'not-zip-file' | 'folder' | 'empty' | 'many'
type ErrorCode = ExportErrorCode | PickError

const MESSAGES: Record<ErrorCode, { title: string; body: string }> = {
  'not-zip-file': {
    title: 'That isn’t a .zip file.',
    body: 'Pick the .zip that Meta sent you. It usually starts with “instagram-”.',
  },
  folder: {
    title: 'That’s a folder.',
    body: 'Looks like the export was unzipped. Drop the original .zip instead, no need to unpack it.',
  },
  empty: { title: 'That file is empty.', body: 'The download may not have finished. Try downloading it again from Meta.' },
  many: { title: 'One file at a time.', body: 'Drop just the Instagram export .zip.' },
  'not-a-zip': {
    title: 'We couldn’t open that zip.',
    body: 'It may be damaged or still downloading. Download it again from Meta and try once more.',
  },
  'not-instagram': {
    title: 'This doesn’t look like an Instagram export.',
    body: 'We couldn’t find any Instagram data inside. Make sure it’s the export from Download your information.',
  },
  'html-export': {
    title: 'This is the HTML version.',
    body: 'Request the export again and choose JSON as the format. HTML is made for browsing, not for counting.',
  },
  encrypted: {
    title: 'This zip is password-protected.',
    body: 'Use the zip exactly as Meta sent it, without re-packing it with a password.',
  },
  'too-large': {
    title: 'One file inside is too big to read here.',
    body: 'A browser tab can’t hold it. Requesting a shorter date range usually fixes this.',
  },
  unknown: {
    title: 'Something went wrong reading this file.',
    body: 'Try again. If it keeps happening, closing other tabs can free up memory.',
  },
}

const ease = [0.16, 1, 0.3, 1] as const

function pickError(files: FileList | null, folder: boolean): PickError | null {
  if (folder) return 'folder'
  if (!files || files.length === 0) return null
  if (files.length > 1) return 'many'
  // The worker is the real check. The name only catches obvious mistakes, since
  // zip MIME types differ between browsers and operating systems.
  if (!/\.zip$/i.test(files[0].name)) return 'not-zip-file'
  if (files[0].size === 0) return 'empty'
  return null
}

const isFolderDrop = (e: DragEvent) =>
  [...e.dataTransfer.items].some((item) => item.webkitGetAsEntry?.()?.isDirectory)

export default function Dropzone() {
  const go = useApp((s) => s.go)
  const load = useApp((s) => s.load)
  const parseError = useApp((s) => s.error)
  const [localError, setLocalError] = useState<PickError | null>(null)
  const [over, setOver] = useState(false)
  const still = useReducedMotion()
  const error = localError ?? parseError
  const message = error ? MESSAGES[error] : null

  // A drop that misses the target would make the browser open the zip itself.
  useEffect(() => {
    const block = (e: Event) => e.preventDefault()
    window.addEventListener('dragover', block)
    window.addEventListener('drop', block)
    return () => {
      window.removeEventListener('dragover', block)
      window.removeEventListener('drop', block)
    }
  }, [])

  function accept(files: FileList | null, folder = false) {
    const problem = pickError(files, folder)
    setLocalError(problem)
    if (problem || !files?.[0]) return
    void load(files[0])
  }

  return (
    <main className="flex min-h-full flex-col bg-[#f4f4f4] text-[#1d1d1f]">
      <header className="flex items-center justify-between px-4 py-3 sm:px-8 sm:py-4">
        <button type="button" onClick={() => go('landing')} className="text-[15px] font-semibold tracking-tight">
          inwrap
        </button>
        <button type="button" onClick={() => go('demo')} className="text-sm font-medium text-[#2340ff] hover:underline">
          Try the demo →
        </button>
      </header>

      <motion.div
        className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 pt-6 pb-16 text-center"
        initial={still ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease }}
      >
        <h1 className="text-[2.75rem] leading-[1] font-light tracking-[-0.035em] sm:text-6xl">
          Drop your <span className="font-serif italic">export</span>.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed text-balance text-[#6e6e73]">
          The .zip from Instagram, exactly as Meta sent it. It’s opened right here in this tab.
        </p>

        <label
          htmlFor="export-file"
          onDragEnter={(e) => {
            e.preventDefault()
            setOver(true)
          }}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver(false)
          }}
          onDrop={(e) => {
            e.preventDefault()
            setOver(false)
            accept(e.dataTransfer.files, isFolderDrop(e))
          }}
          className={`mt-10 flex cursor-pointer flex-col items-center justify-center gap-5 rounded-[28px] border-2 border-dashed px-6 py-14 transition-[background-color,border-color,transform] duration-300 focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-[#2340ff] sm:py-20 ${
            over ? 'scale-[1.01] border-[#1d1d1f] bg-white' : 'border-[#c7c7cc] bg-white/60 hover:bg-white'
          }`}
        >
          <svg viewBox="0 0 48 48" className="size-12" aria-hidden="true">
            <rect x="9" y="4" width="30" height="40" rx="5" fill="none" stroke="#1d1d1f" strokeWidth="2" />
            <path d="M24 4v6m0 4v6m0 4v4" stroke="#1d1d1f" strokeWidth="2" strokeDasharray="3 3" />
            <rect x="20" y="28" width="8" height="8" rx="2" fill="#d4ff3a" stroke="#1d1d1f" strokeWidth="2" />
          </svg>
          <span className="text-xl font-medium tracking-tight">
            {over ? 'Let go to open it' : 'Drag the .zip here'}
          </span>
          <span className="inline-flex h-12 items-center rounded-full bg-[#1d1d1f] px-6 text-[15px] font-medium text-white">
            Choose file
          </span>
          <input
            id="export-file"
            type="file"
            accept=".zip,application/zip,application/x-zip-compressed"
            className="sr-only"
            onChange={(e) => {
              accept(e.target.files)
              e.target.value = ''
            }}
          />
        </label>

        {message && (
          <motion.div
            key={error}
            role="alert"
            className="mt-6 rounded-[20px] bg-white px-6 py-5 text-left"
            initial={still ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease }}
          >
            <p className="font-medium">{message.title}</p>
            <p className="mt-1 text-[15px] leading-relaxed text-[#6e6e73]">{message.body}</p>
          </motion.div>
        )}

        <p className="mt-8 text-sm text-[#86868b]">
          Nothing is uploaded. No account, no server, no analytics. Photos and videos in the zip are skipped.
        </p>
      </motion.div>
    </main>
  )
}
