import {
  MarketingBodySection,
  MarketingTitleSection,
} from "@/components/macwall-marketing/marketing-inner-page"
import { landingPageH1 } from "@/components/macwall-marketing/landing-type"
import CreatorBottomCta from "@/components/macwall-marketing/creator-bottom-cta"
import CreatorFaqSection from "@/components/macwall-marketing/creator-faq-section"
import CreatorHowItWorksBoard from "@/components/macwall-marketing/creator-how-it-works-board"
import { MarketingRichText } from "@/components/macwall-marketing/marketing-primitives"
import { macwallCreatorCopy as copy } from "@/lib/macwall-creator-copy"

export default function MacWallMarketingCreatorPage() {
  return (
    <>
      <MarketingTitleSection className="pt-12 pb-14 text-center md:pt-16 md:pb-20">
        <p className="mb-4 text-sm text-muted-foreground">{copy.pageTitle}</p>
        <h1 className={`${landingPageH1} mx-auto`}>{copy.heroTitle}</h1>
        <p className="mx-auto mt-5 max-w-xl text-center text-base leading-relaxed tracking-tight text-muted-foreground md:text-lg">
          {copy.heroLead}
        </p>
      </MarketingTitleSection>
      <MarketingBodySection>
        <section
          id="how-it-works"
          className="scroll-mt-24 px-4 py-14 md:px-6 md:py-20"
        >
          <CreatorHowItWorksBoard />
        </section>
        <div className="mx-auto max-w-2xl px-4 py-14 md:px-6 md:py-20">
          <CreatorFaqSection />
        </div>
        <section
          id="big-following"
          className="mx-auto max-w-2xl px-4 py-14 md:px-6 md:py-20"
        >
          <div className="rounded-3xl border border-border bg-card px-6 py-10 text-center sm:px-10 md:py-12">
            <h2 className="text-2xl font-normal tracking-tighter md:text-3xl">
              {copy.influencerTitle}
            </h2>
            <MarketingRichText
              as="p"
              className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground"
            >
              {copy.influencerBody}
            </MarketingRichText>
            <a
              href={copy.claimHref}
              className="marketing-hero-primary-btn mt-8 inline-flex"
            >
              {copy.claimCta}
            </a>
          </div>
        </section>
        <section className="mx-auto max-w-2xl px-4 py-14 md:px-6 md:py-20">
          <h2 className="text-2xl font-normal tracking-tighter md:text-3xl">
            {copy.closingTitle}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            {copy.closingBody}
          </p>
        </section>
        <CreatorBottomCta />
      </MarketingBodySection>
    </>
  )
}
