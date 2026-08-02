const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function isValidSupportSessionId(value: string): boolean {
  return UUID_RE.test(value.trim().toLowerCase())
}

export function normalizeSupportSessionId(value: string): string {
  return value.trim().toLowerCase()
}

export const SUPPORT_SESSION_STORAGE_KEY = "macwall_support_session_id"

/** Query flag that auto-opens the live chat popup (`/?support-chat`). */
export const SUPPORT_CHAT_QUERY = "support-chat"

/** Prefills the chat composer when paired with `support-chat`. */
export const SUPPORT_CHAT_MESSAGE_QUERY = "support-message"

/** Starts a fresh conversation before prefilling (paired with `support-chat`). */
export const SUPPORT_CHAT_NEW_QUERY = "support-new"

export type SupportChatLinkOptions = {
  /** Defaults to `/` — pass the current page path when opening from a detail view. */
  pathname?: string
  /** Prefills the composer when the chat opens. */
  message?: string
  /** Start a fresh conversation before prefilling (default true when `message` is set). */
  newConversation?: boolean
}

export function buildSupportChatHref(
  options: SupportChatLinkOptions = {}
): string {
  const pathname = options.pathname ?? "/"
  const params = new URLSearchParams()
  params.set(SUPPORT_CHAT_QUERY, "1")

  const message = options.message?.trim()
  if (message) {
    params.set(SUPPORT_CHAT_MESSAGE_QUERY, message)
    if (options.newConversation !== false) {
      params.set(SUPPORT_CHAT_NEW_QUERY, "1")
    }
  } else if (options.newConversation) {
    params.set(SUPPORT_CHAT_NEW_QUERY, "1")
  }

  const qs = params.toString()
  return qs ? `${pathname}?${qs}` : pathname
}

/** Prefer this for in-app links so the chat opens on soft navigation too. */
export const SUPPORT_CHAT_HREF = buildSupportChatHref()

export function buildWallpaperReportMessage(
  wallpaper: { id: string; name: string; category: string },
  shareUrl: string
): string {
  return [
    "I'd like to report this wallpaper.",
    "",
    `Wallpaper: ${wallpaper.name}`,
    `ID: ${wallpaper.id}`,
    `Category: ${wallpaper.category}`,
    `URL: ${shareUrl}`,
    "",
    "What's wrong: ",
  ].join("\n")
}

export type SupportSentiment = "like" | "dislike" | "neutral"

export function parseSupportSentiment(value: unknown): SupportSentiment {
  if (value === "like" || value === "dislike" || value === "neutral") return value
  return "neutral"
}

export function supportErrorMessage(code: string): string {
  switch (code) {
    case "ticket_closed":
      return "This support ticket is closed. Submit a new support request if you need further assistance."
    case "name_required":
      return "Please enter your name so our support team can assist you."
    case "message_required":
      return "Please write a message first."
    case "invalid_session":
      return "Your support session is invalid. Refresh the page and try again."
    case "rate_limited":
      return "Too many requests. Please wait a moment and try again."
    default:
      return "Something went wrong. Please try again."
  }
}
