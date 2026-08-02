import { SeoPageShell } from "@/components/content/seo-page-shell"
import { HubLinkList } from "@/components/content/hub-link-list"
import { JsonLd } from "@/components/seo/json-ld"
import { collectionPageJsonLd } from "@/lib/seo/json-ld-helpers"
import { docsPagesBySection } from "@/lib/docs/pages"
import { macwall } from "@/lib/macwall-site"
import { createSeoPageMetadata } from "@/lib/seo/create-page-metadata"
import type { SeoContentPage } from "@/lib/content/types"

const PAGE: SeoContentPage = {
  slug: "docs",
  pathname: "/docs",
  title: `${macwall.name} Documentation`,
  headline: `${macwall.name} documentation`,
  description:
    "Install MacWall, set live wallpapers, enable the live Lock Screen, tune performance, manage your license, and fix common issues.",
  keywords: [
    "macwall documentation",
    "macwall help",
    "macwall guide",
    "live wallpaper mac setup",
  ],
  sections: [],
}

export const metadata = createSeoPageMetadata(PAGE)

export default function DocsHubPage() {
  const groups = docsPagesBySection()

  return (
    <>
      <JsonLd
        payload={collectionPageJsonLd({
          pathname: PAGE.pathname,
          name: PAGE.headline,
          description: PAGE.description,
          breadcrumbLabel: "Docs",
          items: groups.flatMap((group) =>
            group.pages.map((page) => ({
              name: page.title,
              pathname: page.pathname,
            }))
          ),
        })}
      />
      <SeoPageShell
        headline={PAGE.headline}
        description={PAGE.description}
        breadcrumbs={[{ label: "Home", href: "/" }]}
      >
        {groups.map((group) => (
          <HubLinkList
            key={group.id}
            title={group.label}
            items={group.pages.map((page) => ({
              href: page.pathname,
              label: page.navLabel,
              description: page.description,
            }))}
          />
        ))}
        <HubLinkList
          title="Related"
          items={[
            {
              href: "/learn",
              label: "Learn",
              description:
                "Concept explainers: how live wallpapers, codecs, displays, and battery accounting actually work.",
            },
            {
              href: "/blog",
              label: "Blog",
              description:
                "Guides, app comparisons, and macOS news from the MacWall team.",
            },
            {
              href: "/changelog",
              label: "Changelog",
              description: "Every shipped release, newest first.",
            },
          ]}
        />
      </SeoPageShell>
    </>
  )
}
