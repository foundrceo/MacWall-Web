import { getMarketingNavItems } from "@/lib/marketing-nav"
import { macwallMarketingCopy } from "@/lib/macwall-marketing-copy"
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
  const h = macwallMarketingCopy.header
  const ho = macwallMarketingCopy.hover

  const navPages = getMarketingNavItems().map((item) =>
    page(`page-${item.href.slice(1).replace(/\//g, "-")}`, item.label, item.href, {
      keywords:
        item.href === "/wallpapers"
          ? ["gallery", "catalog", "live wallpaper", "browse"]
          : item.href === "/pricing"
            ? ["pro", "license", "buy", "upgrade"]
            : item.href === "/blog"
              ? ["news", "articles", "updates"]
              : item.href === "/submit"
                ? ["upload", "community", "creator"]
                : ["earn", "referral", "partner"],
    })
  )

  const pages: CommandPaletteStaticItem[] = [
    page("page-overview", h.navOverview, "/", {
      keywords: ["home", "macwall", "overview"],
    }),
    ...navPages,
    page("page-changelog", "Changelog", "/changelog", {
      keywords: ["release notes", "updates", "history", "github"],
    }),
    page("page-creator", "Creator Solution", "/creator", {
      keywords: ["reel", "refund", "video", "tiktok", "instagram", "creator"],
    }),
    page("page-download", "Download", "/download", {
      keywords: ["installer", "get macwall", "app"],
    }),
    page(
      "page-live-wallpaper",
      "How to Set Live Wallpaper on Mac",
      "/blog/how-to-set-live-wallpaper-mac",
      {
        keywords: ["live wallpaper for mac", "animated wallpaper mac", "guide"],
      }
    ),
    page(
      "page-lock-screen",
      "Lock Screen Live Wallpaper on macOS",
      "/blog/lock-screen-live-wallpaper-macos",
      {
        keywords: ["lock screen live wallpaper mac", "macos tahoe", "pro"],
      }
    ),
  ]

  const actions: CommandPaletteStaticItem[] = [
    action("action-download", h.downloadCta, macwallInstallerLatestPath, {
      description: "Get the MacWall app for macOS 14+",
      keywords: ["install", "dmg", "latest"],
      analyticsEvent: "download_click",
      analyticsLocation: "command_palette",
    }),
    action("action-buy-pro", "Unlock MacWall Pro", macwallProCheckoutURL, {
      description: `${macwall.pro.price} permanent investment`,
      keywords: ["checkout", "license", "upgrade", "pro", "invest"],
      analyticsEvent: "checkout_started",
      analyticsLocation: "command_palette",
    }),
    action("action-discord", ho.links.discord.label, macwall.discordInvite, {
      description: ho.links.discord.title,
      keywords: ["community", "chat", "social", "discussion"],
      external: true,
    }),
    action("action-support-chat", "Live Assistance", SUPPORT_CHAT_HREF, {
      description: "Start a discussion with the MacWall team",
      keywords: ["help", "support", "chat", "guidance", "assistance"],
    }),
    action("action-email", "Email for Guidance", mailtoSupport, {
      description: macwall.supportEmail,
      keywords: ["contact", "mail", "help", "guidance"],
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
