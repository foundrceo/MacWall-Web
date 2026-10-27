import { notFound } from "next/navigation"

import { JsonLd } from "@/components/seo/json-ld"
import { ColorPalette } from "@/components/tools/color-palette"
import { ScreenResolution } from "@/components/tools/screen-resolution"
import { ToolSpecPage } from "@/components/tools/tool-spec"
import { WallpaperResizer } from "@/components/tools/wallpaper-resizer"
import { macwall } from "@/lib/macwall-site"
import { createSeoPageMetadata } from "@/lib/seo/create-page-metadata"
import { faqPageJsonLd } from "@/lib/seo/json-ld-helpers"
import { canonicalSitePath } from "@/lib/site-url"
import { getTool, tools } from "@/lib/tools/tools"
import type { Metadata } from "next"

type PageProps = { params: Promise<{ slug: string }> }

export const dynamicParams = false

export function generateStaticParams() {
  return tools.map((tool) => ({ slug: tool.slug }))
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const tool = getTool((await params).slug)
  return tool ? createSeoPageMetadata(tool) : {}
}

const TOOL_UI: Record<string, () => React.ReactNode> = {
  "wallpaper-resizer": () => <WallpaperResizer />,
  "screen-resolution": () => <ScreenResolution />,
  "color-palette": () => <ColorPalette />,
}

export default async function ToolPage({ params }: PageProps) {
  const tool = getTool((await params).slug)
  if (!tool) notFound()
  const url = canonicalSitePath(tool.pathname)

  return (
    <>
      <JsonLd
        payload={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "@id": `${url}#app`,
          name: tool.name,
          url,
          description: tool.description,
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Any (runs in a web browser)",
          browserRequirements: "Requires JavaScript",
          isAccessibleForFree: true,
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          publisher: { "@id": `${canonicalSitePath("/")}/#organization` },
          provider: { "@type": "Organization", name: macwall.name },
          breadcrumb: {
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: canonicalSitePath("/"),
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Tools",
                item: canonicalSitePath("/tools"),
              },
              { "@type": "ListItem", position: 3, name: tool.name, item: url },
            ],
          },
        }}
      />
      <JsonLd payload={faqPageJsonLd(tool.faq)} />
      <ToolSpecPage tool={tool}>{TOOL_UI[tool.slug]?.()}</ToolSpecPage>
    </>
  )
}
