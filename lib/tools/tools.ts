import type { ContentFaq, SeoContentPage } from "@/lib/content/types"
import { macwall } from "@/lib/macwall-site"
import {
  accessedLabel,
  displayResolutionLabel,
  MAC_DISPLAY_SPECS_ACCESSED,
  macDisplays,
} from "@/lib/seo/mac-displays"

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

const appleSources = [
  ...new Map(macDisplays.map((d) => [d.source, d])).values(),
].map(
  (d) =>
    `[${d.name} tech specs](${d.source}), Apple, accessed ${accessedLabel(d.accessed)}`
)

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
    "See the resolution your Mac's screen is running at, its pixel density and colour depth, and compare it with Apple's native resolution for every Mac.",
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
      body: "If rendered pixels match a row in the table, the screen is at its default setting.",
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
  name: "Colour palette extractor",
  summary: "Pull the main colours out of any wallpaper",
  title: "Wallpaper Colour Palette Extractor",
  headline: "Wallpaper colour palette extractor",
  description:
    "Drop in a wallpaper or photo and get its main colours as hex and RGB, ready to copy. Match your Mac accent colour, widgets or desktop setup to it.",
  line: "Drop in any wallpaper and get its six main colours, from the most common down, ready to copy.",
  question: "How do I find the colours in a wallpaper?",
  answer:
    "Add the image here. The tool shrinks a copy, groups similar pixels together and lists the six colour groups that cover the most of the picture, with how much of it each one covers.",
  keywords: [
    "color palette from image",
    "wallpaper color palette",
    "extract colors from image",
    "image color picker",
    "hex color from image",
  ],
  facts: [
    {
      label: "Colours",
      value: "Six, ordered by how much of the image each one covers.",
    },
    { label: "Formats", value: "Hex and RGB, each copied with one click." },
    {
      label: "Method",
      value:
        "k-means clustering on a 96-pixel-wide copy, the same way MacWall measures its wallpaper colours.",
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
      body: "Each swatch shows its share of the image, a plain colour name and its hex value.",
    },
    { title: "Copy a colour", body: "Click a hex or RGB value to copy it." },
    {
      title: "Use it",
      body: "Pick the closest accent colour in System Settings → Appearance, or use the hex values in your own designs.",
    },
  ],
  faq: [
    {
      question: "Why are there only six colours?",
      answer:
        "Six covers the look of most wallpapers without listing near-identical shades. Smaller details blend into the nearest group.",
    },
    {
      question: "Does it upload my image?",
      answer:
        "No. The colours are worked out by JavaScript in your browser, on your Mac.",
    },
    {
      question: "Can I see palettes for MacWall wallpapers?",
      answer: `Yes. Every wallpaper page on ${macwall.name} lists the colours measured from that wallpaper.`,
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
    "Free tools that run in your browser: resize a wallpaper to any Mac screen, check your screen resolution, and pull a colour palette from any image.",
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

/** Markdown/SEO body for a tool page: answer, facts, steps, sources. */
export function toolSeoPage(tool: ToolPage): SeoContentPage {
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
      ...(tool.slug === "color-palette"
        ? []
        : [
            { type: "h2" as const, text: "Native resolution of every Mac" },
            {
              type: "table" as const,
              columns: [
                "Display",
                "Screen",
                "Native resolution",
                "Pixels per inch",
              ],
              rows: macDisplays.map((d) => [
                d.name,
                `${d.sizeInches}-inch`,
                displayResolutionLabel(d),
                String(d.ppi),
              ]),
            },
            { type: "h2" as const, text: "Sources" },
            { type: "ul" as const, items: appleSources },
          ]),
    ],
  }
}

export { appleSources as TOOL_APPLE_SOURCES }
