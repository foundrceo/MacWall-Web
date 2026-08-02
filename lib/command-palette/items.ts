import { AFFILIATE_UI_VISIBLE } from "@/lib/macwall-affiliate"
import { macwallExactCopy } from "@/lib/macwall-marketing-copy"
import {
  macwall,
  macwallInstallerLatestPath,
  macwallProCheckoutURL,
  mailtoSupport,
} from "@/lib/macwall-site"
import type { CommandPaletteStaticItem } from "@/lib/command-palette/types"
import { SUPPORT_CHAT_HREF } from "@/lib/support/shared"

function page(
  id: string,
  label: string,
  href: string,
  options?: { description?: string; keywords?: string[] }
): CommandPaletteStaticItem {
  return {
    id,
    kind: "page",
    label,
    href,
    description: options?.description,
    keywords: options?.keywords,
  }
}

function action(
  id: string,
  label: string,
  href: string,
  options?: {
    description?: string
    keywords?: string[]
    external?: boolean
    analyticsEvent?: CommandPaletteStaticItem["analyticsEvent"]
    analyticsLocation?: string
  }
): CommandPaletteStaticItem {
  return {
    id,
    kind: "action",
    label,
    href,
    description: options?.description,
    keywords: options?.keywords,
    external: options?.external,
    analyticsEvent: options?.analyticsEvent,
    analyticsLocation: options?.analyticsLocation,
  }
}

/** Static pages and actions surfaced in the command palette. */
export function getCommandPaletteStaticItems(): {
  pages: CommandPaletteStaticItem[]
  actions: CommandPaletteStaticItem[]
} {
  const h = macwallExactCopy.header
  const ho = macwallExactCopy.hover

  const pages: CommandPaletteStaticItem[] = [
    page("page-overview", h.navOverview, "/", {
      keywords: ["home", "macwall", "overview"],
    }),
    page("page-wallpapers", h.navGallery, "/wallpapers", {
      keywords: ["gallery", "catalog", "live wallpaper", "browse"],
    }),
    page("page-pricing", h.navPricing, "/pricing", {
      keywords: ["pro", "license", "buy", "upgrade"],
    }),
    page("page-submit", h.navSubmit, "/submit", {
      keywords: ["upload", "community", "creator"],
    }),
    page("page-blog", h.navBlog, "/blog", {
      keywords: ["news", "articles", "updates"],
    }),
    page("page-download", "Download", "/download", {
      keywords: ["installer", "get macwall", "app"],
    }),
    page("page-live-wallpaper", "Live Wallpaper for Mac", "/live-wallpaper-mac", {
      keywords: ["desktop", "animated", "4k"],
    }),
    page("page-lock-screen", "Lock Screen Wallpapers", "/lock-screen-wallpaper", {
      keywords: ["screensaver", "tahoe", "lock screen"],
    }),
    ...(AFFILIATE_UI_VISIBLE
      ? [
          page("page-affiliate", h.navAffiliate, "/affiliate", {
            keywords: ["earn", "referral", "partner"],
          }),
        ]
      : []),
  ]

  const actions: CommandPaletteStaticItem[] = [
    action("action-download", h.downloadCta, macwallInstallerLatestPath, {
      description: "Get the MacWall app for macOS 14+",
      keywords: ["install", "dmg", "latest"],
      analyticsEvent: "download_click",
      analyticsLocation: "command_palette",
    }),
    action("action-buy-pro", "Buy MacWall Pro", macwallProCheckoutURL, {
      description: `${macwall.pro.price} permanent license`,
      keywords: ["checkout", "license", "upgrade", "pro"],
      analyticsEvent: "checkout_started",
      analyticsLocation: "command_palette",
    }),
    action("action-discord", ho.links.discord.label, macwall.discordInvite, {
      description: ho.links.discord.title,
      keywords: ["community", "chat", "social"],
      external: true,
    }),
    action("action-support-chat", "Live Support", SUPPORT_CHAT_HREF, {
      description: "Chat with the MacWall team",
      keywords: ["help", "support", "chat"],
    }),
    action("action-email", "Email Support", mailtoSupport, {
      description: macwall.supportEmail,
      keywords: ["contact", "mail", "help"],
      external: true,
    }),
  ]

  return { pages, actions }
}

export function matchesCommandQuery(
  item: { label: string; description?: string; keywords?: string[] },
  query: string
): boolean {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return true

  const haystack = [
    item.label,
    item.description ?? "",
    ...(item.keywords ?? []),
  ]
    .join(" ")
    .toLowerCase()

  return normalized
    .split(/\s+/)
    .every((token) => haystack.includes(token))
}
