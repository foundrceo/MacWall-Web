import { macwall, macwallAppIconPath } from "@/lib/macwall-site"
import type { MetadataRoute } from "next"

const DESCRIPTION =
  "Motion wallpapers for Mac: catalog discovery, imports, menu bar controls, and optional MacWall Pro for Lock Screen video where macOS allows."

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
