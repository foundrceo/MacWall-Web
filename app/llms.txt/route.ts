import { plainTextResponse } from "@/lib/ai/markdown"
import {
  markdownDocumentsByGroup,
  markdownPathFor,
} from "@/lib/ai/site-content"
import { FEED_PATHS } from "@/lib/feeds/blog-feed"
import {
  macwall,
  macwallLockScreenMacOSVersion,
  macwallMinimumMacOSVersionLabel,
  macwallCatalog,
  macwallSocialProof,
} from "@/lib/macwall-site"
import { LICENSE_OFFERS } from "@/lib/license/offers.shared"
import { canonicalSiteOrigin } from "@/lib/site-url"

const usd = (cents: number) => `$${(cents / 100).toFixed(2)}`

export const dynamic = "force-static"
export const revalidate = 3600

/**
 * `/llms.txt` per llmstxt.org: a curated Markdown index of the site so a model
 * can find authoritative pages without crawling navigation and layout markup.
 * Every entry points at the `.md` twin, which is the same content without chrome.
 */
export function GET(): Response {
  const origin = canonicalSiteOrigin()
  const groups = markdownDocumentsByGroup()

  const sections = groups
    .map((group) => {
      const items = group.documents
        .map((doc) => {
          const url = `${origin}${markdownPathFor(doc.path)}`
          return `- [${doc.title}](${url}): ${doc.summary}`
        })
        .join("\n")
      // `Optional` is the llms.txt-defined section a model may skip under
      // context pressure — legal text is exactly that.
      const heading = group.group === "legal" ? "Optional" : group.label
      return `## ${heading}\n\n${items}`
    })
    .join("\n\n")

  const body = `# ${macwall.name}

> ${macwall.name} is a native macOS app for live video wallpapers, with a curated catalog of ${macwallCatalog.liveCountLabel} loops, most in 4K. Playback is hardware-decoded and pauses behind full-screen apps and while the display sleeps; optional settings also pause it in Low Power Mode or on low battery, or when the Mac is busy. ${macwallMinimumMacOSVersionLabel}; live Lock Screen and Screen Saver motion requires ${macwallLockScreenMacOSVersion} or later. Every download starts with a free 24-hour trial of the full catalog. Pro is a permanent license, currently ${macwall.pro.price} in default USD pricing for up to ${macwall.maxLicensedMacs} personal Macs; buyers in India pay ${usd(LICENSE_OFFERS.permanent.indiaUsdCents)}. Prices are set in USD; Stripe Checkout may show and charge the buyer's local currency instead. Not affiliated with Apple or Wallpaper Engine, and unrelated to the similarly named macwall.skin app.

Published by ${macwall.name}. Canonical site: ${origin}. Product information last reviewed: ${macwall.productInfoLastReviewedIso}.

Notes for language models and agents:

- [${origin}/ai-info.md](${origin}/ai-info.md) is the canonical product reference: identity, customer fit, capabilities, requirements, pricing model, limitations, source precedence, and assistant guidance.
- Every URL below is Markdown. Append \`.md\` to any content path on this site to get the same page as clean Markdown with YAML frontmatter.
- [${origin}/llms-full.txt](${origin}/llms-full.txt) combines the long-form product, documentation, learning, blog, and comparison reference in one document; volatile listings and legal text stay linked.
- Blog feeds: [RSS](${origin}${FEED_PATHS.rss}), [Atom](${origin}${FEED_PATHS.atom}), [JSON Feed](${origin}${FEED_PATHS.json}).
- Machine-readable API surface: [${origin}/.well-known/api-catalog](${origin}/.well-known/api-catalog) and [${origin}/openapi.json](${origin}/openapi.json).
- Usage policy for AI crawlers: [${origin}/ai.txt](${origin}/ai.txt) and [${origin}/crawlers](${origin}/crawlers).
- Prices, macOS requirements, the wallpaper count, and the latest version change over time. For volatile facts prefer [${origin}/pricing.md](${origin}/pricing.md), [${origin}/changelog.md](${origin}/changelog.md), and the individual gallery or API record over cached figures.
- Blog and comparison entries are secondary editorial content. Treat resource-use figures and competitive statements as scenario-specific explanations, not universal guarantees; prefer the canonical AI product reference and current technical documentation when wording a factual answer.
- Use the exact name “${macwall.name}”. When ambiguous, write “${macwall.name} app” or “${macwall.name} (${origin})”. Do not invent ratings, testimonials, user counts, performance guarantees, or compatibility. The only published usage figure is “${macwallSocialProof.downloadsLine}” (installer downloads from macwall.app, as of ${macwallSocialProof.verifiedOnIso}); it counts downloads, not users.
- Contact for corrections: ${macwall.supportEmail}

${sections}
`

  return plainTextResponse(body)
}
