import { plainTextResponse } from "@/lib/ai/markdown"
import { siteMarkdownDocuments } from "@/lib/ai/site-content"
import {
  macwall,
  macwallLockScreenMacOSVersion,
  macwallMinimumMacOSVersionLabel,
} from "@/lib/macwall-site"
import { canonicalSiteOrigin } from "@/lib/site-url"

export const dynamic = "force-static"
export const revalidate = 3600

/**
 * `/llms-full.txt` — every content page concatenated in one document so a model
 * can ingest the whole site in a single fetch. Index and listing pages are
 * excluded (they only restate links that appear here in full anyway).
 */
export async function GET(): Promise<Response> {
  const origin = canonicalSiteOrigin()
  const documents = siteMarkdownDocuments().filter(
    (doc) => doc.includeInFullText
  )

  const rendered = await Promise.all(
    documents.map(async (doc) => {
      const markdown = await doc.render()
      return `<!-- BEGIN ${origin}${doc.path} -->\n\n${markdown.trim()}\n\n<!-- END ${origin}${doc.path} -->`
    })
  )

  const header = `# ${macwall.name} — full site text

> ${macwall.name} is a native macOS app for cinematic 4K live video wallpapers, with hardware-decoded playback, automatic pausing, live Lock Screen on ${macwallLockScreenMacOSVersion}+, and a one-time ${macwall.pro.price} license. ${macwallMinimumMacOSVersionLabel}.

Canonical site: ${origin}
Publisher: ${macwall.legalCompanyName}
Contact: ${macwall.supportEmail}
Documents: ${documents.length}
Generated: ${new Date().toISOString()}

Curated index: ${origin}/llms.txt
Blog feed: ${origin}/rss.xml
API catalog: ${origin}/.well-known/api-catalog
AI usage policy: ${origin}/ai.txt

Each document below is delimited by \`<!-- BEGIN <url> -->\` and \`<!-- END <url> -->\` comments. Legal text, the changelog, and gallery listings are omitted here because they change often — fetch those pages directly.

---
`

  return plainTextResponse(`${header}\n${rendered.join("\n\n")}\n`)
}
