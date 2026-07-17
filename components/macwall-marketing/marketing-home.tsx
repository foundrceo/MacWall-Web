"use client"

import clsx from "clsx"
import Image from "next/image"
import Link from "next/link"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { useEffect, useMemo, useState } from "react"
import {
  macwall,
  macwallAppIconPath,
  macwallAppIconRadiusClass,
  macwallInstallerLatestPath,
} from "@/lib/macwall-site"
import { macwallExactCopy } from "@/lib/macwall-marketing-copy"
import MacWallMarketingAnnouncementBar from "@/components/macwall-marketing/marketing-announcement-bar"
import MacWallMarketingPageEnd from "@/components/macwall-marketing/marketing-page-end"
import MacWallMarketingHeader from "@/components/macwall-marketing/marketing-header"
import { TrackedDownloadButton } from "@/components/analytics/tracked-marketing-buttons"
import {
  MarketingCard,
  MarketingContainer,
  MarketingSection,
  SectionEyebrow,
  SectionLead,
  SectionTitle,
  TextLink,
} from "@/components/macwall-marketing/marketing-primitives"
import MacWallCatalogMarketingPreview from "@/components/macwall-marketing/macwall-catalog-marketing-preview"
import MacWallMarketingLockScreenVideo from "@/components/macwall-marketing/marketing-lock-screen-video"
import MacWallMarketingValuesSection from "@/components/macwall-marketing/marketing-values-section"
import type { ReactNode } from "react"
import {
  MARKETING_CATALOG_SLIDES,
  type MarketingCatalogSlide,
} from "@/lib/marketing-catalog-slides"
import { MARKETING_SHELL_FALLBACK_MP4 } from "@/lib/marketing-shell/assets"

const menubarDemoIconSrc = (file: string) => `/marketing-shell/icons/${file}`

function HeroSection({
  homePickSlides,
}: Readonly<{ homePickSlides: MarketingCatalogSlide[] }>) {
  const ix = macwallExactCopy.interact

  return (
    <section className="MacWallHero bg-white pt-14 pb-16 text-center md:pt-20 md:pb-24">
      <MarketingContainer wide>
        <div className="MacWallHeroDemo">
          <SectionEyebrow className="mb-2">{ix.kicker}</SectionEyebrow>
          <SectionTitle
            as="h1"
            className="MacWallHeroDemoTitle mx-auto max-w-[640px] text-[28px] md:text-[40px]"
          >
            {ix.title}
          </SectionTitle>
          <p className="MacWallHeroLead">{ix.heroLead}</p>
          <DesktopProductDemo homePickSlides={homePickSlides} />
        </div>

        <div className="MacWallHeroFoot">
          <div className="MacWallHeroFeatures">
            <div className="MacWallHeroFeature">
              <p className="MacWallHeroFeatureTitle">{ix.paragraph1Lead}</p>
              <p className="MacWallHeroFeatureBody">{ix.paragraph1Rest}</p>
            </div>
            <div className="MacWallHeroFeature">
              <p className="MacWallHeroFeatureTitle">{ix.paragraph2Lead}</p>
              <p className="MacWallHeroFeatureBody">{ix.paragraph2Rest}</p>
            </div>
          </div>

          <div id="pricing" className="MacWallHeroActions">
            <TrackedDownloadButton
              href={macwallInstallerLatestPath}
              size="lg"
              location="hero"
            >
              Download for Mac
            </TrackedDownloadButton>
            <Link href="#how-it-works" className="MacWallHeroSecondaryCta">
              Watch Demo
            </Link>
          </div>
          <p className="MacWallHeroMeta">
            Download free, then unlock everything for a one-time{" "}
            {macwall.pro.price} — no subscription, lifetime updates on{" "}
            {macwall.maxLicensedMacs} Macs, and a Reel can earn it all back.
          </p>
          <p className="MacWallHeroFinePrint">
            Free to try. Requires macOS 14 Sonoma or later.
          </p>
        </div>
      </MarketingContainer>
    </section>
  )
}

function MenubarIsland() {
  return (
    <div>
      <div className="Menubar_island__L6ZjV">
        <svg
          className="Menubar_islandLeft__ROMwu"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <path d="M0 16C8.83656 16 16 12.83656 16 0V16H0Z" fill="#000" />
        </svg>
        <svg
          className="Menubar_islandRight__oaUTF"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <path d="M16 16C7.16344 16 0 12.83656 0 0V16H16Z" fill="#000" />
        </svg>
      </div>
    </div>
  )
}

function DesktopProductDemo({
  homePickSlides,
}: Readonly<{ homePickSlides: MarketingCatalogSlide[] }>) {
  const ix = macwallExactCopy.interact
  const reducedMotion = useReducedMotion()
  const catalogSlides = MARKETING_CATALOG_SLIDES
  const n = catalogSlides.length

  const [featuredIx, setFeaturedIx] = useState(0)
  const [desktopWallpaperIx, setDesktopWallpaperIx] = useState(0)
  const [desktopWallpaperOverride, setDesktopWallpaperOverride] =
    useState<MarketingCatalogSlide | null>(null)
  const [demoWindowOpen, setDemoWindowOpen] = useState(true)

  useEffect(() => {
    if (reducedMotion || n <= 1 || !demoWindowOpen) return
    const id = globalThis.setInterval(
      () => setFeaturedIx((s) => (s + 1) % n),
      5000
    )
    return () => globalThis.clearInterval(id)
  }, [reducedMotion, n, demoWindowOpen])

  const safeFeatured = n > 0 ? Math.min(Math.max(featuredIx, 0), n - 1) : 0
  const bgSlide =
    desktopWallpaperOverride ??
    (n > 0
      ? catalogSlides[Math.min(Math.max(desktopWallpaperIx, 0), n - 1)]
      : null)
  const bgVideoSrc = bgSlide?.videoUrl ?? MARKETING_SHELL_FALLBACK_MP4
  const bgPoster = bgSlide?.thumbPath
  const bgVideoKey = bgSlide?.id ?? "catalog-fallback-bg"

  const demoPresenceTransition = useMemo(
    () =>
      reducedMotion
        ? { duration: 0.12, ease: "easeInOut" as const }
        : {
            opacity: { type: "tween" as const, duration: 0.2, ease: "easeOut" },
            scale: { type: "spring", visualDuration: 0.38, bounce: 0.14 },
            y: { type: "spring", visualDuration: 0.38, bounce: 0.14 },
          },
    [reducedMotion]
  )

  return (
    <div className="MacWallDesktopDemo Interact_container__n__qc Interact_containerEmbedded__MacWall">
      <div className="Interact_videoWrap__Gzo4G">
        <video
          key={bgVideoKey}
          className="Interact_videoEl__UxId_"
          src={bgVideoSrc}
          poster={bgPoster}
          autoPlay
          loop
          playsInline
          muted
          preload="auto"
          aria-label={ix.demoVideoAria}
          style={{ opacity: 1, filter: "blur(0px)", transform: "none" }}
        />
      </div>
      <div className="Dock_container__lRHU1">
        <div
          className="Dock_active__UtHnf"
          role="button"
          aria-label={ix.dockAria}
        >
          <Image
            alt={macwallExactCopy.header.logoAlt}
            width={120}
            height={120}
            decoding="async"
            className={`Dock_image___wUSx ${macwallAppIconRadiusClass} object-cover`}
            src={macwallAppIconPath}
            style={{ color: "transparent" }}
          />
        </div>
      </div>
      <div className="Menubar_menubar__4ME4U">
        <div className="Menubar_left__QCsBf">
          <svg
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="0"
            viewBox="0 0 384 512"
            className="Menubar_appleIcon__6eQFN"
            height="14"
            width="14"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
          </svg>
          <span className="Menubar_brand__jj7yS">{ix.menubarBrand}</span>
          <span>File</span>
          <span>Edit</span>
          <span>View</span>
          <span>Window</span>
          <span>Help</span>
        </div>
        <MenubarIsland />
        <div className="Menubar_right___0KcF">
          {demoWindowOpen ? (
            <div className="Menubar_status__QeZi_">
              <Image
                alt={macwallExactCopy.header.logoAlt}
                width={36}
                height={36}
                decoding="async"
                className={clsx(
                  "Menubar_statusIcon__rx7_c object-cover",
                  macwallAppIconRadiusClass
                )}
                src={macwallAppIconPath}
                style={{ color: "transparent" }}
              />
              <span className="Menubar_statusText__DyznY">
                {ix.menubarStatus}
              </span>
            </div>
          ) : (
            <button
              type="button"
              className="Menubar_status__QeZi_ font-inherit cursor-pointer border-0 bg-transparent p-0 hover:brightness-110 focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:outline-none"
              aria-label={ix.demoReopenMenubarAria}
              onClick={() => setDemoWindowOpen(true)}
            >
              <Image
                alt={macwallExactCopy.header.logoAlt}
                width={36}
                height={36}
                decoding="async"
                className={clsx(
                  "Menubar_statusIcon__rx7_c object-cover",
                  macwallAppIconRadiusClass
                )}
                src={macwallAppIconPath}
                style={{ color: "transparent" }}
              />
              <span className="Menubar_statusText__DyznY">
                {ix.menubarStatus}
              </span>
            </button>
          )}
          <span className="Menubar_percent__vaV6A">86%</span>
          <Image
            alt="Battery"
            width={22}
            height={22}
            decoding="async"
            className="Menubar_batteryIcon__3_gXT"
            src={menubarDemoIconSrc("battery.png")}
            style={{ color: "transparent" }}
          />
          <Image
            alt="Wi-Fi signal strength"
            width={22}
            height={22}
            decoding="async"
            className="Menubar_wifi__OJScq"
            src={menubarDemoIconSrc("ios-wifi-2.png")}
            style={{ color: "transparent" }}
          />
          <Image
            alt="Control Center"
            width={22}
            height={22}
            decoding="async"
            className="Menubar_centerIcon__JxLAN"
            src={menubarDemoIconSrc("control-center.png")}
            style={{ color: "transparent" }}
          />
          <div className="Menubar_round__nIYKT" />
          <span className="Menubar_time__4GBY3">Wed 13.05. 19:07</span>
        </div>
      </div>
      <div className="MacWallInteract_demoAppCenterWrap">
        <AnimatePresence initial={false}>
          {demoWindowOpen ? (
            <motion.div
              key="macwall-interact-demo-window"
              className="Application_application__rGRu5 MacWallDesktopDemo__window"
              style={{ filter: "blur(0px)", transformOrigin: "50% 10%" }}
              initial={
                reducedMotion ? false : { opacity: 0, scale: 0.92, y: 28 }
              }
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={
                reducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.9, y: 36 }
              }
              transition={demoPresenceTransition}
            >
              {n > 0 ? (
                <MacWallCatalogMarketingPreview
                  homePickSlides={homePickSlides}
                  featuredIndex={safeFeatured}
                  onFeaturedIndexChange={(index) => {
                    setFeaturedIx(index)
                    setDesktopWallpaperIx(index)
                    setDesktopWallpaperOverride(null)
                  }}
                  onSelectWallpaper={(slide) => {
                    const fi = catalogSlides.findIndex((s) => s.id === slide.id)
                    if (fi >= 0) {
                      setFeaturedIx(fi)
                      setDesktopWallpaperIx(fi)
                      setDesktopWallpaperOverride(null)
                      return
                    }
                    if (homePickSlides.some((s) => s.id === slide.id)) {
                      setDesktopWallpaperOverride(slide)
                    }
                  }}
                  onApplyWallpaper={() => {
                    if (desktopWallpaperOverride) return
                    setDesktopWallpaperIx(safeFeatured)
                  }}
                  onRequestClose={() => setDemoWindowOpen(false)}
                />
              ) : null}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  )
}

function LockScreenSection() {
  const ls = macwallExactCopy.lockScreen
  return (
    <MarketingSection inverted>
      <MarketingContainer>
        <div className="mb-12 text-center md:mb-16">
          <SectionEyebrow inverted className="mb-2">
            {ls.kicker}
          </SectionEyebrow>
          <SectionTitle inverted>{ls.title}</SectionTitle>
        </div>
        <MacWallMarketingLockScreenVideo ariaLabel={`${ls.title} preview`} />
        <SectionLead
          inverted
          className="mx-auto mt-8 max-w-[580px] text-center"
        >
          <span className="font-semibold text-white">{ls.strong}</span>{" "}
          {ls.rest}
        </SectionLead>
        <div className="mt-5 text-center">
          <TextLink href="/terms" inverted>
            {ls.linkText}
          </TextLink>
        </div>
      </MarketingContainer>
    </MarketingSection>
  )
}

export default function MacWallMarketingHome({
  homePickSlides,
  gallerySection,
  walkthroughSection,
}: Readonly<{
  homePickSlides: MarketingCatalogSlide[]
  gallerySection: ReactNode
  walkthroughSection: ReactNode
}>) {
  return (
    <div className="MacWallMarketingPage min-h-screen bg-white">
      <MacWallMarketingHeader variant="light" />
      <MacWallMarketingAnnouncementBar />
      <HeroSection homePickSlides={homePickSlides} />
      {walkthroughSection}
      {gallerySection}
      <LockScreenSection />
      <BatterySection />
      <MacWallMarketingValuesSection />
      <MacWallMarketingPageEnd />
    </div>
  )
}

function BatterySection() {
  const bat = macwallExactCopy.battery
  return (
    <MarketingSection>
      <MarketingContainer wide>
        <div className="mb-12 text-center md:mb-16">
          <SectionEyebrow className="mb-2">{bat.kicker}</SectionEyebrow>
          <SectionTitle>{bat.title}</SectionTitle>
        </div>
        <MarketingCard className="overflow-hidden bg-[#f5f5f7] p-0">
          <Image
            alt={`${macwall.name} Settings, playback, battery, and CPU options`}
            width={1722}
            height={956}
            className="h-auto w-full"
            src="/Settings.jpg"
            sizes="(max-width: 1068px) 100vw, 980px"
          />
        </MarketingCard>
        <div className="mt-10 grid gap-8 md:grid-cols-2 md:gap-12">
          <ul className="space-y-4 text-[17px] leading-[1.47] text-[#86868b]">
            {bat.bulletsA.map((b) => (
              <li key={b.text}>
                {b.strong ? (
                  <span className="font-semibold text-[#1d1d1f]">
                    {b.strong}
                  </span>
                ) : null}{" "}
                {b.text}
              </li>
            ))}
          </ul>
          <ul className="space-y-4 text-[17px] leading-[1.47] text-[#86868b]">
            {bat.bulletsB.map((b) => (
              <li key={b.text}>
                {b.strong ? (
                  <span className="font-semibold text-[#1d1d1f]">
                    {b.strong}
                  </span>
                ) : null}{" "}
                {b.text}
              </li>
            ))}
          </ul>
        </div>
      </MarketingContainer>
    </MarketingSection>
  )
}
