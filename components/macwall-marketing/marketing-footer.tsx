"use client"

import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  DiscordIcon,
  InstagramIcon,
  Mail01Icon,
  TiktokIcon,
} from "@hugeicons/core-free-icons"

import { MacWallBrandLink } from "@/components/macwall-marketing/MacWallBrandLink"
import { AFFILIATE_UI_VISIBLE } from "@/lib/macwall-affiliate"
import { macwall, mailtoSupport } from "@/lib/macwall-site"
import { macwallExactCopy } from "@/lib/macwall-marketing-copy"
import { SUPPORT_CHAT_HREF } from "@/lib/support/shared"

const footerLinkClass =
  "text-[15px] text-marketing-muted transition-colors hover:text-foreground"

const socialLinkClass =
  "inline-flex size-8 items-center justify-center text-marketing-muted transition-colors hover:text-foreground"

const SOCIAL_ICON_SIZE = 18
const SOCIAL_ICON_STROKE = 1.75

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
                {AFFILIATE_UI_VISIBLE ? (
                  <li>
                    <Link href="/affiliate" className={footerLinkClass}>
                      {foot.connect.affiliate}
                    </Link>
                  </li>
                ) : null}
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
                  <a
                    href={macwall.discordInvite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={footerLinkClass}
                  >
                    Discord
                  </a>
                </li>
                <li>
                  <a
                    href={macwall.reelRefundInstagramURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={footerLinkClass}
                  >
                    Instagram
                  </a>
                </li>
                {AFFILIATE_UI_VISIBLE ? (
                  <li>
                    <Link href="/affiliate" className={footerLinkClass}>
                      {foot.connect.affiliate}
                    </Link>
                  </li>
                ) : null}
                <li>
                  <Link href={SUPPORT_CHAT_HREF} className={footerLinkClass}>
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
                    href={macwall.discordInvite}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Discord"
                    className={socialLinkClass}
                  >
                    <HugeiconsIcon
                      icon={DiscordIcon}
                      size={SOCIAL_ICON_SIZE}
                      strokeWidth={SOCIAL_ICON_STROKE}
                      aria-hidden
                    />
                  </a>
                  <a
                    href={macwall.reelRefundInstagramURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className={socialLinkClass}
                  >
                    <HugeiconsIcon
                      icon={InstagramIcon}
                      size={SOCIAL_ICON_SIZE}
                      strokeWidth={SOCIAL_ICON_STROKE}
                      aria-hidden
                    />
                  </a>
                  <a
                    href={macwall.reelRefundTiktokURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="TikTok"
                    className={socialLinkClass}
                  >
                    <HugeiconsIcon
                      icon={TiktokIcon}
                      size={SOCIAL_ICON_SIZE}
                      strokeWidth={SOCIAL_ICON_STROKE}
                      aria-hidden
                    />
                  </a>
                  <a
                    href={mailtoSupport}
                    aria-label={macwall.supportEmail}
                    className={socialLinkClass}
                  >
                    <HugeiconsIcon
                      icon={Mail01Icon}
                      size={SOCIAL_ICON_SIZE}
                      strokeWidth={SOCIAL_ICON_STROKE}
                      aria-hidden
                    />
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
