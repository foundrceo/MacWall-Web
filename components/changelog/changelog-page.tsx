import MarketingSiteChrome from "@/components/macwall-marketing/MarketingSiteChrome"
import MacWallMarketingPageEnd from "@/components/macwall-marketing/marketing-page-end"
import {
  CHANGELOG_PAGE_EYEBROW,
  CHANGELOG_PAGE_TITLE,
  CHANGELOG_SECTION_LABELS,
  sortChangelogSections,
  formatChangelogVersion,
  type ChangelogRelease,
} from "@/lib/changelog/types"
import type { ChangelogPageCopy } from "@/lib/changelog/page-copy"
import { cn } from "@/lib/utils"

const CHANGELOG_TITLE_ID = "changelog-title"

function formatReleaseDate(iso: string): string {
  const parsed = Date.parse(iso)
  if (!Number.isFinite(parsed)) return ""

  return new Date(parsed)
    .toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    })
    .toUpperCase()
}

function ChangelogListItem({ children }: Readonly<{ children: string }>) {
  return (
    <li className="grid grid-cols-[0.375rem_minmax(0,1fr)] items-start gap-x-3">
      <span
        aria-hidden
        className="mt-[0.62em] size-[5px] shrink-0 rounded-full border border-white/40 bg-transparent"
      />
      <span className="min-w-0 text-[15px] leading-[1.65] text-white/62">
        {children}
      </span>
    </li>
  )
}

function ChangelogReleaseBlock({
  release,
}: Readonly<{ release: ChangelogRelease }>) {
  const sections = sortChangelogSections(release.sections)
  const dateLabel = formatReleaseDate(release.date)

  return (
    <article
      aria-labelledby={`release-${release.id}`}
      className="border-b border-white/[0.08] pb-10 last:border-b-0 last:pb-0 md:pb-12"
    >
      <div className="mb-6 flex flex-wrap items-baseline gap-x-3 gap-y-2 md:mb-7">
        <span
          id={`release-${release.id}`}
          className="inline-flex shrink-0 rounded-md border border-white/15 bg-white/[0.03] px-2.5 py-1 font-mono text-[13px] leading-none text-white/85"
        >
          {formatChangelogVersion(release.version, release.build)}
        </span>
        {dateLabel ? (
          <time
            dateTime={release.date}
            className="text-[12px] font-medium leading-none tracking-[0.08em] text-white/40"
          >
            {dateLabel}
          </time>
        ) : null}
      </div>

      <div className="space-y-7 md:space-y-8">
        {sections.map((section) => (
          <section
            key={section.kind}
            aria-label={CHANGELOG_SECTION_LABELS[section.kind]}
          >
            <h3 className="mb-3 font-sans text-[15px] font-normal leading-normal tracking-normal text-white/55">
              {CHANGELOG_SECTION_LABELS[section.kind]}
            </h3>
            <ul className="m-0 list-none space-y-3 p-0">
              {section.items.map((item) => (
                <ChangelogListItem key={item}>{item}</ChangelogListItem>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </article>
  )
}

export function ChangelogPage({
  releases,
  copy,
}: Readonly<{
  releases: readonly ChangelogRelease[]
  copy: ChangelogPageCopy
}>) {
  return (
    <div className="marketing-page">
      <MarketingSiteChrome />

      <main
        id="main-content"
        tabIndex={-1}
        aria-labelledby={CHANGELOG_TITLE_ID}
        className="marketing-main"
      >
        <div className="marketing-prose-rail">
          <header className="marketing-page-header">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-white/42">
              {CHANGELOG_PAGE_EYEBROW}
            </p>
            <h1
              id={CHANGELOG_TITLE_ID}
              className="font-serif text-[clamp(2.25rem,5vw,2.875rem)] font-normal leading-[1.06] tracking-[-0.03em] text-white"
            >
              {CHANGELOG_PAGE_TITLE}
            </h1>
            <p className="mt-4 text-[16px] leading-[1.65] text-white/52">
              {copy.lead}
            </p>
          </header>

          <div className="space-y-10 md:space-y-12">
            {releases.map((release) => (
              <ChangelogReleaseBlock key={release.id} release={release} />
            ))}
          </div>

          <footer
            className={cn(
              "mt-12 space-y-3 border-t border-white/[0.08] pt-8",
              "text-[14px] leading-relaxed text-white/42 md:mt-14 md:pt-10"
            )}
          >
            <p>{copy.omittedNote}</p>
            <p>{copy.autoUpdateNote}</p>
            {copy.syncedLabel ? (
              <p className="text-[12px] leading-relaxed text-white/30">
                {copy.syncedLabel}
              </p>
            ) : null}
          </footer>
        </div>
      </main>

      <MacWallMarketingPageEnd showBottomCta={false} />
    </div>
  )
}
