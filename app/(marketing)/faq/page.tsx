import { HubLinkList } from "@/components/content/hub-link-list"
import { SeoPageShell } from "@/components/content/seo-page-shell"
import { JsonLd } from "@/components/seo/json-ld"
import { faqAnswers, faqAnswersByTopic, faqHubPage } from "@/lib/faq/answers"
import { faqHubJsonLd } from "@/lib/faq/json-ld"
import { createSeoPageMetadata } from "@/lib/seo/create-page-metadata"

export const metadata = createSeoPageMetadata(faqHubPage)

export default function FaqHubPage() {
  return (
    <>
      <JsonLd payload={faqHubJsonLd(faqAnswers())} />
      <SeoPageShell
        headline={faqHubPage.headline}
        description={faqHubPage.description}
        sections={faqHubPage.sections}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "FAQ", href: faqHubPage.pathname },
        ]}
      >
        {faqAnswersByTopic().map((group) => (
          <HubLinkList
            key={group.topic}
            title={group.label}
            items={group.answers.map((answer) => ({
              href: answer.pathname,
              label: answer.question,
              description: answer.description,
            }))}
          />
        ))}
        <HubLinkList
          title="Step-by-step guides"
          items={[
            {
              href: "/docs/install-macwall",
              label: "Install MacWall",
              description:
                "Download, install and set your first live wallpaper in about two minutes.",
            },
            {
              href: "/docs/uninstall-macwall",
              label: "Uninstall MacWall",
              description:
                "Remove the app and its downloads and get your own wallpaper back.",
            },
            {
              href: "/docs/troubleshooting",
              label: "Fix common issues",
              description:
                "A wallpaper that won't appear, a frozen frame or downloads that fail.",
            },
          ]}
        />
      </SeoPageShell>
    </>
  )
}
