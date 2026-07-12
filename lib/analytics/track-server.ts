import { getSupabaseAdmin } from "@/lib/supabase/admin"

import {
  isSiteAnalyticsEventName,
  type SiteAnalyticsEventName,
  type SiteAnalyticsMetadata,
} from "@/lib/analytics/events"

type TrackSiteEventInput = {
  eventName: SiteAnalyticsEventName
  path?: string | null
  referrer?: string | null
  userAgent?: string | null
  sessionId?: string | null
  metadata?: SiteAnalyticsMetadata
}

export async function trackSiteEvent(
  input: TrackSiteEventInput
): Promise<void> {
  if (!isSiteAnalyticsEventName(input.eventName)) return

  try {
    const supabase = getSupabaseAdmin()
    const { error } = await supabase.from("site_analytics_events").insert({
      event_name: input.eventName,
      path: input.path ?? null,
      referrer: input.referrer ?? null,
      user_agent: input.userAgent ?? null,
      session_id: input.sessionId ?? null,
      metadata: input.metadata ?? {},
    })

    if (error) {
      console.error("[analytics] insert failed:", error.message)
    }
  } catch (error) {
    console.error("[analytics] track skipped:", error)
  }
}
