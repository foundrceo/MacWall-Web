/** A comparison table. Cells accept the same inline markdown as paragraphs. */
export type ContentTableBlock = {
  type: "table"
  columns: string[]
  rows: string[][]
  caption?: string
}

/**
 * A screenshot or illustration in the body. Only real captures of MacWall or
 * macOS (no third-party artwork, no catalog wallpapers outside the reviewed
 * generic pool); `src` is root-relative (`/blog/…`) or on the MacWall CDN.
 */
export type ContentImageBlock = {
  type: "image"
  src: string
  /** What the image shows, for screen readers and image search. */
  alt: string
  width: number
  height: number
  caption?: string
}

/** A key moment in a video, in whole seconds from the start. */
export type ContentVideoClip = {
  name: string
  startOffset: number
  endOffset?: number
  /** Link that starts playback at `startOffset`, e.g. a `?t=` URL. */
  url: string
}

/**
 * A screen recording or tutorial in the body, rendered as a `<video>` and
 * described as a VideoObject (with `clips` as key moments) in JSON-LD.
 */
export type ContentVideoBlock = {
  type: "video"
  /** MP4 (H.264) on the MacWall CDN or in `/public`. */
  src: string
  /** Still frame shown before playback, also the VideoObject thumbnail. */
  poster: string
  /** One-sentence description: the visible caption and the VideoObject name. */
  caption: string
  /** ISO 8601 duration, e.g. "PT32S". */
  durationIso: string
  /** YYYY-MM-DD the recording was published. */
  uploadDate: string
  width?: number
  height?: number
  clips?: ContentVideoClip[]
}

export type ContentBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | ContentTableBlock
  | ContentImageBlock
  | ContentVideoBlock

export type ContentFaq = {
  question: string
  answer: string
}

export type SeoContentPage = {
  slug: string
  pathname: string
  title: string
  headline: string
  description: string
  keywords: string[]
  sections: ContentBlock[]
  faq?: ContentFaq[]
  publishedAt?: string
  updatedAt?: string
}

/**
 * A blog post as written in lib/blog/articles. `publishedAt` is required (no
 * invented fallback dates), and set `updatedAt` on every edit after
 * publication: the post shows "Updated {date}" and feeds `dateModified`.
 * Read time is computed from the word count in lib/blog, never set by hand.
 */
export type BlogArticleInput = Omit<SeoContentPage, "publishedAt"> & {
  category: BlogCategory
  excerpt: string
  /** YYYY-MM-DD. */
  publishedAt: string
}

export type BlogArticle = BlogArticleInput & {
  /** `max(1, round(words / 220))`, from `blogArticleWordCount`. */
  readMinutes: number
}

export type BlogCategory =
  "guides" | "comparisons" | "features" | "wallpapers" | "macos"

export const BLOG_CATEGORY_LABELS: Record<BlogCategory, string> = {
  guides: "Guides",
  comparisons: "Comparisons",
  features: "Features",
  wallpapers: "Wallpapers",
  macos: "macOS",
}
