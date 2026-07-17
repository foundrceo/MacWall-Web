import { macwall, macwallAppIconPath } from "@/lib/macwall-site"
import type { MetadataRoute } from "next"

const DESCRIPTION =
  "Live video wallpapers for Mac: cloud catalog, imports, multi-display playback, menu bar control, and optional MacWall Pro for Lock Screen video on macOS 26 Tahoe."

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: macwall.name,
    short_name: macwall.name,
    description: DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: macwallAppIconPath,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  }
}
