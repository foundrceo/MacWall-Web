"use client"

import Link from "next/link"
import { MacWallBrandLink } from "@/components/macwall-marketing/MacWallBrandLink"
import { macwall, mailtoSupport } from "@/lib/macwall-site"
import { macwallExactCopy } from "@/lib/macwall-marketing-copy"
import { cn } from "@/lib/utils"

const socialIconClass = "block size-[18px] shrink-0"

function MailIcon({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      className={cn(socialIconClass, className)}
      viewBox="0 5 24 15"
      fill="currentColor"
      aria-hidden
    >
      <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
      <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
    </svg>
  )
}

function TikTokIcon({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      className={cn(socialIconClass, className)}
      viewBox="-2 1 28 22"
      fill="currentColor"
      aria-hidden
    >
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" />
    </svg>
  )
}

const footerLinkClass =
  "text-[15px] text-marketing-muted transition-colors hover:text-foreground"

const socialLinkClass =
  "inline-flex size-8 items-center justify-center text-marketing-muted transition-colors hover:text-foreground"

export default function MacWallMarketingFooter() {
  const foot = macwallExactCopy.footer
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-12">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="shrink-0 lg:min-w-[17rem]">
            <MacWallBrandLink variant="footer" priority />
            <p className="mt-2.5 max-w-sm text-[14px] leading-snug text-marketing-muted">
              {macwall.tagline}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:gap-x-12 md:grid-cols-4 md:gap-x-10 lg:flex-1 lg:justify-center xl:gap-x-16">
            <div>
              <p className="mb-3 text-[15px] font-medium text-foreground">
                Product
              </p>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/pricing" className={footerLinkClass}>
                    {foot.shop.pricing}
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className={footerLinkClass}>
                    {foot.explore.blog}
                  </Link>
                </li>
                <li>
                  <Link href="/affiliate" className={footerLinkClass}>
                    {foot.connect.affiliate}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="mb-3 text-[15px] font-medium text-foreground">
                {foot.exploreTitle}
              </p>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/live-wallpaper-mac" className={footerLinkClass}>
                    {foot.explore.liveWallpaper}
                  </Link>
                </li>
                <li>
                  <Link href="/download" className={footerLinkClass}>
                    {foot.shop.download}
                  </Link>
                </li>
                <li>
                  <Link href="/submit" className={footerLinkClass}>
                    Submit a wallpaper
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="mb-3 text-[15px] font-medium text-foreground">
                {foot.connectTitle}
              </p>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/affiliate" className={footerLinkClass}>
                    {foot.connect.affiliate}
                  </Link>
                </li>
                <li>
                  <Link href="/support" className={footerLinkClass}>
                    Live Support
                  </Link>
                </li>
                <li>
                  <a href={mailtoSupport} className={footerLinkClass}>
                    {macwall.supportEmail}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="mb-3 text-[15px] font-medium text-foreground">
                Legal
              </p>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/privacy" className={footerLinkClass}>
                    {foot.legal.privacy}
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className={footerLinkClass}>
                    {foot.legal.terms}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-2">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
            <div className="shrink-0 lg:min-w-[17rem]">
              <small className="text-sm text-marketing-muted">
                © {year} {foot.copyrightName}
              </small>
            </div>
            <div className="grid w-full grid-cols-2 gap-x-8 sm:gap-x-12 md:grid-cols-4 md:gap-x-10 lg:flex-1 lg:justify-center xl:gap-x-16">
              <div className="col-span-2 md:col-span-1 md:col-start-4">
                <div className="ml-1 flex items-center gap-2">
                  <a
                    href={mailtoSupport}
                    aria-label={macwall.supportEmail}
                    className={socialLinkClass}
                  >
                    <MailIcon />
                  </a>
                  <a
                    href={macwall.reelRefundTiktokURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="TikTok"
                    className={socialLinkClass}
                  >
                    <TikTokIcon />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
