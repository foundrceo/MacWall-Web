import { absolutizeMarkdownLinks, faqToMarkdown } from "@/lib/ai/markdown"
import { macwall } from "@/lib/macwall-site"
import {
  getPublicWallpaperByDetailSlug,
  listSimilarPublicWallpapers,
} from "@/lib/public-catalog/fetch"
import { wallpaperDetailPath } from "@/lib/public-catalog/urls"
import { buildWallpaperDetailContent } from "@/lib/seo/wallpaper-detail-content"
import { wallpaperCollectionPath } from "@/lib/seo/wallpaper-collections"
import { canonicalSiteOrigin } from "@/lib/site-url"

/**
 * Markdown twin of `/wallpaper/{category}/{slug}`, built from the same catalog
 * record and copy as the HTML page. Returns null for unknown wallpapers and
 * for non-canonical paths, so the twin never duplicates a redirect.
 */
export async function wallpaperDetailMarkdown(
  path: string
): Promise<{ body: string; canonicalPath: string } | null> {
  const match = path.match(/^\/wallpaper\/[^/]+\/([^/]+)$/)
  if (!match) return null
  const wallpaper = await getPublicWallpaperByDetailSlug(match[1])
  if (!wallpaper) return null
  const canonicalPath = wallpaperDetailPath(wallpaper)
  if (canonicalPath !== path) return null

  const origin = canonicalSiteOrigin()
  const content = buildWallpaperDetailContent(wallpaper)
  let similar: Awaited<ReturnType<typeof listSimilarPublicWallpapers>> = []
  try {
    similar = await listSimilarPublicWallpapers(wallpaper, 6)
  } catch {
    similar = []
  }

  const facts = [
    `- Category: ${wallpaper.category}`,
    wallpaper.resolution ? `- Resolution: ${wallpaper.resolution}` : null,
    wallpaper.durationSeconds > 0
      ? `- Loop length: ${Math.round(wallpaper.durationSeconds)} seconds`
      : null,
    content.colors.length
      ? `- Colours: ${content.colors.map((c) => `${c.name} (${c.hex})`).join(", ")}`
      : null,
    `- Plays in: ${macwall.name} for macOS (video wallpaper, not a still image)`,
  ].filter(Boolean)

  const sections = [
    [
      "---",
      `title: "${content.pageTitle.replace(/"/g, '\\"')}"`,
      `description: "${content.metaDescription.replace(/"/g, '\\"')}"`,
      `canonical: "${origin}${canonicalPath}"`,
      `image: "${wallpaper.thumbUrl}"`,
      "---",
    ].join("\n"),
    `# ${wallpaper.name}`,
    content.lead,
    content.detail,
    `## Details\n\n${facts.join("\n")}`,
    content.collections.length
      ? `## Collections\n\n${content.collections
          .slice(0, 4)
          .map(
            (entry) =>
              `- [${entry.name} wallpapers](${origin}${wallpaperCollectionPath(entry.slug)})`
          )
          .join("\n")}`
      : "",
    `## How to set it on your Mac\n\n${content.steps.map((step, i) => `${i + 1}. ${step}`).join("\n")}`,
    similar.length
      ? `## Similar live wallpapers\n\n${similar
          .map(
            (item) => `- [${item.name}](${origin}${wallpaperDetailPath(item)})`
          )
          .join("\n")}`
      : "",
    faqToMarkdown(content.faq),
    `---\n\nSource: ${origin}${canonicalPath}`,
  ]

  return {
    body: `${absolutizeMarkdownLinks(sections.filter(Boolean).join("\n\n"))}\n`,
    canonicalPath,
  }
}

/** Markdown twin of `/wallpapers/page/{n}` and `/wallpapers/{category}/page/{n}`. */
export async function galleryPageMarkdown(
  path: string
): Promise<{ body: string; canonicalPath: string } | null> {
  const match = path.match(/^\/wallpapers(?:\/([^/]+))?\/page\/([^/]+)$/)
  if (!match) return null
  const { loadGalleryPage } = await import("@/lib/seo/gallery-page-route")
  const data = await loadGalleryPage(
    { categorySlug: match[1] ?? null },
    match[2]
  ).catch(() => null)
  if (!data) return null
  const origin = canonicalSiteOrigin()
  const canonicalPath = `${data.basePath}/page/${data.page}`
  const pageLink = (n: number) =>
    `${origin}${n <= 1 ? data.basePath : `${data.basePath}/page/${n}`}`
  const body = [
    [
      "---",
      `title: "${data.copy.title}"`,
      `description: "${data.copy.description}"`,
      `canonical: "${origin}${canonicalPath}"`,
      "---",
    ].join("\n"),
    `# ${data.copy.title}`,
    data.copy.description,
    data.result.wallpapers
      .map((item) => `- [${item.name}](${origin}${wallpaperDetailPath(item)})`)
      .join("\n"),
    [
      data.page > 1 ? `Previous page: ${pageLink(data.page - 1)}` : "",
      data.page < data.totalPages
        ? `Next page: ${pageLink(data.page + 1)}`
        : "",
    ]
      .filter(Boolean)
      .join("\n\n"),
    `---\n\nSource: ${origin}${canonicalPath}`,
  ]
  return { body: `${body.filter(Boolean).join("\n\n")}\n`, canonicalPath }
}
