import type { Tone } from "@/components/admin/ui"
import type {
  AdminFeedback,
  FeedbackMessage,
  FeedbackMessageAuthor,
  FeedbackSentiment,
  FeedbackTotals,
} from "@/lib/admin/feedback"

export type FeedbackItem = AdminFeedback
export type Sentiment = FeedbackSentiment
export type Totals = FeedbackTotals
export type { FeedbackMessage, FeedbackMessageAuthor }

export type Filter = "unread" | "open" | "closed" | "all"

export const FILTERS: readonly { id: Filter; label: string }[] = [
  { id: "unread", label: "Reply" },
  { id: "open", label: "Open" },
  { id: "closed", label: "Closed" },
  { id: "all", label: "All" },
]

export const SENTIMENT: Record<Sentiment, { label: string; tone: Tone }> = {
  like: { label: "Praise", tone: "green" },
  dislike: { label: "Issue", tone: "amber" },
  neutral: { label: "Neutral", tone: "neutral" },
}

export type MessageGroup = {
  author: FeedbackMessageAuthor
  messages: FeedbackMessage[]
}

export type TimelineItem =
  | { kind: "separator"; key: string; label: string }
  | { kind: "system"; key: string; body: string }
  | { kind: "group"; key: string; group: MessageGroup }

/** ticketId → expiry timestamp. Presence in the map means "typing now". */
export type VisitorTyping = Record<string, number>

export type InboxError = {
  message: string
  /** True when the inbox itself failed to load, so retrying makes sense. */
  retry: boolean
}

export type PendingImage = { file: File; previewUrl: string }
