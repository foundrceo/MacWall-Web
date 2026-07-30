# MacWall (web)

Live site: **[https://macwall.app](https://macwall.app)**

This is the marketing + commerce site for MacWall, a native macOS app for cinematic live wallpapers. Download the free app, browse the catalog, then unlock Pro (permanent or annual) through Stripe on this site. Licenses activate in-app via a deep link after checkout.

If you just want to try the product, open the link above — no local setup required.

## Download (DMG)

Latest Mac app installer: **[MacWall 2.9 DMG](https://github.com/foundrceo/MacWall-Web/releases/tag/v2.9)**  
(`MacWall.dmg` on the GitHub Release — or grab it from https://macwall.app/download)

## Screenshots

Homepage:

![MacWall homepage](public/screenshots/homepage.png)

Pricing:

![MacWall pricing](public/screenshots/pricing.png)

App settings / battery controls:

![MacWall settings](public/screenshots/settings.jpg)

## What it does

- Landing pages for the Mac app (hero demo, Lock Screen pitch, FAQ)
- Pricing + Stripe Checkout (permanent, annual, 5-Mac bundle; India coupon support)
- Post-purchase thank-you / activate flow (`macwall://activate`)
- Blog, SEO landings, wallpaper category pages
- Community wallpaper submit + affiliate program
- Support inbox UI, admin catalog tools, license emails (Supabase)

The actual Mac app (Swift) is a separate repo. This repo is everything on the web.

## Stack

Next.js (App Router), Stripe, Supabase, Vercel, Tailwind / shadcn.

## Local

```bash
npm install
# copy your real secrets into .env (local only — never commit)
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

Useful routes: `/`, `/pricing`, `/download`, `/blog`, `/submit`, `/affiliate`, `/support`.

## AI use

I used Cursor (AI coding assistant) while building this site — components, checkout wiring, SEO pages, admin tooling, copy drafts. Product direction, pricing, brand, and the Mac app are mine. I wrote this README myself; it is not AI-generated boilerplate.
