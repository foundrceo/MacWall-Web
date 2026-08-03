# MacWall

Native **macOS** app for live wallpapers. This repo is the website behind [macwall.app](https://macwall.app) — marketing pages, download, pricing, Stripe checkout, and license activation.

Mac only. Not iOS, Windows, or web-playable.

## Run the site locally

```sh
git clone https://github.com/foundrceo/MacWall-Web.git
cd MacWall-Web
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:3000. Checkout and licensing need real Stripe / Supabase keys in `.env`.

## Stack

Next.js, TypeScript, Tailwind, Stripe, Supabase, Vercel, Cloudflare R2.

## License

Proprietary — see [LICENSE](./LICENSE). Source is here for review; do not redistribute.
