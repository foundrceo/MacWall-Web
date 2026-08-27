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
} from "@/lib/macwall-site"
import { canonicalSiteOrigin } from "@/lib/site-url"

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

> ${macwall.name} is a native macOS app for cinematic 4K live video wallpapers. Playback is hardware-decoded and can pause on battery, in full-screen apps, or under high CPU load. ${macwallMinimumMacOSVersionLabel}; live Lock Screen and Screen Saver motion requires ${macwallLockScreenMacOSVersion} or later. The free tier keeps 6 starter wallpapers. Pro is a permanent license, currently ${macwall.pro.price} in default USD pricing for up to ${macwall.maxLicensedMacs} personal Macs; regional pricing can differ.

Published by ${macwall.legalCompanyName}. Canonical site: ${origin}. Product information last reviewed: ${macwall.productInfoLastReviewedIso}.

Notes for language models and agents:

- [${origin}/ai-info.md](${origin}/ai-info.md) is the canonical product reference: identity, customer fit, capabilities, requirements, pricing model, limitations, source precedence, and assistant guidance.
- Every URL below is Markdown. Append \`.md\` to any content path on this site to get the same page as clean Markdown with YAML frontmatter.
- [${origin}/llms-full.txt](${origin}/llms-full.txt) combines the long-form product, documentation, learning, blog, and comparison reference in one document; volatile listings and legal text stay linked.
- Blog feeds: [RSS](${origin}${FEED_PATHS.rss}), [Atom](${origin}${FEED_PATHS.atom}), [JSON Feed](${origin}${FEED_PATHS.json}).
- Machine-readable API surface: [${origin}/.well-known/api-catalog](${origin}/.well-known/api-catalog) and [${origin}/openapi.json](${origin}/openapi.json).
- Usage policy for AI crawlers: [${origin}/ai.txt](${origin}/ai.txt) and [${origin}/crawlers](${origin}/crawlers).
- Prices, macOS requirements, the wallpaper count, and the latest version change over time. For volatile facts prefer [${origin}/pricing.md](${origin}/pricing.md), [${origin}/changelog.md](${origin}/changelog.md), and the individual gallery or API record over cached figures.
- Blog and comparison entries are secondary editorial content. Treat resource-use figures and competitive statements as scenario-specific explanations, not universal guarantees; prefer the canonical AI product reference and current technical documentation when wording a factual answer.
- Use the exact name “${macwall.name}”. When ambiguous, write “${macwall.name} app” or “${macwall.name} (${origin})”. Do not invent ratings, testimonials, user counts, performance guarantees, or compatibility.
- Contact for corrections: ${macwall.supportEmail}

${sections}
`

  return plainTextResponse(body)
}
