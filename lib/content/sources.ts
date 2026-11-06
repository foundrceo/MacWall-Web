import type { ContentBlock } from "@/lib/content/types"

/**
 * A primary source a docs or learn page cites for a platform claim (Apple
 * Support, Apple Developer, Apple tech specs). Rendered as the page's
 * "Sources" list and emitted as the Article's `citation` in JSON-LD.
 * The URL must not contain ")": the inline Markdown renderer ends a link there.
 */
export type PageSource = {
  /** The page's own title, as the source shows it. */
  name: string
  url: string
  /** Who publishes it: "Apple Support", "Apple Developer", "Apple". */
  publisher: string
  /** YYYY-MM-DD the page was read. */
  accessed: string
}

/** "5 November 2026": the date style the blog's source lists use. */
export function sourceAccessedLabel(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  })
}

/** The "Sources" heading and list, appended after a page's own sections. */
export function sourcesBlocks(
  sources: readonly PageSource[] | undefined
): ContentBlock[] {
  if (!sources || sources.length === 0) return []
  return [
    { type: "h2", text: "Sources" },
    {
      type: "ul",
      items: sources.map(
        (source) =>
          `[${source.name}](${source.url}), ${source.publisher}, accessed ${sourceAccessedLabel(source.accessed)}`
      ),
    },
  ]
}

/** `citation` entries for articleJsonLd. */
export function sourceCitations(
  sources: readonly PageSource[] | undefined
): { name: string; url: string }[] {
  return (sources ?? []).map(({ name, url }) => ({ name, url }))
}

/** Apple pages the docs and learn hubs cite, read on the date in `accessed`. */
const APPLE_SOURCES_ACCESSED = "2026-11-05"

export const appleSources = {
  macOS27Compatibility: {
    name: "macOS 27 Golden Gate is compatible with these computers",
    url: "https://support.apple.com/en-us/127255",
    publisher: "Apple Support",
    accessed: APPLE_SOURCES_ACCESSED,
  },
  findMacOSVersion: {
    name: "Find out which macOS your Mac is using",
    url: "https://support.apple.com/en-us/109033",
    publisher: "Apple Support",
    accessed: APPLE_SOURCES_ACCESSED,
  },
  screenSaverSettings: {
    name: "Change Screen Saver settings on Mac",
    url: "https://support.apple.com/guide/mac-help/change-screen-saver-settings-mchlp1227/mac",
    publisher: "Apple Support",
    accessed: APPLE_SOURCES_ACCESSED,
  },
  wallpaperSettings: {
    name: "Wallpaper settings on Mac",
    url: "https://support.apple.com/guide/mac-help/mchlp1103/mac",
    publisher: "Apple Support",
    accessed: APPLE_SOURCES_ACCESSED,
  },
  activityMonitorEnergy: {
    name: "View energy consumption in Activity Monitor on Mac",
    url: "https://support.apple.com/guide/activity-monitor/view-energy-consumption-actmntr43697/mac",
    publisher: "Apple Support",
    accessed: APPLE_SOURCES_ACCESSED,
  },
  powerModes: {
    name: "About Power Modes on your Mac",
    url: "https://support.apple.com/en-us/101613",
    publisher: "Apple Support",
    accessed: APPLE_SOURCES_ACCESSED,
  },
  videoToolbox: {
    name: "Video Toolbox",
    url: "https://developer.apple.com/documentation/videotoolbox",
    publisher: "Apple Developer",
    accessed: APPLE_SOURCES_ACCESSED,
  },
  avFoundation: {
    name: "AVFoundation",
    url: "https://developer.apple.com/documentation/avfoundation",
    publisher: "Apple Developer",
    accessed: APPLE_SOURCES_ACCESSED,
  },
} as const satisfies Record<string, PageSource>
