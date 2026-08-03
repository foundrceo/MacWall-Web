/**
 * Fin/iMessage-style pause before local scripted support bubbles.
 * Real admin typing still comes from SSE separately.
 */

/** Near-instant when the user prefers reduced motion. */
export const LOCAL_SUPPORT_TYPING_REDUCED_MS = 40

/** Inclusive delay range for scripted support replies (ms). */
export const LOCAL_SUPPORT_TYPING_MIN_MS = 400
export const LOCAL_SUPPORT_TYPING_MAX_MS = 900

export function localSupportTypingDelayMs(
  reduceMotion: boolean | null | undefined
): number {
  if (reduceMotion) return LOCAL_SUPPORT_TYPING_REDUCED_MS
  const span =
    LOCAL_SUPPORT_TYPING_MAX_MS - LOCAL_SUPPORT_TYPING_MIN_MS
  return (
    LOCAL_SUPPORT_TYPING_MIN_MS + Math.floor(Math.random() * (span + 1))
  )
}
