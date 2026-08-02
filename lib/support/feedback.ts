import "server-only"

import { getSupabaseAdmin } from "@/lib/supabase/admin"

export type SupportSentiment = "like" | "dislike" | "neutral"

export type SupportMessage = {
  id: string
  author: "user" | "admin"
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
  messages: RpcMessage[] | null
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
    messages: (row.messages ?? []).map((m) => ({
      id: m.id,
      author: m.author === "admin" ? "admin" : "user",
      body: m.body,
      imageUrl: m.image_url ?? null,
      createdAt: m.created_at,
    })),
  }
}

export async function listSupportTickets(sessionId: string): Promise<SupportTicket[]> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.rpc("app_feedback_for_device", {
    p_device_id: sessionId,
  })
  if (error) throw new Error(error.message)
  return ((data ?? []) as RpcRow[]).map(mapTicket)
}

export async function createSupportTicket(input: {
  sessionId: string
  sentiment: SupportSentiment
  name?: string | null
  message: string
  imageUrl?: string | null
  userAgent?: string | null
}): Promise<{ id: string }> {
  const supabase = getSupabaseAdmin()
  const trimmedMessage = input.message.trim()
  const trimmedImage = input.imageUrl?.trim() || null
  if (!trimmedMessage && !trimmedImage) {
    throw new Error("message_required")
  }
  const { data, error } = await supabase.rpc("submit_app_feedback", {
    p_device_id: input.sessionId,
    p_sentiment: input.sentiment,
    p_name: input.name ?? null,
    p_message: trimmedMessage || (trimmedImage ? " " : ""),
    p_image_url: trimmedImage,
    p_app_version: "Web",
    p_os_version: input.userAgent?.slice(0, 80) ?? null,
  })
  if (error) throw new Error(error.message)
  const payload = data as { id?: string }
  if (!payload?.id) throw new Error("Missing ticket id")
  return { id: payload.id }
}

export async function appendSupportMessage(input: {
  sessionId: string
  ticketId: string
  message: string
  imageUrl?: string | null
}): Promise<void> {
  const supabase = getSupabaseAdmin()
  const trimmedMessage = input.message.trim()
  const trimmedImage = input.imageUrl?.trim() || null
  if (!trimmedMessage && !trimmedImage) {
    throw new Error("message_required")
  }
  const { error } = await supabase.rpc("append_app_feedback_message", {
    p_device_id: input.sessionId,
    p_feedback_id: input.ticketId,
    p_message: trimmedMessage || (trimmedImage ? " " : ""),
    p_image_url: trimmedImage,
  })
  if (error) {
    if (error.message.includes("ticket_closed")) {
      throw new Error("ticket_closed")
    }
    throw new Error(error.message)
  }
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
