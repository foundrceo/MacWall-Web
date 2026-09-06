const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function isValidSupportSessionId(value: string): boolean {
  return UUID_RE.test(value.trim().toLowerCase())
}

export function normalizeSupportSessionId(value: string): string {
  return value.trim().toLowerCase()
}

/** Body for the "Report wallpaper" mailto link on wallpaper detail pages. */
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
    case "invalid_ticket":
      return "This support ticket could not be found."
    case "invalid_json":
      return "Invalid request. Please try again."
    case "rate_limited":
      return "Too many requests. Please wait a moment and try again."
    case "typing_failed":
    case "load_failed":
      return "Something went wrong. Please try again."
    default:
      return "Something went wrong. Please try again."
  }
}
