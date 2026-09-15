/** Idle Live Support tickets are closed after this many days with no messages. */
export const STALE_SUPPORT_IDLE_DAYS = 7

/** Posted as the last ticket message when a chat is auto-closed. Keep in sync with the Swift copy. */
export const STALE_SUPPORT_CLOSE_NOTICE =
  "This chat was closed automatically because nothing happened for 7 days. Start a new chat if you still need help."

export function isStaleSupportCloseNotice(body: string | null | undefined): boolean {
  const trimmed = body?.trim() ?? ""
  if (!trimmed) return false
  const lower = trimmed.toLowerCase()
  return (
    lower === STALE_SUPPORT_CLOSE_NOTICE.toLowerCase() ||
    lower.startsWith("this chat was closed automatically")
  )
}
