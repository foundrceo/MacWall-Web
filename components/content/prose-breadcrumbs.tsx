import Link from "next/link"

export function ProseBreadcrumbs({
  items,
}: Readonly<{
  items: { label: string; href: string }[]
}>) {
  if (items.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" className="MacWallProseBreadcrumbs">
      <ol className="MacWallProseBreadcrumbsList">
        {items.map((crumb, index) => (
          <li key={crumb.href} className="MacWallProseBreadcrumbsItem">
            {index > 0 ? (
              <span aria-hidden className="MacWallProseBreadcrumbsSep">
                /
              </span>
            ) : null}
            {index === items.length - 1 ? (
              <span className="MacWallProseBreadcrumbsCurrent">
                {crumb.label}
              </span>
            ) : (
              <Link href={crumb.href} className="MacWallProseBreadcrumbsLink">
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
