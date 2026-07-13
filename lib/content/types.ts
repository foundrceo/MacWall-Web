export type ContentBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }

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

export type BlogArticle = SeoContentPage & {
  category: BlogCategory
  readMinutes: number
  excerpt: string
}

export type BlogCategory =
  | "guides"
  | "comparisons"
  | "features"
  | "wallpapers"
  | "macos"

export const BLOG_CATEGORY_LABELS: Record<BlogCategory, string> = {
  guides: "Guides",
  comparisons: "Comparisons",
  features: "Features",
  wallpapers: "Wallpapers",
  macos: "macOS",
}
