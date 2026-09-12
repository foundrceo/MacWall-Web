import BendSection from "@/components/macwall-marketing/BendSection"
import FeaturesSection from "@/components/macwall-marketing/FeaturesSection"
import HeroSection from "@/components/macwall-marketing/HeroSection"
import HowItWorksSection from "@/components/macwall-marketing/HowItWorksSection"
import { HeroVideoPreload } from "@/components/macwall-marketing/hero-video-preload"
import HomeFaqSection from "@/components/macwall-marketing/HomeFaqSection"
import JoinCommunitySection from "@/components/macwall-marketing/JoinCommunitySection"
import MacWallMarketingPageEnd from "@/components/macwall-marketing/marketing-page-end"
import MarketingSiteChrome from "@/components/macwall-marketing/MarketingSiteChrome"
import { PricingReviewsSection } from "@/components/macwall-marketing/pricing-reviews-section"

export default function MacWallMarketingHome() {
  return (
    <div className="marketing-page">
      <HeroVideoPreload />
      <MarketingSiteChrome />
      <main id="main-content" className="marketing-main-offset">
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <BendSection />
        <PricingReviewsSection />
        <JoinCommunitySection />
        <HomeFaqSection />
      </main>
      <MacWallMarketingPageEnd />
    </div>
  )
}
