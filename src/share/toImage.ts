// Turns the summary poster into a 1080×1920 PNG, entirely in the browser.

export const POSTER_W = 1080
export const POSTER_H = 1920

export type SaveOutcome = 'shared' | 'downloaded' | 'cancelled'

/** Renders a node that is already laid out at POSTER_W × POSTER_H. */
export async function posterBlob(node: HTMLElement): Promise<Blob> {
  // Loaded on demand so the library stays out of the story bundle until someone saves.
  const { toBlob } = await import('html-to-image')
  await document.fonts.ready
  const blob = await toBlob(node, { width: POSTER_W, height: POSTER_H, pixelRatio: 1 })
  if (!blob) throw new Error('poster render returned nothing')
  return blob
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.append(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

/** Opens the share sheet on touch devices (where "Save image" lives), otherwise downloads the PNG. */
export async function savePoster(node: HTMLElement, filename: string): Promise<SaveOutcome> {
  const blob = await posterBlob(node)
  const file = new File([blob], filename, { type: 'image/png' })
  const touch = window.matchMedia('(pointer: coarse)').matches
  if (touch && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] })
      return 'shared'
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return 'cancelled'
      // Some browsers refuse to share after the render's await (no user activation left): download instead.
    }
  }
  download(blob, filename)
  return 'downloaded'
}
