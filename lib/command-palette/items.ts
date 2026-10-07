import {
  getMarketingNavItems,
  getMarketingSecondaryNavItems,
} from "@/lib/marketing-nav"
import { HELP_TOPICS } from "@/lib/docs/help-topics"
import { macwallMarketingCopy } from "@/lib/macwall-marketing-copy"
import {
  macwall,
  macwallInstallerLatestPath,
  macwallProCheckoutURL,
  mailtoSupport,
} from "@/lib/macwall-site"
import type { CommandPaletteStaticItem } from "@/lib/command-palette/types"

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

/** Everyday words people type that the help card titles don't contain. */
const HELP_KEYWORDS: Record<string, string[]> = {
  "/docs/install-macwall": ["install", "download", "setup", "dmg", "permission"],
  "/docs/set-a-live-wallpaper": ["apply", "change wallpaper", "display", "monitor"],
  "/docs/live-lock-screen-and-screen-saver": ["screensaver", "tahoe", "lock"],
  "/docs/import-your-own-videos": ["mp4", "mov", "gif", "upload", "custom"],
  "/docs/license-and-activation": ["key", "activate", "license", "new mac", "transfer"],
  "/docs/performance-and-battery": ["cpu", "slow", "battery", "pause", "fan"],
  "/docs/troubleshooting": ["not working", "broken", "black screen", "stuck", "error", "help"],
  "/docs/menu-bar-controls": ["pause", "shuffle", "skip"],
  "/legal/refund": ["refund", "money back", "cancel"],
  "/#faq": ["faq", "questions"],
  "/docs/uninstall-macwall": ["remove", "delete", "uninstall"],
}

/** Static pages and actions surfaced in the command palette. */
export function getCommandPaletteStaticItems(): {
  pages: CommandPaletteStaticItem[]
  actions: CommandPaletteStaticItem[]
} {
  const h = macwallMarketingCopy.header
  const ho = macwallMarketingCopy.hover

  const navKeywords: Record<string, string[]> = {
    "/wallpapers": ["gallery", "catalog", "live wallpaper", "browse"],
    "/#features": ["lock screen", "screen saver", "music sync", "battery"],
    "/docs": ["help", "support", "install", "license", "troubleshooting"],
    "/pricing": ["pro", "license", "buy", "upgrade"],
    "/learn": ["docs", "guides", "how it works", "explainers"],
    "/creator": [
      "reel",
      "refund",
      "video",
      "tiktok",
      "instagram",
      "creator",
      "want free",
      "get it free",
    ],
    "/blog": ["news", "articles", "updates"],
    "/affiliate": ["earn", "referral", "partner"],
  }

  // The changelog has its own entry below.
  const navPages = [
    ...getMarketingNavItems(),
    ...getMarketingSecondaryNavItems().filter(
      (item) => item.href !== "/changelog"
    ),
  ].map((item) =>
    page(`page-${item.href.slice(1).replace(/[/#]/g, "-")}`, item.label, item.href, {
      keywords: navKeywords[item.href],
    })
  )

  const pages: CommandPaletteStaticItem[] = [
    page("page-overview", h.navOverview, "/", {
      keywords: ["home", "macwall", "overview"],
    }),
    ...navPages,
    // Help center topics (the changelog has its own entry).
    ...HELP_TOPICS.filter((topic) => topic.href !== "/changelog").map((topic) =>
      page(`help-${topic.href.replace(/[^a-z0-9]+/gi, "-")}`, topic.title, topic.href, {
        description: topic.description,
        keywords: ["help", topic.linkLabel.toLowerCase(), ...(HELP_KEYWORDS[topic.href] ?? [])],
      })
    ),
    page("page-changelog", "Changelog", "/changelog", {
      keywords: ["release notes", "updates", "history", "github"],
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
      description: "Get the MacWall app for macOS 15+",
      keywords: ["install", "dmg", "latest"],
      analyticsEvent: "download_click",
      analyticsLocation: "command_palette",
    }),
    action("action-buy-pro", "Get MacWall Pro", macwallProCheckoutURL, {
      description: `${macwall.pro.price}, paid once — no subscription`,
      keywords: ["checkout", "license", "upgrade", "pro", "buy", "price"],
      analyticsEvent: "checkout_started",
      analyticsLocation: "command_palette",
    }),
    action("action-discord", ho.links.discord.label, macwall.discordInvite, {
      description: ho.links.discord.title,
      keywords: ["community", "chat", "social", "discussion"],
      external: true,
    }),
    action("action-email", "Email Support", mailtoSupport, {
      description: macwall.supportEmail,
      keywords: ["contact", "mail", "help", "support", "guidance", "assistance"],
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
