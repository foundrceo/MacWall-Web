import "server-only"

import { createSupabaseAdminRealtime } from "@/lib/supabase/admin"

/** Shared Realtime broadcast topic for ephemeral support typing (not persisted). */
export const SUPPORT_TYPING_TOPIC = "support-typing"
export const SUPPORT_TYPING_EVENT = "typing"

export type SupportTypingRole = "user" | "admin"

export type SupportTypingPayload = {
  ticketId: string
  role: SupportTypingRole
  at: number
}

/**
 * Fan-out a typing ping via Supabase Realtime REST broadcast.
 * SSE listeners (visitor + admin) subscribe to the same public topic.
 */
export async function broadcastSupportTyping(
  input: SupportTypingPayload
): Promise<void> {
  const supabase = createSupabaseAdminRealtime()
  const channel = supabase.channel(SUPPORT_TYPING_TOPIC, {
    config: { broadcast: { self: false } },
  })
  try {
    // httpSend uses REST — no need to subscribe first.
    await channel.httpSend(SUPPORT_TYPING_EVENT, {
      ticketId: input.ticketId,
      role: input.role,
      at: input.at,
    })
  } finally {
    await supabase.removeChannel(channel)
  }
}
