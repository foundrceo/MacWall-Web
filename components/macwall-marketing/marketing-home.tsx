import FeaturesSection from "@/components/macwall-marketing/FeaturesSection"
import HeroSection from "@/components/macwall-marketing/HeroSection"
import HomeFaqSection from "@/components/macwall-marketing/HomeFaqSection"
import JoinCommunitySection from "@/components/macwall-marketing/JoinCommunitySection"
import MacWallMarketingPageEnd from "@/components/macwall-marketing/marketing-page-end"
import MarketingSiteChrome, {
  MARKETING_MAIN_OFFSET_CLASS,
} from "@/components/macwall-marketing/MarketingSiteChrome"
import { MARKETING_PAGE_CLASS } from "@/lib/marketing-chrome"

export default function MacWallMarketingHome() {
  return (
    <div className={MARKETING_PAGE_CLASS}>
      <MarketingSiteChrome />
      <main id="main-content" className={MARKETING_MAIN_OFFSET_CLASS}>
        <HeroSection />
        <FeaturesSection />
        <JoinCommunitySection />
        <HomeFaqSection />
      </main>
      <MacWallMarketingPageEnd />
    </div>
  )
}
