import { notFound } from "next/navigation"

import { JsonLd } from "@/components/seo/json-ld"
import { ColorPalette } from "@/components/tools/color-palette"
import { ScreenResolution } from "@/components/tools/screen-resolution"
import { ToolSpecPage } from "@/components/tools/tool-spec"
import { WallpaperResizer } from "@/components/tools/wallpaper-resizer"
import { createSeoPageMetadata } from "@/lib/seo/create-page-metadata"
import {
  faqPageJsonLd,
  jsonLdGraph,
  siteEntityIds,
  webPageJsonLd,
} from "@/lib/seo/json-ld-helpers"
import { canonicalSiteOrigin, canonicalSitePath } from "@/lib/site-url"
import { getTool, TOOLS_HUB_PATH, tools } from "@/lib/tools/tools"
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
  const origin = canonicalSiteOrigin()
  const url = canonicalSitePath(tool.pathname)
  const appId = `${url}#app`
  const organizationId = siteEntityIds(origin).organization

  // WebPage carries the breadcrumb and points at the tool; `breadcrumb` is a
  // WebPage property, so it never sits on the WebApplication itself.
  const jsonLd = jsonLdGraph(
    webPageJsonLd({
      origin,
      pathname: tool.pathname,
      name: tool.title,
      headline: tool.headline,
      description: tool.description,
      mainEntity: appId,
      breadcrumbs: [{ name: "Tools", pathname: TOOLS_HUB_PATH }],
      breadcrumbName: tool.name,
      dateModified: tool.updatedAt,
    }),
    {
      "@type": "WebApplication",
      "@id": appId,
      name: tool.name,
      url,
      description: tool.description,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any (runs in a web browser)",
      browserRequirements: "Requires JavaScript",
      isAccessibleForFree: true,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        seller: { "@id": organizationId },
      },
      publisher: { "@id": organizationId },
    }
  )

  return (
    <>
      <JsonLd payload={jsonLd} />
      <JsonLd payload={faqPageJsonLd(tool.faq)} />
      <ToolSpecPage tool={tool}>{TOOL_UI[tool.slug]?.()}</ToolSpecPage>
    </>
  )
}
