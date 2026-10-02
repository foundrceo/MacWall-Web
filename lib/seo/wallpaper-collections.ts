import type { ContentFaq } from "@/lib/content/types"
import { macwall, macwallLockScreenMacOSVersion } from "@/lib/macwall-site"

/**
 * Curated, keyword-researched wallpaper collections served at
 * `/wallpapers/collections/{slug}`.
 *
 * Catalog tags are free-form (mixed case, split words, near-duplicates), so raw
 * tags make poor landing pages. Each collection instead names the topic people
 * actually search for ("gojo wallpaper", "rain live wallpaper") and matches it
 * against wallpaper names and tags with case-insensitive patterns.
 *
 * Collections below `COLLECTION_MIN_WALLPAPERS` matches are served `noindex`
 * and left out of the sitemap, so a thin topic never ships as a doorway page.
 */

export const COLLECTION_MIN_WALLPAPERS = 6

/** Cap for the server-rendered grid — keeps the HTML light on huge topics. */
export const COLLECTION_GRID_LIMIT = 48

export type WallpaperCollectionGroup =
  | "anime"
  | "heroes"
  | "sports"
  | "cars"
  | "moods"
  | "space"
  | "colors"

export const COLLECTION_GROUP_LABELS: Record<WallpaperCollectionGroup, string> =
  {
    anime: "Anime",
    heroes: "Heroes & movies",
    sports: "Sports",
    cars: "Cars",
    moods: "Moods & places",
    space: "Space",
    colors: "Colors",
  }

export const COLLECTION_GROUP_ORDER: readonly WallpaperCollectionGroup[] = [
  "anime",
  "heroes",
  "cars",
  "sports",
  "moods",
  "space",
  "colors",
] as const

export type WallpaperCollection = {
  slug: string
  /** Topic name as people type it: "Gojo", "Spider-Man", "Rain". */
  name: string
  group: WallpaperCollectionGroup
  /** `<title>` without the site suffix (root layout appends it). */
  title: string
  /** Meta description, 140–160 characters. */
  description: string
  keywords: string[]
  /** Unique opening paragraph (inline Markdown allowed). */
  intro: string
  /** Case-insensitive regex sources tested against the name and every tag. */
  patterns: string[]
  /** Name/tag patterns that disqualify a match (e.g. "dragon" but not Dragon Ball). */
  exclude?: string[]
  /** Catalog category most of the collection lives in, for the internal link. */
  category: string
  /** One topic-specific question on top of the shared FAQ. */
  faq: ContentFaq
  related: string[]
}

function collection(entry: WallpaperCollection): WallpaperCollection {
  return entry
}

export const wallpaperCollections: WallpaperCollection[] = [
  collection({
    slug: "gojo",
    name: "Gojo",
    group: "anime",
    title: "Gojo Wallpapers for Mac: 4K Live & Animated",
    description:
      "Satoru Gojo live wallpapers for Mac: animated 4K Jujutsu Kaisen loops of Infinity, Hollow Purple, and the blindfold, ready to set on your desktop in one click.",
    keywords: [
      "gojo wallpaper",
      "gojo live wallpaper",
      "satoru gojo wallpaper mac",
      "gojo 4k wallpaper",
      "gojo animated wallpaper",
      "gojo wallpaper macbook",
    ],
    intro:
      "Satoru Gojo is the most requested character in the MacWall community, so this collection gathers every animated Gojo loop in the catalog: blindfold close-ups, Infinity glows, Hollow Purple charges, and quieter shots of the strongest sorcerer. Each one is a real video loop, not a still, so the six eyes actually glow on your desktop.",
    patterns: ["\\bgojo\\b", "\\bsatoru\\b", "hollow purple", "\\binfinity\\b"],
    category: "Anime",
    faq: {
      question: "Are these Gojo wallpapers animated or still images?",
      answer:
        "Every Gojo wallpaper here is an animated video loop. MacWall plays it at the desktop wallpaper layer with hardware decoding, so the motion is smooth without slowing your Mac down.",
    },
    related: ["jujutsu-kaisen", "naruto", "one-piece", "goku"],
  }),
  collection({
    slug: "jujutsu-kaisen",
    name: "Jujutsu Kaisen",
    group: "anime",
    title: "Jujutsu Kaisen Wallpapers for Mac: 4K Live Loops",
    description:
      "Jujutsu Kaisen live wallpapers for Mac: animated Gojo, Sukuna, Yuji, and Megumi loops in 4K. Preview every JJK wallpaper and set it on your Mac desktop.",
    keywords: [
      "jujutsu kaisen wallpaper",
      "jujutsu kaisen live wallpaper",
      "jjk wallpaper mac",
      "sukuna live wallpaper",
      "jjk 4k wallpaper",
      "jujutsu kaisen wallpaper macbook",
    ],
    intro:
      "Domain expansions look better when they move. This Jujutsu Kaisen collection covers the whole cast in motion: Gojo and Sukuna face-offs, Yuji and Megumi fight cuts, cursed energy crackling across the frame. Set one per display if you want Gojo on the laptop and Sukuna on the external monitor.",
    patterns: [
      "jujutsu",
      "\\bjjk\\b",
      "\\bgojo\\b",
      "\\bsukuna\\b",
      "\\bitadori\\b",
      "\\byuji\\b",
      "\\bmegumi\\b",
      "\\bnanami\\b",
      "\\btoji\\b",
    ],
    category: "Anime",
    faq: {
      question:
        "Can I set a different Jujutsu Kaisen wallpaper on each monitor?",
      answer:
        "Yes. MacWall assigns wallpapers per display, so each connected screen can play its own JJK loop, or you can sync one loop across every display.",
    },
    related: ["gojo", "naruto", "demon-slayer", "one-piece"],
  }),
  collection({
    slug: "naruto",
    name: "Naruto",
    group: "anime",
    title: "Naruto Wallpapers for Mac: 4K Live & Animated",
    description:
      "Naruto live wallpapers for Mac: animated Itachi, Sasuke, Kakashi, and Akatsuki loops in 4K. Preview each Naruto wallpaper and set it on your Mac in one click.",
    keywords: [
      "naruto wallpaper",
      "naruto live wallpaper",
      "naruto animated wallpaper",
      "itachi live wallpaper",
      "naruto wallpaper mac",
      "akatsuki wallpaper 4k",
    ],
    intro:
      "From Itachi under a blood moon to Kakashi's Sharingan and the Akatsuki cloaks, this collection brings the Hidden Leaf to your Mac desktop as moving wallpaper. The loops are cut to repeat cleanly, so a Rasengan spins without a visible jump every few seconds.",
    patterns: [
      "\\bnaruto\\b",
      "\\bitachi\\b",
      "\\bsasuke\\b",
      "\\bkakashi\\b",
      "akatsuki",
      "\\bmadara\\b",
      "sharingan",
      "\\bboruto\\b",
      "\\bminato\\b",
    ],
    category: "Anime",
    faq: {
      question: "Which Naruto characters are in the collection?",
      answer:
        "Naruto, Itachi, Sasuke, Kakashi, and the Akatsuki appear most often. New fan-favourite loops are added as the community uploads them, and this page updates automatically.",
    },
    related: ["jujutsu-kaisen", "one-piece", "goku", "demon-slayer"],
  }),
  collection({
    slug: "goku",
    name: "Goku",
    group: "anime",
    title: "Goku Wallpapers for Mac: Dragon Ball 4K Live Loops",
    description:
      "Goku live wallpapers for Mac: animated Dragon Ball loops of Super Saiyan transformations, Ultra Instinct, and Vegeta rivalries in 4K for your Mac desktop.",
    keywords: [
      "goku wallpaper",
      "goku live wallpaper",
      "dragon ball live wallpaper",
      "ultra instinct wallpaper",
      "goku wallpaper mac",
      "dragon ball z wallpaper 4k",
    ],
    intro:
      "Power-up auras were made for live wallpaper. This Dragon Ball collection gathers Goku's Super Saiyan and Ultra Instinct loops, Vegeta face-offs, and ki blasts that pulse behind your windows. Hardware decoding keeps a 4K transformation smooth even on a MacBook Air.",
    patterns: [
      "\\bgoku\\b",
      "\\bvegeta\\b",
      "dragon ?ball",
      "\\bsaiyan\\b",
      "ultra instinct",
      "\\bgohan\\b",
    ],
    category: "Anime",
    faq: {
      question: "Will an animated Goku wallpaper drain my MacBook battery?",
      answer:
        "MacWall pauses playback on battery power and whenever a full-screen app covers the desktop, so an animated Goku wallpaper costs very little in everyday use.",
    },
    related: ["naruto", "one-piece", "jujutsu-kaisen", "demon-slayer"],
  }),
  collection({
    slug: "one-piece",
    name: "One Piece",
    group: "anime",
    title: "One Piece Wallpapers for Mac: Luffy 4K Live Loops",
    description:
      "One Piece live wallpapers for Mac: animated Luffy Gear 5, Zoro, and Straw Hat loops in 4K. Preview every One Piece wallpaper and set it on your Mac desktop.",
    keywords: [
      "one piece live wallpaper",
      "luffy wallpaper",
      "luffy live wallpaper",
      "gear 5 wallpaper",
      "one piece wallpaper mac",
      "zoro wallpaper 4k",
    ],
    intro:
      "Gear 5 Luffy bouncing across the sky, Zoro's three-sword stance, the Thousand Sunny on open water: this One Piece collection turns the Grand Line into desktop motion. Every loop is sized for Mac displays and plays behind your windows without getting in the way.",
    patterns: [
      "one piece",
      "\\bluffy\\b",
      "\\bzoro\\b",
      "gear ?5",
      "straw ?hat",
      "\\bshanks\\b",
      "\\bsanji\\b",
    ],
    category: "Anime",
    faq: {
      question: "Is there a Gear 5 Luffy live wallpaper for Mac?",
      answer:
        "Yes, Gear 5 loops appear in this collection when they are in the catalog. Open any of them to preview the motion, then use Set on Mac to apply it with the MacWall app.",
    },
    related: ["naruto", "goku", "jujutsu-kaisen", "demon-slayer"],
  }),
  collection({
    slug: "demon-slayer",
    name: "Demon Slayer",
    group: "anime",
    title: "Demon Slayer Wallpapers for Mac: 4K Live Loops",
    description:
      "Demon Slayer live wallpapers for Mac: animated Tanjiro, Nezuko, Rengoku, and Hashira loops in 4K. Preview each wallpaper and set it on your Mac desktop.",
    keywords: [
      "demon slayer live wallpaper",
      "demon slayer wallpaper mac",
      "tanjiro live wallpaper",
      "nezuko wallpaper",
      "rengoku wallpaper 4k",
    ],
    intro:
      "Water breathing, flame breathing, and Nezuko's pink glow all read beautifully as motion. This Demon Slayer collection gathers the Kimetsu no Yaiba loops in the MacWall catalog, from quiet Tanjiro moments to full Hashira battle cuts.",
    patterns: [
      "demon ?slayer",
      "kimetsu",
      "\\btanjiro\\b",
      "\\bnezuko\\b",
      "\\brengoku\\b",
      "\\bzenitsu\\b",
      "\\binosuke\\b",
      "hashira",
    ],
    category: "Anime",
    faq: {
      question: "How often are new Demon Slayer wallpapers added?",
      answer:
        "The MacWall catalog grows with community uploads, and this page lists every matching loop automatically, so new Demon Slayer wallpapers appear here as soon as they are published.",
    },
    related: ["jujutsu-kaisen", "naruto", "one-piece", "japanese"],
  }),
  collection({
    slug: "spider-man",
    name: "Spider-Man",
    group: "heroes",
    title: "Spider-Man Wallpapers for Mac: 4K Live & Animated",
    description:
      "Spider-Man live wallpapers for Mac: animated Miles Morales, Spider-Verse, and web-swinging loops in 4K. Preview each one and set it on your Mac desktop.",
    keywords: [
      "spiderman wallpaper",
      "spider man live wallpaper",
      "miles morales live wallpaper",
      "spider verse wallpaper",
      "spiderman wallpaper mac",
      "spider-man 4k wallpaper",
    ],
    intro:
      "Web-swinging over a night skyline is about the best thing you can put behind a Dock. This collection covers Peter Parker, Miles Morales, and the Spider-Verse art styles, with loops that range from calm rooftop perches to full-speed swings through the city.",
    patterns: [
      "spider[- ]?man",
      "spider[- ]?verse",
      "miles morales",
      "\\bpeter parker\\b",
      "\\bgwen\\b",
      "\\bvenom\\b",
    ],
    category: "Heroes",
    faq: {
      question: "Are there Miles Morales wallpapers in this collection?",
      answer:
        "Yes. Miles Morales and Spider-Verse style loops are among the most popular Spider-Man wallpapers in the MacWall catalog and are included here.",
    },
    related: ["marvel", "batman", "city", "cyberpunk"],
  }),
  collection({
    slug: "marvel",
    name: "Marvel",
    group: "heroes",
    title: "Marvel Live Wallpapers for Mac: 4K Hero Loops",
    description:
      "Marvel live wallpapers for Mac: animated Spider-Man, Iron Man, Venom, and Avengers loops in 4K. Preview every Marvel wallpaper and set it on your Mac.",
    keywords: [
      "marvel live wallpaper",
      "marvel wallpaper mac",
      "iron man live wallpaper",
      "avengers wallpaper 4k",
      "venom live wallpaper",
    ],
    intro:
      "Arc reactors, symbiotes, and web-slingers: the Marvel collection gathers every hero loop in the MacWall catalog in one place. It is a good starting point if you want a desktop that feels like a title sequence without the noise of a trailer.",
    patterns: [
      "marvel",
      "spider[- ]?man",
      "spider[- ]?verse",
      "miles morales",
      "iron ?man",
      "avengers",
      "\\bthor\\b",
      "\\bvenom\\b",
      "deadpool",
      "wolverine",
      "captain america",
      "\\bhulk\\b",
      "\\bloki\\b",
      "black panther",
    ],
    category: "Heroes",
    faq: {
      question: "Are these official Marvel wallpapers?",
      answer:
        "No. MacWall is not affiliated with Marvel. If you own rights in a wallpaper listed here, report it from its detail page or send a notice under our DMCA policy and we will take it down.",
    },
    related: ["spider-man", "batman", "cyberpunk", "city"],
  }),
  collection({
    slug: "batman",
    name: "Batman",
    group: "heroes",
    title: "Batman Live Wallpapers for Mac: Dark 4K Loops",
    description:
      "Batman live wallpapers for Mac: animated Gotham rooftops, Joker scenes, and Dark Knight silhouettes in 4K. Preview each loop and set it on your Mac desktop.",
    keywords: [
      "batman live wallpaper",
      "batman wallpaper mac",
      "dark knight wallpaper 4k",
      "joker live wallpaper",
      "gotham wallpaper",
    ],
    intro:
      "Batman wallpapers suit a Mac in dark mode better than almost anything: rain on Gotham rooftops, a cape against a searchlight, the Joker in neon. These loops keep most of the frame dark, which also keeps desktop icons readable.",
    patterns: [
      "batman",
      "\\bjoker\\b",
      "gotham",
      "dark knight",
      "\\bbruce wayne\\b",
    ],
    category: "Heroes",
    faq: {
      question:
        "Do dark wallpapers like Batman work well with macOS dark mode?",
      answer:
        "Yes. Mostly-dark loops keep contrast low behind your icons and menu bar, so text stays readable and the wallpaper feels like part of the system appearance.",
    },
    related: ["spider-man", "marvel", "rain", "city"],
  }),
  collection({
    slug: "football",
    name: "Football",
    group: "sports",
    title: "Football Live Wallpapers for Mac: Ronaldo, Messi & More",
    description:
      "Football live wallpapers for Mac: animated Ronaldo, Messi, Mbappé, Neymar, and Real Madrid loops in 4K. Preview every soccer wallpaper and set it on your Mac.",
    keywords: [
      "football live wallpaper",
      "soccer live wallpaper",
      "football wallpaper mac",
      "messi live wallpaper",
      "mbappe wallpaper",
      "real madrid live wallpaper",
    ],
    intro:
      "Celebrations, free kicks, and stadium lights in slow motion. The football collection is one of the largest in the MacWall catalog, with loops of Ronaldo, Messi, Mbappé, Neymar, and the biggest clubs. Put your team on the desktop and it stays there all season.",
    patterns: [
      "football",
      "soccer",
      "ronaldo",
      "cristiano",
      "\\bcr7\\b",
      "\\bmessi\\b",
      "mbapp",
      "neymar",
      "haaland",
      "real madrid",
      "\\bfifa\\b",
      "barcelona",
      "\\bmadrid\\b",
    ],
    category: "Others",
    faq: {
      question: "Can I use a football wallpaper on my Lock Screen too?",
      answer: `Yes. With MacWall Pro, any catalog loop, including football wallpapers, can play on the Lock Screen and as a Screen Saver on ${macwallLockScreenMacOSVersion} or later.`,
    },
    related: ["ronaldo", "f1", "supercars", "city"],
  }),
  collection({
    slug: "ronaldo",
    name: "Cristiano Ronaldo",
    group: "sports",
    title: "Cristiano Ronaldo Wallpapers for Mac: 4K Live Loops",
    description:
      "Cristiano Ronaldo live wallpapers for Mac: animated CR7 celebrations, Real Madrid, Portugal, and Al Nassr loops in 4K. Set any Ronaldo wallpaper on your Mac.",
    keywords: [
      "cristiano ronaldo wallpaper",
      "ronaldo live wallpaper",
      "cr7 wallpaper",
      "ronaldo wallpaper mac",
      "ronaldo siu wallpaper",
    ],
    intro:
      "The Siu, the free-kick stance, the Real Madrid years: this collection gathers every Cristiano Ronaldo loop in the MacWall catalog. They are short, seamless clips, so the celebration lands every time the loop comes around.",
    patterns: ["ronaldo", "cristiano", "\\bcr7\\b", "\\bsiu+\\b"],
    category: "Others",
    faq: {
      question: "Are Ronaldo wallpapers free on MacWall?",
      answer: `MacWall starts with a free 24-hour trial with full access. After that, the full catalog, including every Ronaldo loop, stays unlocked with a one-time ${macwall.pro.price} Pro license with no subscription.`,
    },
    related: ["football", "f1", "supercars", "bmw"],
  }),
  collection({
    slug: "jdm",
    name: "JDM",
    group: "cars",
    title: "JDM Car Live Wallpapers for Mac: Supra, GT-R & Drift",
    description:
      "JDM live wallpapers for Mac: animated Toyota Supra, Nissan GT-R, Skyline, RX-7, and drift loops in 4K. Preview every car wallpaper and set it on your Mac.",
    keywords: [
      "jdm wallpaper",
      "jdm live wallpaper",
      "car live wallpaper",
      "supra live wallpaper",
      "nissan gtr wallpaper",
      "drift live wallpaper",
    ],
    intro:
      "Night-time touge runs, smoke-filled drifts, and neon-lit parking garages. The JDM collection covers Supras, GT-Rs, Skylines, RX-7s, and Civics in motion, the kind of loop that makes a desktop feel like a car meet at 2 a.m.",
    patterns: [
      "\\bjdm\\b",
      "nissan",
      "toyota",
      "\\bsupra\\b",
      "gt-?r\\b",
      "nissan skyline",
      "skyline (?:gt|r3[234])",
      "\\br3[234]\\b",
      "\\bdrift",
      "\\bhonda\\b",
      "\\bmazda\\b",
      "rx-?7",
      "\\bsilvia\\b",
      "\\bae86\\b",
      "initial d",
    ],
    category: "Cars",
    faq: {
      question: "Do car wallpapers look good on an ultrawide monitor?",
      answer:
        "Wide cinematic car shots suit ultrawide displays well. MacWall scales each loop to fill the screen, and you can set a separate car wallpaper on every connected display.",
    },
    related: ["supercars", "bmw", "porsche", "f1"],
  }),
  collection({
    slug: "bmw",
    name: "BMW",
    group: "cars",
    title: "BMW Live Wallpapers for Mac: M3, M4 & M5 4K Loops",
    description:
      "BMW live wallpapers for Mac: animated M3, M4, M5, and E30 loops in 4K, from night drives to track days. Preview each BMW wallpaper and set it on your Mac.",
    keywords: [
      "bmw wallpaper",
      "bmw live wallpaper",
      "bmw m4 wallpaper",
      "bmw m3 live wallpaper",
      "bmw wallpaper mac",
    ],
    intro:
      "Angel eyes in the rain, an M4 sliding through a corner, an E30 under streetlights. The BMW collection is one of the most popular car sets in the MacWall catalog, and it pairs especially well with dark mode.",
    patterns: [
      "\\bbmw\\b",
      "\\be30\\b",
      "\\bm3\\b",
      "\\bm4\\b",
      "\\bm5\\b",
      "\\bm8\\b",
    ],
    category: "Cars",
    faq: {
      question:
        "Can I set a BMW wallpaper on my MacBook and external display at once?",
      answer:
        "Yes. MacWall can sync one BMW loop across every display or give each screen its own wallpaper, with playback decoded in hardware.",
    },
    related: ["jdm", "supercars", "porsche", "f1"],
  }),
  collection({
    slug: "porsche",
    name: "Porsche",
    group: "cars",
    title: "Porsche Live Wallpapers for Mac: 911 & GT3 4K Loops",
    description:
      "Porsche live wallpapers for Mac: animated 911, GT3 RS, and Taycan loops in 4K. Preview every Porsche wallpaper and set it on your Mac desktop in one click.",
    keywords: [
      "porsche wallpaper",
      "porsche live wallpaper",
      "porsche 911 wallpaper",
      "gt3 rs wallpaper",
      "porsche wallpaper mac",
    ],
    intro:
      "The 911 silhouette is instantly recognisable even as a tiny slice of desktop behind your windows. This collection gathers Porsche loops from the MacWall catalog, from GT3 RS track footage to calm golden-hour drives.",
    patterns: ["porsche", "\\b911\\b", "\\bgt3\\b", "taycan", "\\bcayman\\b"],
    category: "Cars",
    faq: {
      question: "What resolution are the Porsche wallpapers?",
      answer:
        "Most catalog loops are 4K or 1440p. Each wallpaper page lists its exact resolution, duration, and file size before you set it.",
    },
    related: ["supercars", "bmw", "jdm", "f1"],
  }),
  collection({
    slug: "supercars",
    name: "Supercars",
    group: "cars",
    title: "Supercar Live Wallpapers for Mac: Lamborghini, McLaren & Ferrari",
    description:
      "Supercar live wallpapers for Mac: animated Lamborghini, McLaren, Ferrari, and Bugatti loops in 4K. Preview each exotic car wallpaper and set it on your Mac.",
    keywords: [
      "supercar live wallpaper",
      "lamborghini live wallpaper",
      "mclaren wallpaper",
      "ferrari live wallpaper",
      "bugatti wallpaper 4k",
    ],
    intro:
      "Scissor doors, carbon aero, and exhaust flames in slow motion. The supercar collection brings Lamborghini, McLaren, Ferrari, Bugatti, and Koenigsegg loops together, cut to repeat seamlessly so the reveal never gets old.",
    patterns: [
      "lamborghini",
      "\\blambo\\b",
      "mclaren",
      "ferrari",
      "bugatti",
      "koenigsegg",
      "pagani",
      "supercar",
      "hypercar",
      "aventador",
      "huracan",
    ],
    category: "Cars",
    faq: {
      question: "Are there McLaren P1 and Lamborghini wallpapers?",
      answer:
        "Yes. McLaren and Lamborghini loops are included whenever they are in the catalog; open any wallpaper to see its resolution and loop length.",
    },
    related: ["jdm", "porsche", "bmw", "f1"],
  }),
  collection({
    slug: "f1",
    name: "F1",
    group: "sports",
    title: "F1 Live Wallpapers for Mac: Formula 1 4K Loops",
    description:
      "F1 live wallpapers for Mac: animated Formula 1 loops of Leclerc, Ferrari, McLaren, and night races in 4K. Preview each F1 wallpaper and set it on your Mac.",
    keywords: [
      "f1 live wallpaper",
      "formula 1 wallpaper",
      "f1 wallpaper mac",
      "leclerc wallpaper",
      "ferrari f1 wallpaper",
    ],
    intro:
      "Sunset laps, pit-lane glow, and onboard shots at 300 km/h. The F1 collection gathers Formula 1 loops from the MacWall catalog, including the Charles Leclerc sunset lap that became one of the most-searched wallpapers on the site.",
    patterns: [
      "\\bf1\\b",
      "formula",
      "leclerc",
      "verstappen",
      "hamilton",
      "grand prix",
      "red bull",
      "pit ?lane",
    ],
    category: "Cars",
    faq: {
      question: "Is the Leclerc sunset lap wallpaper available for Mac?",
      answer:
        "Yes. It is part of this collection when listed in the catalog. Open it to preview the loop, then use Set on Mac to apply it with MacWall.",
    },
    related: ["supercars", "football", "jdm", "porsche"],
  }),
  collection({
    slug: "rain",
    name: "Rain",
    group: "moods",
    title: "Rain Live Wallpapers for Mac: Rainy 4K Loops",
    description:
      "Rain live wallpapers for Mac: animated rainy windows, wet city streets, and storm loops in 4K. Calm, focus-friendly motion for your Mac desktop.",
    keywords: [
      "rain live wallpaper",
      "rainy live wallpaper",
      "rain wallpaper mac",
      "rainy window wallpaper",
      "rain animated wallpaper",
    ],
    intro:
      "Rain is the most-used focus wallpaper in the MacWall catalog for a reason: slow, repetitive motion that never demands attention. This collection covers rain on glass, neon streets after a storm, and quiet rainy nights, all muted by default so the only sound is whatever you are listening to.",
    patterns: [
      "\\brain",
      "\\bstorm",
      "thunder",
      "\\bdrizzle\\b",
      "monsoon",
      "umbrella",
    ],
    category: "Nature",
    faq: {
      question: "Are rain live wallpapers good for focus?",
      answer:
        "Slow, low-contrast motion like rain on a window sits in peripheral vision without pulling your eye, which is why many people use rain loops while working.",
    },
    related: ["lofi", "city", "japanese", "forest"],
  }),
  collection({
    slug: "city",
    name: "City",
    group: "moods",
    title: "City Live Wallpapers for Mac: Night Skylines in 4K",
    description:
      "City live wallpapers for Mac: animated night skylines, Tokyo streets, New York aerials, and urban timelapses in 4K. Preview each loop and set it on your Mac.",
    keywords: [
      "city live wallpaper",
      "city wallpaper mac",
      "night city live wallpaper",
      "tokyo live wallpaper",
      "new york wallpaper mac",
    ],
    intro:
      "Traffic trails, blinking skyscrapers, and wet streets under neon. The city collection is the largest mood set in the MacWall catalog, with night skylines from Tokyo to New York and slow aerials that look like a window onto somewhere else.",
    patterns: [
      "\\bcity\\b",
      "cityscape",
      "\\burban\\b",
      "skyline",
      "\\bstreet",
      "\\btokyo\\b",
      "new york",
      "\\bdowntown\\b",
      "\\bmetropolis\\b",
    ],
    exclude: ["nissan skyline", "skyline (?:gt|r3[234])"],
    category: "Dark",
    faq: {
      question: "Is there a New York live wallpaper for Mac?",
      answer:
        "Yes. New York aerials and street loops are part of the city collection, alongside Tokyo and other skylines.",
    },
    related: ["cyberpunk", "rain", "japanese", "lofi"],
  }),
  collection({
    slug: "cyberpunk",
    name: "Cyberpunk",
    group: "moods",
    title: "Cyberpunk Wallpapers for Mac: Neon 4K Live Loops",
    description:
      "Cyberpunk live wallpapers for Mac: animated neon cities, futuristic streets, and synthwave glow in 4K. Preview every cyberpunk wallpaper and set it on your Mac.",
    keywords: [
      "cyberpunk wallpaper",
      "cyberpunk live wallpaper",
      "neon live wallpaper",
      "cyberpunk wallpaper mac",
      "futuristic city wallpaper",
    ],
    intro:
      "Neon signs flickering through rain, holograms over crowded streets, synthwave sunsets. The cyberpunk collection is built for dark-mode desktops, with saturated color at the edges and enough dark space in the middle to keep your icons readable.",
    patterns: [
      "cyberpunk",
      "\\bneon\\b",
      "futuristic",
      "synthwave",
      "\\bhud\\b",
      "blade ?runner",
    ],
    category: "Dark",
    faq: {
      question: "Do neon cyberpunk wallpapers use more power than calm ones?",
      answer:
        "Not meaningfully. Decode cost depends on resolution and frame rate, not on color, and MacWall pauses playback on battery or when a full-screen app covers the desktop.",
    },
    related: ["city", "hacker", "rain", "space"],
  }),
  collection({
    slug: "japanese",
    name: "Japanese",
    group: "moods",
    title: "Japanese Live Wallpapers for Mac: Torii, Sakura & Shrines",
    description:
      "Japanese live wallpapers for Mac: animated torii gates, sakura blossoms, shrines, and lantern-lit streets in 4K. Calm, cinematic loops for your Mac desktop.",
    keywords: [
      "japanese live wallpaper",
      "torii gate wallpaper",
      "sakura live wallpaper",
      "japan wallpaper mac",
      "japanese aesthetic wallpaper",
    ],
    intro:
      "Torii gates in the mist, cherry blossoms drifting past a shrine, paper lanterns along a rainy alley. The Japanese collection is one of the calmest sets in the catalog, and a favourite for people who want motion that feels more like weather than animation.",
    patterns: [
      "japan",
      "\\btorii\\b",
      "\\bshrine\\b",
      "\\bsakura\\b",
      "cherry blossom",
      "\\blantern",
      "\\bkyoto\\b",
      "\\bfuji\\b",
      "\\btemple\\b",
    ],
    category: "Nature",
    faq: {
      question: "Are there torii gate wallpapers in the collection?",
      answer:
        "Yes. Torii gates are one of the most common scenes in the Japanese collection, along with sakura, shrines, and lantern-lit streets.",
    },
    related: ["samurai", "rain", "lofi", "forest"],
  }),
  collection({
    slug: "samurai",
    name: "Samurai",
    group: "moods",
    title: "Samurai Live Wallpapers for Mac: Katana & Ronin 4K Loops",
    description:
      "Samurai live wallpapers for Mac: animated ronin, katana duels, and Vagabond-style ink scenes in 4K. Preview each samurai wallpaper and set it on your Mac.",
    keywords: [
      "samurai live wallpaper",
      "samurai wallpaper mac",
      "katana wallpaper",
      "ronin wallpaper 4k",
      "vagabond wallpaper",
    ],
    intro:
      "A lone ronin in falling snow, a katana catching moonlight, ink-wash duels in the style of Vagabond. The samurai collection leans dark and cinematic, perfect for a focused desktop with a bit of edge.",
    patterns: [
      "samurai",
      "katana",
      "\\bronin\\b",
      "vagabond",
      "\\bshogun\\b",
      "musashi",
    ],
    category: "Anime",
    faq: {
      question: "Do samurai wallpapers work on the Lock Screen?",
      answer: `Yes. With MacWall Pro on ${macwallLockScreenMacOSVersion} or later, any samurai loop can also play on your Lock Screen and as a Screen Saver.`,
    },
    related: ["japanese", "demon-slayer", "naruto", "dark-fantasy"],
  }),
  collection({
    slug: "lofi",
    name: "Lofi",
    group: "moods",
    title: "Lofi Live Wallpapers for Mac: Cozy Study Loops",
    description:
      "Lofi live wallpapers for Mac: cozy animated study rooms, cafés, and rainy windows in 4K. Calm, focus-friendly motion for studying and deep work on your Mac.",
    keywords: [
      "lofi wallpaper",
      "lofi live wallpaper",
      "cozy live wallpaper",
      "study wallpaper mac",
      "aesthetic live wallpaper",
    ],
    intro:
      "Warm desk lamps, a cat asleep by the window, rain outside a café. The lofi collection is made for study sessions and long work blocks: soft palettes, slow loops, and nothing that flashes. Pair one with your favourite beats playlist and MacWall's Music Sync.",
    patterns: [
      "lo-?fi",
      "\\bcozy\\b",
      "\\bcafe\\b",
      "\\bcoffee\\b",
      "\\bstudy",
      "\\bbedroom\\b",
      "\\bchill\\b",
    ],
    category: "Others",
    faq: {
      question: "Can a lofi wallpaper react to my music?",
      answer:
        "MacWall's Music Sync adds album-art gradients from Apple Music and Spotify. The lofi loops themselves are silent videos, so your own music stays in charge.",
    },
    related: ["rain", "japanese", "city", "forest"],
  }),
  collection({
    slug: "sunset",
    name: "Sunset",
    group: "moods",
    title: "Sunset Live Wallpapers for Mac: Golden Hour 4K Loops",
    description:
      "Sunset live wallpapers for Mac: animated golden hour skies, dusk horizons, and ocean sunsets in 4K. Warm, calm motion for your Mac desktop.",
    keywords: [
      "sunset live wallpaper",
      "sunset wallpaper mac",
      "golden hour wallpaper",
      "aesthetic sunset wallpaper",
      "dusk live wallpaper",
    ],
    intro:
      "Golden hour, stretched into a loop. The sunset collection gathers warm skies, dusk horizons, and silhouettes against the last light of the day. They are some of the most readable wallpapers in the catalog, because the bright sky sits above where your icons usually live.",
    patterns: [
      "sunset",
      "\\bdusk\\b",
      "golden hour",
      "sunrise",
      "\\bsundown\\b",
      "afterglow",
    ],
    category: "Nature",
    faq: {
      question: "Do sunset wallpapers change with the time of day?",
      answer:
        "These are video loops, not time-shifting dynamic wallpapers. For the difference, see dynamic wallpaper vs live wallpaper on the MacWall blog.",
    },
    related: ["ocean", "forest", "city", "japanese"],
  }),
  collection({
    slug: "forest",
    name: "Forest",
    group: "moods",
    title: "Forest Live Wallpapers for Mac: Nature 4K Loops",
    description:
      "Forest live wallpapers for Mac: animated misty woods, sunlit trees, and mountain forests in 4K. Calm nature motion for your Mac desktop, hardware decoded.",
    keywords: [
      "forest live wallpaper",
      "forest wallpaper mac",
      "nature live wallpaper",
      "misty forest wallpaper",
      "woods live wallpaper",
    ],
    intro:
      "Mist rolling between pines, light breaking through leaves, a stream moving through moss. The forest collection is pure nature motion, the closest thing to leaving a window open on your desk.",
    patterns: [
      "\\bforest",
      "\\bwoods\\b",
      "\\btrees?\\b",
      "\\bpine",
      "\\bjungle\\b",
      "\\bmoss",
    ],
    category: "Nature",
    faq: {
      question: "What is the best nature live wallpaper for a MacBook Air?",
      answer:
        "Any forest loop in this collection runs well on a MacBook Air. MacWall decodes video in hardware and pauses on battery by default, so fanless Macs stay cool.",
    },
    related: ["rain", "snow", "sunset", "japanese"],
  }),
  collection({
    slug: "snow",
    name: "Snow",
    group: "moods",
    title: "Snow Live Wallpapers for Mac: Winter 4K Loops",
    description:
      "Snow live wallpapers for Mac: animated snowfall, winter cabins, and frozen mountains in 4K. Quiet, seasonal motion for your Mac desktop.",
    keywords: [
      "snow live wallpaper",
      "winter live wallpaper",
      "snowfall wallpaper mac",
      "christmas live wallpaper mac",
      "cozy winter wallpaper",
    ],
    intro:
      "Slow snowfall over a cabin, a frozen lake at dusk, mountains in a blizzard. The snow collection is the seasonal favourite in the MacWall catalog, calm enough to leave running all winter.",
    patterns: [
      "\\bsnow",
      "\\bwinter\\b",
      "\\bblizzard\\b",
      "\\bfrozen\\b",
      "\\bcabin\\b",
      "christmas",
    ],
    category: "Nature",
    faq: {
      question: "Is there a Christmas or winter live wallpaper for Mac?",
      answer:
        "Yes. Snowfall, winter cabins, and holiday scenes are grouped here and update as new seasonal loops are added.",
    },
    related: ["forest", "rain", "japanese", "lofi"],
  }),
  collection({
    slug: "ocean",
    name: "Ocean",
    group: "moods",
    title: "Ocean Live Wallpapers for Mac: Waves & Beaches in 4K",
    description:
      "Ocean live wallpapers for Mac: animated waves, beaches, underwater scenes, and sea horizons in 4K. Calm, cinematic motion for your Mac desktop.",
    keywords: [
      "ocean wallpaper",
      "ocean live wallpaper",
      "beach live wallpaper",
      "waves wallpaper mac",
      "underwater live wallpaper",
    ],
    intro:
      "Waves rolling onto sand, light filtering down through water, a calm horizon at dusk. The ocean collection gathers every sea loop in the catalog, and water is one of the easiest subjects to loop seamlessly, so these are some of the smoothest wallpapers MacWall offers.",
    patterns: [
      "\\bocean",
      "\\bsea\\b",
      "\\bbeach",
      "\\bwaves?\\b",
      "underwater",
      "\\bcoast",
      "\\bshore",
    ],
    category: "Nature",
    faq: {
      question: "Do ocean live wallpapers loop seamlessly?",
      answer:
        "Water is one of the easiest subjects to loop cleanly, and MacWall catalog loops are cut so the last frame flows into the first without a visible jump.",
    },
    related: ["sunset", "forest", "galaxy", "rain"],
  }),
  collection({
    slug: "galaxy",
    name: "Galaxy",
    group: "space",
    title: "Galaxy Live Wallpapers for Mac: Nebula & Stars in 4K",
    description:
      "Galaxy live wallpapers for Mac: animated nebulae, star fields, the Milky Way, and cosmic clouds in 4K. Deep-space motion for your Mac desktop.",
    keywords: [
      "galaxy wallpaper",
      "galaxy live wallpaper",
      "nebula live wallpaper",
      "space live wallpaper",
      "milky way wallpaper mac",
    ],
    intro:
      "Slow-turning nebulae, star fields drifting past, the Milky Way over a quiet horizon. Galaxy loops are mostly black with points of light, which makes them among the most battery-friendly and readable wallpapers in the catalog.",
    patterns: [
      "galaxy",
      "nebula",
      "\\bcosmic\\b",
      "\\bcosmos\\b",
      "\\bstars\\b",
      "starfield",
      "milky ?way",
      "\\bplanet",
    ],
    category: "Space",
    faq: {
      question: "Are galaxy wallpapers good for OLED or mini-LED MacBooks?",
      answer:
        "Mostly-black galaxy loops look especially deep on mini-LED MacBook Pro displays, and the dark frame keeps desktop icons easy to read.",
    },
    related: ["black-hole", "ocean", "cyberpunk", "sunset"],
  }),
  collection({
    slug: "black-hole",
    name: "Black Hole",
    group: "space",
    title: "Black Hole Live Wallpapers for Mac: Gargantua in 4K",
    description:
      "Black hole live wallpapers for Mac: animated Gargantua, accretion disks, and singularities in 4K. Interstellar-style space motion for your Mac desktop.",
    keywords: [
      "black hole live wallpaper",
      "black hole wallpaper mac",
      "gargantua wallpaper",
      "interstellar live wallpaper",
      "accretion disk wallpaper",
    ],
    intro:
      "A glowing accretion disk bending light around a perfect black circle. Black hole loops are some of the most dramatic wallpapers in the MacWall catalog, and the Interstellar-style Gargantua scenes are a staff favourite for the MacWall blog art.",
    patterns: [
      "black.?hole",
      "singularity",
      "accretion",
      "gargantua",
      "event horizon",
      "interstellar",
      "wormhole",
    ],
    category: "Space",
    faq: {
      question: "Is there an Interstellar Gargantua live wallpaper for Mac?",
      answer:
        "Yes. Gargantua-style black hole loops are included in this collection. Open one to preview the motion before setting it.",
    },
    related: ["galaxy", "cyberpunk", "hacker", "ocean"],
  }),
  collection({
    slug: "hacker",
    name: "Hacker",
    group: "moods",
    title: "Hacker & Code Live Wallpapers for Mac: Matrix-Style Loops",
    description:
      "Hacker live wallpapers for Mac: animated code rain, Matrix-style terminals, binary streams, and HUD loops in 4K. Developer-friendly motion for your Mac desktop.",
    keywords: [
      "hacker live wallpaper",
      "matrix live wallpaper",
      "code wallpaper mac",
      "programming wallpaper 4k",
      "terminal wallpaper mac",
    ],
    intro:
      "Falling green glyphs, scrolling terminals, HUD overlays, and binary streams. The hacker collection is built for developers who want their desktop to look like the work they do, without the distraction of anything too bright.",
    patterns: [
      "\\bcode\\b",
      "coding",
      "hacker",
      "\\bmatrix\\b",
      "\\bbinary\\b",
      "terminal",
      "\\bhud\\b",
      "anonymous",
      "programming",
    ],
    category: "Dark",
    faq: {
      question: "Do hacker wallpapers slow down Xcode or builds?",
      answer:
        "No meaningful impact. MacWall decodes video on the media engine rather than the CPU and can auto-pause when system load spikes, so compile times stay the same.",
    },
    related: ["cyberpunk", "black-hole", "city", "galaxy"],
  }),
  collection({
    slug: "dark-fantasy",
    name: "Dark Fantasy",
    group: "moods",
    title: "Dark Fantasy Live Wallpapers for Mac: 4K Loops",
    description:
      "Dark fantasy live wallpapers for Mac: animated knights, dragons, gothic castles, and moonlit battlefields in 4K. Cinematic motion for dark-mode desktops.",
    keywords: [
      "dark fantasy live wallpaper",
      "fantasy live wallpaper",
      "dragon live wallpaper",
      "knight wallpaper mac",
      "elden ring wallpaper",
    ],
    intro:
      "Knights under a blood moon, dragons circling a ruined castle, lanterns in a haunted forest. The dark fantasy collection leans cinematic and moody, the desktop equivalent of a boss-fight loading screen.",
    patterns: [
      "dark fantasy",
      "\\bdragon\\b(?! ?ball)",
      "\\bknight\\b",
      "\\bcastle\\b",
      "elden ring",
      "dark souls",
      "\\bberserk\\b",
      "\\bguts\\b",
      "\\bgothic\\b",
      "\\belf\\b",
      "plague doctor",
    ],
    exclude: ["dragon ?ball", "\\bgoku\\b", "disney"],
    category: "Others",
    faq: {
      question: "Are there Elden Ring or dragon wallpapers?",
      answer:
        "Dragons, knights, and souls-like scenes are grouped here whenever they are in the catalog, and the page updates as new fantasy loops are published.",
    },
    related: ["samurai", "black-hole", "batman", "japanese"],
  }),
  // Second wave, from the Semrush competitor gap (wallsflow/wallspace) and
  // head terms with low difficulty: "purple wallpaper" 22.2k (KD 16), "red
  // wallpaper" 12.1k (KD 13), "miles morales wallpaper" 8.1k, "lamborghini
  // wallpaper" 6.6k, "sukuna wallpaper" 6.6k.
  collection({
    slug: "miles-morales",
    name: "Miles Morales",
    group: "heroes",
    title: "Miles Morales Wallpapers for Mac: 4K Spider-Verse Loops",
    description:
      "Miles Morales live wallpapers for Mac: animated Spider-Verse loops of Miles swinging, glitching, and posing in the rain, in 4K for your Mac desktop.",
    keywords: [
      "miles morales wallpaper",
      "miles morales live wallpaper",
      "spider verse wallpaper",
      "miles morales wallpaper 4k",
      "miles morales wallpaper mac",
    ],
    intro:
      "Glitch effects, halftone color, and a hoodie in the rain: Miles Morales loops carry the Spider-Verse art style better than any still. This collection gathers every Miles and Spider-Verse wallpaper in the MacWall catalog, from quiet winter streets to full-speed swings.",
    patterns: ["miles morales", "spider[- ]?verse"],
    category: "Heroes",
    faq: {
      question: "Are these Miles Morales wallpapers animated?",
      answer:
        "Yes. Each one is a looping video in the Spider-Verse style, played as your desktop wallpaper by MacWall with hardware decoding.",
    },
    related: ["spider-man", "marvel", "cyberpunk", "city"],
  }),
  collection({
    slug: "sukuna",
    name: "Sukuna",
    group: "anime",
    title: "Sukuna Wallpapers for Mac: 4K Live Jujutsu Kaisen Loops",
    description:
      "Ryomen Sukuna live wallpapers for Mac: animated Malevolent Shrine, Fuga flames, and Gojo vs Sukuna domain clashes in 4K for your Mac desktop.",
    keywords: [
      "sukuna wallpaper",
      "sukuna live wallpaper",
      "sukuna 4k wallpaper",
      "ryomen sukuna wallpaper",
      "sukuna wallpaper mac",
    ],
    intro:
      "The King of Curses deserves motion. These Sukuna loops cover crimson cursed energy, Fuga flames, and the Gojo vs Sukuna domain clash, cut to repeat cleanly behind your windows.",
    patterns: ["\\bsukuna\\b", "malevolent shrine"],
    category: "Anime",
    faq: {
      question: "Is there a Gojo vs Sukuna live wallpaper?",
      answer:
        "Yes, the domain clash loop is part of this collection when it is in the catalog. Open it to preview the motion, then set it with MacWall.",
    },
    related: ["jujutsu-kaisen", "gojo", "itachi", "red"],
  }),
  collection({
    slug: "itachi",
    name: "Itachi",
    group: "anime",
    title: "Itachi Wallpapers for Mac: 4K Live Sharingan Loops",
    description:
      "Itachi Uchiha live wallpapers for Mac: animated Sharingan, red moon, and crimson forest loops in 4K. Preview each Itachi wallpaper and set it on your Mac.",
    keywords: [
      "itachi wallpaper",
      "itachi live wallpaper",
      "itachi uchiha wallpaper",
      "itachi 4k wallpaper",
      "sharingan wallpaper",
    ],
    intro:
      "A spinning Sharingan, a silhouette against the red moon, crows scattering through a crimson forest. The Itachi collection is small and dark, which makes it one of the most readable anime sets for a dark-mode desktop.",
    patterns: ["\\bitachi\\b"],
    category: "Anime",
    faq: {
      question: "Do Itachi wallpapers work in dark mode?",
      answer:
        "Yes. The Itachi loops are mostly dark with red accents, so icons and menu bar text stay easy to read.",
    },
    related: ["naruto", "sukuna", "red", "moon"],
  }),
  collection({
    slug: "anime-girl",
    name: "Anime Girl",
    group: "anime",
    title: "Anime Girl Wallpapers for Mac: 4K Live & Aesthetic",
    description:
      "Anime girl live wallpapers for Mac: aesthetic animated loops of anime girls in rain, neon cities, and quiet rooms, in 4K for your Mac desktop.",
    keywords: [
      "anime girl wallpaper",
      "anime girl live wallpaper",
      "aesthetic anime girl wallpaper",
      "anime girl wallpaper 4k",
      "anime girl wallpaper mac",
    ],
    intro:
      "Rain on a car window, a neon street at night, a quiet room with the lights low. The anime girl collection is one of the largest in the MacWall catalog, mostly calm, atmospheric loops rather than action scenes.",
    patterns: ["anime girl", "\\bgirl\\b", "waifu"],
    category: "Anime",
    faq: {
      question: "Are the anime girl wallpapers safe for work?",
      answer:
        "The catalog is moderated for a general audience. If any wallpaper looks out of place, report it from its detail page and the team reviews it.",
    },
    related: ["lofi", "rain", "japanese", "purple"],
  }),
  collection({
    slug: "lamborghini",
    name: "Lamborghini",
    group: "cars",
    title: "Lamborghini Wallpapers for Mac: 4K Live Aventador Loops",
    description:
      "Lamborghini live wallpapers for Mac: animated Aventador, Huracán, Urus, and Diablo loops in 4K. Preview every Lamborghini wallpaper and set it on your Mac.",
    keywords: [
      "lamborghini wallpaper",
      "lamborghini live wallpaper",
      "aventador wallpaper",
      "lamborghini wallpaper 4k",
      "lamborghini wallpaper mac",
    ],
    intro:
      "Aventadors in dark garages, a Diablo under green neon, an Urus climbing a mountain road. The Lamborghini collection gathers every raging bull in the MacWall catalog as a seamless 4K loop.",
    patterns: [
      "lamborghini",
      "\\blambo\\b",
      "aventador",
      "hurac[aá]n",
      "revuelto",
      "\\burus\\b",
    ],
    category: "Cars",
    faq: {
      question: "Which Lamborghini models are included?",
      answer:
        "Mostly Aventador loops, plus Huracán, Urus, and Diablo when they are in the catalog. The page updates automatically as new ones are published.",
    },
    related: ["supercars", "ferrari", "mclaren", "porsche"],
  }),
  collection({
    slug: "ferrari",
    name: "Ferrari",
    group: "cars",
    title: "Ferrari Wallpapers for Mac: 4K Live F1 & Road Car Loops",
    description:
      "Ferrari live wallpapers for Mac: animated F40, 812 Superfast, 458, and Scuderia Ferrari F1 loops in 4K. Preview each one and set it on your Mac desktop.",
    keywords: [
      "ferrari wallpaper",
      "ferrari live wallpaper",
      "ferrari f1 wallpaper",
      "ferrari wallpaper 4k",
      "ferrari wallpaper mac",
    ],
    intro:
      "Rosso Corsa in motion: an F40 on a night run, an 812 Superfast in a tunnel, the latest Scuderia Ferrari car on track. This collection covers both Ferrari road cars and Formula 1 loops.",
    patterns: ["ferrari", "scuderia", "\\bf40\\b", "\\b458\\b", "\\b812\\b"],
    category: "Cars",
    faq: {
      question: "Are there Ferrari F1 live wallpapers?",
      answer:
        "Yes. Scuderia Ferrari F1 loops sit alongside the road cars here. For every team, see the F1 collection.",
    },
    related: ["f1", "lamborghini", "mclaren", "supercars"],
  }),
  collection({
    slug: "mclaren",
    name: "McLaren",
    group: "cars",
    title: "McLaren Wallpapers for Mac: 4K Live P1 & 720S Loops",
    description:
      "McLaren live wallpapers for Mac: animated P1, 720S, and McLaren F1 loops in 4K, from sunset drives to foggy garages. Set any one on your Mac desktop.",
    keywords: [
      "mclaren wallpaper",
      "mclaren p1 wallpaper",
      "mclaren live wallpaper",
      "mclaren f1 wallpaper",
      "mclaren wallpaper 4k",
    ],
    intro:
      "Papaya orange at sunset, a P1 under gas station lights, a 720S on a mountain road. The McLaren collection mixes hypercars and Formula 1, and the McLaren P1 loops are among the most searched car wallpapers on MacWall.",
    patterns: ["mclaren", "\\bp1\\b", "\\b720s\\b"],
    category: "Cars",
    faq: {
      question: "Is there a McLaren P1 live wallpaper for Mac?",
      answer:
        "Yes, several. Open any McLaren P1 loop on this page to preview it, then use Set on Mac to apply it with MacWall.",
    },
    related: ["supercars", "f1", "lamborghini", "ferrari"],
  }),
  collection({
    slug: "mercedes-amg",
    name: "Mercedes-AMG",
    group: "cars",
    title: "Mercedes-AMG Wallpapers for Mac: 4K Live Loops",
    description:
      "Mercedes-AMG live wallpapers for Mac: animated C63, G63, drifting AMGs, and Mercedes F1 garage loops in 4K. Set any one on your Mac desktop.",
    keywords: [
      "mercedes amg wallpaper",
      "mercedes wallpaper",
      "amg live wallpaper",
      "g63 wallpaper",
      "mercedes f1 wallpaper",
    ],
    intro:
      "A G63 in the city, a C63 coupe sliding sideways, the Silver Arrows in the pit garage. The Mercedes-AMG collection covers road cars and Mercedes F1 in one place.",
    patterns: ["mercedes", "\\bamg\\b", "\\bg ?63\\b", "\\bc ?63\\b"],
    category: "Cars",
    faq: {
      question: "Does the Mercedes collection include F1 cars?",
      answer:
        "Yes. Mercedes F1 garage and pit-lane loops are included with the AMG road cars.",
    },
    related: ["bmw", "f1", "porsche", "supercars"],
  }),
  collection({
    slug: "moon",
    name: "Moon",
    group: "space",
    title: "Moon Live Wallpapers for Mac: Moonlit 4K Loops",
    description:
      "Moon live wallpapers for Mac: animated full moons, blood moons, eclipses, and moonlit landscapes in 4K. Calm night-time motion for your Mac desktop.",
    keywords: [
      "moon wallpaper",
      "moon live wallpaper",
      "moonlight wallpaper",
      "blood moon wallpaper",
      "moon wallpaper mac",
    ],
    intro:
      "A full moon over still water, a blood moon behind a silhouette, clouds sliding across a crescent. Moon loops are dark, slow, and quiet, which makes them some of the easiest wallpapers to live with all day.",
    patterns: ["\\bmoon", "lunar", "eclipse"],
    exclude: ["moon knight"],
    category: "Space",
    faq: {
      question: "Are moon wallpapers good for dark mode?",
      answer:
        "Yes. Most of the frame is night sky, so menu bar text and desktop icons stay readable and the loop blends with macOS dark mode.",
    },
    related: ["galaxy", "black", "japanese", "itachi"],
  }),
  collection({
    slug: "mountain",
    name: "Mountain",
    group: "moods",
    title: "Mountain Live Wallpapers for Mac: 4K Peaks & Lakes",
    description:
      "Mountain live wallpapers for Mac: animated snowy peaks, mountain lakes, and alpine roads in 4K. Calm, cinematic landscape motion for your Mac desktop.",
    keywords: [
      "mountain wallpaper",
      "mountain live wallpaper",
      "mountain wallpaper mac",
      "snowy mountain wallpaper",
      "landscape live wallpaper",
    ],
    intro:
      "An eagle over snowy ridges, a stag at a blue mountain lake, clouds crossing a dark citadel. The mountain collection is the landscape set for people who want scale and stillness on their desktop.",
    patterns: [
      "mountain",
      "\\bpeaks?\\b",
      "\\balps\\b",
      "himalaya",
      "\\bsummit\\b",
    ],
    category: "Nature",
    faq: {
      question: "Do mountain wallpapers look good on an iMac?",
      answer:
        "Wide landscape loops suit large 16:9 displays like the iMac and Studio Display. MacWall scales each loop to fill the screen.",
    },
    related: ["forest", "snow", "sunset", "ocean"],
  }),
  collection({
    slug: "cat",
    name: "Cat",
    group: "moods",
    title: "Cat Live Wallpapers for Mac: Cozy Animated Cats in 4K",
    description:
      "Cat live wallpapers for Mac: animated cats watching the sky, sleeping in cozy rooms, and wandering moonlit streets. Calm 4K loops for your Mac desktop.",
    keywords: [
      "cat wallpaper",
      "cat live wallpaper",
      "cute cat wallpaper mac",
      "black cat wallpaper",
      "cozy cat wallpaper",
    ],
    intro:
      "A black cat by moonlit water, a cat watching a shooting star, one asleep in a cozy study room. The cat collection is small, soft, and very easy to leave running all day.",
    patterns: ["\\bcats?\\b", "kitten", "kitty"],
    category: "Others",
    faq: {
      question: "Are there cute cat live wallpapers for Mac?",
      answer:
        "Yes. The cat collection leans cozy: sleeping cats, window-watching cats, and moonlit night scenes, all as smooth video loops.",
    },
    related: ["lofi", "rain", "moon", "anime-girl"],
  }),
  collection({
    slug: "purple",
    name: "Purple",
    group: "colors",
    title: "Purple Wallpapers for Mac: 4K Live & Aesthetic",
    description:
      "Purple live wallpapers for Mac: aesthetic violet nebulae, neon portraits, and purple night skies in 4K. Animated purple backgrounds for your Mac desktop.",
    keywords: [
      "purple wallpaper",
      "purple aesthetic wallpaper",
      "purple live wallpaper",
      "purple wallpaper mac",
      "violet wallpaper 4k",
    ],
    intro:
      "Violet nebulae, neon portraits, purple moonlit clouds. The purple collection gathers every loop in the catalog where purple leads the palette, and it pairs well with the purple accent color in macOS settings.",
    patterns: ["purple", "violet", "lavender", "magenta"],
    category: "Abstract",
    faq: {
      question: "Can I match my Mac accent color to a purple wallpaper?",
      answer:
        "Yes. Set a purple loop with MacWall, then choose Purple under System Settings > Appearance > Accent color for a matching interface.",
    },
    related: ["blue", "galaxy", "cyberpunk", "anime-girl"],
  }),
  collection({
    slug: "red",
    name: "Red",
    group: "colors",
    title: "Red Wallpapers for Mac: 4K Live & Dark Red Loops",
    description:
      "Red live wallpapers for Mac: crimson skies, red moons, Sharingan eyes, and red neon in 4K. Dark, dramatic animated red backgrounds for your Mac desktop.",
    keywords: [
      "red wallpaper",
      "dark red wallpaper",
      "red aesthetic wallpaper",
      "red live wallpaper",
      "crimson wallpaper",
    ],
    intro:
      "Crimson moonlit skies, red neon reflections, glowing Sharingan eyes. The red collection is the most dramatic color set in the catalog, mostly dark frames with red light, so it stays readable behind your windows.",
    patterns: ["\\bred\\b", "crimson", "scarlet"],
    exclude: ["red dead", "red bull"],
    category: "Dark",
    faq: {
      question: "Is a dark red wallpaper hard on the eyes?",
      answer:
        "Most loops in this collection are dark with red accents rather than solid red, which keeps brightness low. MacWall also pauses playback when a full-screen app is in front.",
    },
    related: ["black", "itachi", "sukuna", "moon"],
  }),
  collection({
    slug: "black",
    name: "Black",
    group: "colors",
    title: "Black Wallpapers for Mac: 4K Live Dark & Monochrome",
    description:
      "Black live wallpapers for Mac: animated monochrome portraits, black holes, and pitch-dark scenes in 4K. Minimal dark backgrounds that suit macOS dark mode.",
    keywords: [
      "black wallpaper",
      "black aesthetic wallpaper",
      "dark wallpaper mac",
      "black live wallpaper",
      "monochrome wallpaper",
    ],
    intro:
      "Monochrome portraits, silhouettes, black holes, and near-black scenes with a single point of light. The black collection is the minimal end of the catalog, built for dark mode and for desktops full of icons.",
    patterns: ["\\bblack\\b", "monochrome", "amoled", "\\bnoir\\b"],
    exclude: ["black panther"],
    category: "Dark",
    faq: {
      question: "Do black live wallpapers save battery on a MacBook?",
      answer:
        "MacBook panels are LCD or mini-LED, so black pixels save a little on mini-LED MacBook Pro and little on LCD. The bigger saving is MacWall pausing playback on battery.",
    },
    related: ["red", "moon", "black-hole", "hacker"],
  }),
  collection({
    slug: "blue",
    name: "Blue",
    group: "colors",
    title: "Blue Wallpapers for Mac: 4K Live & Aesthetic Loops",
    description:
      "Blue live wallpapers for Mac: animated blue oceans, nebulae, code rain, and blue-hour cities in 4K. Calm, cool-toned motion for your Mac desktop.",
    keywords: [
      "blue wallpaper",
      "blue aesthetic wallpaper",
      "dark blue wallpaper",
      "blue live wallpaper",
      "blue wallpaper mac",
    ],
    intro:
      "Deep ocean blue, blue-hour skylines, cyan code rain, and nebula drift. Blue is the calmest color set in the catalog and the default favourite for people who want motion without distraction.",
    patterns: ["\\bblue\\b", "azure", "\\bcyan\\b"],
    exclude: ["blue archive", "blue lock"],
    category: "Abstract",
    faq: {
      question: "Why are blue wallpapers popular for work?",
      answer:
        "Cool, low-contrast colors sit comfortably in peripheral vision, so a blue loop adds motion without competing with the windows you are working in.",
    },
    related: ["ocean", "purple", "galaxy", "hacker"],
  }),
]

const collectionBySlug = new Map(
  wallpaperCollections.map((entry) => [entry.slug, entry])
)

export function getWallpaperCollection(
  slug: string
): WallpaperCollection | undefined {
  return collectionBySlug.get(slug)
}

export function wallpaperCollectionPath(slug: string): string {
  return `/wallpapers/collections/${slug}`
}

export const WALLPAPER_COLLECTIONS_HUB_PATH = "/wallpapers/collections" as const

type MatchableWallpaper = { name: string; tags: readonly string[] }

type CompiledCollection = { include: RegExp[]; exclude: RegExp[] }

const compiledPatterns = new Map<string, CompiledCollection>()

function patternsFor(entry: WallpaperCollection): CompiledCollection {
  let compiled = compiledPatterns.get(entry.slug)
  if (!compiled) {
    compiled = {
      include: entry.patterns.map((source) => new RegExp(source, "i")),
      exclude: (entry.exclude ?? []).map((source) => new RegExp(source, "i")),
    }
    compiledPatterns.set(entry.slug, compiled)
  }
  return compiled
}

export function wallpaperMatchesCollection(
  wallpaper: MatchableWallpaper,
  entry: WallpaperCollection
): boolean {
  // Tags are often hyphenated slugs ("spider-man"); match them as words.
  const haystacks = [
    wallpaper.name,
    ...wallpaper.tags.map((tag) => tag.replace(/-/g, " ")),
  ]
  const { include, exclude } = patternsFor(entry)
  const hit = (pattern: RegExp) => haystacks.some((text) => pattern.test(text))
  return include.some(hit) && !exclude.some(hit)
}

/**
 * Collections a single wallpaper belongs to. Topics named in the wallpaper's
 * own title come before tag-only matches, so "Leclerc Sunset Lap" leads with
 * F1 rather than Supercars (which it only reaches through a "ferrari" tag).
 */
export function collectionsForWallpaper(
  wallpaper: MatchableWallpaper
): WallpaperCollection[] {
  const matches = wallpaperCollections.filter((entry) =>
    wallpaperMatchesCollection(wallpaper, entry)
  )
  const byName = (entry: WallpaperCollection) =>
    wallpaperMatchesCollection({ name: wallpaper.name, tags: [] }, entry)
  return [
    ...matches.filter(byName),
    ...matches.filter((entry) => !byName(entry)),
  ]
}

/** Shared FAQ for every collection page, with the topic-specific entry first. */
export function collectionFaq(
  entry: WallpaperCollection,
  count: number
): ContentFaq[] {
  const topic = entry.name
  return [
    entry.faq,
    {
      question: `How do I set a ${topic} live wallpaper on my Mac?`,
      answer: `Download ${macwall.name}, open any ${topic} wallpaper on this page, and choose Set on Mac. The app opens that wallpaper and applies it to your desktop. You can also find it inside the app by searching for "${topic}".`,
    },
    {
      question: `How many ${topic} wallpapers are there?`,
      answer: `${count} ${topic} ${count === 1 ? "wallpaper is" : "wallpapers are"} in the ${macwall.name} catalog right now, and the list updates automatically as the community publishes new loops.`,
    },
    {
      question: `Do ${topic} live wallpapers work on MacBook Air and MacBook Pro?`,
      answer: `Yes. ${macwall.name} runs on Apple Silicon and Intel Macs with macOS 15 or later, decodes video in hardware, and pauses automatically on battery and in full-screen apps.`,
    },
  ]
}
