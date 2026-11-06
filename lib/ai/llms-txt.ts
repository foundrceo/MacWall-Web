import {
  CURRENCY_NOTE,
  currentPromotionLines,
  licenseSummarySentence,
} from "@/lib/ai/price-facts"
import {
  macwall,
  macwallBatteryPolicy,
  macwallCatalog,
  macwallImportFormatsLabel,
  macwallPlaybackModes,
  macwallSocialProof,
  macwallSupportedMacOS,
  macwallTrial,
} from "@/lib/macwall-site"

const systemPlayback = macwallPlaybackModes.systemWallpaper
const appPlayback = macwallPlaybackModes.app

/**
 * The summary blockquote and facts at the top of /llms.txt (and the header of
 * /llms-full.txt), built from the product constants and priced for `now`.
 * Kept free of the page registry so it can be unit tested on its own.
 */
export function llmsTxtSummary(now: number = Date.now()): string {
  return `${macwall.name} is a native macOS app for live video wallpapers on the desktop, Lock Screen and screen saver, with a curated catalog of ${macwallCatalog.liveCountLabel} loops, most in 4K, and imports of your own ${macwallImportFormatsLabel} videos with Pro. ${macwallSupportedMacOS.summary} Two playback modes: ${systemPlayback.setting} (marketed as ${systemPlayback.marketing}, ${systemPlayback.minimumMacOS}+) keeps playing after you quit the app: ${systemPlayback.cpu}. ${appPlayback.setting} (${appPlayback.marketing}, ${appPlayback.minimumMacOS}+) needs MacWall open and allows a different Lock Screen wallpaper. ${macwallBatteryPolicy.summary} ${macwall.name} is a paid app with a free 24-hour trial. ${macwallTrial.summary} ${licenseSummarySentence(now)} No subscription. ${CURRENCY_NOTE} Not affiliated with Apple or Wallpaper Engine, and unrelated to the similarly named macwall.skin app.`
}

/** Lines under the summary: who publishes it, when facts were reviewed, and any live sale. */
export function llmsTxtFactLines(
  origin: string,
  now: number = Date.now()
): string[] {
  return [
    `Published by ${macwall.name} (${macwall.legalCompanyName}). Canonical site: ${origin}. Current app version: ${macwall.currentVersion} (released ${macwall.currentVersionReleasedIso}). Product information last reviewed: ${macwall.productInfoLastReviewedIso}.`,
    ...currentPromotionLines(now),
  ]
}

/** The opening of /llms.txt: H1, blockquote summary and fact lines. */
export function llmsTxtHeader(
  origin: string,
  now: number = Date.now()
): string {
  return [
    `# ${macwall.name}`,
    `> ${llmsTxtSummary(now)}`,
    llmsTxtFactLines(origin, now).join("\n\n"),
  ].join("\n\n")
}

/** "25,000+ downloads (installer downloads from macwall.app, as of …)". */
export const llmsTxtUsageFigure = `“${macwallSocialProof.downloadsLine}” (installer downloads from macwall.app, as of ${macwallSocialProof.verifiedOnIso}); it counts downloads, not users`
