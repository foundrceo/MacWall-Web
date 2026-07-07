import {
  catalogMarketingGalleryPosterUrlFromKey,
  catalogPublicThumbUrlFromKey,
  catalogPublicVideoUrlFromKey,
} from "@/lib/macwall-catalog-urls"

export type MarketingGalleryWallpaper = {
  id: string
  name: string
  category: string
  /** Full catalog MP4 — lazy-loaded only for visible tiles. */
  videoUrl: string
  /** Original thumb (fallback). */
  thumbUrl: string
  /** Supabase-transformed 16:9 poster for tiles and video placeholder. */
  posterUrl: string
}

export const MARKETING_GALLERY_WALLPAPER_COUNT = 20

export function buildMarketingGalleryWallpaper(input: {
  id: string
  name: string
  category: string
  videoKey: string
  thumbKey: string
}): MarketingGalleryWallpaper {
  return {
    id: input.id,
    name: input.name,
    category: input.category,
    videoUrl: catalogPublicVideoUrlFromKey(input.videoKey),
    thumbUrl: catalogPublicThumbUrlFromKey(input.thumbKey),
    posterUrl: catalogMarketingGalleryPosterUrlFromKey(input.thumbKey),
  }
}

const FALLBACK_SEEDS = [
  {
    id: "miles-morales-spider-man-snow",
    name: "Miles Morales – Snow",
    category: "Anime",
    videoKey: "videos/miles-morales-spider-man-snow.mp4",
    thumbKey: "thumbs/miles-morales-spider-man-snow.jpg",
  },
  {
    id: "bmw-m3-e46-need-for-speed-most-wanted-moewalls-com",
    name: "BMW M3 E46 (Need for Speed Most Wanted)",
    category: "Video Games",
    videoKey: "videos/bmw-m3-e46-need-for-speed-most-wanted-moewalls-com.mp4",
    thumbKey: "thumbs/bmw-m3-e46-need-for-speed-most-wanted-moewalls-com.jpg",
  },
  {
    id: "umbrella-anime-wolf-girl-rainy-city-street-moewalls-com",
    name: "Umbrella Wolf Girl, Rainy City Street (Anime)",
    category: "Anime",
    videoKey:
      "videos/umbrella-anime-wolf-girl-rainy-city-street-moewalls-com.mp4",
    thumbKey:
      "thumbs/umbrella-anime-wolf-girl-rainy-city-street-moewalls-com.jpg",
  },
  {
    id: "mondstadt-temple-of-space-genshin-impact-moewalls-com",
    name: "Mondstadt Temple of Space (Genshin Impact)",
    category: "Video Games",
    videoKey:
      "videos/mondstadt-temple-of-space-genshin-impact-moewalls-com.mp4",
    thumbKey:
      "thumbs/mondstadt-temple-of-space-genshin-impact-moewalls-com.jpg",
  },
  {
    id: "the-hidden-ivy-cafe-moewalls-com",
    name: "The Hidden Ivy Cafe",
    category: "City",
    videoKey: "videos/the-hidden-ivy-cafe-moewalls-com.mp4",
    thumbKey: "thumbs/the-hidden-ivy-cafe-moewalls-com.jpg",
  },
  {
    id: "cyberpunk-elf-girl",
    name: "Cyberpunk Elf Girl",
    category: "Sci-fi",
    videoKey: "videos/cyberpunk-elf-girl.mp4",
    thumbKey: "thumbs/cyberpunk-elf-girl.jpg",
  },
  {
    id: "tattooed-katana-girl",
    name: "Tattooed Katana Girl",
    category: "Fantasy",
    videoKey: "videos/tattooed-katana-girl.mp4",
    thumbKey: "thumbs/tattooed-katana-girl.jpg",
  },
  {
    id: "aesthetic-orange-autumn-forest",
    name: "Aesthetic Orange Autumn Forest",
    category: "Nature",
    videoKey: "videos/aesthetic-orange-autumn-forest.mp4",
    thumbKey: "thumbs/aesthetic-orange-autumn-forest.jpg",
  },
  {
    id: "girl-with-leopard",
    name: "Girl With Leopard",
    category: "Cats",
    videoKey: "videos/girl-with-leopard.mp4",
    thumbKey: "thumbs/girl-with-leopard.jpg",
  },
  {
    id: "orbital-station-above-earth",
    name: "Orbital Station Above Earth",
    category: "Space",
    videoKey: "videos/orbital-station-above-earth.mp4",
    thumbKey: "thumbs/orbital-station-above-earth.jpg",
  },
  {
    id: "dark-spiderman-neon-moewalls-com",
    name: "Dark Spiderman Neon",
    category: "Anime",
    videoKey: "videos/dark-spiderman-neon-moewalls-com.mp4",
    thumbKey: "thumbs/dark-spiderman-neon-moewalls-com.jpg",
  },
  {
    id: "sukuna-god",
    name: "Sukuna God",
    category: "Anime",
    videoKey: "videos/sukuna-god.mp4",
    thumbKey: "thumbs/sukuna-god.jpg",
  },
  {
    id: "dark-souls-burning-warrior",
    name: "Dark Souls Burning Warrior",
    category: "Video Games",
    videoKey: "videos/dark-souls-burning-warrior.mp4",
    thumbKey: "thumbs/dark-souls-burning-warrior.jpg",
  },
  {
    id: "miles-morales-falling-purple-sky-spiderman-across-the-spider-verse-moewalls-com",
    name: "Miles Morales Falling Purple Sky",
    category: "Anime",
    videoKey:
      "videos/miles-morales-falling-purple-sky-spiderman-across-the-spider-verse-moewalls-com.mp4",
    thumbKey:
      "thumbs/miles-morales-falling-purple-sky-spiderman-across-the-spider-verse-moewalls-com.jpg",
  },
  {
    id: "spiderman-across-the-spiderverse-logo-moewalls-com",
    name: "Spiderman Across The Spiderverse Logo",
    category: "Anime",
    videoKey: "videos/spiderman-across-the-spiderverse-logo-moewalls-com.mp4",
    thumbKey: "thumbs/spiderman-across-the-spiderverse-logo-moewalls-com.jpg",
  },
  {
    id: "sports-car-street-photo",
    name: "Sports Car Street Photo",
    category: "Cars",
    videoKey:
      "videos/kk_carphoto_1776588470_3878627191710377718_78640876614_1.mp4",
    thumbKey: "thumbs/sports-car-street-photo.jpg",
  },
  {
    id: "bmw-wallpaper-showcase",
    name: "BMW Wallpaper Showcase",
    category: "Cars",
    videoKey: "videos/bmw-wallpaper-showcase.mov",
    thumbKey: "thumbs/bmw-wallpaper-showcase.jpg",
  },
  {
    id: "green-bmw-showcase",
    name: "Green BMW Showcase",
    category: "Cars",
    videoKey: "videos/Green BMW.mov",
    thumbKey: "thumbs/green-bmw-showcase.jpg",
  },
  {
    id: "bmw-b58-engine-bay",
    name: "BMW B58 Engine Bay",
    category: "Cars",
    videoKey:
      "videos/yummy_b58_AQOWTtg47OkrLRkrwgDQ-46NsfTEnVPmY5K9wuz-feII49zaeIdrm2L6fz6oS01-2l3mwF7uEl02IW0g35kD8yT1.mp4",
    thumbKey: "thumbs/bmw-b58-engine-bay.jpg",
  },
  {
    id: "bmw-m-performance-night",
    name: "BMW M Performance Night",
    category: "Cars",
    videoKey:
      "videos/withtobi_1778522235_3894846134668232381_17051888503 (1).mp4",
    thumbKey: "thumbs/bmw-m-performance-night.jpg",
  },
] as const

/** Fallback set (synced from Supabase) — used if REST fetch fails at build time. */
export const MARKETING_GALLERY_WALLPAPERS_FALLBACK: MarketingGalleryWallpaper[] =
  FALLBACK_SEEDS.map(buildMarketingGalleryWallpaper)
