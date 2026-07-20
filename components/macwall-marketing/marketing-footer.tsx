"use client"

import Link from "next/link"
import { MacWallBrandLink } from "@/components/macwall-marketing/MacWallBrandLink"
import {
  macwall,
  mailtoSupport,
} from "@/lib/macwall-site"
import { macwallExactCopy } from "@/lib/macwall-marketing-copy"
import { cn } from "@/lib/utils"

const socialIconClass = "block size-[18px] shrink-0"

function DiscordIcon({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      className={cn(socialIconClass, className)}
      viewBox="-1 3 26 18"
      fill="currentColor"
      aria-hidden
    >
      <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037 12.683 12.683 0 00-.608 1.25 18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  )
}

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
            <p className="mt-2.5 text-[14px] leading-snug text-marketing-muted max-sm:whitespace-normal sm:whitespace-nowrap">
              {macwall.tagline}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-8 sm:gap-x-12 md:grid-cols-4 md:gap-x-10 lg:flex-1 lg:justify-center xl:gap-x-16">
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
                  <Link href="/support" className={footerLinkClass}>
                    Live Support
                  </Link>
                </li>
                <li>
                  <a
                    href={macwall.discordInvite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={footerLinkClass}
                  >
                    {foot.connect.discord}
                  </a>
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

        <div className="mt-10 border-t border-border pt-8">
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
                    href={macwall.discordInvite}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Discord"
                    className={socialLinkClass}
                  >
                    <DiscordIcon />
                  </a>
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
