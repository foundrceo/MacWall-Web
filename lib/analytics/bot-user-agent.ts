/**
 * Crawlers, AI fetchers, link previews and headless browsers. "bot",
 * "crawler" and "spider" catch most of them (Googlebot, bingbot, Applebot,
 * GPTBot, ClaudeBot, PerplexityBot, CCBot, and ChatGPT-User through its
 * openai.com/bot URL); the ones without those words are named.
 */
const BOT_USER_AGENT =
  /bot|crawler|spider|GPTBot|ClaudeBot|Claude-User|PerplexityBot|Perplexity-User|bingbot|Googlebot|Google-InspectionTool|Applebot|meta-externalagent|facebookexternalhit|Bytespider|CCBot|HeadlessChrome|Lighthouse/i

/**
 * True for automated user agents. Server routes use it to keep crawler hits
 * out of the download analytics; the visitor still gets the same response.
 */
export function isBotUserAgent(userAgent: string | null | undefined): boolean {
  return Boolean(userAgent && BOT_USER_AGENT.test(userAgent))
}
