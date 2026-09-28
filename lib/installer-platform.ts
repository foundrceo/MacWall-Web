/**
 * Classifies a download request by the visitor's OS so `/download/latest` only
 * serves the DMG to devices that could open it.
 *
 * iPadOS 13+ Safari reports a Mac user agent and stays "mac" here; the
 * client-side platform script still shows it the phone/tablet hero.
 */
export type InstallerPlatform = "mac" | "ios" | "android" | "windows" | "other"

export function installerPlatformFromUserAgent(
  userAgent: string | null
): InstallerPlatform {
  const ua = userAgent ?? ""
  if (/iPhone|iPad|iPod/.test(ua)) return "ios"
  if (/Android/i.test(ua)) return "android"
  if (/Windows/i.test(ua)) return "windows"
  if (/Macintosh|Mac OS X/.test(ua)) return "mac"
  return "other"
}

/** Devices that can't open a DMG; they get the "send the link to your Mac" page. */
export function cannotOpenInstaller(platform: InstallerPlatform): boolean {
  return platform === "ios" || platform === "android" || platform === "windows"
}
