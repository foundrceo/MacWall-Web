import "server-only"

import { getSupabaseAdmin } from "@/lib/supabase/admin"

export type SupportSentiment = "like" | "dislike" | "neutral"
export type SupportMessageAuthor = "user" | "admin" | "assist"

export type SupportMessage = {
  id: string
  author: SupportMessageAuthor
  body: string
  imageUrl: string | null
  createdAt: string
}

export type SupportTicket = {
  id: string
  sentiment: SupportSentiment
  name: string | null
  message: string
  userHasUnread: boolean
  needsAdminReply: boolean
  isResolved: boolean
  messages: SupportMessage[]
  createdAt: string
  chatId?: string | null
}

type RpcMessage = {
  id: string
  author: string
  body: string
  image_url?: string | null
  created_at: string
}

type RpcRow = {
  id: string
  sentiment: SupportSentiment
  name: string | null
  message: string
  user_has_unread: boolean
  needs_admin_reply: boolean
  is_resolved: boolean
  created_at: string
  chat_id?: string | null
  messages: RpcMessage[] | null
}

type RpcErrorLike = {
  message?: string
  code?: string
  details?: string | null
  hint?: string | null
}

/** True when extended assist RPC args / columns aren't available yet. */
function shouldFallbackLegacySubmit(
  error: RpcErrorLike | null | undefined
): boolean {
  if (!error) return false
  const hay = [error.message, error.details, error.hint, error.code]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
  return (
    error.code === "PGRST202" ||
    error.code === "42703" || // undefined_column
    hay.includes("could not find the function") ||
    hay.includes("schema cache") ||
    hay.includes("function public.submit_app_feedback") ||
    hay.includes("function public.append_app_feedback_message") ||
    hay.includes("chat_id") ||
    hay.includes("p_chat_id") ||
    hay.includes("p_first_author") ||
    hay.includes("p_needs_admin_reply") ||
    hay.includes("p_author") ||
    (hay.includes("does not exist") &&
      (hay.includes("function") || hay.includes("column")))
  )
}

function mapAuthor(author: string): SupportMessageAuthor {
  if (author === "admin") return "admin"
  if (author === "assist") return "assist"
  return "user"
}

function mapTicket(row: RpcRow): SupportTicket {
  return {
    id: row.id,
    sentiment: row.sentiment,
    name: row.name,
    message: row.message,
    userHasUnread: row.user_has_unread,
    needsAdminReply: row.needs_admin_reply,
    isResolved: row.is_resolved,
    createdAt: row.created_at,
    chatId: row.chat_id ?? null,
    messages: (row.messages ?? []).map((m) => ({
      id: m.id,
      author: mapAuthor(m.author),
      body: m.body,
      imageUrl: m.image_url ?? null,
      createdAt: m.created_at,
    })),
  }
}

export async function listSupportTickets(
  sessionId: string
): Promise<SupportTicket[]> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.rpc("app_feedback_for_device", {
    p_device_id: sessionId,
  })
  if (error) throw new Error(error.message)
  return ((data ?? []) as RpcRow[]).map(mapTicket)
}

/**
 * Cheap ownership check for typing/SSE auth — one row, no messages tree.
 * Prefer this over `listSupportTickets` on hot paths.
 */
export async function sessionOwnsSupportTicket(
  sessionId: string,
  ticketId: string
): Promise<boolean> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("app_feedback")
    .select("id")
    .eq("id", ticketId)
    .eq("device_id", sessionId)
    .limit(1)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return Boolean(data?.id)
}

export async function createSupportTicket(input: {
  sessionId: string
  sentiment: SupportSentiment
  name?: string | null
  message: string
  imageUrl?: string | null
  userAgent?: string | null
  chatId?: string | null
  firstAuthor?: "user" | "assist"
  needsAdminReply?: boolean
}): Promise<{ id: string }> {
  const supabase = getSupabaseAdmin()
  const trimmedMessage = input.message.trim()
  const trimmedImage = input.imageUrl?.trim() || null
  if (!trimmedMessage && !trimmedImage) {
    throw new Error("message_required")
  }

  const baseArgs = {
    p_device_id: input.sessionId,
    p_sentiment: input.sentiment,
    p_name: input.name?.trim() || "Visitor",
    p_message: trimmedMessage || (trimmedImage ? " " : ""),
    p_image_url: trimmedImage,
    p_app_version: "Web",
    p_os_version: input.userAgent?.slice(0, 80) ?? null,
  }

  // Prefer assist migration signature (chat_id / first_author / needs_admin_reply).
  // If prod hasn't applied 20260803180000 yet, fall back to the image-era overload.
  const extended = await supabase.rpc("submit_app_feedback", {
    ...baseArgs,
    p_chat_id: input.chatId ?? null,
    p_first_author: input.firstAuthor ?? "user",
    p_needs_admin_reply: input.needsAdminReply ?? true,
  })

  let data = extended.data
  let error = extended.error

  if (error && shouldFallbackLegacySubmit(error)) {
    console.warn(
      "[support] submit_app_feedback extended args/columns unavailable; falling back to legacy RPC",
      {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      }
    )
    const legacy = await supabase.rpc("submit_app_feedback", baseArgs)
    data = legacy.data
    error = legacy.error
  }

  if (error) {
    console.error("[support] submit_app_feedback failed", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    })
    throw new Error(error.message)
  }

  const payload = data as { id?: string }
  if (!payload?.id) throw new Error("Missing ticket id")
  return { id: payload.id }
}

export async function appendSupportMessage(input: {
  sessionId: string
  ticketId: string
  message: string
  imageUrl?: string | null
  author?: "user" | "assist"
}): Promise<void> {
  const supabase = getSupabaseAdmin()
  const trimmedMessage = input.message.trim()
  const trimmedImage = input.imageUrl?.trim() || null
  if (!trimmedMessage && !trimmedImage) {
    throw new Error("message_required")
  }

  const baseArgs = {
    p_device_id: input.sessionId,
    p_feedback_id: input.ticketId,
    p_message: trimmedMessage || (trimmedImage ? " " : ""),
    p_image_url: trimmedImage,
  }

  const author = input.author ?? "user"
  const extended = await supabase.rpc("append_app_feedback_message", {
    ...baseArgs,
    p_author: author,
  })

  let error = extended.error
  if (error && shouldFallbackLegacySubmit(error)) {
    // Legacy append always stores author=user — fine for visitor replies.
    console.warn(
      "[support] append_app_feedback_message p_author unavailable; falling back to legacy RPC",
      {
        code: error.code,
        message: error.message,
      }
    )
    const legacy = await supabase.rpc("append_app_feedback_message", baseArgs)
    error = legacy.error
  }

  if (error) {
    if (error.message.includes("ticket_closed")) {
      throw new Error("ticket_closed")
    }
    console.error("[support] append_app_feedback_message failed", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    })
    throw new Error(error.message)
  }
}

export async function updateSupportVisitor(input: {
  sessionId: string
  ticketId: string
  name?: string | null
  requestHuman?: boolean
}): Promise<void> {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.rpc("update_app_feedback_visitor", {
    p_device_id: input.sessionId,
    p_feedback_id: input.ticketId,
    p_name: input.name ?? null,
    p_request_human: input.requestHuman ?? false,
  })
  if (error) throw new Error(error.message)
}

export async function markSupportTicketSeen(input: {
  sessionId: string
  ticketId: string
}): Promise<void> {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.rpc("mark_app_feedback_reply_seen", {
    p_device_id: input.sessionId,
    p_feedback_id: input.ticketId,
  })
  if (error) throw new Error(error.message)
}
