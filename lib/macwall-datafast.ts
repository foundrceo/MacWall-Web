/** DataFast analytics — site tracking, bot traffic, and Stripe revenue attribution. */

export const DATAFAST_WEBSITE_ID = "dfid_PRxi18U1KokXWrniJ0Qlr" as const

export const DATAFAST_DOMAIN = "macwall.app" as const

/** Server-only env var for optional bot-traffic request auth (`dfbot_...`). */
export const DATAFAST_BOT_TOKEN_ENV = "DATAFAST_BOT_TOKEN" as const

/** First-party cookies set by the DataFast SDK / script. */
export const DATAFAST_VISITOR_COOKIE = "datafast_visitor_id" as const

export const DATAFAST_SESSION_COOKIE = "datafast_session_id" as const
