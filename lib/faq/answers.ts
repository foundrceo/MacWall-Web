import { seoPageToMarkdown } from "@/lib/ai/markdown"
import type { ContentBlock, SeoContentPage } from "@/lib/content/types"
import {
  macwall,
  macwallBatteryPolicy,
  macwallCatalog,
  macwallImportFormatsLabel,
  macwallMinimumMacOSVersion,
  macwallPlaybackModes,
  macwallSupportedMacOS,
  macwallTrial,
} from "@/lib/macwall-site"
import {
  formatPriceCents,
  offersFor,
  proPriceFor,
  saleLastDay,
  type SaleAwarePrice,
} from "@/lib/pricing/sale-aware-price"

/**
 * Answer pages: one question per URL at /faq/{slug}, for search and AI answer
 * engines that prefer a short canonical answer over a long page.
 *
 * Each page leads with a 40 to 60 word direct answer (plain text: it is the
 * lead paragraph and the FAQPage answer), then details and links into the
 * docs. Product facts come from the constants in lib/macwall-site.ts, checked
 * against the shipped app (4.1.0); prices come from the sale-aware helper and
 * are computed when the page renders. A question whose answer is a whole docs
 * page (uninstalling, for one) links to that page instead of getting its own.
 */

export const FAQ_HUB_PATH = "/faq" as const

export type FaqTopic = "price" | "performance" | "wallpapers" | "compatibility"

export const FAQ_TOPIC_LABELS: Record<FaqTopic, string> = {
  price: "Price and licenses",
  performance: "Battery and performance",
  wallpapers: "Lock Screen and your own videos",
  compatibility: "Compatibility",
}

export const FAQ_TOPIC_ORDER: readonly FaqTopic[] = [
  "price",
  "performance",
  "wallpapers",
  "compatibility",
] as const

/** A page that answers the question in more depth. Root-relative href. */
export type FaqLink = { href: string; label: string; description: string }

export type FaqAnswer = {
  slug: string
  pathname: string
  topic: FaqTopic
  /** The H1 and the FAQPage question. */
  question: string
  /** Short label for the breadcrumb. */
  navLabel: string
  /** `<title>` before the brand suffix. */
  title: string
  /**
   * 110 to 160 characters for the meta description, the hub list and
   * llms.txt. Never a price: the llms.txt index is built once per isolate.
   */
  description: string
  /** The direct answer: 40 to 60 words of plain text, no Markdown. */
  answer: string
  details: ContentBlock[]
  docLinks: FaqLink[]
  /** Slugs of other answers to list under "More questions". */
  related: string[]
  keywords: string[]
  /** True when the answer or details state a MacWall price. */
  quotesPrice: boolean
  /** YYYY-MM-DD. */
  publishedAt: string
  /** YYYY-MM-DD: the day this answer's text last changed. */
  updatedAt: string
}

export function faqAnswerPath(slug: string): string {
  return `${FAQ_HUB_PATH}/${slug}`
}

const name = macwall.name
const maxMacs = macwall.maxLicensedMacs
const refundDays = macwall.refundWindowDays
const supportEmail = macwall.supportEmail
const supportLink = `[${supportEmail}](mailto:${supportEmail})`
const power = macwallBatteryPolicy
const systemPlayback = macwallPlaybackModes.systemWallpaper
const appPlayback = macwallPlaybackModes.app
const playbackPath = macwallPlaybackModes.settingsPath
/** "The MacWall process uses 0% CPU after you quit; macOS still decodes the video." */
const systemPlaybackCpu = `${systemPlayback.cpu.charAt(0).toUpperCase()}${systemPlayback.cpu.slice(1)}`
const reelHalf = macwall.reelRefundHalfViews.toLocaleString("en-US")
const reelFull = macwall.reelRefundFullViews.toLocaleString("en-US")

/** "the Black Friday sale", "the Summer Sale". */
function saleName(label: string): string {
  return /\bsale$/i.test(label) ? `the ${label}` : `the ${label} sale`
}

/** "Dec 1, 2026": the banner's end date with its year. */
function saleEndsText(price: SaleAwarePrice): string | null {
  if (!price.endsAt || !price.endsLabel) return null
  return `${price.endsLabel}, ${saleLastDay(price.endsAt).slice(0, 4)}`
}

/**
 * What checkout charges right now, with the sale's name and end date while
 * one runs: "$9.09 during the Black Friday sale (30% off until Dec 1, 2026)",
 * or "$12.99". The regular price is left out during a sale, so an answer never
 * quotes a price nobody pays that day.
 */
function priceNowText(price: SaleAwarePrice): string {
  const current = formatPriceCents(price.currentCents)
  const ends = saleEndsText(price)
  if (price.saleCents === null || !price.label || !ends) return current
  return `${current} during ${saleName(price.label)} (${price.percentOff}% off until ${ends})`
}

/** The answer's closing sentence on what Pro costs today. */
function proCostSentence(price: SaleAwarePrice): string {
  const current = formatPriceCents(price.currentCents)
  const ends = saleEndsText(price)
  if (price.saleCents === null || !price.label || !ends) {
    return `It costs ${current}.`
  }
  return `It costs ${current} in ${saleName(price.label)}, ${price.percentOff}% off until ${ends}.`
}

/** "Pro" or "Pro+": the pack name without its Mac count. */
function packName(price: SaleAwarePrice): string {
  return price.name.replace(/\s*\(.*\)$/, "")
}

/** "These are Black Friday prices, 30% off until Dec 1, 2026. " while a sale runs. */
function salePricesNote(price: SaleAwarePrice): string {
  const ends = saleEndsText(price)
  if (price.saleCents === null || !price.label || !ends) return ""
  return `These are ${price.label} prices, ${price.percentOff}% off until ${ends}. `
}

const PUBLISHED = "2026-11-06"

function buildFaqAnswers(now: number): FaqAnswer[] {
  const pro = proPriceFor("default", now)
  const offers = offersFor("default", now)
  const indiaPro = proPriceFor("india", now)
  const packLines = offers.map(
    (price) =>
      `**${price.macs} Macs**: ${packName(price)}, ${formatPriceCents(price.currentCents)}`
  )
  const saleNote = salePricesNote(pro)
  const indiaLine = `In India, Pro (${indiaPro.macs} Macs) is ${priceNowText(indiaPro)}.`

  const entries: Omit<FaqAnswer, "pathname">[] = [
    {
      slug: "is-macwall-free",
      topic: "price",
      question: `Is ${name} free?`,
      navLabel: `Is ${name} free?`,
      title: `Is ${name} Free? Free Trial and One-Time Price`,
      description: `No. ${name} has a free ${macwallTrial.hours}-hour trial on every Mac, then Pro is a one-time payment for up to ${maxMacs} Macs. There is no subscription.`,
      answer: `No. ${name} is a paid app with a free ${macwallTrial.hours}-hour trial: every Mac gets one trial of ${macwallTrial.includesLabel}, with no card. After that, Pro is a one-time payment for up to ${maxMacs} Macs, with no subscription. ${proCostSentence(pro)}`,
      details: [
        { type: "h2", text: "What the free trial covers" },
        {
          type: "p",
          text: `${macwallTrial.summary} The catalog has ${macwallCatalog.liveCountLabel} live wallpapers, most in 4K.`,
        },
        {
          type: "p",
          text: `When the ${macwallTrial.hours} hours are up, ${name} stops the desktop and Lock Screen wallpapers until you activate Pro. Nothing is charged.`,
        },
        { type: "h2", text: "What Pro costs" },
        { type: "ul", items: packLines },
        {
          type: "p",
          text: `${saleNote}Every pack is one payment with lifetime updates, and every pack has the same features: only the number of Macs changes.`,
        },
        {
          type: "p",
          text: `${indiaLine} Prices are set in US dollars, and [pricing](/pricing) shows today's price in your currency.`,
        },
        { type: "h2", text: "Getting your money back" },
        {
          type: "p",
          text: `Every license has a ${refundDays}-day money-back guarantee, no reason needed ([Refund Policy](/legal/refund)). Separately, the [Reel Refund program](/creator) pays back half of what you paid when a video of ${name} in use reaches ${reelHalf} views, and all of it at ${reelFull}.`,
        },
      ],
      docLinks: [
        {
          href: "/pricing",
          label: `${name} pricing`,
          description:
            "Today's price for Pro and Pro+ in your region and currency, and what each pack covers.",
        },
        {
          href: "/docs/license-and-activation",
          label: "License and activation",
          description:
            "How the license key works, how to activate it and how to move it to another Mac.",
        },
        {
          href: "/creator",
          label: "Reel Refund",
          description: `Post a video of ${name} in use and get half or all of your purchase back.`,
        },
      ],
      related: [
        "how-many-macs-per-license",
        "macwall-refund-policy",
        "does-macwall-work-offline",
      ],
      keywords: [
        "is macwall free",
        "macwall price",
        "macwall free trial",
        "live wallpaper mac free",
      ],
      quotesPrice: true,
      publishedAt: PUBLISHED,
      updatedAt: PUBLISHED,
    },
    {
      slug: "how-many-macs-per-license",
      topic: "price",
      question: `How many Macs can I use ${name} on?`,
      navLabel: "Macs per license",
      title: `How Many Macs Can One ${name} License Cover?`,
      description: `One ${name} Pro license activates on up to ${maxMacs} of your Macs. Pro+ covers 5 or 10 Macs with the same features, and every license is paid once.`,
      answer: `One ${name} Pro license activates on up to ${maxMacs} of your Macs, with every Pro feature on each. For more machines, Pro+ covers 5 or 10 Macs; only the number of Macs changes. Every license is a single payment with lifetime updates, and there is no account to sign in to.`,
      details: [
        { type: "h2", text: "Licenses by number of Macs" },
        { type: "ul", items: packLines },
        {
          type: "p",
          text: `${saleNote}Each is a one-time payment. [Pricing](/pricing) shows today's price for your region and currency.`,
        },
        { type: "h2", text: "Adding or moving a Mac" },
        {
          type: "ul",
          items: [
            "Under the limit, use the same key on the next Mac: click **Activate** in the license email, or paste the key in Settings → MacWall Pro → **Enter License Key…**.",
            "Before you sell or erase a Mac, open Settings → MacWall Pro and click **Unlink** to take the license off it.",
            `If activation says the key is already on ${maxMacs} Macs, or you no longer have an old Mac, email ${supportLink} with your key and we free a place.`,
          ],
        },
      ],
      docLinks: [
        {
          href: "/docs/license-and-activation",
          label: "License and activation",
          description:
            "Activate a key, find a lost one and move a license to a new Mac.",
        },
        {
          href: "/pricing",
          label: `${name} pricing`,
          description: "Pro and Pro+ side by side, with today's prices.",
        },
      ],
      related: [
        "is-macwall-free",
        "macwall-refund-policy",
        "does-macwall-work-offline",
      ],
      keywords: [
        "macwall license how many macs",
        "macwall pro plus",
        "macwall multiple macs",
        "transfer macwall license",
      ],
      quotesPrice: true,
      publishedAt: PUBLISHED,
      updatedAt: PUBLISHED,
    },
    {
      slug: "macwall-refund-policy",
      topic: "price",
      question: `Can I get a refund for ${name}?`,
      navLabel: "Refunds",
      title: `${name} Refund Policy: ${refundDays}-Day Money-Back Guarantee`,
      description: `Yes. Every ${name} license has a ${refundDays}-day money-back guarantee, no reason needed: email support within ${refundDays} days. EU and UK buyers get 14 days.`,
      answer: `Yes. Every ${name} license, Pro or Pro+, has a ${refundDays}-day money-back guarantee, and you don't need to give a reason. Email ${supportEmail} within ${refundDays} days of purchase and you get a full refund to your original payment method. A full refund deactivates the license key. In the EU, EEA and UK, consumers have 14 days.`,
      details: [
        { type: "h2", text: "How to ask for a refund" },
        {
          type: "p",
          text: `Email ${supportLink} with the subject "Refund request", from the address you paid with if you can, and include your license key or roughly when you bought. We reply within 1 to 2 business days.`,
        },
        {
          type: "p",
          text: `Refunds go back through ${macwall.paymentProcessor} in the currency you paid, and banks usually show them within 5 to 10 business days.`,
        },
        { type: "h2", text: `After ${refundDays} days` },
        {
          type: "p",
          text: "Billing problems are put right at any time: a duplicate charge, a charge you don't recognize or a license key that never arrived.",
        },
        { type: "h2", text: "Half or all of it back for a video" },
        {
          type: "p",
          text: `The [Reel Refund program](/creator) refunds 50% of what you paid when one video of ${name} in use reaches ${reelHalf} views, and 100% at ${reelFull} views. After a 50% refund your license stays active; a full refund deactivates it.`,
        },
      ],
      docLinks: [
        {
          href: "/legal/refund",
          label: "Refund Policy",
          description:
            "The full policy: what qualifies, EU and UK withdrawal rights and how refunds are paid.",
        },
        {
          href: "/creator",
          label: "Reel Refund",
          description:
            "The view thresholds, the platforms that count and how to claim.",
        },
        {
          href: "/contact",
          label: `Contact ${name}`,
          description: "Email support about refunds, billing and license keys.",
        },
      ],
      related: [
        "is-macwall-free",
        "how-many-macs-per-license",
        "does-macwall-work-offline",
      ],
      keywords: [
        "macwall refund",
        "macwall refund policy",
        "macwall money back guarantee",
      ],
      quotesPrice: false,
      publishedAt: PUBLISHED,
      updatedAt: PUBLISHED,
    },
    {
      slug: "does-macwall-drain-battery",
      topic: "performance",
      question: `Does ${name} drain your MacBook battery?`,
      navLabel: "Battery use",
      title: `Does ${name} Drain Your MacBook Battery?`,
      description: `A playing wallpaper uses some power. ${name} pauses behind full-screen apps and while displays sleep, and ${power.pauseOnBattery.label} holds it whenever you unplug.`,
      answer: `A playing live wallpaper uses some battery, because your Mac decodes video while the desktop is visible. ${name} limits that: it decodes in hardware, pauses behind full-screen apps by default and stops while displays sleep. Turn on ${power.pauseOnBattery.label} and it holds a still frame whenever your Mac is unplugged.`,
      details: [
        { type: "h2", text: `The battery settings in ${name}` },
        {
          type: "p",
          text: `All of these are in ${power.settingsPath}. A paused wallpaper keeps its last frame and starts again on its own.`,
        },
        {
          type: "ul",
          items: [
            `**${power.pauseBehindFullScreen.label}** (on by default): a display covered by a full-screen app stops decoding until the wallpaper can be seen again.`,
            `**${power.pauseOnBattery.label}** (off by default): ${power.pauseOnBattery.detail}, even while ${name} is closed.`,
            `**${power.lowerQualityOnBattery.label}** (off by default): ${power.lowerQualityOnBattery.detail}.`,
            `**${power.pauseWhenBusy.label}** (off by default): ${power.pauseWhenBusy.detail}.`,
          ],
        },
        { type: "h2", text: "What uses more or less" },
        {
          type: "ul",
          items: [
            "**The video**: a higher resolution or frame rate means more decoding. For your own videos, export at your display's resolution and 24 to 30 fps.",
            `**Displays**: each display with its own wallpaper adds decoding work. With ${systemPlayback.setting} playback, displays showing the same wallpaper share one player.`,
            `**The Lock Screen**: with ${systemPlayback.setting} playback the Lock Screen plays the wallpaper unless you turn off **Play the wallpaper while locked** in Settings → Lock Screen. Once the display sleeps, nothing is decoded.`,
          ],
        },
        { type: "h2", text: "Check your own Mac" },
        {
          type: "p",
          text: `We haven't published a measured battery test, so we don't quote a figure. To see what your setup costs, open Activity Monitor → Energy with a wallpaper playing, then pause it from the ${name} menu bar icon and compare. With ${systemPlayback.setting} playback macOS decodes the video in its own wallpaper process, so compare the whole Mac, not just ${name}'s row.`,
        },
      ],
      docLinks: [
        {
          href: "/docs/performance-and-battery",
          label: "Performance and battery",
          description: `Every pause rule in ${name} 4.1.0 and how to measure CPU and energy use yourself.`,
        },
        {
          href: "/learn/battery-and-energy-basics",
          label: "Battery and energy basics",
          description:
            "What a live wallpaper costs in power, and what a paused one costs.",
        },
        {
          href: "/learn/hardware-video-decode",
          label: "Hardware video decode",
          description:
            "Why video wallpapers decode on the Mac's media hardware instead of the CPU.",
        },
      ],
      related: [
        "macwall-cpu-use",
        "live-wallpaper-on-mac-lock-screen",
        "live-wallpaper-on-multiple-monitors",
      ],
      keywords: [
        "does live wallpaper drain battery mac",
        "macwall battery",
        "live wallpaper battery macbook",
        "pause on battery",
      ],
      quotesPrice: false,
      publishedAt: PUBLISHED,
      updatedAt: PUBLISHED,
    },
    {
      slug: "macwall-cpu-use",
      topic: "performance",
      question: `How much CPU does ${name} use?`,
      navLabel: "CPU use",
      title: `How Much CPU Does ${name} Use?`,
      description: `${name} decodes video in hardware. With ${systemPlayback.setting} playback on ${systemPlayback.minimumMacOS}+, ${systemPlayback.cpu}.`,
      answer: `${name} decodes video on your Mac's media hardware rather than the CPU, and by default stops decoding behind full-screen apps. With ${systemPlayback.setting} playback on ${systemPlayback.minimumMacOS} or later, ${systemPlayback.cpu}. We haven't published a benchmark, so measure your Mac in Activity Monitor.`,
      details: [
        { type: "h2", text: "Where the decoding happens" },
        {
          type: "p",
          text: `${name} plays wallpapers through Apple's video frameworks, which decode H.264 and HEVC on the Mac's media hardware instead of on the CPU. When nothing can see the wallpaper, behind a full-screen app or with the displays asleep, it stops decoding instead of playing in the background.`,
        },
        { type: "h2", text: "Playback mode makes a difference" },
        {
          type: "ul",
          items: [
            `**${systemPlayback.setting}** (${systemPlayback.minimumMacOS}+): macOS plays the wallpaper, so ${name} can stay closed. ${systemPlaybackCpu}.`,
            `**${appPlayback.setting}**: ${name} plays the video itself and stays open while it does.`,
          ],
        },
        {
          type: "p",
          text: `Switch between them in ${playbackPath}.`,
        },
        { type: "h2", text: "What raises the load" },
        {
          type: "ul",
          items: [
            "**Your own videos**: an 8K or 60 fps file takes far more decoding than a 4K loop at 30 fps.",
            "**The codec**: ProRes, AV1 or VP9 inside your own video is converted when you set it, which takes a while. H.264 and HEVC play as they are.",
            `**Displays**: each display with its own wallpaper adds decoding work. With ${systemPlayback.setting} playback, displays showing the same wallpaper share one player.`,
          ],
        },
        {
          type: "p",
          text: `For games, exports and builds in a window, turn on **${power.pauseWhenBusy.label}** in ${power.settingsPath}.`,
        },
        { type: "h2", text: "Measure it in Activity Monitor" },
        {
          type: "ol",
          items: [
            "Open **Activity Monitor** and choose the **CPU** tab.",
            `Search for **${name}** and watch **% CPU** with a wallpaper playing.`,
            "Switch to **Energy** and watch **Energy Impact** for a few minutes.",
            `Pause from the ${name} menu bar icon and compare.`,
          ],
        },
        {
          type: "p",
          text: `With ${systemPlayback.setting} playback macOS decodes the video in its own wallpaper process, so compare the whole Mac's CPU, not just ${name}'s row.`,
        },
      ],
      docLinks: [
        {
          href: "/docs/performance-and-battery",
          label: "Performance and battery",
          description:
            "Every pause rule, and what to check when usage looks higher than expected.",
        },
        {
          href: "/learn/hardware-video-decode",
          label: "Hardware video decode",
          description:
            "How the Mac's media engine decodes video and why that matters for a wallpaper.",
        },
        {
          href: "/learn/video-formats-and-codecs",
          label: "Video formats and codecs",
          description:
            "H.264, HEVC, ProRes and AV1: which decode in hardware and which cost more.",
        },
      ],
      related: [
        "does-macwall-drain-battery",
        "use-your-own-video-as-mac-wallpaper",
        "live-wallpaper-on-multiple-monitors",
      ],
      keywords: [
        "macwall cpu usage",
        "live wallpaper cpu usage mac",
        "does live wallpaper slow down mac",
      ],
      quotesPrice: false,
      publishedAt: PUBLISHED,
      updatedAt: PUBLISHED,
    },
    {
      slug: "live-wallpaper-on-mac-lock-screen",
      topic: "wallpapers",
      question: "Can you put a live wallpaper on the Mac Lock Screen?",
      navLabel: "Live Lock Screen",
      title: "Live Lock Screen Wallpaper on Mac: Tahoe and 27",
      description: `Yes, on macOS 26 Tahoe and macOS 27. ${name} plays your wallpaper on the Lock Screen and as the screen saver, with Pro or during the free trial.`,
      answer: `Yes, on macOS 26 Tahoe and macOS 27 Golden Gate. ${name} plays a moving wallpaper on the Lock Screen and as the screen saver, with Pro or during the free ${macwallTrial.hours}-hour trial. On macOS 15 Sequoia only the desktop moves and the Lock Screen shows a still. Without an app, macOS animates only Apple's own aerials there.`,
      details: [
        { type: "h2", text: "How it works in each playback mode" },
        {
          type: "ul",
          items: [
            `**${systemPlayback.setting}** (the homepage calls it ${systemPlayback.marketing}): the Lock Screen and screen saver show the desktop's wallpaper, moving, even while ${name} is closed. **Play only on the Lock Screen** keeps the desktop on a still frame and moves the wallpaper only when you lock your Mac or the screen saver starts.`,
            `**${appPlayback.setting}** (${appPlayback.marketing}): the Lock Screen can have its own wallpaper. Open one, click the arrow next to **Set Wallpaper** and choose **Lock Screen Only**. macOS plays it the way it plays Apple's aerials, so the first apply takes a moment.`,
          ],
        },
        {
          type: "p",
          text: `Switch modes in ${playbackPath}. On macOS 15, ${name} always uses ${appPlayback.setting} and the Lock Screen shows a still from your wallpaper.`,
        },
        { type: "h2", text: "If the Lock Screen doesn't move" },
        {
          type: "ol",
          items: [
            "Check you're on macOS 26 or later: Apple menu → About This Mac.",
            `Check that Pro or the trial is active in ${name} → Settings → MacWall Pro.`,
            `With ${appPlayback.setting} playback, turn on **Show on Lock Screen and screen saver** in Settings → Lock Screen.`,
            `Open System Settings → Wallpaper → Screen Saver: a screen saver you picked after ${name} set its own is the one macOS shows.`,
          ],
        },
      ],
      docLinks: [
        {
          href: "/docs/live-lock-screen-and-screen-saver",
          label: "Live Lock Screen and screen saver",
          description:
            "Set it up in either playback mode, with the full checklist for when motion doesn't appear.",
        },
        {
          href: "/learn/how-macos-tahoe-lock-screen-video-works",
          label: "How Lock Screen video works on Tahoe",
          description:
            "What macOS 26 opened up for third-party apps, and what it still keeps to itself.",
        },
        {
          href: "/learn/live-vs-dynamic-vs-aerial-wallpapers-mac",
          label: "Live vs dynamic vs aerial",
          description:
            "The three kinds of moving wallpaper on a Mac, and which one plays where.",
        },
      ],
      related: [
        "does-macwall-work-on-macos-27",
        "does-macwall-drain-battery",
        "is-macwall-free",
      ],
      keywords: [
        "live wallpaper mac lock screen",
        "macos tahoe lock screen wallpaper",
        "macos 27 lock screen live wallpaper",
        "animated lock screen mac",
      ],
      quotesPrice: false,
      publishedAt: PUBLISHED,
      updatedAt: PUBLISHED,
    },
    {
      slug: "use-your-own-video-as-mac-wallpaper",
      topic: "wallpapers",
      question: "Can I use my own video as a wallpaper on Mac?",
      navLabel: "Your own video",
      title: "Can You Set a Video as Your Mac Wallpaper?",
      description: `Not with macOS alone, which takes only images. ${name} Pro adds your own ${macwallImportFormatsLabel} videos as private live wallpapers on your Mac.`,
      answer: `Not with macOS alone: System Settings takes photos and image files, not videos. ${name} Pro adds your own ${macwallImportFormatsLabel} files as private live wallpapers that stay on your Mac. Videos with H.264 or HEVC inside play best. GIFs and still images can't be added privately, so convert a GIF to MP4 first.`,
      details: [
        { type: "h2", text: "Add a video in three steps" },
        {
          type: "ol",
          items: [
            `In ${name}, choose **Upload Wallpaper** (⌘N) and pick **Private**.`,
            "Drag in up to 10 videos at a time, or click **Choose Videos**.",
            "Click **Add to Library**, then open a video and click **Set Wallpaper**.",
          ],
        },
        {
          type: "p",
          text: `Adding your own videos needs Pro. The ${macwallTrial.name} covers ${macwallTrial.includesLabel}, not imports.`,
        },
        { type: "h2", text: "Export settings that play best" },
        {
          type: "ul",
          items: [
            "**Codec**: H.264 or HEVC. ProRes, AV1 or VP9 inside is converted when you set the wallpaper, and it can look black until that finishes.",
            "**Resolution**: your display's own, or 3840×2160 for a 4K display. Anything larger costs decoding with no visible gain.",
            "**Frame rate**: 24 to 30 fps is plenty for ambient motion.",
            "**Loop**: pick footage whose first and last frames are close, so the loop point doesn't jump.",
          ],
        },
        { type: "h2", text: "Private or public" },
        {
          type: "p",
          text: "Videos added under **Private** stay on your Mac and only you see them. **Public** submits a video to the community catalog: every upload is reviewed before it appears, and public videos need at least 1080p and at most 300 MB.",
        },
      ],
      docLinks: [
        {
          href: "/docs/import-your-own-videos",
          label: "Import your own videos",
          description:
            "The full import guide, with encoding settings and answers on file size and GIFs.",
        },
        {
          href: "/learn/video-formats-and-codecs",
          label: "Video formats and codecs",
          description:
            "MP4 and MOV containers, H.264 and HEVC inside, and why the codec decides the cost.",
        },
        {
          href: "/learn/wallpaper-resolution-and-displays",
          label: "Wallpaper resolution and displays",
          description:
            "Which resolution to export for each Mac display, and when 4K is worth it.",
        },
      ],
      related: [
        "macwall-cpu-use",
        "live-wallpaper-on-multiple-monitors",
        "is-macwall-free",
      ],
      keywords: [
        "use video as wallpaper mac",
        "set video as wallpaper mac",
        "mp4 wallpaper mac",
        "custom live wallpaper mac",
      ],
      quotesPrice: false,
      publishedAt: PUBLISHED,
      updatedAt: PUBLISHED,
    },
    {
      slug: "live-wallpaper-on-multiple-monitors",
      topic: "wallpapers",
      question: `Does ${name} work with multiple monitors?`,
      navLabel: "Multiple monitors",
      title: "Live Wallpaper on Multiple Monitors on Mac",
      description: `Yes. ${name} plays on every connected display, one wallpaper in sync everywhere or a different one per display, and remembers each monitor setup.`,
      answer: `Yes. ${name} plays on every connected display. Set Wallpaper puts one wallpaper on all of them, in sync, or you can give each display its own with the arrow next to Set Wallpaper. ${name} remembers each display's wallpaper for every monitor setup, so a docked or undocked MacBook gets its wallpapers back.`,
      details: [
        { type: "h2", text: "One wallpaper, or one per display" },
        {
          type: "ul",
          items: [
            "**Every display**: Set Wallpaper applies to all displays, and the same wallpaper plays in step on each.",
            "**One display**: open a wallpaper, click the arrow next to **Set Wallpaper** and pick a display under Display.",
            "**Settings → Displays** shows what plays on each display.",
          ],
        },
        { type: "h2", text: "Ultrawide and mixed sizes" },
        {
          type: "p",
          text: "**Fill screen**, the default, crops the edges so the wallpaper fills each display; **Fit to screen** shows the whole wallpaper (Settings → Wallpaper). For 21:9 and 32:9 monitors, Explore in the app has an Ultrawide filter, and the web gallery has [ultrawide live wallpapers](/wallpapers/display/ultrawide).",
        },
        { type: "h2", text: "Pausing with several displays" },
        {
          type: "p",
          text: `A full-screen app pauses only the display it covers, while the others keep playing. Each display with its own wallpaper adds decoding work; with ${systemPlayback.setting} playback, displays showing the same wallpaper share one player and stay on the same frame.`,
        },
      ],
      docLinks: [
        {
          href: "/docs/set-a-live-wallpaper",
          label: "Set a live wallpaper",
          description:
            "Set a wallpaper on every display or just one, plus Shuffle and Day Schedule.",
        },
        {
          href: "/wallpapers/display/ultrawide",
          label: "Ultrawide live wallpapers",
          description: "Loops sized for 3440 × 1440 and 5120 × 1440 monitors.",
        },
        {
          href: "/learn/wallpaper-resolution-and-displays",
          label: "Wallpaper resolution and displays",
          description:
            "How resolution, aspect ratio and scaling decide what you see on each screen.",
        },
      ],
      related: [
        "macwall-cpu-use",
        "does-macwall-drain-battery",
        "use-your-own-video-as-mac-wallpaper",
      ],
      keywords: [
        "live wallpaper multiple monitors mac",
        "dual monitor live wallpaper mac",
        "different wallpaper each display mac",
      ],
      quotesPrice: false,
      publishedAt: PUBLISHED,
      updatedAt: PUBLISHED,
    },
    {
      slug: "does-macwall-work-on-macos-27",
      topic: "compatibility",
      question: `Does ${name} work on macOS 27?`,
      navLabel: "macOS 27",
      title: `Does ${name} Work on macOS 27 Golden Gate?`,
      description: `Yes. ${name} runs on macOS 27 Golden Gate with live desktop, Lock Screen and screen saver wallpapers. macOS 27 itself needs an Apple silicon Mac.`,
      answer: `Yes. ${name} runs on macOS 27 Golden Gate, as well as macOS 15 Sequoia and macOS 26 Tahoe. On macOS 27 you get live desktop, Lock Screen and screen saver wallpapers, with ${systemPlayback.setting} or ${appPlayback.setting} playback. macOS 27 itself needs an Apple silicon Mac, so Intel Macs stay on macOS 26 or earlier.`,
      details: [
        { type: "h2", text: "What each macOS version gets" },
        {
          type: "ul",
          items: [
            "**macOS 15 Sequoia**: live desktop wallpapers; the Lock Screen shows a still.",
            "**macOS 26 Tahoe**: live desktop, Lock Screen and screen saver.",
            "**macOS 27 Golden Gate**: live desktop, Lock Screen and screen saver, on Apple silicon Macs.",
          ],
        },
        { type: "h2", text: "After you upgrade to macOS 27" },
        {
          type: "ol",
          items: [
            `Update ${name}: Settings → About → **Check Now**, or download the current build from [macwall.app/download](/download).`,
            `If the desktop is black, check that ${name} is running (its icon is in the menu bar) and click **Set Wallpaper** again.`,
            `If the Lock Screen or screen saver stopped moving, open System Settings → Wallpaper → Screen Saver: a screen saver picked after ${name} set its own replaces it.`,
          ],
        },
        {
          type: "p",
          text: `The current version is ${name} ${macwall.currentVersion}, released ${macwall.currentVersionReleasedLabel}. Fixes for new macOS releases are listed in [the changelog](/changelog).`,
        },
      ],
      docLinks: [
        {
          href: "/docs/install-macwall",
          label: `Install ${name}`,
          description: `Download, install and set a first wallpaper on macOS 15, 26 or 27.`,
        },
        {
          href: "/docs/live-lock-screen-and-screen-saver",
          label: "Live Lock Screen and screen saver",
          description:
            "Lock Screen and screen saver motion on macOS 26 and 27, in both playback modes.",
        },
        {
          href: "/docs/troubleshooting",
          label: "Fix common issues",
          description:
            "A black desktop after a macOS update, a frozen frame or downloads that fail.",
        },
      ],
      related: [
        "does-macwall-work-on-intel-macs",
        "live-wallpaper-on-mac-lock-screen",
        "does-macwall-work-offline",
      ],
      keywords: [
        "macwall macos 27",
        "live wallpaper macos 27",
        "macos golden gate live wallpaper",
      ],
      quotesPrice: false,
      publishedAt: PUBLISHED,
      updatedAt: PUBLISHED,
    },
    {
      slug: "does-macwall-work-on-intel-macs",
      topic: "compatibility",
      question: `Does ${name} work on Intel Macs?`,
      navLabel: "Intel Macs",
      title: `Does ${name} Work on Intel Macs?`,
      description: `Yes. ${name} is a universal app for ${macwallSupportedMacOS.architectures} on ${macwallMinimumMacOSVersion} or later. macOS 27 needs Apple silicon, so Intel Macs use 15 or 26.`,
      answer: `Yes. ${name} ships as a universal app for ${macwallSupportedMacOS.architectures} and needs macOS 15 Sequoia or later. Apple's macOS 27 runs only on Apple silicon, so an Intel Mac uses ${name} on macOS 15 or macOS 26. An Intel Mac on macOS 26 Tahoe also gets the live Lock Screen.`,
      details: [
        { type: "h2", text: "What an Intel Mac gets on each macOS" },
        {
          type: "ul",
          items: [
            `**macOS 15 Sequoia**: live desktop wallpapers with ${appPlayback.setting} playback; the Lock Screen shows a still.`,
            `**macOS 26 Tahoe**: live desktop, Lock Screen and screen saver, with ${systemPlayback.setting} or ${appPlayback.setting} playback.`,
            "**macOS 27 Golden Gate**: Apple silicon only, per [Apple's list of compatible Macs](https://support.apple.com/en-us/127255).",
          ],
        },
        { type: "h2", text: "The one exception" },
        {
          type: "p",
          text: "[Bend](/bend), which folds the desktop as you close the lid, reads the lid angle of Apple silicon MacBooks, so it isn't offered on Intel Macs.",
        },
        { type: "h2", text: "Playback on Intel" },
        {
          type: "p",
          text: `${name} decodes video in hardware on Intel Macs too. For your own videos, H.264 and HEVC play best; ProRes, AV1 and VP9 are converted when you set them.`,
        },
      ],
      docLinks: [
        {
          href: "/docs/install-macwall",
          label: `Install ${name}`,
          description:
            "Download the universal build, install it and set a first wallpaper.",
        },
        {
          href: "/learn/hardware-video-decode",
          label: "Hardware video decode",
          description:
            "How Macs decode video in hardware, on Apple silicon and Intel.",
        },
        {
          href: "/download",
          label: `Download ${name}`,
          description: "The current signed and notarized build, for every Mac.",
        },
      ],
      related: [
        "does-macwall-work-on-macos-27",
        "live-wallpaper-on-mac-lock-screen",
        "macwall-cpu-use",
      ],
      keywords: [
        "macwall intel mac",
        "live wallpaper intel mac",
        "macwall apple silicon",
      ],
      quotesPrice: false,
      publishedAt: PUBLISHED,
      updatedAt: PUBLISHED,
    },
    {
      slug: "does-macwall-work-offline",
      topic: "compatibility",
      question: `Does ${name} work offline?`,
      navLabel: "Offline use",
      title: `Does ${name} Work Offline?`,
      description: `Yes, for wallpapers you've downloaded. New downloads and activating a key need internet, and Pro pauses after 7 days without a license check.`,
      answer: `Yes, for wallpapers you've already downloaded: ${name} keeps each one on your Mac after the first download and plays it with no connection. Downloading new wallpapers and activating a license need internet. Pro keeps working for 7 days after its last online license check, then pauses until you reconnect.`,
      details: [
        { type: "h2", text: "What needs a connection" },
        {
          type: "ul",
          items: [
            "**Downloading** a wallpaper the first time, in the app or with **Set on Mac** on the web.",
            "**Activating** a license key.",
            `**New wallpapers**: offline, Home and Explore show the catalog ${name} last loaded.`,
            `**Updates**: ${name} looks for new versions while it's open.`,
          ],
        },
        { type: "h2", text: "What works offline" },
        {
          type: "ul",
          items: [
            "Every wallpaper you've downloaded or added yourself, on the desktop, the Lock Screen and the screen saver.",
            "Shuffle and Day Schedule, with wallpapers already on your Mac. A scheduled one that isn't downloaded yet waits until you're back online.",
          ],
        },
        { type: "h2", text: "Going offline for a while" },
        {
          type: "p",
          text: `Before a trip, open the wallpapers you want and choose **Save to Library**, which downloads them without changing your desktop. If Pro pauses after a week offline, ${name} shows **Reconnect to Restore Pro**: the license is fine, and Pro comes back by itself once your Mac is online. There's nothing to buy again.`,
        },
      ],
      docLinks: [
        {
          href: "/docs/license-and-activation",
          label: "License and activation",
          description: "How activation works and what the license check does.",
        },
        {
          href: "/docs/set-a-live-wallpaper",
          label: "Set a live wallpaper",
          description:
            "Download and set wallpapers, and save them to your Library for later.",
        },
        {
          href: "/docs/troubleshooting",
          label: "Fix common issues",
          description:
            "Downloads that fail or stall behind a VPN, proxy or content filter.",
        },
      ],
      related: [
        "how-many-macs-per-license",
        "is-macwall-free",
        "does-macwall-work-on-macos-27",
      ],
      keywords: [
        "macwall offline",
        "live wallpaper offline mac",
        "macwall without internet",
      ],
      quotesPrice: false,
      publishedAt: PUBLISHED,
      updatedAt: PUBLISHED,
    },
  ]

  const byTopic = (entry: Omit<FaqAnswer, "pathname">) =>
    FAQ_TOPIC_ORDER.indexOf(entry.topic)
  return entries
    .map((entry, index) => ({ entry, index }))
    .sort((a, b) => byTopic(a.entry) - byTopic(b.entry) || a.index - b.index)
    .map(({ entry }) => ({ ...entry, pathname: faqAnswerPath(entry.slug) }))
}

/** Every answer, grouped by topic in FAQ_TOPIC_ORDER, priced for `now`. */
export function faqAnswers(now: number = Date.now()): FaqAnswer[] {
  return buildFaqAnswers(now)
}

export function getFaqAnswer(
  slug: string,
  now: number = Date.now()
): FaqAnswer | undefined {
  return buildFaqAnswers(now).find((answer) => answer.slug === slug)
}

export function getAllFaqSlugs(): string[] {
  return buildFaqAnswers(0).map((answer) => answer.slug)
}

/** Answer pages that state a MacWall price, to revalidate when a sale starts or ends. */
export function faqPricePaths(): string[] {
  return buildFaqAnswers(0)
    .filter((answer) => answer.quotesPrice)
    .map((answer) => answer.pathname)
}

/** The newest `updatedAt` across the answers, for the hub. */
export function faqLastUpdated(): string {
  return buildFaqAnswers(0)
    .map((answer) => answer.updatedAt)
    .sort()
    .at(-1)!
}

export function faqAnswersByTopic(
  now: number = Date.now()
): { topic: FaqTopic; label: string; answers: FaqAnswer[] }[] {
  const answers = buildFaqAnswers(now)
  return FAQ_TOPIC_ORDER.map((topic) => ({
    topic,
    label: FAQ_TOPIC_LABELS[topic],
    answers: answers.filter((answer) => answer.topic === topic),
  })).filter((group) => group.answers.length > 0)
}

export function relatedFaqAnswers(
  answer: FaqAnswer,
  now: number = Date.now()
): FaqAnswer[] {
  const all = buildFaqAnswers(now)
  return answer.related
    .map((slug) => all.find((candidate) => candidate.slug === slug))
    .filter((candidate): candidate is FaqAnswer => Boolean(candidate))
}

/** The /faq hub. Its HTML lists the answers; `faqHubSeoPage` adds them for Markdown. */
export const faqHubPage: SeoContentPage = {
  slug: "faq",
  pathname: FAQ_HUB_PATH,
  title: `${name} FAQ: Price, Battery, Lock Screen and macOS`,
  headline: `${name} questions, answered`,
  description: `Short, direct answers about ${name}: the free trial and price, battery and CPU use, the Lock Screen, macOS 27, Intel Macs, multiple displays and refunds.`,
  keywords: [
    "macwall faq",
    "macwall questions",
    "live wallpaper mac questions",
  ],
  publishedAt: PUBLISHED,
  sections: [
    {
      type: "p",
      text: `Each page answers one question about ${name} in a few sentences, then links to the documentation for the steps. For how-to guides see [the docs](/docs); for how live wallpapers work on a Mac see [Learn](/learn).`,
    },
  ],
}

/** The hub as one Markdown-ready page: the intro plus every question by topic. */
export function faqHubSeoPage(now: number = Date.now()): SeoContentPage {
  const sections: ContentBlock[] = [...faqHubPage.sections]
  for (const group of faqAnswersByTopic(now)) {
    sections.push(
      { type: "h2", text: group.label },
      {
        type: "ul",
        items: group.answers.map(
          (answer) =>
            `[${answer.question}](${answer.pathname}): ${answer.description}`
        ),
      }
    )
  }
  return { ...faqHubPage, updatedAt: faqLastUpdated(), sections }
}

/**
 * One answer as a page for its Markdown twin: the question as the H1, the
 * direct answer right under it (as on the HTML page), then the details and
 * links. Build it per request so the prices are current.
 */
export function faqAnswerSeoPage(answer: FaqAnswer): SeoContentPage {
  const related = relatedFaqAnswers(answer)
  return {
    slug: answer.slug,
    pathname: answer.pathname,
    title: answer.title,
    headline: answer.question,
    description: answer.answer,
    keywords: answer.keywords,
    publishedAt: answer.publishedAt,
    updatedAt: answer.updatedAt,
    sections: [
      ...answer.details,
      { type: "h2", text: "Go deeper" },
      {
        type: "ul",
        items: answer.docLinks.map(
          (link) => `[${link.label}](${link.href}): ${link.description}`
        ),
      },
      ...(related.length > 0
        ? ([
            { type: "h2", text: "More questions" },
            {
              type: "ul",
              items: related.map(
                (other) => `[${other.question}](${other.pathname})`
              ),
            },
          ] satisfies ContentBlock[])
        : []),
    ],
  }
}

/**
 * Entries for lib/ai/site-content.ts (add `group: "faq"`): the hub and every
 * answer, for the `.md` twins, llms.txt and llms-full.txt. Summaries carry no
 * price; `render` reads the answer again so prices match the moment it runs.
 */
export function faqMarkdownDocuments(): {
  path: string
  title: string
  summary: string
  updatedAt: string
  includeInFullText: boolean
  render: () => string
}[] {
  return [
    {
      path: FAQ_HUB_PATH,
      title: faqHubPage.title,
      summary: faqHubPage.description,
      updatedAt: faqLastUpdated(),
      includeInFullText: false,
      render: () => seoPageToMarkdown(faqHubSeoPage()),
    },
    ...getAllFaqSlugs().map((slug) => {
      const answer = getFaqAnswer(slug, 0)!
      return {
        path: answer.pathname,
        title: answer.question,
        summary: answer.description,
        updatedAt: answer.updatedAt,
        includeInFullText: true,
        render: () => seoPageToMarkdown(faqAnswerSeoPage(getFaqAnswer(slug)!)),
      }
    }),
  ]
}
