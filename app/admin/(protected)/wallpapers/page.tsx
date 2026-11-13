import { WallpapersView } from "@/components/admin/wallpapers/wallpapers-view"

export default async function AdminWallpapersPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ q?: string | string[] }>
}>) {
  const { q } = await searchParams
  const initialQuery = (Array.isArray(q) ? q[0] : q) ?? ""

  // Keyed so a new `?q=` (from ⌘K, say) restarts the search on this page.
  return <WallpapersView key={initialQuery} initialQuery={initialQuery} />
}
