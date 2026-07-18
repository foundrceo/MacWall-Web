import Link from "next/link"
import {
  proseBreadcrumbs,
  proseBreadcrumbsCurrent,
  proseBreadcrumbsItem,
  proseBreadcrumbsLink,
  proseBreadcrumbsList,
  proseBreadcrumbsSep,
} from "@/lib/marketing-prose-classes"

export function ProseBreadcrumbs({
  items,
}: Readonly<{
  items: { label: string; href: string }[]
}>) {
  if (items.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" className={proseBreadcrumbs}>
      <ol className={proseBreadcrumbsList}>
        {items.map((crumb, index) => (
          <li key={crumb.href} className={proseBreadcrumbsItem}>
            {index > 0 ? (
              <span aria-hidden className={proseBreadcrumbsSep}>
                /
              </span>
            ) : null}
            {index === items.length - 1 ? (
              <span className={proseBreadcrumbsCurrent}>{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className={proseBreadcrumbsLink}>
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
