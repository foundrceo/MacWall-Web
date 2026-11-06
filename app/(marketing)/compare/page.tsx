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
import { comparedAppNode } from "@/components/content/comparison-landing-page"
import { JsonLd } from "@/components/seo/json-ld"
import { macwall, macwallInstallerLatestPath } from "@/lib/macwall-site"
import { proseBody, proseLinkProse } from "@/lib/marketing-prose-classes"
import {
  compareAppTable,
  compareIndexPage,
  compareIntroSections,
  compareOutroSections,
  compareSourcesSections,
  comparisonPages,
  macWallpaperApps,
  type MacWallpaperAppEntry,
} from "@/lib/seo/compare-pages"
import { createSeoPageMetadata } from "@/lib/seo/create-page-metadata"
import {
  absoluteUrl,
  collectionPageJsonLd,
  faqPageJsonLd,
  jsonLdGraph,
  siteEntityIds,
  type JsonLdNode,
} from "@/lib/seo/json-ld-helpers"
import { canonicalSiteOrigin } from "@/lib/site-url"
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

/** "November 6, 2026", as the other comparison pages show it. */
function checkedDateLabel(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  })
}

/**
 * The compared apps as an ItemList of SoftwareApplication nodes. MacWall is
 * the site graph's own node; for the others only sourced fields are used
 * (name, developer when the source names one, platforms, source URL), never
 * a rating or an invented value.
 */
function appsItemList(
  origin: string,
  apps: readonly MacWallpaperAppEntry[]
): JsonLdNode {
  const ids = siteEntityIds(origin)
  return {
    "@type": "ItemList",
    "@id": `${absoluteUrl(origin, compareIndexPage.pathname)}#apps`,
    name: "Mac wallpaper apps compared",
    numberOfItems: apps.length,
    itemListElement: apps.map((app, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item:
        app.name === macwall.name
          ? { "@id": ids.softwareApplication }
          : // Not a SoftwareApplication: no offers or ratings for other
            // apps, so it would be an invalid Software App item.
            comparedAppNode({
              name: app.name,
              url: absoluteUrl(origin, app.siteUrl),
              operatingSystem: app.platforms,
              developer: /^Not (stated|named)/.test(app.developer)
                ? undefined
                : app.developer,
            }),
    })),
  }
}

export default function CompareIndexPage() {
  const page = compareIndexPage
  const origin = canonicalSiteOrigin()
  const apps = macWallpaperApps()

  return (
    <>
      <JsonLd
        payload={jsonLdGraph(
          collectionPageJsonLd({
            pathname: page.pathname,
            name: page.headline,
            description: page.description,
            breadcrumbLabel: "Compare",
            dateModified: page.updatedAt,
            items: comparisonPages.map((entry) => ({
              name: entry.headline,
              pathname: entry.pathname,
            })),
          }),
          appsItemList(origin, apps)
        )}
      />
      {page.faq && page.faq.length > 0 ? (
        <JsonLd payload={faqPageJsonLd(page.faq)} />
      ) : null}
      <SeoPageShell
        headline={page.headline}
        description={page.description}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Compare", href: page.pathname },
        ]}
        sections={compareIntroSections}
        faq={page.faq}
        meta={
          page.updatedAt ? (
            <>
              Last checked{" "}
              <time dateTime={page.updatedAt}>
                {checkedDateLabel(page.updatedAt)}
              </time>{" "}
              by the {macwall.name} team
            </>
          ) : undefined
        }
      >
        <div className={cn(proseFlow, "mt-5")}>
          <ContentTable
            block={compareAppTable(apps)}
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
          <ContentBody sections={compareSourcesSections(apps)} />
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
            Best live wallpaper apps
          </ProseSecondaryLink>
        </ProseActionRow>
      </SeoPageShell>
    </>
  )
}
