import {
  resolveTikTokEventsApiAccessToken,
  resolveTikTokPixelId,
  resolveTikTokTestEventCode,
} from "@/lib/analytics/tiktok-config"
import {
  hashTikTokEmail,
  hashTikTokExternalId,
  hashTikTokPhone,
} from "@/lib/analytics/tiktok-hash"
import {
  macwallProProperties,
  type TikTokTrackEvent,
} from "@/lib/analytics/tiktok-shared"

const TIKTOK_EVENTS_API_URL =
  "https://business-api.tiktok.com/open_api/v1.3/pixel/track/"

export type TikTokServerEventInput = {
  event: TikTokTrackEvent
  eventId: string
  url: string
  ip?: string | null
  userAgent?: string | null
  referrer?: string | null
  sessionId?: string | null
  email?: string | null
  phone?: string | null
  ttclid?: string | null
  ttp?: string | null
  searchString?: string | null
}

type TikTokTrackResponse = {
  code?: number
  message?: string
  request_id?: string
}

export async function sendTikTokServerEvent(
  input: TikTokServerEventInput
): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const accessToken = resolveTikTokEventsApiAccessToken()
  const pixelCode = resolveTikTokPixelId()

  if (!accessToken || !pixelCode) {
    return { ok: true, skipped: true }
  }

  const user: Record<string, string> = {}
  if (input.email) user.email = hashTikTokEmail(input.email)
  if (input.phone) user.phone_number = hashTikTokPhone(input.phone)
  if (input.sessionId) user.external_id = hashTikTokExternalId(input.sessionId)
  if (input.ttp) user.ttp = input.ttp

  const ad: Record<string, string> = {}
  if (input.ttclid) ad.callback = input.ttclid

  const properties = {
    ...macwallProProperties(),
    ...(input.searchString ? { query: input.searchString.slice(0, 256) } : {}),
  }

  const body: Record<string, unknown> = {
    pixel_code: pixelCode,
    event: input.event,
    event_id: input.eventId,
    timestamp: new Date().toISOString(),
    context: {
      ip: input.ip ?? undefined,
      user_agent: input.userAgent ?? undefined,
      page: {
        url: input.url,
        referrer: input.referrer ?? undefined,
      },
      user: Object.keys(user).length > 0 ? user : undefined,
      ad: Object.keys(ad).length > 0 ? ad : undefined,
    },
    properties,
  }

  const testEventCode = resolveTikTokTestEventCode()
  if (testEventCode) {
    body.test_event_code = testEventCode
  }

  try {
    const response = await fetch(TIKTOK_EVENTS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Token": accessToken,
      },
      body: JSON.stringify(body),
    })

    const payload = (await response
      .json()
      .catch(() => ({}))) as TikTokTrackResponse

    if (!response.ok || (payload.code != null && payload.code !== 0)) {
      return {
        ok: false,
        error: payload.message ?? `HTTP ${response.status}`,
      }
    }

    return { ok: true }
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "TikTok Events API request failed",
    }
  }
}
