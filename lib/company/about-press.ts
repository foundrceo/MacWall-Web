import type { SeoContentPage } from "@/lib/content/types"
import {
  macwall,
  macwallAppIconPath,
  macwallCatalog,
  macwallLockScreenMacOSVersion,
  macwallPlaybackModes,
  macwallSocialProof,
  macwallSupportedMacOS,
  macwallTrial,
} from "@/lib/macwall-site"
import { MARKETING_HERO_VIDEO_MP4_PATH } from "@/lib/marketing-assets-urls"
import {
  COMPARISONS_CHECKED_ISO,
  COMPARISONS_RECHECKED_ISO,
  accessedLabel,
} from "@/lib/seo/comparison-facts"
import { CURRENCY_NOTE, proPriceText } from "@/lib/ai/price-facts"

/**
 * /about and /press: organization-level pages, shared by the HTML pages and
 * their Markdown twins. Facts come from lib/macwall-site.ts; prices from the
 * sale-aware helper at render time. No people, photos or figures that the
 * rest of the site doesn't already state: the company is named as plain text
 * only (no address, agent, file number or formation date).
 */

export const ABOUT_PATH = "/about" as const
export const PRESS_PATH = "/press" as const

/** The day the text of these two pages last changed. */
export const COMPANY_PAGES_UPDATED_ISO = "2026-11-06"

const systemPlayback = macwallPlaybackModes.systemWallpaper

/** One-paragraph description for articles, listings and directories. */
export function macwallBoilerplate(now: number = Date.now()): string {
  return `${macwall.name} is a native macOS app that plays live video wallpapers on the desktop, and on the Lock Screen and screen saver on ${macwallLockScreenMacOSVersion} or later. It has a curated catalog of ${macwallCatalog.liveCountLabel} loops, most in 4K, plays your own videos, and decodes video in hardware. ${macwall.name} runs on ${macwallSupportedMacOS.label}. Every Mac gets a free 24-hour trial; Pro is a one-time ${proPriceText("default", now)} for up to ${macwall.maxLicensedMacs} Macs, with no subscription. ${macwall.name} is made by ${macwall.legalCompanyName} and available at macwall.app.`
}

export const ABOUT_TITLE = "About MacWall: Who Makes the Live Wallpaper App"
export const ABOUT_DESCRIPTION = `What ${macwall.name} is, who makes it, how to reach the team, and how the product and comparison facts on macwall.app are checked and corrected.`

export function getAboutPage(now: number = Date.now()): SeoContentPage {
  return {
    slug: "about",
    pathname: ABOUT_PATH,
    title: ABOUT_TITLE,
    headline: `About ${macwall.name}`,
    description: ABOUT_DESCRIPTION,
    keywords: [
      "about macwall",
      "who makes macwall",
      "macwall company",
      "macwall developer",
    ],
    publishedAt: COMPANY_PAGES_UPDATED_ISO,
    updatedAt: COMPANY_PAGES_UPDATED_ISO,
    sections: [
      { type: "h2", text: `What ${macwall.name} is` },
      {
        type: "p",
        text: `${macwall.name} is a native Mac app for live video wallpapers: looping video behind your windows, on the Lock Screen and as the screen saver. It is written for macOS, decodes video in hardware, and lives in the menu bar. In ${systemPlayback.setting} mode, macOS keeps the wallpaper playing even after you quit the app. ${macwall.name} is made only for the Mac; there is no Windows, iPhone or iPad version.`,
      },
      {
        type: "p",
        text: `Every Mac gets one ${macwallTrial.name}. Pro is a one-time ${proPriceText("default", now)} for up to ${macwall.maxLicensedMacs} Macs, and Pro+ covers 5 or 10. ${CURRENCY_NOTE} Full details are on [pricing](/pricing).`,
      },
      { type: "h2", text: `Who makes ${macwall.name}` },
      {
        type: "p",
        text: `${macwall.name} is made and sold by **${macwall.legalCompanyName}**, the company named in the [Terms of Service](/legal/terms). The [Reel refund](/creator) pays people back for posting a video of the app in use. Payments are processed by ${macwall.paymentProcessor}; ${macwall.name} never sees card details.`,
      },
      {
        type: "p",
        text: `${macwall.name} is distributed only from macwall.app, as a Developer ID signed DMG notarized by Apple. Updates arrive through the app's built-in updater, and every release is listed in the [changelog](/changelog). The current version is ${macwall.currentVersion}, released ${macwall.currentVersionReleasedLabel}.`,
      },
      { type: "h2", text: "Facts" },
      {
        type: "ul",
        items: [
          `**Product**: ${macwall.name}, a live wallpaper app for Mac (bundle ID ${macwall.bundleIdentifier}).`,
          `**Company**: ${macwall.legalCompanyName}.`,
          `**Runs on**: ${macwallSupportedMacOS.label}, on ${macwallSupportedMacOS.architectures}. Lock Screen video needs ${macwallLockScreenMacOSVersion} or later.`,
          `**Catalog**: ${macwallCatalog.liveCountLabel} live wallpapers, most in 4K, across ${macwall.categories.length} categories.`,
          `**Downloads**: ${macwallSocialProof.downloadsLine} from macwall.app (as of ${macwallSocialProof.verifiedOnIso}). It counts installer downloads, not users.`,
          `**Price**: free 24-hour trial; Pro is a one-time ${proPriceText("default", now)}; in India, ${proPriceText("india", now)}.`,
          `**Website**: [${macwall.website}](${macwall.website}).`,
        ],
      },
      { type: "h2", text: "How we check what this site says" },
      {
        type: "ul",
        items: [
          `**Product facts** (macOS support, the trial, battery and playback behavior, permissions, file formats) are checked against the shipped Mac app before a page changes. The [AI product information](/ai-info) page carries the review date, last ${macwall.productInfoLastReviewedLabel}.`,
          `**Comparisons** with other apps quote each developer's own site, GitHub page or App Store listing, and every comparison page lists its sources with the date they were read. Most were read on ${accessedLabel(COMPARISONS_CHECKED_ISO)}, and prices again on ${accessedLabel(COMPARISONS_RECHECKED_ISO)}.`,
          "**No invented numbers**: we don't publish ratings, benchmark figures or user counts we haven't measured. The only usage figure is the download count above.",
          `**Corrections**: if something here is wrong, about ${macwall.name} or about another app, email [${macwall.supportEmail}](mailto:${macwall.supportEmail}) and we fix it.`,
        ],
      },
      { type: "h2", text: "Contact" },
      {
        type: "ul",
        items: [
          `Support, licenses, corrections and press: [${macwall.supportEmail}](mailto:${macwall.supportEmail}). See also [contact](/contact).`,
          `Reel refund claims: [${macwall.reelRefundEmail}](mailto:${macwall.reelRefundEmail}).`,
          `Community: [Discord](${macwall.discordInvite}).`,
          `Social: [Instagram ${macwall.reelRefundInstagram}](${macwall.reelRefundInstagramURL}), [TikTok ${macwall.reelRefundTiktok}](${macwall.reelRefundTiktokURL}), [YouTube](${macwall.youtubeChannelURL}).`,
        ],
      },
      { type: "h2", text: "More about MacWall" },
      {
        type: "ul",
        items: [
          "[Press kit](/press): boilerplate, fact sheet, the app icon and product images.",
          "[AI product information](/ai-info): the canonical product reference.",
          "[FAQ](/faq): short answers on price, battery, the Lock Screen and compatibility.",
          "[Legal](/legal): terms, privacy and refund policies.",
        ],
      },
    ],
  }
}

/** Downloadable brand and product assets, all served from macwall.app or its CDN. */
export type PressAsset = {
  label: string
  href: string
  /** Shown as a preview on the HTML page; null for files that aren't images. */
  preview: string | null
  detail: string
}

export const PRESS_ASSETS: readonly PressAsset[] = [
  {
    label: "App icon",
    href: macwallAppIconPath,
    preview: macwallAppIconPath,
    detail: "PNG, 1024 × 1024, transparent corners.",
  },
  {
    label: "MacWall on a Mac desktop",
    href: "/hero/hero-video-poster.jpg",
    preview: "/hero/hero-video-poster.jpg",
    detail:
      "JPEG still from the homepage video: a live wallpaper behind the macOS menu bar and Dock.",
  },
  {
    label: "Homepage demo video",
    href: MARKETING_HERO_VIDEO_MP4_PATH,
    preview: null,
    detail: "MP4: the loop that plays at the top of macwall.app.",
  },
]

export const PRESS_TITLE = "MacWall Press Kit: Facts, Logo and Images"
export const PRESS_DESCRIPTION = `Everything for writing about ${macwall.name}: a short description, a fact sheet with current price and macOS support, the app icon, product images and a press contact.`

export function getPressPage(now: number = Date.now()): SeoContentPage {
  return {
    slug: "press",
    pathname: PRESS_PATH,
    title: PRESS_TITLE,
    headline: `${macwall.name} press kit`,
    description: PRESS_DESCRIPTION,
    keywords: [
      "macwall press kit",
      "macwall logo",
      "macwall fact sheet",
      "macwall media",
    ],
    publishedAt: COMPANY_PAGES_UPDATED_ISO,
    updatedAt: COMPANY_PAGES_UPDATED_ISO,
    sections: [
      { type: "h2", text: "About MacWall in one paragraph" },
      { type: "p", text: macwallBoilerplate(now) },
      { type: "h2", text: "Fact sheet" },
      {
        type: "table",
        columns: ["Fact", "Detail"],
        rows: [
          ["Name", `${macwall.name} (one word, capital M and W)`],
          ["What it is", "Live video wallpaper app for Mac"],
          ["Company", macwall.legalCompanyName],
          ["Website", macwall.website],
          [
            "Runs on",
            `${macwallSupportedMacOS.label}; ${macwallSupportedMacOS.architectures}`,
          ],
          ["Lock Screen video", `${macwallLockScreenMacOSVersion} or later`],
          [
            "Price",
            `Free 24-hour trial; Pro ${proPriceText("default", now)} one time for ${macwall.maxLicensedMacs} Macs; Pro+ for 5 or 10 Macs`,
          ],
          ["India price", `Pro ${proPriceText("india", now)} one time`],
          ["Subscription", "None"],
          [
            "Catalog",
            `${macwallCatalog.liveCountLabel} live wallpapers, most in 4K`,
          ],
          [
            "Downloads",
            `${macwallSocialProof.downloadsLine} (as of ${macwallSocialProof.verifiedOnIso})`,
          ],
          [
            "Current version",
            `${macwall.currentVersion} (${macwall.currentVersionReleasedLabel})`,
          ],
          ["Distribution", "Signed and notarized DMG from macwall.app"],
        ],
        caption: `Prices as of the day this page was generated; see [pricing](/pricing) for today's. ${CURRENCY_NOTE}`,
      },
      { type: "h2", text: "Logo and images" },
      {
        type: "ul",
        items: PRESS_ASSETS.map(
          (asset) => `[${asset.label}](${asset.href}): ${asset.detail}`
        ),
      },
      {
        type: "p",
        text: `Use these to write about ${macwall.name}. Please don't redraw or recolor the icon. The wallpapers shown in product images belong to their creators; use them only as part of the ${macwall.name} image, not on their own.`,
      },
      { type: "h2", text: "Writing about MacWall" },
      {
        type: "ul",
        items: [
          `Write **${macwall.name}**, or **${macwall.name} app** where the name could be confused with the unrelated Maccaferri MacWall retaining-wall product or the macwall.skin wallpaper app.`,
          `${macwall.name} is not affiliated with Apple, Wallpaper Engine or Steam.`,
          `For product facts and the approved wording on performance, see the [AI product information](/ai-info) page.`,
        ],
      },
      { type: "h2", text: "Press contact" },
      {
        type: "p",
        text: `Email [${macwall.supportEmail}](mailto:${macwall.supportEmail}) with "Press" in the subject for interviews, more images or a fact check. More about the company: [About ${macwall.name}](/about).`,
      },
    ],
  }
}
