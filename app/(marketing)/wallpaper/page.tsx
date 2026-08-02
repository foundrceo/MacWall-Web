import { getPublicWallpaperById } from "@/lib/public-catalog/fetch"
import { wallpaperDetailPath } from "@/lib/public-catalog/urls"
import type { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Wallpaper redirect",
  description: "Legacy wallpaper share link — redirects to the catalog.",
  robots: { index: false, follow: false },
}

type PageProps = {
  searchParams: Promise<{ id?: string }>
}

/**
 * Legacy Mac app share links: `/wallpaper?id={id}`
 * Redirect to the canonical `/wallpaper/{category}/{slug}` detail URL.
 */
export default async function WallpaperIdRedirectPage({
  searchParams,
}: PageProps) {
  const { id } = await searchParams
  const wallpaperId = id?.trim()

  if (!wallpaperId) {
    redirect("/wallpapers")
  }

  try {
    const wallpaper = await getPublicWallpaperById(wallpaperId)
    if (wallpaper) {
      redirect(wallpaperDetailPath(wallpaper))
    }
  } catch {
    // Fall through to gallery when catalog is unavailable.
  }

  redirect("/wallpapers")
}
