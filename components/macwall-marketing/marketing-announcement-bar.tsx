import { macwallInstallerLatestPath } from "@/lib/macwall-site"
import { macwallExactCopy } from "@/lib/macwall-marketing-copy"

/** Site-wide promo strip below the header — one implementation for every marketing page. */
export default function MacWallMarketingAnnouncementBar() {
  const c = macwallExactCopy.ribbon

  return (
    <div className="MacWallMarketingAnnouncementBar">
      <p>
        {c.lineBeforeLink}
        <a href={macwallInstallerLatestPath}>
          {c.linkText}
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="MacWallMarketingAnnouncementBarChevron"
            aria-hidden
          >
            <path d="M8.72 18.78a.75.75 0 0 1 0-1.06L14.44 12 8.72 6.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018l6.25 6.25a.75.75 0 0 1 0 1.06l-6.25 6.25a.75.75 0 0 1-1.06 0Z" />
          </svg>
        </a>
      </p>
    </div>
  )
}
