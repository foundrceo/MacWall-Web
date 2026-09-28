/**
 * Crawlers, link unfurlers, uptime/link checkers and scripted HTTP clients.
 * Deliberately conservative: a false positive only sends a real visitor to
 * /pricing instead of straight to Stripe. Used to keep bots from minting
 * Stripe Checkout Sessions (and pending license rows).
 */
const BOT_USER_AGENT =
  /bot\b|bot\/|crawl|spider|slurp|headless|lighthouse|pagespeed|facebookexternalhit|embedly|whatsapp|bingpreview|google-inspectiontool|python-requests|python-urllib|aiohttp|curl\/|wget\/|go-http-client|node-fetch|axios\/|undici|scrapy|httpx|libwww|feedfetcher|uptime|pingdom|monitor/i

export function isLikelyBotUserAgent(
  userAgent: string | null | undefined
): boolean {
  const ua = userAgent?.trim() ?? ""
  if (!ua) return true
  return BOT_USER_AGENT.test(ua)
}

/**
 * Only unmistakable automation (headless browsers, audit tools, no UA). For
 * requests made by our own page JS, where a false positive would block a
 * real buyer (e.g. an in-app browser whose UA names the host app).
 */
const AUTOMATION_USER_AGENT =
  /headless|lighthouse|pagespeed|phantomjs|puppeteer|playwright/i

export function isAutomationUserAgent(
  userAgent: string | null | undefined
): boolean {
  const ua = userAgent?.trim() ?? ""
  if (!ua) return true
  return AUTOMATION_USER_AGENT.test(ua)
}
