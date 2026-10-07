import {
  BatteryFullIcon,
  Delete02Icon,
  HelpCircleIcon,
  Image01Icon,
  Key01Icon,
  MenuSquareIcon,
  MoneyReceiveSquareIcon,
  News01Icon,
  Rocket01Icon,
  SquareLock02Icon,
  Video01Icon,
  Wrench01Icon,
} from "@hugeicons/core-free-icons"
import type { IconSvgElement } from "@hugeicons/react"

import { macwall, macwallLockScreenMacOSVersion } from "@/lib/macwall-site"

export type HelpTopic = {
  title: string
  /** One plain sentence: what you'll find there. */
  description: string
  /** Short link label shown with an arrow. */
  linkLabel: string
  href: string
  icon: IconSvgElement
}

/** The help center grid, in the order people need it: start → use → pay → fix. */
export const HELP_TOPICS: readonly HelpTopic[] = [
  {
    title: "Get started",
    description: `Download ${macwall.name}, open it, and set your first live wallpaper in about a minute.`,
    linkLabel: "Install guide",
    href: "/docs/install-macwall",
    icon: Rocket01Icon,
  },
  {
    title: "Set a wallpaper",
    description: "Pick a wallpaper, preview it, and set it on one display or all of them.",
    linkLabel: "Wallpapers",
    href: "/docs/set-a-live-wallpaper",
    icon: Image01Icon,
  },
  {
    title: "Lock Screen",
    description: `Play your wallpaper on the Lock Screen and screen saver on ${macwallLockScreenMacOSVersion}.`,
    linkLabel: "Lock Screen",
    href: "/docs/live-lock-screen-and-screen-saver",
    icon: SquareLock02Icon,
  },
  {
    title: "Your own videos",
    description: "Turn any MP4 or MOV clip into a live wallpaper.",
    linkLabel: "Import",
    href: "/docs/import-your-own-videos",
    icon: Video01Icon,
  },
  {
    title: "License & Pro",
    description: `One payment of ${macwall.pro.price}, up to ${macwall.maxLicensedMacs} Macs, and how to move your key to a new Mac.`,
    linkLabel: "License",
    href: "/docs/license-and-activation",
    icon: Key01Icon,
  },
  {
    title: "Battery & speed",
    description: "How MacWall pauses itself so your Mac stays fast and cool.",
    linkLabel: "Performance",
    href: "/docs/performance-and-battery",
    icon: BatteryFullIcon,
  },
  {
    title: "Fix a problem",
    description: "Wallpaper not showing, stuck on one frame, or black? Find your fix.",
    linkLabel: "Troubleshooting",
    href: "/docs/troubleshooting",
    icon: Wrench01Icon,
  },
  {
    title: "Menu bar",
    description: "Pause, skip and shuffle wallpapers without opening the app.",
    linkLabel: "Controls",
    href: "/docs/menu-bar-controls",
    icon: MenuSquareIcon,
  },
  {
    title: "Refunds",
    description: `${macwall.refundWindowDays}-day money-back guarantee on every license, no reason needed.`,
    linkLabel: "Refund policy",
    href: "/legal/refund",
    icon: MoneyReceiveSquareIcon,
  },
  {
    title: "FAQ",
    description: "Quick answers about pricing, macOS versions, sound and more.",
    linkLabel: "Questions",
    href: "/#faq",
    icon: HelpCircleIcon,
  },
  {
    title: "What's new",
    description: "Every update and new feature, newest first.",
    linkLabel: "Changelog",
    href: "/changelog",
    icon: News01Icon,
  },
  {
    title: "Uninstall",
    description: `Remove ${macwall.name} and its downloaded videos cleanly. Your license stays yours.`,
    linkLabel: "Uninstall",
    href: "/docs/uninstall-macwall",
    icon: Delete02Icon,
  },
]
