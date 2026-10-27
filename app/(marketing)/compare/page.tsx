import Link from "next/link"
import type { ReactNode } from "react"
import { ContentBody } from "@/components/content/content-body"
import { ContentTable } from "@/components/content/content-table"
import { HubLinkList } from "@/components/content/hub-link-list"
import {
  ProseActionRow,
  ProseSecondaryLink,
} from "@/components/content/prose-action-row"
import { SeoPageShell } from "@/components/content/seo-page-shell"
import { TrackedDownloadButton } from "@/components/analytics/tracked-marketing-buttons"
import { legalLinkProse } from "@/components/legal/legal-classes"
import { JsonLd } from "@/components/seo/json-ld"
import { macwallInstallerLatestPath } from "@/lib/macwall-site"
import { proseBody, proseLinkProse } from "@/lib/marketing-prose-classes"
import {
  compareAppTable,
  compareIndexPage,
  compareIntroSections,
  compareOutroSections,
  compareSourcesSections,
  comparisonPages,
} from "@/lib/seo/compare-pages"
import { createSeoPageMetadata } from "@/lib/seo/create-page-metadata"
import { collectionPageJsonLd, faqPageJsonLd } from "@/lib/seo/json-ld-helpers"
import { cn } from "@/lib/utils"

export const metadata = createSeoPageMetadata(compareIndexPage)

const INLINE_TOKEN = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g
const INLINE_LINK = /^\[([^\]]+)\]\(([^)]+)\)$/

/**
 * Inline markdown for the app table. Unlike ContentBody, links to other
 * developers' sites are `nofollow`: this table links out to every app.
 */
function renderTableInline(text: string): ReactNode[] {
  return text.split(INLINE_TOKEN).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      )
    }
    const link = part.match(INLINE_LINK)
    if (link) {
      const [, label, href] = link
      if (href.startsWith("/")) {
        return (
          <Link key={index} href={href}>
            {label}
          </Link>
        )
      }
      return (
        <a key={index} href={href} target="_blank" rel="nofollow noopener">
          {label}
        </a>
      )
    }
    return <span key={index}>{part}</span>
  })
}

const proseFlow = cn(proseBody, proseLinkProse, legalLinkProse)

export default function CompareIndexPage() {
  const page = compareIndexPage

  return (
    <>
      <JsonLd
        payload={collectionPageJsonLd({
          pathname: page.pathname,
          name: page.headline,
          description: page.description,
          breadcrumbLabel: "Compare",
          items: comparisonPages.map((entry) => ({
            name: entry.headline,
            pathname: entry.pathname,
          })),
        })}
      />
      {page.faq && page.faq.length > 0 ? (
        <JsonLd payload={faqPageJsonLd(page.faq)} />
      ) : null}
      <SeoPageShell
        headline={page.headline}
        description={page.description}
        breadcrumbs={[{ label: "Home", href: "/" }]}
        sections={compareIntroSections}
        faq={page.faq}
      >
        <div className={cn(proseFlow, "mt-5")}>
          <ContentTable
            block={compareAppTable}
            renderInline={renderTableInline}
          />
        </div>
        <div className="mt-12">
          <ContentBody sections={compareOutroSections} />
        </div>
        <div className="mt-12">
          <HubLinkList
            title="Our comparison pages"
            items={comparisonPages.map((entry) => ({
              href: entry.pathname,
              label: entry.headline,
              description: entry.description,
            }))}
          />
        </div>
        <div className="mt-12">
          <ContentBody sections={compareSourcesSections} />
        </div>
        <ProseActionRow>
          <TrackedDownloadButton
            href={macwallInstallerLatestPath}
            size="lg"
            location="compare_index"
          >
            Download for Mac
          </TrackedDownloadButton>
          <ProseSecondaryLink href="/best-live-wallpaper-mac">
            Live wallpaper apps compared
          </ProseSecondaryLink>
        </ProseActionRow>
      </SeoPageShell>
    </>
  )
}
