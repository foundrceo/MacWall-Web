import CreatorBottomCta from "@/components/macwall-marketing/creator-bottom-cta"
import CreatorFaqSection from "@/components/macwall-marketing/creator-faq-section"
import CreatorHowItWorksBoard from "@/components/macwall-marketing/creator-how-it-works-board"
import { MarketingRichText } from "@/components/macwall-marketing/marketing-primitives"
import MarketingSiteChrome from "@/components/macwall-marketing/MarketingSiteChrome"
import MacWallMarketingPageEnd from "@/components/macwall-marketing/marketing-page-end"
import { macwallCreatorCopy as copy } from "@/lib/macwall-creator-copy"

export default function MacWallMarketingCreatorPage() {
  return (
    <div className="marketing-page antialiased">
      <MarketingSiteChrome />

      <main id="main-content" className="marketing-main">
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-[13px] font-medium text-marketing-muted sm:text-[14px]">
            {copy.pageTitle}
          </p>
          <h1 className="mt-3 text-[clamp(2rem,5.5vw,3.25rem)] font-normal leading-[1.08] tracking-[-0.03em] text-foreground">
            {copy.heroTitle}
          </h1>
          <p className="mx-auto mt-6 text-[15px] leading-[1.65] text-foreground/75 sm:text-[16px] sm:whitespace-nowrap">
            {copy.heroLead}
          </p>
        </header>

        <section
          id="how-it-works"
          className="relative mt-12 w-full scroll-mt-24 sm:mt-14"
        >
          <div className="pb-8 sm:pb-12 md:pb-16">
            <CreatorHowItWorksBoard />
          </div>
        </section>

        <div className="mx-auto mt-16 w-full max-w-3xl sm:mt-20">
          <CreatorFaqSection />
        </div>

        <section
          id="big-following"
          className="mx-auto mt-16 w-full max-w-3xl scroll-mt-24 sm:mt-20"
        >
          <div className="rounded-[20px] bg-secondary/50 px-6 py-7 text-center sm:px-8 sm:py-8">
            <h2 className="text-[clamp(1.25rem,3vw,1.5rem)] font-normal leading-[1.2] tracking-[-0.02em] text-foreground">
              {copy.influencerTitle}
            </h2>
            <MarketingRichText
              as="p"
              className="mx-auto mt-4 max-w-2xl text-[15px] leading-[1.6] text-foreground/70 sm:text-[16px]"
            >
              {copy.influencerBody}
            </MarketingRichText>
            <a
              href={copy.claimHref}
              className="marketing-hero-primary-btn mt-6 inline-flex px-4 py-2.5 text-[14px] sm:text-[15px]"
            >
              {copy.claimCta}
            </a>
          </div>
        </section>

        <section className="mx-auto mt-16 w-full max-w-3xl sm:mt-20">
          <h2 className="text-[clamp(1.25rem,3vw,1.5rem)] font-normal leading-[1.2] tracking-[-0.02em] text-foreground">
            {copy.closingTitle}
          </h2>
          <p className="mt-4 text-[15px] leading-[1.6] text-foreground/70 sm:text-[16px]">
            {copy.closingBody}
          </p>
        </section>
      </main>

      <CreatorBottomCta />

      <MacWallMarketingPageEnd showBottomCta={false} />
    </div>
  )
}
