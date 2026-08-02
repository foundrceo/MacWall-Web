import FeaturesSection from "@/components/macwall-marketing/FeaturesSection"
import HeroSection from "@/components/macwall-marketing/HeroSection"
import HomeFaqSection from "@/components/macwall-marketing/HomeFaqSection"
import JoinCommunitySection from "@/components/macwall-marketing/JoinCommunitySection"
import MacWallMarketingPageEnd from "@/components/macwall-marketing/marketing-page-end"
import MarketingSiteChrome from "@/components/macwall-marketing/MarketingSiteChrome"

export default function MacWallMarketingHome() {
  return (
    <div className="marketing-page">
      <MarketingSiteChrome />
      <main id="main-content" className="marketing-main-offset">
        <HeroSection />
        <FeaturesSection />
        <JoinCommunitySection />
        <HomeFaqSection />
      </main>
      <MacWallMarketingPageEnd />
    </div>
  )
}
