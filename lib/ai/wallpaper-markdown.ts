import { absolutizeMarkdownLinks, faqToMarkdown } from "@/lib/ai/markdown"
import { macwall } from "@/lib/macwall-site"
import { wallpaperSourceLabel } from "@/lib/public-catalog/attribution"
import {
  getPublicWallpaperByDetailSlug,
  listPublicWallpapersForCollections,
  listSimilarPublicWallpapers,
} from "@/lib/public-catalog/fetch"
import type { PublicWallpaper } from "@/lib/public-catalog/types"
import { wallpaperDetailPath } from "@/lib/public-catalog/urls"
import { buildWallpaperDetailContent } from "@/lib/seo/wallpaper-detail-content"
import { macFitLabel } from "@/lib/seo/wallpaper-detail-copy"
import { buildWallpaperDetailLinks } from "@/lib/seo/wallpaper-detail-links"
import {
  accessedLabel,
  displayResolutionLabel,
  MAC_DISPLAY_SPECS_ACCESSED,
} from "@/lib/seo/mac-displays"
import { canonicalSiteOrigin } from "@/lib/site-url"

/** A Markdown table cell: pipes escaped, one line. */
function cell(text: string): string {
  return text.replace(/\|/g, "\\|").replace(/\s+/g, " ").trim()
}

/**
 * Markdown twin of `/wallpaper/{category}/{slug}`, built from the same catalog
 * record, copy and links as the HTML page. Returns null for unknown
 * wallpapers and for non-canonical paths, so the twin never duplicates a
 * redirect.
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
  let similar: PublicWallpaper[] = []
  try {
    similar = await listSimilarPublicWallpapers(wallpaper)
  } catch {
    similar = []
  }
  let catalog: PublicWallpaper[] | null
  try {
    catalog = await listPublicWallpapersForCollections()
  } catch {
    catalog = null
  }
  const links = buildWallpaperDetailLinks({
    wallpaper,
    content,
    catalog,
    similar,
  })
  const source = wallpaperSourceLabel(wallpaper)

  const facts = [
    `- Category: ${wallpaper.category}`,
    content.resolutionLabel
      ? `- Resolution: ${content.resolutionLabel}${
          content.qualityLabel ? ` (${content.qualityLabel})` : ""
        }`
      : null,
    wallpaper.durationSeconds > 0
      ? `- Loop length: ${Math.round(wallpaper.durationSeconds)} seconds`
      : null,
    content.colors.length
      ? `- Colours: ${content.colors.map((c) => `${c.name} (${c.hex})`).join(", ")}`
      : null,
    source ? `- Source: ${source}` : null,
    `- Plays in: ${macwall.name} for macOS (video wallpaper, not a still image)`,
  ].filter(Boolean)

  const fitsTable = content.fits.length
    ? [
        "## Fits these Macs",
        [
          `| Mac | Screen | ${cell(content.resolutionLabel)} loop |`,
          "| --- | --- | --- |",
          ...content.fits.map((row) => {
            const mac = row.href
              ? `[${cell(row.display.shortName)}](${origin}${row.href})`
              : cell(row.display.shortName)
            return `| ${mac} | ${displayResolutionLabel(row.display)} | ${macFitLabel(row)} |`
          }),
        ].join("\n"),
        `Screen resolutions from Apple's tech specs, read ${accessedLabel(MAC_DISPLAY_SPECS_ACCESSED)}.`,
      ].join("\n\n")
    : ""

  const sections = [
    [
      "---",
      `title: "${content.pageTitle.replace(/"/g, '\\"')}"`,
      `description: "${content.metaDescription.replace(/"/g, '\\"')}"`,
      `canonical: "${origin}${canonicalPath}"`,
      `image: "${wallpaper.thumbUrl}"`,
      "---",
    ].join("\n"),
    `# ${content.heading}`,
    content.lead,
    content.detail,
    `## Details\n\n${facts.join("\n")}`,
    fitsTable,
    links.collections.length
      ? `## Collections\n\n${links.collections
          .map(
            ({ collection, href }) =>
              `- [${collection.name} wallpapers](${origin}${href})`
          )
          .join("\n")}`
      : "",
    `## Set it up\n\n${content.setup.intro}\n\n${content.setup.links
      .map((link) => `- [${link.label}](${origin}${link.href})`)
      .join("\n")}`,
    similar.length
      ? `## Similar live wallpapers\n\n${similar
          .map(
            (item) => `- [${item.name}](${origin}${wallpaperDetailPath(item)})`
          )
          .join("\n")}`
      : "",
    links.alsoIn
      ? `## Also in ${links.alsoIn.collection.name}\n\n${links.alsoIn.wallpapers
          .map(
            (item) => `- [${item.name}](${origin}${wallpaperDetailPath(item)})`
          )
          .join("\n")}\n\nAll of them: ${origin}${links.alsoIn.href}`
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
