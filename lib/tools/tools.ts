import type {
  ContentBlock,
  ContentFaq,
  SeoContentPage,
} from "@/lib/content/types"
import { macwall } from "@/lib/macwall-site"
import {
  DISPLAY_PAGES_PATH,
  displayPageDefs,
  displayPagePath,
  MACBOOK_HUB_PATH,
} from "@/lib/seo/display-pages"
import {
  accessedLabel,
  displayResolutionLabel,
  MAC_DISPLAY_SPECS_ACCESSED,
  macDisplayPagePath,
  macDisplaySources,
  macDisplays,
} from "@/lib/seo/mac-displays"
import {
  wallpaperCollectionPath,
  wallpaperCollections,
  type WallpaperCollection,
} from "@/lib/seo/wallpaper-collections"

/**
 * Free browser tools at /tools. Every tool runs on the visitor's Mac in the
 * browser: images are read with FileReader and drawn to a canvas, nothing is
 * uploaded. Resolutions come from Apple's tech specs (lib/seo/mac-displays.ts).
 */

export type ToolFact = { label: string; value: string }
export type ToolStep = { title: string; body: string }

export type ToolPage = SeoContentPage & {
  /** Name in lists and the breadcrumb. */
  name: string
  /** One line under the name in the tools list. */
  summary: string
  /** Sentence under the page title. */
  line: string
  /** Heading of the short-answer section. */
  question: string
  answer: string
  facts: ToolFact[]
  steps: ToolStep[]
  faq: ContentFaq[]
}

export const TOOLS_HUB_PATH = "/tools"

const appleSources = macDisplaySources().map(
  (source) =>
    `[${source.name}](${source.url}), Apple, accessed ${accessedLabel(source.accessed)}`
)

/** Wallpaper pages per screen, linked from the resizer and resolution tools. */
export const TOOL_DISPLAY_LINKS: readonly { href: string; label: string }[] = [
  { href: MACBOOK_HUB_PATH, label: "Every MacBook" },
  ...displayPageDefs.map((def) => ({
    href: displayPagePath(def.slug),
    label: def.label,
  })),
  { href: DISPLAY_PAGES_PATH, label: "All Mac displays" },
]

export type ColorCollectionLink = {
  href: string
  name: string
  /**
   * Colour words that put an image in this collection: the hues of its
   * palette rule, the light tones for a light collection, or its own name.
   */
  words: string[]
}

const LIGHT_COLOR_WORDS = ["white", "off-white", "light grey"]

function colorWordsFor(entry: WallpaperCollection): string[] {
  // Read defensively: not every collection has a palette rule.
  const rule = (
    entry as { palette?: { kind?: string; hues?: readonly string[] } }
  ).palette
  if (rule?.kind === "hue" && rule.hues?.length) return [...rule.hues]
  if (rule?.kind === "light") return LIGHT_COLOR_WORDS
  return [entry.name.toLowerCase()]
}

/**
 * The colour collections (/wallpapers/collections/{colour}) the palette tool
 * links to: written ones only, so a collection still being drafted never
 * gets a link.
 */
export const TOOL_COLOR_COLLECTIONS: readonly ColorCollectionLink[] =
  wallpaperCollections
    .filter(
      (entry) =>
        entry.group === "colors" &&
        entry.description.trim().length > 0 &&
        entry.intro.trim().length > 0
    )
    .map((entry) => ({
      href: wallpaperCollectionPath(entry.slug),
      name: entry.name,
      words: colorWordsFor(entry),
    }))

const resolutionList = macDisplays
  .filter((d) => d.current)
  .map(
    (d) => `${d.shortName.replace("″", "-inch")} ${displayResolutionLabel(d)}`
  )
  .join(", ")

const resizer: ToolPage = {
  slug: "wallpaper-resizer",
  pathname: "/tools/wallpaper-resizer",
  name: "Wallpaper resizer",
  summary: "Crop any image to your Mac's exact screen size",
  title: "Mac Wallpaper Resizer: Crop to Any Mac Screen",
  headline: "Mac wallpaper resizer",
  description:
    "Crop and resize any image to the native resolution of your MacBook Air, MacBook Pro, iMac or Studio Display. Free, runs in your browser, nothing uploaded.",
  line: "Pick your Mac, drop an image, drag to frame it, and download a wallpaper at the screen's native resolution.",
  question: "What size should a Mac wallpaper be?",
  answer: `The sharpest wallpaper matches the screen's native resolution. Apple lists these for current Macs: ${resolutionList} pixels. This tool crops your image to that exact size, so macOS doesn't have to stretch or shrink it.`,
  keywords: [
    "mac wallpaper resizer",
    "resize wallpaper for mac",
    "macbook wallpaper size",
    "crop image to wallpaper",
    "wallpaper maker mac",
  ],
  facts: [
    {
      label: "Sizes",
      value:
        "Native resolutions for every current Mac and Apple display, from Apple's tech specs.",
    },
    {
      label: "Framing",
      value:
        "Fill crops to the screen's shape; Fit keeps the whole image on a dark background.",
    },
    {
      label: "Output",
      value: "JPEG or PNG at the exact pixel size of the screen you pick.",
    },
    {
      label: "Privacy",
      value:
        "Your image is read and cropped in your browser. It's never uploaded.",
    },
    { label: "Cost", value: "Free, with no sign-up and no watermark." },
  ],
  steps: [
    {
      title: "Pick your Mac",
      body: "Choose the screen you're making the wallpaper for. Each size comes from Apple's tech specs.",
    },
    {
      title: "Add an image",
      body: "Drop a photo onto the preview or choose a file. JPEG, PNG and WebP work in every browser; Safari also opens HEIC.",
    },
    {
      title: "Frame it",
      body: "Drag the image to choose what stays in view, or switch to Fit to keep all of it.",
    },
    {
      title: "Download",
      body: "Save it as JPEG or PNG, then set it in System Settings → Wallpaper → Add Photo.",
    },
  ],
  faq: [
    {
      question: "Why does my wallpaper look blurry on my Mac?",
      answer:
        "It's usually smaller than the screen, so macOS scales it up. Use an image at least as large as the native resolution, or crop a larger one here.",
    },
    {
      question: "Is my image uploaded anywhere?",
      answer:
        "No. The tool reads the file in your browser and draws it on a canvas on your Mac. Nothing leaves your computer.",
    },
    {
      question: "What size do I need for two different Macs?",
      answer:
        "Crop once per Mac. Pick the first Mac and download, then pick the second; your framing stays where you left it.",
    },
    {
      question: "Can I make a live wallpaper with this?",
      answer: `This tool makes still images. For moving wallpapers, ${macwall.name} plays video loops behind your windows, and Pro can import your own videos.`,
    },
  ],
  sections: [],
  updatedAt: MAC_DISPLAY_SPECS_ACCESSED,
}

const screenResolution: ToolPage = {
  slug: "screen-resolution",
  pathname: "/tools/screen-resolution",
  name: "Screen resolution checker",
  summary: "See your Mac's screen size and pixel density",
  title: "What's My Screen Resolution? Mac Checker",
  headline: "What's my screen resolution?",
  description:
    "See the resolution your Mac's screen is running at, its pixel density and color depth, and compare it with Apple's native resolution for every Mac.",
  line: "Your browser reports the screen this page is open on. Here's what it says, and what it means for wallpapers.",
  question: "How do I find my Mac's screen resolution?",
  answer:
    "Open System Settings → Displays to see the resolution macOS is set to. This page reads the same thing from your browser: the size macOS lays things out at, times the pixel density, gives the pixels it draws. A wallpaper looks sharpest at the screen's native resolution, listed below for every Mac.",
  keywords: [
    "what is my screen resolution",
    "mac screen resolution",
    "macbook resolution",
    "check screen resolution mac",
    "my screen size",
  ],
  facts: [
    {
      label: "Looks like",
      value:
        "The size macOS lays the screen out at, the number shown in System Settings → Displays.",
    },
    {
      label: "Pixel density",
      value: "How many screen pixels make one point. Retina Macs use 2.",
    },
    {
      label: "Rendered pixels",
      value:
        "Looks-like size times the density. This is the size to make a wallpaper for that setting.",
    },
    {
      label: "Native",
      value:
        "The panel's physical pixels. Scaled settings render at a different size and macOS fits it to the panel.",
    },
    {
      label: "Privacy",
      value: "Read by your browser on this page. Nothing is stored or sent.",
    },
  ],
  steps: [
    {
      title: "Open this page on the Mac",
      body: "Use the screen you want to check. On several displays, drag the window there and reload.",
    },
    {
      title: "Read the numbers",
      body: "Looks like, density and rendered pixels update as you move or resize between screens.",
    },
    {
      title: "Compare with native",
      body: "If rendered pixels match a row in the table, the screen is at its default setting, and the tool links the live wallpapers that fit it.",
    },
    {
      title: "Size your wallpaper",
      body: "Make wallpapers at the native resolution so they stay sharp in any setting.",
    },
  ],
  faq: [
    {
      question: "Why doesn't the number match Apple's specs?",
      answer:
        "Mac screens are often set to a scaled resolution. macOS then draws at one size and fits it to the panel, so the browser reports the scaled setting, not the panel.",
    },
    {
      question: "What does 2x or Retina mean?",
      answer:
        "Each point on screen is drawn with two pixels across and two down. A 1512 × 982 looks-like size at 2x renders 3024 × 1964 pixels.",
    },
    {
      question: "Which resolution should I use for a wallpaper?",
      answer:
        "The native resolution of the screen. It stays sharp whichever scaled setting you choose later.",
    },
  ],
  sections: [],
  updatedAt: MAC_DISPLAY_SPECS_ACCESSED,
}

const colorPalette: ToolPage = {
  slug: "color-palette",
  pathname: "/tools/color-palette",
  name: "Color palette extractor",
  summary: "Pull the main colors out of any image",
  title: "Color Palette From Image: Free Hex & RGB Extractor",
  headline: "Color palette from any image",
  description:
    "Get a color palette from any image: drop in a wallpaper or photo and copy its six main colors as hex and RGB. Free, in your browser, nothing uploaded.",
  line: "Drop in any image and get its six main colors, from the most common down, ready to copy as hex or RGB.",
  question: "How do I get a color palette from an image?",
  answer:
    "Add the image here. The tool shrinks a copy, groups similar pixels together and lists the six color groups that cover the most of the picture, with how much of it each one covers, as hex and RGB values you can copy.",
  keywords: [
    "color palette from image",
    "color palette extractor",
    "extract colors from image",
    "hex color from image",
    "wallpaper color palette",
  ],
  facts: [
    {
      label: "Colors",
      value: "Six, ordered by how much of the image each one covers.",
    },
    { label: "Formats", value: "Hex and RGB, each copied with one click." },
    {
      label: "Method",
      value:
        "k-means clustering on a 96-pixel-wide copy, the same way MacWall measures the colours of its own wallpapers.",
    },
    {
      label: "Privacy",
      value: "Worked out in your browser. The image is never uploaded.",
    },
    { label: "Cost", value: "Free, with no sign-up." },
  ],
  steps: [
    {
      title: "Add an image",
      body: "Drop a wallpaper onto the box or choose a file. A sample loads first so you can see how it works.",
    },
    {
      title: "Read the palette",
      body: "Each swatch shows its share of the image, a plain color name and its hex value.",
    },
    { title: "Copy a color", body: "Click a hex or RGB value to copy it." },
    {
      title: "Use it",
      body: "Pick the closest accent color in System Settings → Appearance, use the hex values in your own designs, or open the live wallpapers in the same colors.",
    },
  ],
  faq: [
    {
      question: "Why are there only six colors?",
      answer:
        "Six covers the look of most wallpapers without listing near-identical shades. Smaller details blend into the nearest group.",
    },
    {
      question: "Does it upload my image?",
      answer:
        "No. The colors are worked out by JavaScript in your browser, on your Mac.",
    },
    {
      question: "Can I see palettes for MacWall wallpapers?",
      answer: `Yes. Every wallpaper page on ${macwall.name} lists the colors measured from that wallpaper, and the color collections group live wallpapers by their main color.`,
    },
  ],
  sections: [],
}

export const tools: readonly ToolPage[] = [
  resizer,
  screenResolution,
  colorPalette,
]

export function getTool(slug: string): ToolPage | undefined {
  return tools.find((tool) => tool.slug === slug)
}

export const toolsHubPage: SeoContentPage = {
  slug: "tools",
  pathname: TOOLS_HUB_PATH,
  title: "Free Wallpaper Tools for Mac",
  headline: "Wallpaper tools for your Mac",
  description:
    "Free tools that run in your browser: resize a wallpaper to any Mac screen, check your screen resolution, and pull a color palette from any image.",
  keywords: [
    "mac wallpaper tools",
    "wallpaper resizer",
    "screen resolution checker",
    "color palette extractor",
  ],
  sections: [],
  updatedAt: MAC_DISPLAY_SPECS_ACCESSED,
}

export const TOOLS_SHARED_FACTS: ToolFact[] = [
  {
    label: "Where it runs",
    value: "In your browser, on your Mac. Images are never uploaded.",
  },
  {
    label: "Screen sizes",
    value: `From Apple's tech specs, read ${accessedLabel(MAC_DISPLAY_SPECS_ACCESSED)}.`,
  },
  {
    label: "Cost",
    value: "Free, with no account, no sign-up and no watermark.",
  },
  {
    label: "Live wallpapers",
    value: `These tools make stills. ${macwall.name} plays video wallpapers behind your windows.`,
  },
]

export const TOOLS_HUB_FAQ: ContentFaq[] = [
  {
    question: "Are these tools free?",
    answer:
      "Yes. They run in your browser with no account and add no watermark.",
  },
  {
    question: "Do the tools upload my images?",
    answer:
      "No. Every tool reads the image in your browser and works on it there.",
  },
  {
    question: "Where do the Mac screen sizes come from?",
    answer:
      "From Apple's tech specs pages for each Mac and display, linked in the sources on each tool.",
  },
]

function linkList(links: readonly { href: string; label: string }[]): string {
  return links.map((link) => `[${link.label}](${link.href})`).join(" · ")
}

/** Markdown/SEO body for a tool page: answer, facts, steps, sources. */
export function toolSeoPage(tool: ToolPage): SeoContentPage {
  const tail: ContentBlock[] =
    tool.slug === "color-palette"
      ? TOOL_COLOR_COLLECTIONS.length > 0
        ? [
            { type: "h2", text: "Live wallpapers by color" },
            {
              type: "p",
              text: linkList(
                TOOL_COLOR_COLLECTIONS.map((entry) => ({
                  href: entry.href,
                  label: `${entry.name} live wallpapers`,
                }))
              ),
            },
          ]
        : []
      : [
          { type: "h2", text: "Native resolution of every Mac" },
          {
            type: "table",
            columns: [
              "Display",
              "Screen",
              "Native resolution",
              "Pixels per inch",
            ],
            rows: macDisplays.map((d) => [
              `[${d.name}](${macDisplayPagePath(d)})`,
              `${d.sizeInches}-inch`,
              displayResolutionLabel(d),
              String(d.ppi),
            ]),
          },
          { type: "h2", text: "Live wallpapers for each screen" },
          { type: "p", text: linkList(TOOL_DISPLAY_LINKS) },
          { type: "h2", text: "Sources" },
          { type: "ul", items: appleSources },
        ]
  return {
    ...tool,
    sections: [
      { type: "p", text: `**${tool.answer}**` },
      { type: "h2", text: `What the ${tool.name.toLowerCase()} does` },
      {
        type: "ul",
        items: tool.facts.map((fact) => `**${fact.label}**: ${fact.value}`),
      },
      { type: "h2", text: "How to use it" },
      {
        type: "ol",
        items: tool.steps.map((step) => `**${step.title}.** ${step.body}`),
      },
      ...tail,
    ],
  }
}

export { appleSources as TOOL_APPLE_SOURCES }
