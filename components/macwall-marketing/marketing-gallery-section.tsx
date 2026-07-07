import MacWallMarketingGallery from "@/components/macwall-marketing/marketing-gallery"
import { fetchMarketingGalleryWallpapers } from "@/lib/fetch-marketing-gallery-wallpapers"

/** Server Component — fetches cached gallery data at build/ISR time. */
export default async function MacWallMarketingGallerySection() {
  const wallpapers = await fetchMarketingGalleryWallpapers()

  return (
    <>
      {wallpapers.slice(0, 10).map((wallpaper) => (
        <link
          key={`preload-${wallpaper.id}`}
          rel="preload"
          as="image"
          href={wallpaper.thumbUrl}
        />
      ))}
      <MacWallMarketingGallery wallpapers={wallpapers} />
    </>
  )
}
