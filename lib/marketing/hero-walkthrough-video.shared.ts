export const HERO_WALKTHROUGH_VIDEO_ID = "hero-walkthrough-video" as const

export const HERO_VIDEO_POSTER_STORAGE_KEY =
  "mw-hero-walkthrough-poster-v1" as const

/** Matches MacWall walkthrough footage — reserves height before metadata loads. */
export const HERO_VIDEO_ASPECT_CLASS = "aspect-[3024/1964]"

export function readHeroVideoPoster(): string | null {
  if (typeof window === "undefined") return null
  try {
    return window.sessionStorage.getItem(HERO_VIDEO_POSTER_STORAGE_KEY)
  } catch {
    return null
  }
}

export function writeHeroVideoPoster(dataUrl: string): void {
  if (typeof window === "undefined") return
  try {
    window.sessionStorage.setItem(HERO_VIDEO_POSTER_STORAGE_KEY, dataUrl)
  } catch {
    // Ignore quota / private mode.
  }
}

export function captureVideoPoster(video: HTMLVideoElement): string | null {
  if (video.videoWidth <= 0 || video.videoHeight <= 0) return null

  try {
    const canvas = document.createElement("canvas")
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const context = canvas.getContext("2d")
    if (!context) return null
    context.drawImage(video, 0, 0)
    return canvas.toDataURL("image/jpeg", 0.82)
  } catch {
    return null
  }
}
