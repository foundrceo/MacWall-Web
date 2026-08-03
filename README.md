# MacWall Web

Website and web platform for **[MacWall](https://macwall.app)**, a native macOS app for cinematic 4K live wallpapers.

**Website:** https://macwall.app

Browse the wallpaper catalog, download the Mac app, and purchase Pro with Stripe Checkout. After checkout, the license automatically opens the app using `macwall://activate`.

![MacWall homepage](public/screenshots/homepage.png)

## What this repository includes

- Homepage and marketing pages
- Pricing (Free, Pro, Pro+)
- Stripe Checkout and license activation
- Blog and SEO pages
- Community wallpaper submissions
- Affiliate pages
- Support inbox UI

The native macOS app is written in Swift and is maintained in a separate repository.

## Screenshots

### Homepage

![MacWall homepage](public/screenshots/homepage.png)

### Pricing

![MacWall pricing](public/screenshots/pricing.png)

### App Settings

![MacWall settings](public/screenshots/settings.jpg)

## Tech Stack

| Technology | Purpose |
| --- | --- |
| Next.js (App Router) | Website and API routes |
| React + TypeScript | Frontend |
| Stripe | Payments |
| Supabase | Licenses and backend |
| Vercel | Hosting |
| Tailwind CSS + shadcn/ui | UI styling |
| Cloudflare R2 | Wallpaper storage and CDN |

## Local Development

```sh
git clone https://github.com/foundrceo/MacWall-Web.git
cd MacWall-Web
npm install
cp .env.example .env
npm run dev
```

Copy `.env.example` to `.env` and add the required environment variables from your deployment (Vercel project settings).

Never commit `.env` files or production credentials.

Most marketing pages work with a minimal environment setup. Stripe Checkout and license activation require Stripe and Supabase credentials. See `.env.example` for the required variable names.

```sh
npm run lint
npm run typecheck
npm run build
```

Open http://localhost:3000.

## Routes

| Route | Description |
| --- | --- |
| `/` | Home |
| `/pricing` | Pricing |
| `/download` | Download |
| `/blog` | Blog |
| `/submit` | Submit wallpapers |
| `/affiliate` | Affiliate program |
| `/support` | Support |

## Download

https://macwall.app/download

## License

Proprietary. See [LICENSE](./LICENSE).
