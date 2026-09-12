import AnnouncementBanner from "@/components/macwall-marketing/AnnouncementBanner"
import Navbar from "@/components/macwall-marketing/Navbar"
import { FLAGS } from "@/lib/flags"
import type { ReactNode } from "react"

/** Banner above navbar — shared site chrome for marketing pages. */
export default function MarketingSiteChrome({
  children,
}: Readonly<{ children?: ReactNode }>) {
  return (
    <>
      {FLAGS.announcementBanner ? <AnnouncementBanner /> : null}
      <Navbar />
      {children}
    </>
  )
}
