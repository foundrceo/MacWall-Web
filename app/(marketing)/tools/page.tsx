import { JsonLd } from "@/components/seo/json-ld"
import { ToolsHubPage } from "@/components/tools/tool-spec"
import { createSeoPageMetadata } from "@/lib/seo/create-page-metadata"
import { collectionPageJsonLd, faqPageJsonLd } from "@/lib/seo/json-ld-helpers"
import { TOOLS_HUB_FAQ, tools, toolsHubPage } from "@/lib/tools/tools"

export const dynamic = "force-static"

export const metadata = createSeoPageMetadata(toolsHubPage)

export default function ToolsPage() {
  return (
    <>
      <JsonLd
        payload={collectionPageJsonLd({
          pathname: toolsHubPage.pathname,
          name: toolsHubPage.headline,
          description: toolsHubPage.description,
          breadcrumbLabel: "Tools",
          items: tools.map((tool) => ({
            name: tool.name,
            pathname: tool.pathname,
          })),
        })}
      />
      <JsonLd payload={faqPageJsonLd(TOOLS_HUB_FAQ)} />
      <ToolsHubPage faq={TOOLS_HUB_FAQ} />
    </>
  )
}
