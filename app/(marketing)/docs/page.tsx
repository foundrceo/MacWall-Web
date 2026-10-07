import Link from "next/link"
import { ArrowRight01Icon, DiscordIcon, Mail01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { HelpSearchButton } from "@/components/help/help-search-button"
import { landingPageH1, landingPageLead } from "@/components/macwall-marketing/landing-type"
import {
  MarketingBodySection,
  MarketingTitleSection,
} from "@/components/macwall-marketing/marketing-inner-page"
import { JsonLd } from "@/components/seo/json-ld"
import { HELP_TOPICS } from "@/lib/docs/help-topics"
import { docsPagesBySection } from "@/lib/docs/pages"
import { macwall } from "@/lib/macwall-site"
import { createSeoPageMetadata } from "@/lib/seo/create-page-metadata"
import { collectionPageJsonLd } from "@/lib/seo/json-ld-helpers"
import type { SeoContentPage } from "@/lib/content/types"

const PAGE: SeoContentPage = {
  slug: "docs",
  pathname: "/docs",
  title: `${macwall.name} Help`,
  headline: "Help",
  description:
    "Find answers fast: install, live wallpapers, Lock Screen, your license, refunds, and fixes for common problems.",
  keywords: [
    "macwall help",
    "macwall documentation",
    "macwall support",
    "live wallpaper mac setup",
  ],
  sections: [],
}

export const metadata = createSeoPageMetadata(PAGE)

export default function HelpCenterPage() {
  const articles = docsPagesBySection().flatMap((group) => group.pages)

  return (
    <>
      <JsonLd
        payload={collectionPageJsonLd({
          pathname: PAGE.pathname,
          name: `${macwall.name} Help`,
          description: PAGE.description,
          breadcrumbLabel: "Help",
          items: articles.map((page) => ({
            name: page.title,
            pathname: page.pathname,
          })),
        })}
      />

      <MarketingTitleSection aria-labelledby="help-title">
        <h1 id="help-title" className={landingPageH1}>
          {PAGE.headline}
        </h1>
        <p className={landingPageLead}>{PAGE.description}</p>
        <HelpSearchButton />
      </MarketingTitleSection>

      <MarketingBodySection>
        <div className="w-full px-4 py-8 md:px-6">
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {HELP_TOPICS.map((topic) => (
              <li key={topic.href}>
                <Link
                  href={topic.href}
                  className="group flex h-full flex-col rounded-2xl bg-white/[0.03] p-5 no-underline ring-1 ring-white/[0.07] transition hover:bg-white/[0.06] hover:ring-white/[0.14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                >
                  <span className="inline-flex size-9 items-center justify-center rounded-xl bg-white/[0.07] text-white/80">
                    <HugeiconsIcon icon={topic.icon} size={18} strokeWidth={1.75} aria-hidden />
                  </span>
                  <span className="mt-4 text-[16px] font-medium text-white">
                    {topic.title}
                  </span>
                  <span className="mt-1.5 flex-1 text-[14px] leading-relaxed text-white/60">
                    {topic.description}
                  </span>
                  <span className="mt-4 inline-flex items-center gap-1 text-[13px] font-medium text-white/80 group-hover:text-white">
                    {topic.linkLabel}
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      size={14}
                      strokeWidth={2}
                      className="transition-transform group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <section
            aria-labelledby="help-contact-title"
            className="mt-6 flex flex-col gap-4 rounded-2xl bg-white/[0.03] p-5 ring-1 ring-white/[0.07] sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h2 id="help-contact-title" className="text-[16px] font-medium text-white">
                Still stuck?
              </h2>
              <p className="mt-1 text-[14px] text-white/60">
                A real person replies within 1 to 2 business days, usually sooner.
                You can also ask from inside the app.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/contact"
                className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-[14px] font-medium text-black no-underline transition hover:bg-white/90"
              >
                <HugeiconsIcon icon={Mail01Icon} size={16} strokeWidth={1.75} aria-hidden />
                Contact us
              </Link>
              <a
                href={macwall.discordInvite}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-full bg-white/10 px-4 text-[14px] font-medium text-white no-underline transition hover:bg-white/15"
              >
                <HugeiconsIcon icon={DiscordIcon} size={16} strokeWidth={1.75} aria-hidden />
                Ask on Discord
              </a>
            </div>
          </section>

          <p className="mt-6 text-[13px] text-white/45">
            More reading: <Link href="/learn" className="underline-offset-4 hover:text-white/75 hover:underline">Learn</Link>
            {" · "}
            <Link href="/blog" className="underline-offset-4 hover:text-white/75 hover:underline">Blog</Link>
            {" · "}
            <Link href="/docs/public-api" className="underline-offset-4 hover:text-white/75 hover:underline">Developers: API &amp; feeds</Link>
          </p>
        </div>
      </MarketingBodySection>
    </>
  )
}
