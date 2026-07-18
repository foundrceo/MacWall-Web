import AnnouncementBanner from "@/components/macwall-marketing/AnnouncementBanner"
import Navbar from "@/components/macwall-marketing/Navbar"
import { MARKETING_MAIN_OFFSET_CLASS } from "@/lib/marketing-chrome"
import type { ReactNode } from "react"

export { MARKETING_MAIN_OFFSET_CLASS }

/** Banner above navbar — shared site chrome for marketing pages. */
export default function MarketingSiteChrome({
  children,
}: Readonly<{ children?: ReactNode }>) {
  return (
    <>
      <AnnouncementBanner />
      <Navbar />
      {children}
    </>
  )
}
