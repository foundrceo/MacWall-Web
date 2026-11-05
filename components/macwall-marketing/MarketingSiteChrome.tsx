import AnnouncementBanner from "@/components/macwall-marketing/AnnouncementBanner"
import Navbar from "@/components/macwall-marketing/Navbar"
import SaleBanner from "@/components/macwall-marketing/sale-banner"
import { FLAGS, showSaleBanner } from "@/lib/flags"
import type { ReactNode } from "react"

/** Banner above navbar: shared site chrome for marketing pages. */
export default function MarketingSiteChrome({
  children,
}: Readonly<{ children?: ReactNode }>) {
  return (
    <>
      {showSaleBanner() ? (
        <SaleBanner />
      ) : FLAGS.announcementBanner ? (
        <AnnouncementBanner />
      ) : null}
      <Navbar />
      {children}
    </>
  )
}
