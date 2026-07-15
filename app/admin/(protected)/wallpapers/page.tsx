import { AdminShell } from "@/components/admin/admin-shell"
import { WallpaperCatalogPanel } from "@/components/admin/wallpaper-catalog-panel"

type PageProps = {
  searchParams: Promise<{ q?: string }>
}

export default async function AdminWallpapersPage({ searchParams }: PageProps) {
  const { q } = await searchParams

  return (
    <AdminShell
      title="Wallpapers"
      description="Bulk upload catalog videos, review likes, and edit wallpaper metadata."
    >
      <WallpaperCatalogPanel initialQuery={q} />
    </AdminShell>
  )
}
