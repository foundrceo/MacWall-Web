import { macwall, macwallCatalog } from "@/lib/macwall-site"
import {
  getWallpaperCollection,
  wallpaperCollectionPath,
  type WallpaperCollection,
} from "@/lib/seo/wallpaper-collections"
import type { ContentBlock, ContentFaq } from "@/lib/content/types"

/**
 * The only source of copy for the gallery hubs: /wallpapers and the nine
 * /wallpapers/{category} pages. Titles target what people search for ("car
 * live wallpaper", "superhero wallpaper"), each intro is written for its
 * category, and no FAQ quotes a price (prices change with sales and region;
 * /pricing is the one place they live).
 *
 * Product facts here match the shipped app (4.1.0): macOS 15 or later on
 * Apple silicon and Intel, Lock Screen and screen saver on macOS 26 or
 * later, "Set Wallpaper" with a per-display menu, imports in MP4, MOV or
 * M4V with Pro.
 */

export type CategorySeo = {
  /** Category name as the catalog and the app use it ("Others"). */
  name: string
  slug: string
  /** Label on the web: "More" for the catch-all "Others". */
  displayLabel: string
  /** One wallpaper, for instructions: "an anime wallpaper". */
  oneItem: string
  /** Many, for the count line: "anime loops". */
  items: string
  /** `<title>` without the " | MacWall" suffix. */
  title: string
  /** H1. */
  headline: string
  /** Meta description, under 160 characters. */
  description: string
  keywords: string[]
  /**
   * Answer-first opening paragraph, 80–120 words, inline Markdown. Rendered
   * once per hub, near the H1 (see `categoryHubIntro`).
   */
  intro: string
  /** Two or three questions specific to the category; never a price. */
  faq: ContentFaq[]
  /** Collections to link from the hub, most useful first. Generic or franchise topics only, never a real person. */
  collectionSlugs: string[]
}

const CATALOG = macwallCatalog.liveCountLabel

/** "A, B and C", the site's list style. */
function listPhrase(items: readonly string[]): string {
  if (items.length <= 1) return items.join("")
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`
}
const SET_IT =
  "Preview any loop on this page, then [download MacWall](/download), open the wallpaper and click **Set Wallpaper**."
const MACOS_LINE =
  "Each one plays behind your windows on macOS 15 Sequoia or later, and on macOS 26 Tahoe or later it can also play on the Lock Screen and as the screen saver."

export const categorySeo = {
  Anime: {
    name: "Anime",
    slug: "anime",
    displayLabel: "Anime",
    oneItem: "an anime wallpaper",
    items: "anime loops",
    title: "Anime Wallpapers for MacBook: 4K Live Loops",
    headline: "Anime live wallpapers for Mac",
    description:
      "Anime live wallpapers for Mac and MacBook: Jujutsu Kaisen, Naruto, One Piece, Demon Slayer and lofi scenes as 4K video loops. Preview free, set in MacWall.",
    keywords: [
      "anime wallpaper macbook",
      "anime live wallpaper mac",
      "anime wallpaper mac",
      "animated anime wallpaper mac",
    ],
    intro: `**These are anime live wallpapers made for Mac, not Windows: video loops that play behind your windows on macOS 15 Sequoia or later, and on the Lock Screen and as the screen saver on macOS 26 Tahoe or later.** Anime is the largest category in MacWall's catalog of ${CATALOG} live wallpapers, with fight scenes, character close-ups and quiet lofi rooms from series such as Jujutsu Kaisen, Naruto, One Piece and Demon Slayer. ${SET_IT} On a MacBook with an external display, the menu next to Set Wallpaper gives each screen its own loop.`,
    faq: [
      {
        question: "Do anime live wallpapers work on a MacBook?",
        answer:
          "Yes. MacWall plays them on any Mac with macOS 15 Sequoia or later, MacBook Air and MacBook Pro included, on Apple silicon and Intel. On battery, Settings → Battery & Performance can pause the wallpaper or lower its quality.",
      },
      {
        question: "Can I use my Wallpaper Engine anime wallpapers on a Mac?",
        answer:
          "Not in MacWall: it can't open Wallpaper Engine projects. Its anime loops are its own catalog, and with Pro you can import MP4, MOV or M4V clips you made or have the rights to use.",
      },
      {
        question: "Are these official wallpapers from the anime studios?",
        answer:
          "No. MacWall isn't affiliated with the studios or publishers of the series shown, and the characters belong to their owners. The loops are for personal use in the MacWall app.",
      },
    ],
    collectionSlugs: [
      "jujutsu-kaisen",
      "naruto",
      "one-piece",
      "demon-slayer",
      "goku",
      "aesthetic",
      "anime-girl",
    ],
  },
  Nature: {
    name: "Nature",
    slug: "nature",
    displayLabel: "Nature",
    oneItem: "a nature wallpaper",
    items: "nature loops",
    title: "Nature Live Wallpapers for Mac: Rain and Forest",
    headline: "Nature live wallpapers for Mac",
    description:
      "Nature live wallpapers for Mac: rain on leaves, misty forests, ocean waves, snow and cherry blossoms as 4K video loops. Preview free, then set them in MacWall.",
    keywords: [
      "nature live wallpaper mac",
      "nature wallpaper mac",
      "rain live wallpaper mac",
      "forest live wallpaper mac",
    ],
    intro: `**Nature live wallpapers bring slow, calm motion to a Mac desktop: rain on a window, mist drifting through pines, waves rolling onto a beach, petals falling past a shrine gate.** They are one of nine categories in MacWall's catalog of ${CATALOG} live wallpapers, and the collections below split them into rain, forest, ocean, snow, autumn, sunsets, mountains and cherry blossom. ${MACOS_LINE} ${SET_IT}`,
    faq: [
      {
        question: "Do nature live wallpapers drain a MacBook battery?",
        answer:
          "Any video wallpaper uses some power. MacWall pauses behind full-screen apps by default, and in Settings → Battery & Performance you can turn on Pause on battery, which holds the frame whenever your Mac is unplugged, or Lower quality on battery. Activity Monitor shows what it uses on your Mac.",
      },
      {
        question: "Can a nature wallpaper change with the time of day?",
        answer:
          "MacWall's Day Schedule picks a wallpaper by time of day, so a sunrise loop can play in the morning and a night scene later. It switches between whole loops; for one scene whose light shifts slowly, use Apple's built-in dynamic wallpapers.",
      },
    ],
    collectionSlugs: [
      "rain",
      "forest",
      "ocean",
      "snow",
      "autumn",
      "sunset",
      "mountain",
      "cherry-blossom",
    ],
  },
  Cars: {
    name: "Cars",
    slug: "cars",
    displayLabel: "Cars",
    oneItem: "a car wallpaper",
    items: "car loops",
    title: "Car Live Wallpapers for Mac",
    headline: "Car live wallpapers for Mac",
    description:
      "Car live wallpapers for Mac in 4K: JDM night drives, F1 cockpits, Porsche, BMW and supercar loops. Preview them free here, then set them in MacWall.",
    keywords: [
      "car live wallpaper",
      "car live wallpaper mac",
      "car wallpaper mac",
      "car wallpaper 4k mac",
    ],
    intro: `**Car live wallpapers turn a Mac desktop into a moving garage: night drives, drifts, Formula 1 cockpits and supercars on rain-soaked streets, as looping video rather than still photos.** They are part of MacWall's catalog of ${CATALOG} live wallpapers, and the collections below group them by JDM, F1, Porsche, BMW, Ferrari, Lamborghini and other supercars. MacWall needs macOS 15 Sequoia or later; on macOS 26 Tahoe or later the same loop can also play on the Lock Screen and as the screen saver. ${SET_IT}`,
    faq: [
      {
        question: "Can I put a different car on each display?",
        answer:
          "Yes. Open a wallpaper in MacWall, use the menu next to Set Wallpaper and choose the display. Each display plays its own loop, or the same one on all of them.",
      },
      {
        question: "Are these official wallpapers from the car brands?",
        answer:
          "No. MacWall isn't affiliated with any carmaker or racing team shown, and their names and logos belong to their owners. The loops are for personal use in the MacWall app.",
      },
    ],
    collectionSlugs: [
      "jdm",
      "f1",
      "porsche",
      "bmw",
      "supercars",
      "ferrari",
      "lamborghini",
    ],
  },
  Gaming: {
    name: "Gaming",
    slug: "gaming",
    displayLabel: "Gaming",
    oneItem: "a gaming wallpaper",
    items: "gaming loops",
    title: "Minecraft and Gaming Live Wallpapers for Mac",
    headline: "Gaming live wallpapers for Mac",
    description:
      "Gaming live wallpapers for Mac: Minecraft lakes, pixel art rooms, Pokémon, Genshin Impact, Red Dead and Halo scenes as 4K video loops, set with MacWall.",
    keywords: [
      "gaming live wallpaper mac",
      "gaming wallpaper mac",
      "minecraft live wallpaper mac",
      "pixel art live wallpaper mac",
    ],
    intro: `**Gaming live wallpapers bring scenes from the games you play to a Mac desktop: Minecraft lakesides, pixel art bedrooms, Pokémon napping in a field, Genshin Impact characters and Red Dead riders at sunset.** They make up MacWall's Gaming category, part of a catalog of ${CATALOG} live wallpapers, and the Pixel Art collection gathers the retro ones. ${MACOS_LINE} MacWall pauses behind full-screen apps, so it stays out of the way of a full-screen game. ${SET_IT}`,
    faq: [
      {
        question: "Does a live wallpaper slow down games on a Mac?",
        answer:
          "MacWall pauses the wallpaper behind full-screen apps by default. Settings → Battery & Performance also has Pause when your Mac is busy, which gives games, exports and builds the full processor. Activity Monitor shows what it uses on your Mac.",
      },
      {
        question: "Are these wallpapers from the game studios?",
        answer:
          "No. MacWall isn't affiliated with the studios or publishers of the games shown, and the characters belong to their owners. The loops are for personal use in the MacWall app.",
      },
    ],
    collectionSlugs: ["pixel-art"],
  },
  Space: {
    name: "Space",
    slug: "space",
    displayLabel: "Space",
    oneItem: "a space wallpaper",
    items: "space loops",
    title: "Space and Black Hole Live Wallpapers for Mac",
    headline: "Space live wallpapers for Mac",
    description:
      "Space live wallpapers for Mac: black holes, galaxies, nebulae, planets and astronauts as 4K video loops. Preview them free here, then set them in MacWall.",
    keywords: [
      "space live wallpaper mac",
      "space wallpaper 4k mac",
      "black hole live wallpaper mac",
      "galaxy live wallpaper mac",
    ],
    intro: `**Space live wallpapers put slow cosmic motion behind your windows: a black hole's accretion disk turning, a nebula drifting, Earth rolling under an orbital station, an astronaut floating past.** They are part of MacWall's catalog of ${CATALOG} live wallpapers, with collections for galaxies, black holes and the Moon. Mostly dark, these scenes sit well with macOS dark mode and keep desktop icons easy to read. MacWall plays them on macOS 15 Sequoia or later; on macOS 26 Tahoe or later the same loop can run on the Lock Screen and as the screen saver. ${SET_IT}`,
    faq: [
      {
        question: "Is there a black hole live wallpaper for Mac?",
        answer:
          "Yes. The Black Hole collection on this page gathers MacWall's black hole loops, from glowing accretion disks to eclipses and collisions, and each one plays as a looping video on macOS 15 or later.",
      },
      {
        question: "Can I use a space wallpaper as my Mac screen saver?",
        answer:
          "Yes, on macOS 26 Tahoe or later: the wallpaper you set in MacWall also plays as the screen saver. macOS starts the screen saver after the idle time you choose in System Settings > Wallpaper > Screen Saver.",
      },
    ],
    collectionSlugs: ["galaxy", "black-hole", "moon"],
  },
  Heroes: {
    name: "Heroes",
    slug: "heroes",
    displayLabel: "Heroes",
    oneItem: "a superhero wallpaper",
    items: "superhero loops",
    title: "Superhero Live Wallpapers for Mac",
    headline: "Superhero live wallpapers for Mac",
    description:
      "Superhero live wallpapers for Mac: Spider-Man, Miles Morales, Batman, Iron Man and other Marvel and DC scenes as 4K video loops, set with MacWall.",
    keywords: [
      "superhero live wallpaper mac",
      "superhero wallpaper mac",
      "spider-man live wallpaper mac",
      "marvel live wallpaper mac",
    ],
    intro: `**Superhero live wallpapers for Mac: Spider-Man swinging through the rain, Miles Morales in neon, Batman over Gotham, Iron Man and other Marvel and DC scenes as looping video.** MacWall files them under Heroes, one of nine categories in its catalog of ${CATALOG} live wallpapers, with collections for Spider-Man, Miles Morales, Batman and Marvel. ${MACOS_LINE} ${SET_IT} To find one character, type a name such as Venom or Black Panther into the search on this page.`,
    faq: [
      {
        question: "Are these official Marvel or DC wallpapers?",
        answer:
          "No. MacWall isn't affiliated with Marvel, DC or their studios, and the characters belong to their owners. The loops are for personal use in the MacWall app.",
      },
      {
        question: "Can I use a different superhero on the Lock Screen?",
        answer:
          "Yes, on macOS 26 Tahoe or later with MacWall App playback (Settings → Wallpaper → Playback): open a wallpaper and choose Lock Screen Only from the menu next to Set Wallpaper. With System Wallpaper playback, the desktop, Lock Screen and screen saver share one wallpaper.",
      },
    ],
    collectionSlugs: ["spider-man", "miles-morales", "batman", "marvel"],
  },
  Dark: {
    name: "Dark",
    slug: "dark",
    displayLabel: "Dark",
    oneItem: "a dark wallpaper",
    items: "dark loops",
    title: "Dark and Neon Live Wallpapers for Mac",
    headline: "Dark live wallpapers for Mac",
    description:
      "Dark live wallpapers for Mac: rainy night cities, neon streets, falling code, blood moons and gothic knights as 4K video loops that suit dark mode.",
    keywords: [
      "dark live wallpaper mac",
      "dark wallpaper mac",
      "neon live wallpaper mac",
      "cyberpunk live wallpaper mac",
    ],
    intro: `**Dark live wallpapers keep a Mac desktop low-key and moody: rain on a Tokyo street at night, neon highways, falling code, blood moons and gothic knights.** Their deep shadows suit macOS dark mode and keep icons and windows easy to read. They are part of MacWall's catalog of ${CATALOG} live wallpapers, with collections for city nights, cyberpunk, neon, hacker screens, red and black. MacWall plays them on macOS 15 Sequoia or later, and on macOS 26 Tahoe or later also on the Lock Screen and as the screen saver. ${SET_IT}`,
    faq: [
      {
        question: "Do dark live wallpapers change with dark mode?",
        answer:
          "No. A MacWall wallpaper plays the same loop whichever appearance you choose, unlike Apple's dynamic wallpapers, which can switch between light and dark versions. Pick a dark loop to match dark mode.",
      },
      {
        question: "Can I keep a dark wallpaper for the Lock Screen only?",
        answer:
          "Yes, on macOS 26 Tahoe or later with MacWall App playback: open the wallpaper and choose Lock Screen Only from the menu next to Set Wallpaper, and the desktop keeps its own wallpaper.",
      },
    ],
    collectionSlugs: ["city", "cyberpunk", "neon", "hacker", "red", "black"],
  },
  Abstract: {
    name: "Abstract",
    slug: "abstract",
    displayLabel: "Abstract",
    oneItem: "an abstract wallpaper",
    items: "abstract loops",
    title: "Abstract Live Wallpapers for Mac in 4K",
    headline: "Abstract live wallpapers for Mac",
    description:
      "Abstract live wallpapers for Mac: liquid textures, neon lines, wave forms, particle swirls and animated takes on classic art as 4K video loops.",
    keywords: [
      "abstract live wallpaper mac",
      "abstract wallpaper mac",
      "minimal live wallpaper mac",
      "liquid live wallpaper mac",
    ],
    intro: `**Abstract live wallpapers give a Mac desktop motion without a subject: liquid textures, neon lines, layered wave forms, glowing particles and animated takes on classic art such as The Great Wave off Kanagawa and The Starry Night.** With nothing to focus on, they work well behind busy windows and on a second display. They are part of MacWall's catalog of ${CATALOG} live wallpapers, with color collections for purple, blue and pink. ${MACOS_LINE} ${SET_IT}`,
    faq: [
      {
        question: "Can I make my own abstract live wallpaper?",
        answer:
          "Yes, with Pro: export your animation as an MP4, MOV or M4V file and import it in MacWall. H.264 or HEVC video plays best; MacWall converts ProRes, AV1 or VP9 files your Mac can't play directly when you set them.",
      },
      {
        question: "Do abstract wallpapers work across two displays?",
        answer:
          "Yes. Set one loop on every display, or open the menu next to Set Wallpaper and give each display its own. Displays showing the same loop stay in sync.",
      },
    ],
    collectionSlugs: ["purple", "blue", "pink"],
  },
  Others: {
    name: "Others",
    slug: "others",
    displayLabel: "More",
    oneItem: "a wallpaper",
    items: "loops in this category",
    title: "More Live Wallpapers for Mac: Lofi, Cats and Code",
    headline: "More live wallpapers for Mac",
    description:
      "More live wallpapers for Mac: cozy lofi rooms, cats in the rain, scrolling code, sports and fantasy scenes as 4K video loops outside the main categories.",
    keywords: [
      "lofi live wallpaper mac",
      "cat live wallpaper mac",
      "aesthetic live wallpaper mac",
      "coding live wallpaper mac",
    ],
    intro: `**This is everything in MacWall that doesn't fit one of the eight themed categories: cozy lofi rooms on rainy nights, cats and frogs, scrolling code and HUD screens, sports, and fantasy knights.** The app lists these under Others. They are part of MacWall's catalog of ${CATALOG} live wallpapers, and the Lofi, Cat and Dark Fantasy collections below are the quickest way in. ${MACOS_LINE} ${SET_IT}`,
    faq: [
      {
        question: "Why is this category called Others in the app?",
        answer:
          "MacWall's app sorts its catalog into nine categories, and Others holds the wallpapers outside the eight themes. The web gallery labels it More; the wallpapers are the same.",
      },
      {
        question: "Is there a lofi live wallpaper for Mac?",
        answer:
          "Yes. The Lofi collection gathers MacWall's cozy rooms, rainy windows and city nights. On macOS 26 Tahoe or later the one you set also plays on the Lock Screen and as the screen saver.",
      },
    ],
    collectionSlugs: ["lofi", "cat", "dark-fantasy"],
  },
} satisfies Record<string, CategorySeo>

export type CategorySeoName = keyof typeof categorySeo

/** All nine, in the catalog's order (`macwall.categories`). */
export const categorySeoEntries: readonly CategorySeo[] = macwall.categories
  .map((name) => categorySeoFor(name))
  .filter((entry): entry is CategorySeo => Boolean(entry))

export function categorySeoFor(name: string): CategorySeo | undefined {
  return (categorySeo as Record<string, CategorySeo>)[name]
}

/** Web label for a catalog category: "More" for "Others". */
export function categoryDisplayLabel(name: string): string {
  return categorySeoFor(name)?.displayLabel ?? name
}

/** The hub's collections, resolved; a slug that no longer exists is skipped. */
export function categoryCollections(name: string): WallpaperCollection[] {
  return (categorySeoFor(name)?.collectionSlugs ?? []).flatMap((slug) => {
    const entry = getWallpaperCollection(slug)
    return entry ? [entry] : []
  })
}

/**
 * The hub's opening paragraph. With the live total it adds how many loops
 * the page lists; the catalog-wide figure is always `liveCountLabel`.
 */
export function categoryHubIntro(name: string, total?: number): string {
  const entry = categorySeoFor(name)
  const intro =
    entry?.intro ??
    `**${name} live wallpapers for Mac**: looping video from MacWall's catalog of ${CATALOG} live wallpapers. ${MACOS_LINE} ${SET_IT}`
  if (!total || total <= 0) return intro
  const items = entry?.items ?? `${name.toLowerCase()} loops`
  return `${intro} The gallery here has all ${total} ${items}, most popular first.`
}

/**
 * Body sections after the intro: how to set a wallpaper, and the hub's
 * collections. Rendered below the grid; the intro is not repeated here.
 */
export function categoryHubSections(name: string): ContentBlock[] {
  const entry = categorySeoFor(name)
  const oneItem = entry?.oneItem ?? `a ${name.toLowerCase()} wallpaper`
  const collections = categoryCollections(name)
  const blocks: ContentBlock[] = [
    { type: "h2", text: "How to set one on your Mac" },
    {
      type: "ol",
      items: [
        "[Download MacWall](/download) for macOS 15 or later and start the free 24-hour trial; it asks for an email address, never a card.",
        `Open ${oneItem} on this page and click **Set on Mac**, or find it under ${name} in the app.`,
        "Click **Set Wallpaper**. To give another display its own loop, open the menu next to Set Wallpaper and choose the display.",
        "On macOS 26 Tahoe or later, the same loop also plays on the Lock Screen and as the screen saver. The [Lock Screen guide](/docs/live-lock-screen-and-screen-saver) covers the options.",
      ],
    },
  ]
  if (collections.length > 0) {
    blocks.push({
      type: "p",
      text: `Collections in this category: ${listPhrase(
        collections.map(
          (collection) =>
            `[${collection.name}](${wallpaperCollectionPath(collection.slug)})`
        )
      )}. Comparing apps first? See [live wallpaper apps for Mac, compared](/best-live-wallpaper-mac).`,
    })
  }
  return blocks
}

export type GalleryIndexSeo = {
  title: string
  headline: string
  description: string
  keywords: string[]
  intro: string
  faq: ContentFaq[]
}

/** /wallpapers: the whole gallery, aimed at "4K live wallpapers for Mac". */
export const galleryIndexSeo: GalleryIndexSeo = {
  title: "4K Live Wallpapers for Mac",
  headline: "4K live wallpapers for Mac",
  description: `Browse ${CATALOG} live wallpapers for Mac and MacBook, most in 4K: anime, cars, nature, space and more. Video loops that play in MacWall, not still images.`,
  keywords: [
    "4k live wallpapers mac",
    "live wallpapers for mac",
    "mac live wallpaper",
    "macbook live wallpaper",
  ],
  intro: `**MacWall's gallery holds ${CATALOG} live wallpapers for Mac, most in 4K, in nine categories: ${listPhrase(
    macwall.categories.map((name) => categoryDisplayLabel(name))
  )}.** Each is a looping video that plays behind your windows on macOS 15 Sequoia or later, and on the Lock Screen and as the screen saver on macOS 26 Tahoe or later. They play in the MacWall app rather than downloading as image files: preview any loop here, [download MacWall](/download), and click **Set Wallpaper**, or use **Set on Mac** on a wallpaper's page to send it to the app.`,
  faq: [
    {
      question: "Are these live wallpapers free?",
      answer:
        "Previewing them here is free. Setting them on your Mac needs MacWall, which starts with a free 24-hour trial of the full catalog and then needs a one-time Pro license. The pricing page shows today's price for your region.",
    },
    {
      question: "Can I download these wallpapers as video files?",
      answer:
        "No. The wallpapers play inside the MacWall app and are for personal use there; they can't be redistributed. With Pro you can also import your own MP4, MOV or M4V clips.",
    },
    {
      question: "Do they work on Intel Macs?",
      answer:
        "Yes. MacWall runs on Apple silicon and Intel Macs with macOS 15 Sequoia or later. The live Lock Screen and screen saver need macOS 26 Tahoe or later.",
    },
  ],
}
