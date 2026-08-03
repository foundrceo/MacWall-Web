# MacWall

Native **macOS** app for live wallpapers. This repo is the website behind [macwall.app](https://macwall.app) — marketing pages, download, pricing, Stripe checkout, and license activation.

Mac only. Not iOS, Windows, or web-playable.

## Try it (reviewers)

1. Download from https://macwall.app/download
2. Install and open the app
3. Paste a license key when asked

The demo key is not listed in plain text. Decode it in a terminal:

```sh
echo TVctVjdOOC1SWUxKLUg5OVY= | base64 --decode
```

That unlocks Pro for review. Please do not share it publicly.

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
