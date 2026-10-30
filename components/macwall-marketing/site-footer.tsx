import Link from "next/link"

import { MacWallAppIcon } from "@/components/macwall-app-icon"
import { FooterWordmark } from "@/components/macwall-marketing/footer-wordmark"
import { FOOTER_FRAME } from "@/components/macwall-marketing/marketing-section"
import MarketingFooterAiSummary from "@/components/macwall-marketing/marketing-footer-ai-summary"
import { macwallMarketingCopy } from "@/lib/macwall-marketing-copy"
import { macwall } from "@/lib/macwall-site"
import { cn } from "@/lib/utils"

type FooterLink = Readonly<{ href: string; label: string }>

/**
 * Doormat columns, as on PostMesh: Product first and Legal last, help before
 * the developer pieces. No links to page sections.
 */
const FOOTER_COLUMNS: ReadonlyArray<
  Readonly<{ title: string; links: ReadonlyArray<FooterLink> }>
> = [
  {
    title: "Product",
    links: [
      { href: "/wallpapers", label: "Wallpapers" },
      { href: "/download", label: "Download" },
      { href: "/pricing", label: "Pricing" },
      { href: "/compare", label: "Compare" },
      { href: "/tools", label: "Free tools" },
      { href: "/blog", label: "Blog" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/docs", label: "Help center" },
      { href: "/contact", label: "Contact us" },
      { href: macwall.discordInvite, label: "Discord" },
    ],
  },
  {
    title: "Developers",
    links: [
      { href: "/docs/public-api", label: "Public API" },
      { href: "/ai-info", label: "AI product info" },
      { href: "/llms.txt", label: "llms.txt" },
      { href: "/llms-full.txt", label: "llms-full.txt" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/legal/privacy", label: "Privacy Policy" },
      { href: "/legal/terms", label: "Terms of Service" },
      { href: "/legal/refund", label: "Refund Policy" },
      { href: "/legal", label: "All policies" },
    ],
  },
]

const linkFocus =
  "rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-white/40"

/** Files (llms.txt, sitemap.xml) aren't pages, so they get a plain <a>. */
function FooterAnchor({
  href,
  label,
  className,
}: FooterLink & { className: string }) {
  if (href.startsWith("https://")) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {label}
      </a>
    )
  }
  if (/\.(txt|xml|md)$/.test(href)) {
    return (
      <a href={href} className={className}>
        {label}
      </a>
    )
  }
  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  )
}

/**
 * The site footer, built the way PostMesh's is: the brand block and four link
 * columns, a bottom row with the copyright and the AI summary links, then the giant
 * halftone wordmark cropped by the page's bottom edge. Uses PostMesh's own
 * footer frame (1440px, 80px gutters on desktop).
 */
export function SiteFooter({ className }: Readonly<{ className?: string }>) {
  const year = new Date().getFullYear()

  return (
    <footer id="company" className={cn("bg-black", className)}>
      <div
        className={cn(FOOTER_FRAME, "pt-20 pb-20 sm:pb-24 lg:pt-24 lg:pb-32")}
      >
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Link
              href="/"
              aria-label={`${macwall.name} home`}
              className="inline-flex shrink-0 items-center gap-2.5 rounded-full text-[17px] leading-none font-medium tracking-[-0.01em] text-ink transition-colors outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-white/40"
            >
              <MacWallAppIcon size={26} aria-hidden />
              {macwall.name}
            </Link>
            <p className="mt-4 text-[14px] leading-[22px] whitespace-pre-line text-ink-2">
              {macwallMarketingCopy.footer.blurb}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 lg:col-span-8">
            {FOOTER_COLUMNS.map((column) => (
              <nav
                key={column.title}
                aria-label={column.title}
                className="flex flex-col gap-4"
              >
                <p className="text-[14px] leading-5 font-medium text-ink">
                  {column.title}
                </p>
                <ul className="flex flex-col gap-3">
                  {column.links.map((item) => (
                    <li key={item.href}>
                      <FooterAnchor
                        {...item}
                        className={cn(
                          "text-[14px] leading-5 text-ink-2 transition-colors hover:text-white",
                          linkFocus
                        )}
                      />
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-hairline pt-8 text-[13px] leading-5 text-ink-3 md:flex-row md:items-center md:justify-between md:gap-6 lg:mt-20">
          <div className="flex flex-col gap-2">
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>
                © {year} {macwall.name}. All rights reserved.
              </span>
              {/* The cookie page holds the live on/off control for this
                  device (CookieChoiceReset); the banner itself only opens
                  for EEA/UK/CH visitors who haven't chosen yet. */}
              <Link
                href="/legal/cookies#consent"
                className={cn("transition-colors hover:text-white", linkFocus)}
              >
                Cookie settings
              </Link>
              <Link
                href="/legal/ccpa#sale"
                className={cn("transition-colors hover:text-white", linkFocus)}
              >
                Your Privacy Choices
              </Link>
            </p>
            <p className="text-[12px] leading-5">
              Mac and macOS are trademarks of Apple Inc., registered in the
              U.S. and other countries and regions. {macwall.name} is not
              affiliated with Apple.
            </p>
          </div>
          <MarketingFooterAiSummary labelClassName="text-[13px] leading-5 text-ink-3" />
        </div>
      </div>
      <FooterWordmark />
    </footer>
  )
}
