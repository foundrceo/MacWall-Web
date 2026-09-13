import {
  CHANGELOG_PAGE_TITLE,
  CHANGELOG_SECTION_LABELS,
  sortChangelogSections,
  formatChangelogVersion,
  type ChangelogRelease,
} from "@/lib/changelog/types"
import type { ChangelogPageCopy } from "@/lib/changelog/page-copy"
import {
  MarketingBodySection,
  MarketingTitleSection,
} from "@/components/macwall-marketing/marketing-inner-page"
import { landingPageH1, landingPageLead } from "@/components/macwall-marketing/landing-type"

const CHANGELOG_TITLE_ID = "changelog-title"

function formatReleaseDate(iso: string): string {
  const parsed = Date.parse(iso)
  if (!Number.isFinite(parsed)) return ""

  return new Date(parsed).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  })
}

function ChangelogReleaseBlock({
  release,
}: Readonly<{ release: ChangelogRelease }>) {
  const sections = sortChangelogSections(release.sections)
  const dateLabel = formatReleaseDate(release.date)

  return (
    <article
      aria-labelledby={`release-${release.id}`}
      className="group p-6 lg:p-8"
    >
      <div className="mb-6 flex flex-wrap items-baseline gap-x-3 gap-y-2">
        <h2
          id={`release-${release.id}`}
          className="text-xl font-medium tracking-tight"
        >
          {formatChangelogVersion(release.version, release.build)}
        </h2>
        {dateLabel ? (
          <time
            dateTime={release.date}
            className="text-sm text-muted-foreground"
          >
            {dateLabel}
          </time>
        ) : null}
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <section
            key={section.kind}
            aria-label={CHANGELOG_SECTION_LABELS[section.kind]}
          >
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">
              {CHANGELOG_SECTION_LABELS[section.kind]}
            </h3>
            <ul className="m-0 list-none space-y-2 p-0">
              {section.items.map((item) => (
                <li
                  key={item}
                  className="grid grid-cols-[0.375rem_minmax(0,1fr)] items-start gap-x-3 text-sm leading-6 text-muted-foreground md:text-base"
                >
                  <span
                    aria-hidden
                    className="mt-[0.65em] size-1.5 rounded-full bg-foreground/40"
                  />
                  <span>{item}</span>
                </li>
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
    <>
      <MarketingTitleSection aria-labelledby={CHANGELOG_TITLE_ID}>
        <h1 id={CHANGELOG_TITLE_ID} className={landingPageH1}>
          {CHANGELOG_PAGE_TITLE}
        </h1>
        <p className={landingPageLead}>{copy.lead}</p>
      </MarketingTitleSection>
      <MarketingBodySection>
        <div className="grid divide-y divide-dashed divide-border">
          {releases.map((release) => (
            <ChangelogReleaseBlock key={release.id} release={release} />
          ))}
        </div>
        <footer className="space-y-3 border-t border-dashed border-border px-6 py-8 text-sm leading-relaxed text-muted-foreground">
          <p>{copy.omittedNote}</p>
          <p>{copy.autoUpdateNote}</p>
          {copy.syncedLabel ? <p>{copy.syncedLabel}</p> : null}
        </footer>
      </MarketingBodySection>
    </>
  )
}
