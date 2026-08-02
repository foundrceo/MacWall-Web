import {
  macwall,
  macwallFavicons,
  macwallLockScreenMacOSVersion,
} from "@/lib/macwall-site"
import type { MetadataRoute } from "next"

const DESCRIPTION =
  `${macwall.tagline} Live video wallpapers for Mac (macOS 14+): cloud catalog, imports, multi-display playback, menu bar control, and optional MacWall Pro for Lock Screen video on ${macwallLockScreenMacOSVersion}.`

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: macwall.fullTagline,
    short_name: macwall.name,
    description: DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#0c0d0a",
    theme_color: "#0c0d0a",
    icons: [
      {
        src: macwallFavicons.android192,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: macwallFavicons.android512,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  }
}
