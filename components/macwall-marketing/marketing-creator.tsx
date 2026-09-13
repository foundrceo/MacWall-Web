import {
  MarketingBodySection,
  MarketingTitleSection,
} from "@/components/macwall-marketing/marketing-inner-page"
import { landingPageH1, landingPageLead } from "@/components/macwall-marketing/landing-type"
import CreatorBottomCta from "@/components/macwall-marketing/creator-bottom-cta"
import CreatorFaqSection from "@/components/macwall-marketing/creator-faq-section"
import CreatorHowItWorksBoard from "@/components/macwall-marketing/creator-how-it-works-board"
import { MarketingRichText } from "@/components/macwall-marketing/marketing-primitives"
import { macwallCreatorCopy as copy } from "@/lib/macwall-creator-copy"

export default function MacWallMarketingCreatorPage() {
  return (
    <>
      <MarketingTitleSection className="text-center">
        <p className="text-sm text-muted-foreground">{copy.pageTitle}</p>
        <h1 className={`${landingPageH1} mx-auto`}>{copy.heroTitle}</h1>
        <p className={`${landingPageLead} mx-auto text-center`}>
          {copy.heroLead}
        </p>
      </MarketingTitleSection>
      <MarketingBodySection>
        <section id="how-it-works" className="scroll-mt-24 px-4 py-10 md:px-6">
          <CreatorHowItWorksBoard />
        </section>
        <div className="border-t border-dashed border-border px-4 py-10 md:px-6">
          <CreatorFaqSection />
        </div>
        <section
          id="big-following"
          className="border-t border-dashed border-border px-4 py-10 text-center md:px-6"
        >
          <h2 className="text-2xl font-normal tracking-tighter md:text-3xl">
            {copy.influencerTitle}
          </h2>
          <MarketingRichText
            as="p"
            className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground"
          >
            {copy.influencerBody}
          </MarketingRichText>
          <a
            href={copy.claimHref}
            className="marketing-hero-primary-btn mt-6 inline-flex"
          >
            {copy.claimCta}
          </a>
        </section>
        <section className="border-t border-dashed border-border px-4 py-10 md:px-6">
          <h2 className="text-2xl font-normal tracking-tighter md:text-3xl">
            {copy.closingTitle}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {copy.closingBody}
          </p>
        </section>
        <CreatorBottomCta />
      </MarketingBodySection>
    </>
  )
}
