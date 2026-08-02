import { SeoPageShell } from "@/components/content/seo-page-shell"
import { HubLinkList } from "@/components/content/hub-link-list"
import { JsonLd } from "@/components/seo/json-ld"
import { learnPages } from "@/lib/learn/pages"
import { collectionPageJsonLd } from "@/lib/seo/json-ld-helpers"
import { createSeoPageMetadata } from "@/lib/seo/create-page-metadata"
import type { SeoContentPage } from "@/lib/content/types"

const PAGE: SeoContentPage = {
  slug: "learn",
  pathname: "/learn",
  title: "Learn: How Live Wallpapers Work on Mac",
  headline: "Learn how live wallpapers work",
  description:
    "Plain-English explainers for live wallpapers on Mac: the macOS wallpaper layer, hardware video decode, codecs, display resolution, and battery impact.",
  keywords: [
    "how live wallpapers work",
    "macos wallpaper layer",
    "hardware video decode mac",
    "live wallpaper battery",
  ],
  sections: [],
}

export const metadata = createSeoPageMetadata(PAGE)

export default function LearnHubPage() {
  return (
    <>
      <JsonLd
        payload={collectionPageJsonLd({
          pathname: PAGE.pathname,
          name: PAGE.headline,
          description: PAGE.description,
          breadcrumbLabel: "Learn",
          items: learnPages.map((page) => ({
            name: page.title,
            pathname: page.pathname,
          })),
        })}
      />
      <SeoPageShell
        headline={PAGE.headline}
        description={PAGE.description}
        breadcrumbs={[{ label: "Home", href: "/" }]}
        sections={[
          {
            type: "p",
            text: "These pages explain the mechanics behind live wallpapers — why video-based wallpapers are cheap to run, how macOS composites the wallpaper layer, which codecs decode in hardware, and what actually costs battery. For step-by-step product instructions see [the documentation](/docs); for comparisons and news see [the blog](/blog).",
          },
        ]}
      >
        <HubLinkList
          title="Explainers"
          items={learnPages.map((page) => ({
            href: page.pathname,
            label: page.navLabel,
            description: page.takeaway,
          }))}
        />
        <HubLinkList
          title="Put it into practice"
          items={[
            {
              href: "/docs/performance-and-battery",
              label: "Performance and battery settings",
              description:
                "Every pause rule in MacWall, and how to verify real CPU usage in Activity Monitor.",
            },
            {
              href: "/docs/import-your-own-videos",
              label: "Import your own videos",
              description:
                "Turn your own footage into a wallpaper, with the encoding settings that keep it efficient.",
            },
            {
              href: "/wallpapers",
              label: "Browse the wallpaper gallery",
              description:
                "Over 1,000 curated 4K loops, filterable by category, tag, and popularity.",
            },
          ]}
        />
      </SeoPageShell>
    </>
  )
}
