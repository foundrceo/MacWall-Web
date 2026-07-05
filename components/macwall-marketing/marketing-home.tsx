/* eslint-disable @next/next/no-img-element -- Matches vendored layout markup (same-origin `/marketing-shell` assets). */
"use client"

import clsx from "clsx"
import Link from "next/link"
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "motion/react"
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import {
  macwall,
  macwallAppIconPath,
  macwallAppIconRadiusClass,
  macwallProCheckoutURL,
} from "@/lib/macwall-site"
import { macwallExactCopy } from "@/lib/macwall-marketing-copy"
import MacWallMarketingFooter from "@/components/macwall-marketing/marketing-footer"
import MacWallMarketingHeader from "@/components/macwall-marketing/marketing-header"
import { HIGHLIGHT_PAGE_IDS } from "./marketing-data"
import MacWallCatalogMarketingPreview from "@/components/macwall-marketing/macwall-catalog-marketing-preview"
import { MARKETING_SUPABASE_WALLPAPER_SLIDES } from "@/lib/marketing-supabase-wallpapers"
import { MARKETING_SHELL_FALLBACK_MP4 } from "@/lib/marketing-shell/assets"

const menubarDemoIconSrc = (file: string) => `/marketing-shell/icons/${file}`

function SvgLinkChevron() {
  return (
    <svg
      stroke="currentColor"
      fill="currentColor"
      strokeWidth="0"
      viewBox="0 0 24 24"
      height="16"
      width="16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M8.72 18.78a.75.75 0 0 1 0-1.06L14.44 12 8.72 6.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018l6.25 6.25a.75.75 0 0 1 0 1.06l-6.25 6.25a.75.75 0 0 1-1.06 0Z" />
    </svg>
  )
}

function SvgChevron14() {
  return (
    <svg
      stroke="currentColor"
      fill="currentColor"
      strokeWidth="0"
      viewBox="0 0 24 24"
      height="14"
      width="14"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M8.72 18.78a.75.75 0 0 1 0-1.06L14.44 12 8.72 6.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018l6.25 6.25a.75.75 0 0 1 0 1.06l-6.25 6.25a.75.75 0 0 1-1.06 0Z" />
    </svg>
  )
}

function Ribbon() {
  const c = macwallExactCopy.ribbon
  return (
    <div className="Ribbon_ribbon__wKRG3">
      <span className="Ribbon_text__QAwUX">
        {c.lineBeforeLink}
        <a
          className="Ribbon_link__XDQxu"
          target="_blank"
          rel="noopener noreferrer"
          href={macwall.website}
        >
          {c.linkText} <SvgChevron14 />
        </a>
      </span>
    </div>
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
        >
          <path d="M16 16C7.16344 16 0 12.83656 0 0V16H16Z" fill="#000" />
        </svg>
      </div>
    </div>
  )
}

function InteractDemo() {
  const ix = macwallExactCopy.interact
  const reducedMotion = useReducedMotion()
  const catalogSlides = MARKETING_SUPABASE_WALLPAPER_SLIDES
  const n = catalogSlides.length

  const [featuredIx, setFeaturedIx] = useState(0)
  /** Desktop area behind the faux window — starts on first catalog clip; “View Wallpaper” applies the hero. */
  const [desktopWallpaperIx, setDesktopWallpaperIx] = useState(0)
  /** Faux app window visibility (red traffic light closes; menu-bar status mountain reopens). */
  const [demoWindowOpen, setDemoWindowOpen] = useState(true)

  useEffect(() => {
    if (n <= 0) return
    const cap = n - 1
    setFeaturedIx((i) => Math.min(Math.max(i, 0), cap))
    setDesktopWallpaperIx((i) => Math.min(Math.max(i, 0), cap))
  }, [n])

  useEffect(() => {
    if (reducedMotion || n <= 1 || !demoWindowOpen) return
    const id = globalThis.setInterval(
      () => setFeaturedIx((s) => (s + 1) % n),
      5000
    )
    return () => globalThis.clearInterval(id)
  }, [reducedMotion, n, demoWindowOpen])

  const safeFeatured = n > 0 ? Math.min(featuredIx, n - 1) : 0
  const safeDesktop = n > 0 ? Math.min(desktopWallpaperIx, n - 1) : 0

  const fallbackBgVideo = MARKETING_SHELL_FALLBACK_MP4
  const bgSlide = n > 0 ? catalogSlides[safeDesktop] : null
  const bgVideoSrc = bgSlide?.videoUrl ?? fallbackBgVideo
  const bgPoster = bgSlide?.thumbPath
  const bgVideoKey = bgSlide?.id ?? "catalog-fallback-bg"

  /** Presence transition — spring move/scale; opacity fades on tween per Motion perf patterns. */
  const demoPresenceTransition = useMemo(
    () =>
      reducedMotion
        ? { duration: 0.12, ease: "easeInOut" as const }
        : {
            opacity: { type: "tween" as const, duration: 0.2, ease: "easeOut" },
            scale: {
              type: "spring",
              visualDuration: 0.38,
              bounce: 0.14,
            },
            y: {
              type: "spring",
              visualDuration: 0.38,
              bounce: 0.14,
            },
          },
    [reducedMotion]
  )

  return (
    <section className="Interact_interact__IL36v">
      <div className="Interact_text__LkV7D">
        <h3 className="Interact_subtitle__1lt_2">{ix.kicker}</h3>
        <h2 className="Interact_title__gbMbW">{ix.title}</h2>
        <Link className="Interact_link__VsII_" href="/terms">
          {ix.moreLink} <SvgLinkChevron />
        </Link>
      </div>
      <div className="Interact_container__n__qc">
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
            <img
              alt=""
              loading="lazy"
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
                <img
                  alt={macwallExactCopy.header.logoAlt}
                  loading="lazy"
                  width={512}
                  height={512}
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
                <img
                  alt=""
                  loading="lazy"
                  width={512}
                  height={512}
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
            <img
              alt="Battery"
              loading="lazy"
              width={512}
              height={512}
              decoding="async"
              className="Menubar_batteryIcon__3_gXT"
              srcSet={`${menubarDemoIconSrc("battery.png")} 2x`}
              src={menubarDemoIconSrc("battery.png")}
              style={{ color: "transparent" }}
            />
            <img
              alt="Wi-Fi"
              loading="lazy"
              width={512}
              height={512}
              decoding="async"
              className="Menubar_wifi__OJScq"
              srcSet={`${menubarDemoIconSrc("ios-wifi-2.png")} 2x`}
              src={menubarDemoIconSrc("ios-wifi-2.png")}
              style={{ color: "transparent" }}
            />
            <img
              alt="Control Center"
              loading="lazy"
              width={512}
              height={512}
              decoding="async"
              className="Menubar_centerIcon__JxLAN"
              srcSet={`${menubarDemoIconSrc("control-center.png")} 2x`}
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
                className="Application_application__rGRu5"
                style={{
                  filter: "blur(0px)",
                  transformOrigin: "50% 10%",
                }}
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
                    featuredIndex={safeFeatured}
                    onFeaturedIndexChange={setFeaturedIx}
                    onApplyWallpaper={() => setDesktopWallpaperIx(safeFeatured)}
                    onRequestClose={() => setDemoWindowOpen(false)}
                  />
                ) : null}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
      <div className="Interact_paragraph_bottom__E5Zvq">
        <p>
          <span className="Interact_strong__n7znd">{ix.paragraph1Lead}</span>{" "}
          {ix.paragraph1Rest}
        </p>
        <p>
          <span className="Interact_strong__n7znd">{ix.paragraph2Lead}</span>{" "}
          {ix.paragraph2Rest}
        </p>
      </div>
    </section>
  )
}

function Highlights() {
  const hi = macwallExactCopy.highlights
  const slides = hi.slides
  const [active, setActive] = useState(0)
  const sectionRef = useRef<HTMLDivElement>(null)
  const rowRef = useRef<HTMLDivElement>(null)
  const [slideWidthPx, setSlideWidthPx] = useState(1320)
  const inView = useInView(sectionRef, {
    once: true,
    margin: "-12% 0px -8% 0px",
  })
  const reduceMotion = useReducedMotion()

  useLayoutEffect(() => {
    const row = rowRef.current
    if (!row) return
    const measure = () => {
      const el = row.querySelector(
        ".Highlights_page__J9LwR"
      ) as HTMLElement | null
      if (el) setSlideWidthPx(el.getBoundingClientRect().width)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(row)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (reduceMotion) return
    const id = globalThis.setInterval(() => {
      setActive((a) => (a + 1) % slides.length)
    }, 5000)
    return () => globalThis.clearInterval(id)
  }, [reduceMotion, slides.length])

  const appleEase = [0.25, 0.1, 0.25, 1] as const
  const baseDuration = reduceMotion ? 0 : 0.55
  const enterDelay = reduceMotion ? 0 : 0.06

  let sectionReveal = { opacity: 1, y: 0 }
  if (!reduceMotion && !inView) {
    sectionReveal = { opacity: 0, y: 32 }
  }

  return (
    <motion.div
      id="highlights"
      ref={sectionRef}
      className="Highlights_highlights___gpi5"
      role="region"
      aria-label={hi.sectionTitle}
      initial={reduceMotion ? false : { opacity: 0, y: 32 }}
      animate={sectionReveal}
      transition={{ duration: baseDuration, ease: appleEase }}
    >
      <div className="Highlights_container___7oEy">
        <motion.div
          className="Highlights_header__w97Ud"
          initial={false}
          animate={reduceMotion || inView ? "visible" : "hidden"}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: enterDelay,
                delayChildren: reduceMotion ? 0 : 0.08,
              },
            },
          }}
        >
          <motion.h1
            className="Highlights_title__Du7W5"
            variants={{
              hidden: reduceMotion
                ? {}
                : { opacity: 0, y: 18, filter: "blur(4px)" },
              visible: {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                transition: { duration: 0.5, ease: appleEase },
              },
            }}
          >
            {hi.sectionTitle}
          </motion.h1>
          <motion.div
            className="Highlights_links__O3_AU"
            variants={{
              hidden: reduceMotion ? {} : { opacity: 0, y: 12 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.45, ease: appleEase },
              },
            }}
          >
            <Link href="/terms">
              {hi.linkSystem} <SvgLinkChevron />
            </Link>
            <Link href="/privacy">
              {hi.linkDisplays} <SvgLinkChevron />
            </Link>
          </motion.div>
        </motion.div>
        <div
          ref={rowRef}
          className="Highlights_content__jBdmq"
          style={{
            transform: `translateX(-${active * slideWidthPx}px)`,
          }}
        >
          {slides.map((title, i) => (
            <div className="Highlights_page__J9LwR" key={HIGHLIGHT_PAGE_IDS[i]}>
              <motion.div
                className={clsx(
                  "Highlights_pageContainer__WzunM",
                  active === i && "Highlights_active__GU3MW"
                )}
                id={HIGHLIGHT_PAGE_IDS[i]}
                onClick={() => setActive(i)}
                initial={false}
                animate={
                  reduceMotion
                    ? {}
                    : {
                        opacity: active === i ? 1 : 0.42,
                        scale: active === i ? 1 : 0.972,
                      }
                }
                transition={{
                  duration: reduceMotion ? 0 : 0.48,
                  ease: [0.4, 0, 0.2, 1],
                }}
                whileHover={
                  reduceMotion || active === i
                    ? undefined
                    : { opacity: 0.72, scale: 0.982 }
                }
                style={{
                  cursor: "pointer",
                  transformOrigin: "center bottom",
                  ...(i === 0 && {
                    backgroundImage: "url(/FrameMacBook.jpg)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                  }),
                }}
              >
                <h2>{title}</h2>
              </motion.div>
            </div>
          ))}
        </div>
        <div className="Highlights_navContainer__5025i">
          <div className="Highlights_navButtons__7mMqT">
            {slides.map((_, i) => (
              <motion.button
                key={HIGHLIGHT_PAGE_IDS[i]}
                type="button"
                className={clsx(
                  "Highlights_navButton__GFYXy",
                  active === i && "Highlights_active__GU3MW"
                )}
                aria-label={`Highlight ${i + 1}`}
                aria-current={active === i}
                onClick={() => setActive(i)}
                whileHover={reduceMotion ? undefined : { scale: 1.18 }}
                whileTap={reduceMotion ? undefined : { scale: 0.88 }}
                animate={
                  reduceMotion
                    ? {}
                    : {
                        scale: active === i ? 1 : 0.92,
                        opacity: active === i ? 1 : 0.55,
                      }
                }
                transition={
                  reduceMotion
                    ? { duration: 0.2, ease: appleEase }
                    : { type: "spring", stiffness: 420, damping: 28 }
                }
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/** Marketing home: vendored layout CSS class names + MacWall copy/assets. */
export default function MacWallMarketingHome() {
  return (
    <div className="Wrapper_wrapper__5atST">
      <MacWallMarketingHeader />
      <section
        className="Main_main__P1GaN"
        style={{ opacity: 1, transform: "none" }}
      >
        <Ribbon />
        <div
          className="Main_container__rgXx7"
          style={{ opacity: 1, transform: "none" }}
        >
          <InteractDemo />
          <div
            id="pricing"
            className="Main_buttons__dsN_0"
            style={{
              opacity: 1,
              transform: "none",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: "0.75rem",
            }}
          >
            <a
              href={macwallProCheckoutURL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 17,
                fontWeight: 400,
                lineHeight: 1.235,
                letterSpacing: "-0.022em",
                padding: "9.25px 21px",
                borderRadius: 9999,
                backgroundColor: "rgb(0, 113, 227)",
                color: "#f5f5f7",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                boxSizing: "border-box",
                width: "max-content",
                flexShrink: 0,
                whiteSpace: "nowrap",
              }}
            >
              {macwallExactCopy.pricing.buyCta}
            </a>
            {/* Secondary CTA (Get Discount) — hidden per product request.
            <Link
              href="/terms#pro"
              style={{
                fontSize: 17,
                fontWeight: 400,
                lineHeight: 1.235,
                letterSpacing: "-0.022em",
                padding: "9.25px 21px",
                borderRadius: 9999,
                backgroundColor: "rgb(45, 45, 47)",
                color: "#f5f5f7",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                boxSizing: "border-box",
                width: "max-content",
                flexShrink: 0,
                whiteSpace: "nowrap",
                border: "1px solid rgba(255, 255, 255, 0.12)",
              }}
            >
              {macwallExactCopy.pricing.secondaryCta}
            </Link>
            */}
          </div>
          <p className="Main_p_buy__b03hg">
            {macwallExactCopy.pricing.priceLine}
          </p>
        </div>
      </section>
      <Highlights />
      <section className="Statistic_statistic__V4kCy">
        <div className="Statistic_container__5dVfB">
          <div className="Statistic_text__ckl3k">
            <h2 className="Statistic_subtitle__SQARS">
              {macwallExactCopy.stats.kicker}
            </h2>
            <h1 className="Statistic_title__WbE_f">
              {macwallExactCopy.stats.title}
            </h1>
          </div>
          <div className="Statistic_grid__42HXC">
            <div className="Statistic_image__container__J5z52">
              <img
                alt=""
                loading="lazy"
                width={1162}
                height={710}
                decoding="async"
                className="Statistic_image__uYNCo"
                src="/OGMacBook.jpg"
                style={{ color: "transparent" }}
              />
            </div>
            <div className="Statistic_info__ATOD7">
              <div className="Statistic_stats__lfkDf">
                {macwallExactCopy.stats.cards.map((card) => (
                  <div className="Statistic_card__X55XC" key={card.strong}>
                    <div className="Statistic_count__wyKhN">{card.value}</div>
                    <p className="Statistic_description__cDDmb">
                      <span className="Statistic_strong__HlCC7">
                        {card.strong}{" "}
                      </span>
                      {card.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="General_general__88yyQ">
        <div className="General_container__ROnT_">
          <div className="General_text__leNbB">
            <h2 className="General_subtitle___9qQJ">
              {macwallExactCopy.lockScreen.kicker}
            </h2>
            <h1 className="General_title__4lenb">
              {macwallExactCopy.lockScreen.title}
            </h1>
          </div>

          <div>
            <video
              className="General_video__IEVrZ"
              width={1920}
              height={1080}
              poster="/FrameMacBook.jpg"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              disablePictureInPicture
              aria-label={macwallExactCopy.lockScreen.title}
            >
              <source src="/Video.webm" type="video/webm" />
            </video>
            <p className="General_paragraph__8i3VW">
              <span className="General_strong__bt9ho">
                {macwallExactCopy.lockScreen.strong}
              </span>{" "}
              {macwallExactCopy.lockScreen.rest}
            </p>
            <Link className="General_link__Mp8wq" href="/terms">
              {macwallExactCopy.lockScreen.linkText} <SvgLinkChevron />
            </Link>
          </div>
        </div>
      </div>

      <div id="playback" className="Battery_battery__Tg_Yb">
        <div className="Battery_container__Dpv9T">
          <div className="Battery_text__Z_Vvq">
            <h2 className="Battery_subtitle__oIk_s">
              {macwallExactCopy.battery.kicker}
            </h2>
            <h1 className="Battery_title__ma6uO">
              {macwallExactCopy.battery.title}
            </h1>
          </div>
          <div className="Battery_image__0Bymm">
            <img
              alt={`${macwall.name} Settings — playback, battery, and CPU options`}
              loading="lazy"
              width={1722}
              height={956}
              decoding="async"
              className="Battery_image__0Bymm"
              src="/Settings.png"
              style={{ color: "transparent" }}
            />
            <div className="Battery_text__container___4Z10">
              <ul className="Battery_paragraph__xt5SM">
                {macwallExactCopy.battery.bulletsA.map((b, i) => (
                  <li
                    key={i}
                    className={
                      "highlight" in b && b.highlight
                        ? "Battery_red__hZsm7"
                        : undefined
                    }
                  >
                    {b.strong ? (
                      <span className="Battery_strong__2TmnP">{b.strong}</span>
                    ) : null}{" "}
                    {b.text}
                  </li>
                ))}
              </ul>
              <ul className="Battery_paragraph__xt5SM">
                {macwallExactCopy.battery.bulletsB.map((b, i) => (
                  <li key={i}>
                    <span className="Battery_strong__2TmnP">{b.strong}</span>{" "}
                    {b.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <section className="Features_wrap__40TGD">
        <div className="Features_inner__X0dCW">
          <h2 className="Features_title__ED4qR">
            {macwallExactCopy.values.title}
          </h2>
          <p className="Features_lead__z37_i">{macwallExactCopy.values.lead}</p>
          <div className="Features_grid__78BjN">
            <article className="Features_item__GV7hf">
              <div className="Features_icon__ZfzqM Features_iconGreen__uqYft">
                <svg
                  stroke="currentColor"
                  fill="currentColor"
                  strokeWidth="0"
                  viewBox="0 0 256 256"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M128,24h0A104,104,0,1,0,232,128,104.12,104.12,0,0,0,128,24Zm87.62,96H175.79C174,83.49,159.94,57.67,148.41,42.4A88.19,88.19,0,0,1,215.63,120ZM96.23,136h63.54c-2.31,41.61-22.23,67.11-31.77,77C118.45,203.1,98.54,177.6,96.23,136Zm0-16C98.54,78.39,118.46,52.89,128,43c9.55,9.93,29.46,35.43,31.77,77Zm52.18,93.6c11.53-15.27,25.56-41.09,27.38-77.6h39.84A88.19,88.19,0,0,1,148.41,213.6Z" />
                </svg>
              </div>
              <div className="Features_texts__RtIcz">
                <h3 className="Features_itemTitle__iMRZ2">
                  <span className="Features_itemTitleStrong__gHhaD">
                    {macwallExactCopy.values.cards[0].title}
                  </span>{" "}
                  {macwallExactCopy.values.cards[0].body}
                </h3>
              </div>
            </article>
            <article className="Features_item__GV7hf">
              <div className="Features_icon__ZfzqM Features_iconWhite__BG9b_">
                <svg
                  stroke="currentColor"
                  fill="currentColor"
                  strokeWidth="0"
                  viewBox="0 0 256 256"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M100,36a28,28,0,1,1,28,28A28,28,0,0,1,100,36ZM215.42,140.78l-45.25-51.3a28,28,0,0,0-21-9.48H106.83a28,28,0,0,0-21,9.48l-45.25,51.3a16,16,0,0,0,22.56,22.69L89,142.7l-19.7,74.88a16,16,0,0,0,29.08,13.35L128,180l29.58,51a16,16,0,0,0,29.08-13.35L167,142.7l25.9,20.77a16,16,0,0,0,22.56-22.69Z" />
                </svg>
              </div>
              <div className="Features_texts__RtIcz">
                <h3 className="Features_itemTitle__iMRZ2">
                  <span className="Features_itemTitleStrong__gHhaD">
                    {macwallExactCopy.values.cards[1].title}
                  </span>{" "}
                  {macwallExactCopy.values.cards[1].body}
                </h3>
              </div>
            </article>
            <article className="Features_item__GV7hf">
              <div className="Features_icon__ZfzqM Features_iconBlue__Wn9xn">
                <svg
                  stroke="currentColor"
                  fill="currentColor"
                  strokeWidth="0"
                  viewBox="0 0 256 256"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M208,80H176V56a48,48,0,0,0-96,0V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80ZM96,56a32,32,0,0,1,64,0V80H96Z" />
                </svg>
              </div>
              <div className="Features_texts__RtIcz">
                <h3 className="Features_itemTitle__iMRZ2">
                  <span className="Features_itemTitleStrong__gHhaD">
                    {macwallExactCopy.values.cards[2].title}
                  </span>{" "}
                  {macwallExactCopy.values.cards[2].body}
                </h3>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="UnderFooter_UnderFooter__b6g_p">
        <div className="UnderFooter_container__oOtv6">
          <h1 className="UnderFooter_title__OVvuP">
            {macwallExactCopy.underFooter.title}
          </h1>
          <p className="UnderFooter_text__nMG8_">
            {macwallExactCopy.underFooter.body}
          </p>
          <Link
            className="UnderFooter_link__83P0M"
            href={macwall.website}
            target="_blank"
            rel="noopener noreferrer"
          >
            {macwallExactCopy.underFooter.cta}
            <SvgChevron14 />
          </Link>
        </div>
      </section>

      <MacWallMarketingFooter shopPricingHref="/pricing" />
    </div>
  )
}
