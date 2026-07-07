/**
 * Vendored marketing layout CSS served from `/public/marketing-shell` (same-origin).
 * Fonts use site Geist; body class pairing lives in {@link ../../components/macwall-marketing/marketing-body-class.tsx}.
 */
export const MARKETING_SHELL_STYLESHEETS = [
  "/marketing-shell/css/layout-1.css",
  "/marketing-shell/css/layout-2.css",
  "/marketing-shell/css/layout-3.css",
  "/marketing-shell/css/marketing-overrides.css",
] as const

/** Fallback loop when catalog clips are unavailable in the demo. */
export const MARKETING_SHELL_FALLBACK_MP4 =
  "/marketing-shell/video/wallpaper1-fallback.mp4"

/** Lock Screen Pro section — motion demo (no poster; video only). */
export const MARKETING_LOCK_SCREEN_VIDEO_MP4 = "/Video.mp4"
export const MARKETING_LOCK_SCREEN_VIDEO_WEBM = "/Video.webm"
