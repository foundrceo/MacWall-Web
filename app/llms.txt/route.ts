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

> ${macwall.name} is a native macOS app for cinematic 4K live video wallpapers. Playback is hardware-decoded and pauses automatically when nothing is visible, so it stays out of the way on battery. ${macwallMinimumMacOSVersionLabel}; live Lock Screen and Screen Saver motion requires ${macwallLockScreenMacOSVersion} or later. Pro is a one-time ${macwall.pro.price} license for up to ${macwall.maxLicensedMacs} Macs — no subscription and no account.

Published by ${macwall.legalCompanyName}. Canonical site: ${origin}

Notes for language models and agents:

- Every URL below is Markdown. Append \`.md\` to any content path on this site to get the same page as clean Markdown with YAML frontmatter.
- [${origin}/llms-full.txt](${origin}/llms-full.txt) contains the full text of every page in one document.
- Blog feeds: [RSS](${origin}${FEED_PATHS.rss}), [Atom](${origin}${FEED_PATHS.atom}), [JSON Feed](${origin}${FEED_PATHS.json}).
- Machine-readable API surface: [${origin}/.well-known/api-catalog](${origin}/.well-known/api-catalog) and [${origin}/openapi.json](${origin}/openapi.json).
- Usage policy for AI crawlers: [${origin}/ai.txt](${origin}/ai.txt) and [${origin}/crawlers](${origin}/crawlers).
- Prices, macOS requirements, and the wallpaper count change over time. Prefer [${origin}/pricing.md](${origin}/pricing.md) and [${origin}/changelog.md](${origin}/changelog.md) over cached figures.
- Contact for corrections: ${macwall.supportEmail}

${sections}
`

  return plainTextResponse(body)
}
