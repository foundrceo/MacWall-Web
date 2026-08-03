import { getSupabaseAdmin } from "@/lib/supabase/admin"

export type FeedbackSentiment = "like" | "dislike" | "neutral"
export type FeedbackFilter = FeedbackSentiment | "all" | "unread"
export type FeedbackMessageAuthor = "user" | "admin" | "assist"

export type FeedbackMessage = {
  id: string
  author: FeedbackMessageAuthor
  body: string
  imageUrl: string | null
  createdAt: string
}

export type AdminFeedback = {
  id: string
  deviceId: string | null
  sentiment: FeedbackSentiment
  name: string | null
  message: string
  appVersion: string | null
  osVersion: string | null
  deviceModel: string | null
  modelIdentifier: string | null
  chip: string | null
  memoryGb: number | null
  isResolved: boolean
  userHasUnread: boolean
  needsAdminReply: boolean
  messages: FeedbackMessage[]
  createdAt: string
  chatId?: string | null
}

export type FeedbackTotals = {
  total: number
  like: number
  dislike: number
  neutral: number
  unresolved: number
  awaitingReply: number
}

type FeedbackRow = {
  id: string
  device_id: string | null
  sentiment: FeedbackSentiment
  name: string | null
  message: string
  app_version: string | null
  os_version: string | null
  device_model: string | null
  model_identifier: string | null
  chip: string | null
  memory_gb: number | null
  is_resolved: boolean
  user_has_unread: boolean
  needs_admin_reply: boolean
  created_at: string
}

type MessageRow = {
  id: string
  feedback_id: string
  author: string
  body: string
  image_url: string | null
  created_at: string
}

type FeedbackRowWithChat = FeedbackRow & { chat_id?: string | null }

const BASE_COLUMNS =
  "id,device_id,sentiment,name,message,app_version,os_version,device_model,model_identifier,chip,memory_gb,is_resolved,user_has_unread,needs_admin_reply,created_at"

const COLUMNS_WITH_CHAT = `${BASE_COLUMNS},chat_id`

/** Cached after first probe so we don't keep selecting a missing column. */
let chatIdColumnAvailable: boolean | null = null

function isMissingChatIdColumnError(error: {
  message?: string
  code?: string
  details?: string | null
} | null): boolean {
  if (!error) return false
  const hay = [error.message, error.details, error.code]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
  return (
    error.code === "42703" ||
    (hay.includes("chat_id") &&
      (hay.includes("does not exist") || hay.includes("column")))
  )
}

async function selectFeedbackRows(
  buildQuery: (
    columns: string
  ) => PromiseLike<{ data: unknown; error: { message?: string; code?: string; details?: string | null } | null }>
): Promise<FeedbackRowWithChat[]> {
  const preferChat =
    chatIdColumnAvailable === null ? true : chatIdColumnAvailable

  if (preferChat) {
    const withChat = await buildQuery(COLUMNS_WITH_CHAT)
    if (!withChat.error) {
      chatIdColumnAvailable = true
      return (withChat.data ?? []) as FeedbackRowWithChat[]
    }
    if (isMissingChatIdColumnError(withChat.error)) {
      chatIdColumnAvailable = false
      console.warn(
        "[admin/feedback] app_feedback.chat_id missing; selecting without it. Apply migration 20260803180000_assist_chat_authors.sql when ready."
      )
    } else {
      throw new Error(withChat.error.message ?? "feedback_query_failed")
    }
  }

  const withoutChat = await buildQuery(BASE_COLUMNS)
  if (withoutChat.error) {
    throw new Error(withoutChat.error.message ?? "feedback_query_failed")
  }
  return (withoutChat.data ?? []) as FeedbackRowWithChat[]
}

function mapAuthor(author: string): FeedbackMessageAuthor {
  if (author === "admin") return "admin"
  if (author === "assist") return "assist"
  return "user"
}

function mapMessage(row: MessageRow): FeedbackMessage {
  return {
    id: row.id,
    author: mapAuthor(row.author),
    body: row.body,
    imageUrl: row.image_url,
    createdAt: row.created_at,
  }
}

function mapFeedback(
  row: FeedbackRowWithChat,
  messages: FeedbackMessage[]
): AdminFeedback {
  return {
    id: row.id,
    deviceId: row.device_id,
    sentiment: row.sentiment,
    name: row.name,
    message: row.message,
    appVersion: row.app_version,
    osVersion: row.os_version,
    deviceModel: row.device_model,
    modelIdentifier: row.model_identifier,
    chip: row.chip,
    memoryGb: row.memory_gb,
    isResolved: row.is_resolved,
    userHasUnread: row.user_has_unread,
    needsAdminReply: row.needs_admin_reply,
    messages,
    createdAt: row.created_at,
    chatId: row.chat_id ?? null,
  }
}

async function loadMessagesForFeedback(
  ids: string[]
): Promise<Map<string, FeedbackMessage[]>> {
  const grouped = new Map<string, FeedbackMessage[]>()
  if (ids.length === 0) return grouped

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("app_feedback_messages")
    .select("id,feedback_id,author,body,image_url,created_at")
    .in("feedback_id", ids)
    .order("created_at", { ascending: true })

  if (error) throw new Error(error.message)

  for (const row of (data ?? []) as MessageRow[]) {
    const list = grouped.get(row.feedback_id) ?? []
    list.push(mapMessage(row))
    grouped.set(row.feedback_id, list)
  }
  return grouped
}

export async function listAppFeedback(
  filter: FeedbackFilter = "all"
): Promise<AdminFeedback[]> {
  const supabase = getSupabaseAdmin()

  const rows = await selectFeedbackRows((columns) => {
    let query = supabase
      .from("app_feedback")
      .select(columns)
      .order("needs_admin_reply", { ascending: false })
      .order("is_resolved", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(300)

    if (filter === "unread") {
      query = query.eq("needs_admin_reply", true)
    } else if (filter !== "all") {
      query = query.eq("sentiment", filter)
    }

    return query
  })

  const messages = await loadMessagesForFeedback(rows.map((r) => r.id))
  return rows.map((row) => {
    const thread = messages.get(row.id) ?? []
    const mapped = mapFeedback(row, thread)
    const last = thread.at(-1)
    // Keep Reply inbox accurate even if the column lagged.
    // Assist messages never imply admin attention — only user (post-handoff).
    if (!mapped.isResolved && last?.author === "user") {
      mapped.needsAdminReply = true
    } else if (
      !mapped.isResolved &&
      thread.length === 0 &&
      mapped.message.trim()
    ) {
      mapped.needsAdminReply = true
    } else if (last?.author === "assist" && !mapped.needsAdminReply) {
      mapped.needsAdminReply = false
    }
    return mapped
  })
}

export async function getFeedbackTotals(): Promise<FeedbackTotals> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("app_feedback")
    .select("sentiment,is_resolved,needs_admin_reply")
    .limit(5000)

  if (error) throw new Error(error.message)

  const rows = (data ?? []) as Array<
    Pick<FeedbackRow, "sentiment" | "is_resolved" | "needs_admin_reply">
  >
  const totals: FeedbackTotals = {
    total: rows.length,
    like: 0,
    dislike: 0,
    neutral: 0,
    unresolved: 0,
    awaitingReply: 0,
  }
  for (const row of rows) {
    if (row.sentiment in totals) {
      totals[row.sentiment] += 1
    }
    if (!row.is_resolved) totals.unresolved += 1
    if (row.needs_admin_reply) totals.awaitingReply += 1
  }
  return totals
}

export async function replyToFeedback(
  id: string,
  reply: string,
  imageUrl?: string | null
) {
  const trimmed = reply.trim()
  const trimmedImage =
    typeof imageUrl === "string" && imageUrl.trim() ? imageUrl.trim() : null
  if (trimmedImage && !/^https:\/\//i.test(trimmedImage)) {
    throw new Error("Invalid image URL")
  }
  if (!trimmed && !trimmedImage) {
    throw new Error("Reply message is required")
  }

  const supabase = getSupabaseAdmin()
  const body = (trimmed || " ").slice(0, 4000)
  const now = new Date().toISOString()

  const { error: insertError } = await supabase
    .from("app_feedback_messages")
    .insert({
      feedback_id: id,
      author: "admin",
      body,
      image_url: trimmedImage,
    })
  if (insertError) throw new Error(insertError.message)

  const { error: updateError } = await supabase
    .from("app_feedback")
    .update({
      admin_reply: trimmed || (trimmedImage ? "(image)" : body),
      admin_replied_at: now,
      user_has_unread: true,
      user_has_seen_reply: false,
      needs_admin_reply: false,
    })
    .eq("id", id)

  if (updateError) throw new Error(updateError.message)

  const rows = await selectFeedbackRows((columns) =>
    supabase.from("app_feedback").select(columns).eq("id", id).limit(1)
  )
  const data = rows[0]
  if (!data) throw new Error("Feedback not found")

  const messages = await loadMessagesForFeedback([id])
  return mapFeedback(data, messages.get(id) ?? [])
}

export async function setFeedbackResolved(id: string, resolved: boolean) {
  const supabase = getSupabaseAdmin()

  let needsAdminReply: boolean | undefined
  if (!resolved) {
    // Reopen: if last message is from the user, put ticket back in Needs reply
    const { data: lastMsg } = await supabase
      .from("app_feedback_messages")
      .select("author")
      .eq("feedback_id", id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
    if (lastMsg?.author === "user") needsAdminReply = true
  }

  const { error } = await supabase
    .from("app_feedback")
    .update({
      is_resolved: resolved,
      ...(resolved
        ? { needs_admin_reply: false }
        : {
            user_has_unread: true,
            user_has_seen_reply: false,
            ...(needsAdminReply ? { needs_admin_reply: true } : {}),
          }),
    })
    .eq("id", id)

  if (error) throw new Error(error.message)
  return { id, isResolved: resolved }
}
