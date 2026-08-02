import { getSupabaseAdmin } from "@/lib/supabase/admin"

export type FeedbackSentiment = "like" | "dislike" | "neutral"
export type FeedbackFilter = FeedbackSentiment | "all" | "unread"
export type FeedbackMessageAuthor = "user" | "admin"

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
  author: FeedbackMessageAuthor
  body: string
  image_url: string | null
  created_at: string
}

const COLUMNS =
  "id,device_id,sentiment,name,message,app_version,os_version,device_model,model_identifier,chip,memory_gb,is_resolved,user_has_unread,needs_admin_reply,created_at"

function mapMessage(row: MessageRow): FeedbackMessage {
  return {
    id: row.id,
    author: row.author,
    body: row.body,
    imageUrl: row.image_url,
    createdAt: row.created_at,
  }
}

function mapFeedback(
  row: FeedbackRow,
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
  let query = supabase
    .from("app_feedback")
    .select(COLUMNS)
    .order("needs_admin_reply", { ascending: false })
    .order("is_resolved", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(300)

  if (filter === "unread") {
    query = query.eq("needs_admin_reply", true)
  } else if (filter !== "all") {
    query = query.eq("sentiment", filter)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)

  const rows = (data ?? []) as FeedbackRow[]
  const messages = await loadMessagesForFeedback(rows.map((r) => r.id))
  return rows.map((row) => {
    const thread = messages.get(row.id) ?? []
    const mapped = mapFeedback(row, thread)
    const last = thread.at(-1)
    // Keep Reply inbox accurate even if the column lagged
    if (!mapped.isResolved && last?.author === "user") {
      mapped.needsAdminReply = true
    } else if (
      !mapped.isResolved &&
      thread.length === 0 &&
      mapped.message.trim()
    ) {
      mapped.needsAdminReply = true
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

export async function replyToFeedback(id: string, reply: string) {
  const trimmed = reply.trim()
  if (!trimmed) throw new Error("Reply message is required")

  const supabase = getSupabaseAdmin()
  const body = trimmed.slice(0, 4000)
  const now = new Date().toISOString()

  const { error: insertError } = await supabase
    .from("app_feedback_messages")
    .insert({
      feedback_id: id,
      author: "admin",
      body,
    })
  if (insertError) throw new Error(insertError.message)

  const { data, error } = await supabase
    .from("app_feedback")
    .update({
      admin_reply: body,
      admin_replied_at: now,
      user_has_unread: true,
      user_has_seen_reply: false,
      needs_admin_reply: false,
    })
    .eq("id", id)
    .select(COLUMNS)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) throw new Error("Feedback not found")

  const messages = await loadMessagesForFeedback([id])
  return mapFeedback(data as FeedbackRow, messages.get(id) ?? [])
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
