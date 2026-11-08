import { useEffect, useRef, type PointerEvent } from 'react'

const HOLD_MS = 200

/**
 * Story gestures on one element: a short press is a tap, a press longer than
 * HOLD_MS is a hold. Releasing a hold never counts as a tap.
 */
export function useTapHold(onTap: (e: PointerEvent<HTMLElement>) => void, onHold: (holding: boolean) => void) {
  const timer = useRef(0)
  const pressed = useRef(false)
  const held = useRef(false)

  useEffect(() => () => clearTimeout(timer.current), [])

  const release = () => {
    clearTimeout(timer.current)
    pressed.current = false
    if (!held.current) return false
    held.current = false
    onHold(false)
    return true
  }

  return {
    onPointerDown(e: PointerEvent<HTMLElement>) {
      if (e.button !== 0) return
      pressed.current = true
      held.current = false
      timer.current = window.setTimeout(() => {
        held.current = true
        onHold(true)
      }, HOLD_MS)
    },
    onPointerUp(e: PointerEvent<HTMLElement>) {
      if (!pressed.current) return
      if (!release()) onTap(e)
    },
    onPointerCancel() {
      if (pressed.current) release()
    },
    onPointerLeave() {
      if (pressed.current) release()
    },
    onContextMenu(e: { preventDefault: () => void }) {
      e.preventDefault()
    },
  }
}
