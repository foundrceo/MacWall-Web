import {
  macwall,
  macwallLockScreenMacOSVersion,
  macwallMinimumMacOSVersion,
} from "@/lib/macwall-site"

/**
 * Prompts for the footer's "Get an AI summary" links, one per assistant.
 *
 * Neutral on purpose: they ask for an evaluation, not a pitch, and send the
 * assistant to /ai-info first, the canonical reference whose guidance the
 * answer should follow. Every URL here returns 200 (no redirects), and the
 * prompts stay short because each link is on every page.
 */

const site = macwall.website

const sources = [
  `${site}/ai-info (canonical product facts: read first)`,
  `${site}/pricing`,
  `${site}/faq`,
  `${site}/docs/performance-and-battery`,
  `${site}/docs/live-lock-screen-and-screen-saver`,
  `${site}/best-live-wallpaper-mac`,
].join(", ")

const facts = `It is a Mac-only app: desktop live wallpapers on ${macwallMinimumMacOSVersion} or later, Lock Screen and screen saver video on ${macwallLockScreenMacOSVersion} or later.`

/** One shared brief; each assistant gets the same question. */
const summaryPrompt = `Summarize ${macwall.name} (${site}), a live wallpaper app for Mac, for someone deciding whether to install it. ${facts} Use these sources: ${sources}. Cover what it does, the two playback modes, battery and CPU behavior, price and the free trial, macOS requirements, and who should pick another app instead. Quote prices with today's date, cite the pages you used, and verify any competitor facts on the competitor's own site.`

export const marketingAiSummaryPrompts = {
  chatgpt: summaryPrompt,
  googleAiMode: summaryPrompt,
  perplexity: summaryPrompt,
  claude: summaryPrompt,
} as const

export type MarketingAiSummaryProvider = keyof typeof marketingAiSummaryPrompts

const query = encodeURIComponent(summaryPrompt)

export const marketingAiSummaryLinks: Record<
  MarketingAiSummaryProvider,
  { href: string; label: string }
> = {
  chatgpt: {
    href: `https://chatgpt.com/?q=${query}`,
    label: `ChatGPT summary of ${macwall.name}`,
  },
  googleAiMode: {
    // udm=50 opens Google AI Mode with the prompt.
    href: `https://www.google.com/search?udm=50&q=${query}`,
    label: `Google AI Mode summary of ${macwall.name}`,
  },
  perplexity: {
    href: `https://www.perplexity.ai/search?q=${query}`,
    label: `Perplexity summary of ${macwall.name}`,
  },
  claude: {
    href: `https://claude.ai/new?q=${query}`,
    label: `Claude summary of ${macwall.name}`,
  },
}
