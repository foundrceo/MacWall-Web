import { ArrowUpRight } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"

import { MacWallBrandLink } from "@/components/macwall-marketing/MacWallBrandLink"
import { DeferredVideo } from "@/components/macwall-marketing/deferred-video"
import { MacDesktop } from "@/components/macwall-marketing/footer-mac-desktop"
import {
  WallpaperWall,
  type WallTile,
} from "@/components/macwall-marketing/footer-wallpaper-wall"
import { FooterHoverWordmark } from "@/components/macwall-marketing/footer-hover-wordmark"
import { landingShellPad } from "@/components/macwall-marketing/landing-type"
import MarketingFooterAiSummary from "@/components/macwall-marketing/marketing-footer-ai-summary"
import { MarketingSocialBrandIcon } from "@/components/macwall-marketing/marketing-social-icons"
import { macwallMarketingCopy } from "@/lib/macwall-marketing-copy"
import { MARKETING_GALLERY_WALLPAPERS_FALLBACK } from "@/lib/marketing-gallery-wallpapers"
import { macwall, macwallMinimumMacOSVersion } from "@/lib/macwall-site"
import { wallpaperDetailPath } from "@/lib/public-catalog/urls"
import {
  footerCategoryLinks,
  footerCompareLinks,
  getMarketingFooterColumns,
  getMarketingFooterSocialLinks,
  type MarketingFooterColumn,
  type MarketingFooterLink,
} from "@/lib/marketing-footer-nav"
import { cn } from "@/lib/utils"

/**
 * - directory (live): Apple-style dense directory and one fine-print row,
 *   then the giant serif "MacWall".
 * - wordmark: the previous footer; desktop, wall, card: the other
 *   candidates. All kept on /footer-lab for now.
 */
export type FooterVariant = "wordmark" | "desktop" | "wall" | "directory" | "card"

const footerColumnTitleClass =
  "mb-4 text-[14px] font-medium leading-none text-foreground"

const footerLinkClass =
  "inline-block rounded-sm text-[14px] leading-[1.45] text-marketing-muted transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"

const socialLinkClass =
  "inline-flex size-9 items-center justify-center rounded-full text-white/70 transition-colors outline-none hover:bg-white/[0.06] hover:text-white focus-visible:ring-2 focus-visible:ring-white/40"

function FooterLink({
  link,
  className = footerLinkClass,
}: Readonly<{ link: MarketingFooterLink; className?: string }>) {
  if (link.external) {
    return (
      <a
        href={link.href}
        className={className}
        {...(link.href.startsWith("mailto:")
          ? {}
          : { target: "_blank", rel: "noopener noreferrer" })}
      >
        {link.label}
      </a>
    )
  }

  return (
    <Link href={link.href} className={className}>
      {link.label}
    </Link>
  )
}

function Socials({ className }: Readonly<{ className?: string }>) {
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {getMarketingFooterSocialLinks().map((social) => (
        <a
          key={social.label}
          href={social.href}
          aria-label={social.label}
          className={socialLinkClass}
          target="_blank"
          rel="noopener noreferrer"
        >
          <MarketingSocialBrandIcon brand={social.brand} />
        </a>
      ))}
    </div>
  )
}

function Copyright({ className }: Readonly<{ className?: string }>) {
  return (
    <p className={cn("text-[13px] leading-[1.45] text-white/45", className)}>
      © {new Date().getFullYear()} {macwallMarketingCopy.footer.copyrightName}
    </p>
  )
}

function LinkColumn({ column }: Readonly<{ column: MarketingFooterColumn }>) {
  return (
    <nav aria-label={column.title}>
      <p className={footerColumnTitleClass}>{column.title}</p>
      <ul className="flex flex-col gap-3">
        {column.links.map((link) => (
          <li key={`${column.title}-${link.href}`}>
            <FooterLink link={link} />
          </li>
        ))}
      </ul>
    </nav>
  )
}

function LinkColumns({ className }: Readonly<{ className?: string }>) {
  return (
    <div className={cn("grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 sm:gap-x-12", className)}>
      {getMarketingFooterColumns().map((column) => (
        <LinkColumn key={column.title} column={column} />
      ))}
    </div>
  )
}

/** Brand, its line and the socials. */
function BrandBlock({ className }: Readonly<{ className?: string }>) {
  return (
    <div className={className}>
      <MacWallBrandLink variant="footer" priority />
      <p className="mt-4 max-w-[16rem] text-[14px] leading-[1.55] text-marketing-muted">
        {macwallMarketingCopy.footer.blurb}
      </p>
      {/* The buttons carry 9px of padding around each icon, so the margin
          is 9px short: the visible gap above the icons reads 24px. */}
      <Socials className="-ml-[9px] mt-[15px]" />
    </div>
  )
}

/** Brand on the left; columns on the right, a fixed width so they line up. */
function BrandAndColumns() {
  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,18rem)_1fr] lg:gap-16">
      <BrandBlock />
      <LinkColumns className="lg:grid-cols-[repeat(3,10rem)] lg:justify-self-end lg:gap-x-14" />
    </div>
  )
}

/** © on the left, the AI summary on the right; stacked on phones. */
function BottomBar({ className }: Readonly<{ className?: string }>) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse items-start justify-between gap-3 sm:flex-row sm:items-center",
        className
      )}
    >
      <Copyright />
      <MarketingFooterAiSummary />
    </div>
  )
}

/**
 * The dashed column every footer sits in. With `wordmark`, it ends in the
 * giant serif "MacWall" fading and cropped by the bottom edge, whose outline
 * lights up around the pointer.
 */
function FooterShell({
  children,
  wordmark = true,
}: Readonly<{ children: ReactNode; wordmark?: boolean }>) {
  return (
    <footer id="company" className="bg-background">
      <div className="container relative mx-auto">
        <div className="overflow-hidden border-border border-dashed sm:border-x">
          <div
            className={cn(
              landingShellPad,
              "pt-14 md:pt-16 lg:pt-20",
              !wordmark && "pb-10 md:pb-12"
            )}
          >
            {children}
          </div>
          {wordmark ? (
            <div className="mt-6 px-4 sm:px-8">
              <FooterHoverWordmark text={macwall.name} />
            </div>
          ) : null}
        </div>
      </div>
    </footer>
  )
}

/** Picks wallpapers from the bundled catalog sample by id, in that order. */
function pickWallpapers(ids: readonly string[]) {
  return ids.flatMap((id) => {
    const found = MARKETING_GALLERY_WALLPAPERS_FALLBACK.find((w) => w.id === id)
    return found ? [found] : []
  })
}

/* ------------------------------------------------------------------ */
/* Current                                                             */
/* ------------------------------------------------------------------ */

function WordmarkFooter() {
  return (
    <FooterShell>
      <BrandAndColumns />
      <BottomBar className="mt-14 lg:mt-16" />
    </FooterShell>
  )
}

/* ------------------------------------------------------------------ */
/* 1 · Mac desktop                                                     */
/* ------------------------------------------------------------------ */

/** The footer as a Mac screen: menu bar links, live wallpaper, a Dock. */
function DesktopFooter() {
  const [wallpaper] = pickWallpapers(["aesthetic-orange-autumn-forest"])
  return (
    <FooterShell wordmark={false}>
      {wallpaper ? (
        <MacDesktop
          menus={getMarketingFooterColumns()}
          socials={getMarketingFooterSocialLinks()}
          wallpaper={{
            src: wallpaper.videoUrl,
            poster: wallpaper.posterUrl,
            name: wallpaper.name,
          }}
          headline="Your Mac, alive."
          blurb={macwallMarketingCopy.footer.blurb}
        />
      ) : null}
      <div className="mt-6 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
        <Copyright />
        <p className="text-[13px] text-white/45">
          Requires {macwallMinimumMacOSVersion} or later
        </p>
      </div>
    </FooterShell>
  )
}

/* ------------------------------------------------------------------ */
/* 2 · Wallpaper wall                                                  */
/* ------------------------------------------------------------------ */

/** Real wallpapers drift across the top; the links sit calmly below. */
function WallFooter() {
  const tiles: WallTile[] = MARKETING_GALLERY_WALLPAPERS_FALLBACK.map((w) => ({
    id: w.id,
    name: w.name,
    href: wallpaperDetailPath(w),
    posterUrl: w.posterUrl,
    videoUrl: w.videoUrl,
  }))
  const half = Math.ceil(tiles.length / 2)
  const rows = [tiles.slice(0, half), tiles.slice(half)]
  const landing = macwallMarketingCopy.landing

  return (
    <footer id="company" className="bg-background">
      <div className="container relative mx-auto">
        <div className="overflow-hidden border-border border-dashed pt-14 pb-10 sm:border-x md:pt-16 md:pb-12 lg:pt-20">
          <WallpaperWall rows={rows} />
          <div className={cn(landingShellPad, "mt-14 md:mt-16")}>
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
              <div>
                <MacWallBrandLink variant="footer" priority />
                <p className="mt-4 font-display text-3xl tracking-tight text-foreground md:text-4xl">
                  {landing.browseTitle}.
                </p>
                <Link
                  href="/wallpapers"
                  className="mt-3 inline-flex items-center gap-1 rounded-sm text-[14px] font-medium text-foreground transition-opacity outline-none hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  Browse them all
                  <ArrowUpRight className="size-3.5" strokeWidth={2} aria-hidden />
                </Link>
              </div>
              <Socials className="-ml-[9px] sm:-mr-[9px] sm:ml-0" />
            </div>
            <LinkColumns className="mt-12 sm:grid-cols-3 lg:grid-cols-[repeat(3,minmax(0,14rem))]" />
            <BottomBar className="mt-14" />
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ------------------------------------------------------------------ */
/* 3 · Apple-style directory                                           */
/* ------------------------------------------------------------------ */

/**
 * Like apple.com: a dense directory of every useful page in small type
 * (categories and comparisons included), a "more ways" line, one fine-print
 * row; the faint wordmark is its only flourish.
 */
function DirectoryFooter() {
  const [product, resources, legal] = getMarketingFooterColumns()
  const foot = macwallMarketingCopy.footer
  const socials = getMarketingFooterSocialLinks().map((social) => ({
    label: social.label,
    href: social.href,
    external: true,
  }))
  const groups: { title: string; links: readonly MarketingFooterLink[] }[] = [
    ...(product ? [product] : []),
    {
      title: "Wallpapers",
      links: footerCategoryLinks.filter((link) => link.label !== "Others"),
    },
    ...(resources
      ? [
          {
            title: resources.title,
            links: resources.links.filter((link) => link.href !== "/contact"),
          },
        ]
      : []),
    { title: "Compare", links: footerCompareLinks },
    {
      title: "Connect",
      links: [{ label: "Contact", href: "/contact" }, ...socials],
    },
    ...(legal ? [legal] : []),
  ]
  const fine = "text-[12px] leading-[1.5] text-white/45"
  // py-1 / -my-1 grow every hit area to 24px+ without moving the text.
  const dirLink =
    "-my-1 flex w-fit items-center gap-1 rounded-sm py-1 text-[13px] leading-[1.4] text-white/55 transition-colors outline-none hover:text-foreground focus-visible:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
  const inlineLink =
    "rounded-sm text-white/70 underline-offset-2 transition-colors outline-none hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"

  return (
    <FooterShell>
      <nav
        aria-label="Directory"
        // On desktop the columns size to their content and share the spare
        // room equally between them: the first starts at the left edge, the
        // last ends at the right, so the block reads centred, not left-heavy.
        className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:flex lg:justify-between lg:gap-x-10"
      >
        {groups.map((group) => (
          <div key={group.title}>
            <p className="mb-3.5 text-[13px] leading-none font-semibold text-white/90">
              {group.title}
            </p>
            <ul className="flex flex-col gap-2.5">
              {group.links.map((link) =>
                link.external ? (
                  // Leaves the site in a new tab: say so with the arrow.
                  <li key={link.href}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(dirLink, "group")}
                    >
                      {link.label}
                      <ArrowUpRight
                        className="size-3 opacity-50 transition-opacity group-hover:opacity-100"
                        strokeWidth={2}
                        aria-hidden
                      />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </li>
                ) : (
                  <li key={link.href}>
                    <FooterLink link={link} className={dirLink} />
                  </li>
                )
              )}
            </ul>
          </div>
        ))}
      </nav>
      <p className={cn(fine, "mt-12 lg:mt-14")}>
        More ways to get help:{" "}
        <Link href="/docs" className={inlineLink}>
          read the docs
        </Link>
        ,{" "}
        <Link href="/contact" className={inlineLink}>
          contact us
        </Link>
        , or{" "}
        <a
          href={macwall.discordInvite}
          target="_blank"
          rel="noopener noreferrer"
          className={inlineLink}
        >
          ask on Discord
        </a>
        .
      </p>
      <div className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className={fine}>
          Copyright © {new Date().getFullYear()} {foot.copyrightName}. All rights
          reserved.
        </p>
        <MarketingFooterAiSummary labelClassName="text-[12px]" />
      </div>
    </FooterShell>
  )
}

/* ------------------------------------------------------------------ */
/* 4 · Big final card                                                  */
/* ------------------------------------------------------------------ */

/**
 * The last slide of a keynote: one large card with a live wallpaper behind
 * the headline, the links laid over it on glass, and the fine print below.
 */
function CardFooter() {
  const [wallpaper] = pickWallpapers(["orbital-station-above-earth"])
  return (
    <FooterShell wordmark={false}>
      <div className="relative isolate overflow-hidden rounded-3xl ring-1 ring-white/10">
        {wallpaper ? (
          <div aria-hidden className="absolute inset-0 -z-10">
            <DeferredVideo
              src={wallpaper.videoUrl}
              poster={wallpaper.posterUrl}
              label=""
            />
            <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/45 to-black/20" />
            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />
          </div>
        ) : null}
        <div className="flex min-h-[34rem] flex-col justify-between gap-12 p-6 md:p-10 lg:min-h-[38rem] lg:p-12">
          <div className="flex items-center justify-between gap-4">
            <MacWallBrandLink variant="footer" priority />
            <Socials className="-mr-[9px]" />
          </div>
          <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16">
            <div>
              <p className="max-w-[12ch] font-display text-5xl leading-[1.02] tracking-tight text-white md:text-7xl">
                Make your Mac feel alive.
              </p>
              <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-white/75">
                {macwallMarketingCopy.footer.blurb}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-8 rounded-2xl bg-black/35 p-6 ring-1 ring-white/10 backdrop-blur-xl sm:grid-cols-3 lg:gap-x-10">
              {getMarketingFooterColumns().map((column) => (
                <nav key={column.title} aria-label={column.title}>
                  <p className="mb-3 text-[13px] font-medium text-white">
                    {column.title}
                  </p>
                  <ul className="flex flex-col gap-2">
                    {column.links.map((link) => (
                      <li key={link.href}>
                        <FooterLink
                          link={link}
                          className="rounded-sm text-[13px] text-white/65 transition-colors outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-white/40"
                        />
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}
            </div>
          </div>
        </div>
      </div>
      <BottomBar className="mt-6" />
    </FooterShell>
  )
}

export default function MacWallMarketingFooter({
  variant = "directory",
}: Readonly<{ variant?: FooterVariant }>) {
  const Footer = {
    wordmark: WordmarkFooter,
    desktop: DesktopFooter,
    wall: WallFooter,
    directory: DirectoryFooter,
    card: CardFooter,
  }[variant]
  return <Footer />
}
