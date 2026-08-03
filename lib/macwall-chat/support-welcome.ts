/**
 * Local-only support welcome (human-to-human). No FAQ / Assist matching.
 */

export const SUPPORT_WELCOME = `Welcome to MacWall Support.
Share a few details and we’ll connect you with our team.

What’s your name?`

/** @deprecated Use SUPPORT_WELCOME */
export const CHAT_GREETING = SUPPORT_WELCOME

/** Strict-enough email for support contact (rejects `hello`, `name@`, spaces). */
const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/

export function isValidVisitorEmail(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed || trimmed.length > 254) return false
  if (/\s/.test(trimmed)) return false
  return EMAIL_RE.test(trimmed)
}

/** Strip spaces while the visitor is typing an email. */
export function sanitizeVisitorEmailDraft(value: string): string {
  return value.replace(/\s+/g, "").slice(0, 254)
}

/**
 * Shown right after a valid email is saved — ticket + Chat ID are created here.
 * Invite them to describe the issue while waiting (no fake “team joined”).
 */
export const SUPPORT_CONNECTING_PROMPT = `Thanks — you're connected. Someone from the MacWall team will reply here.

Meanwhile, tell us what’s going on. A screenshot helps if you have one.`

/** Seed body stored on the ticket at email confirmation (hidden in the visitor transcript). */
export const SUPPORT_JOIN_SEED =
  "Joined support — waiting for issue details."

/** Shown only when the first admin/support message lands — never after email alone. */
export const SUPPORT_TEAM_JUST_JOINED = "MacWall Team just joined"
/** @deprecated Prefer SUPPORT_TEAM_JUST_JOINED on first admin message. */
export const SUPPORT_CONNECTED_EVENT = "Connected you with the team"
/** Transient connecting chip — not persisted in the transcript. */
export const SUPPORT_CONNECTING_EVENT = "Connecting you with the team…"
export const SUPPORT_REPLY_WINDOW_EVENT =
  "We’ll reply within 24 hours. Leave this open or come back anytime."
