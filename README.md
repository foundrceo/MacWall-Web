# MacWall Web

hey! this is the website for **[MacWall](https://macwall.app)** — a native macOS app for cinematic live 4K wallpapers.

**live site (no setup):** [https://macwall.app](https://macwall.app)

browse the catalog, download the free Mac app, and unlock Pro with a one-time Stripe checkout. after payment, the license opens the app via `macwall://activate`.

you dont need this repo just to use MacWall — clone it if you want to run or contribute to the web + commerce side.

![MacWall homepage — live 4K wallpapers hero](public/screenshots/homepage.png)

## why I made this

I built MacWall (the Mac app) first, then needed a real home on the web — not a throwaway landing page. this repo is that home: marketing, pricing, Stripe checkout, license delivery, blog/SEO, community submissions, affiliates, and support.

the Mac app itself is Swift and lives in a separate repo. this one is the public web + commerce stack.

## screenshots (current)

### homepage hero

live wallpaper product shot, download CTA, and “pay once, own it forever” positioning. catalog callout: **1,000+ wallpapers**. minimum **macOS 14.0+**.

![MacWall homepage](public/screenshots/homepage.png)

### pricing

three plans — **Free**, **Pro** ($7.99 one-time, limited sale), and **Pro+** ($12.99 one-time for up to 5 Macs). no new annual subscriptions. Stripe Adaptive Pricing localizes presentment at checkout.

![MacWall pricing — Free / Pro / Pro+](public/screenshots/pricing.png)

### app settings

battery + playback controls inside the Mac app (what the site is selling).

![MacWall settings](public/screenshots/settings.jpg)

## what this repo does

- homepage with real catalog hero demo (Home / Explore / Library UI)
- pricing: Free · Pro (3 Macs) · Pro+ (5 Macs) — pay once, lifetime updates
- Stripe Checkout only (`/api/checkout/create-session`) + Adaptive Pricing
- thank-you / license activation (`macwall://activate`)
- abandoned-checkout recovery queue (Supabase + cron edge function)
- blog, SEO landings, wallpaper category pages
- community wallpaper submissions
- affiliate program pages
- support inbox UI
- admin tools for the wallpaper catalog
- license emails via Supabase edge functions

## pricing model (current)

| plan | price | India | discount vs global | what you get |
| --- | --- | --- | --- | --- |
| **Free** | $0 | $0 | — | curated free wallpapers, menu bar, multi-display, community uploads |
| **Pro** | **$7.99** one-time (was $14.99) | **$3.99** | India Price | 1,000+ live wallpapers, Lock Screen & Screen Saver, import videos, up to **3 Macs**, Music Sync, lifetime updates |
| **Pro+** | **$12.99** one-time (was $24.99) | **$6.99** | India Price | everything in Pro on up to **5 Macs** |

headline on `/pricing`: **Pay once. Pro forever.** — limited price, no subscriptions for new buyers. India visitors see **$3.99 / $6.99** and Checkout uses dedicated India Stripe Prices (same product, no coupon). Everyone else uses **$7.99 / $12.99**.

creators can still earn up to 100% back via the [Reel Refund](https://macwall.app/pricing/reel-refund) offer.

## how this was made

- **[Next.js](https://nextjs.org)** App Router (React + TypeScript)
- **[Stripe](https://stripe.com)** Checkout for payments (only gateway)
- **[Supabase](https://supabase.com)** for licenses, device limits, edge functions
- **[Vercel](https://vercel.com)** hosting
- **[Tailwind CSS](https://tailwindcss.com)** + **[shadcn/ui](https://ui.shadcn.com)**
- **Cloudflare R2** (`cdn.macwall.app`) for wallpaper media

### problems I had to fix

1. **abandoned checkout recovery** — Stripe doesnt tell you someone bailed after 5 minutes. solved with a DB queue + cron edge function that emails a recovery link if payment never completed.
2. **hero that matches the real app** — homepage uses real catalog clips / UI chrome, not fake mockups.
3. **secrets out of the public repo** — Stripe / Supabase / R2 stay in env + Vercel only. sanitized `.env.example` ships empty.

## tech stack

| piece | what its for |
| --- | --- |
| Next.js 16 (App Router) | website + API routes |
| React 19 + TypeScript | UI |
| Stripe | Checkout / Adaptive Pricing |
| Supabase | licenses, edge functions, emails |
| Vercel | deploy + hosting |
| Tailwind CSS + shadcn/ui | styling |
| Cloudflare R2 | wallpaper media CDN |
| Motion | marketing animations |

## heres how to run the project

### 1. clone

```sh
git clone https://github.com/foundrceo/MacWall-Web.git
cd MacWall-Web
```

### 2. install

```sh
npm install
```

### 3. env

copy `.env.example` → `.env` and fill real values (do **not** commit `.env`):

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
STRIPE_SECRET_KEY=...
NEXT_PUBLIC_R2_PUBLIC_BASE_URL=https://cdn.macwall.app
```

checkout, admin, and license emails need Stripe + Supabase. marketing pages can render without every secret filled in. see `.env.example` for the full list.

### 4. dev

```sh
npm run dev
```

open [http://localhost:3000](http://localhost:3000)

### 5. checks / production build

```sh
npm run lint
npm run typecheck
npm run build
npm start
```

### useful routes

| route | what it is |
| --- | --- |
| `/` | homepage hero |
| `/pricing` | Free / Pro / Pro+ |
| `/pricing/reel-refund` | creator refund offer |
| `/download` | Mac installer |
| `/blog` | blog |
| `/submit` | community wallpapers |
| `/affiliate` | affiliate program |
| `/support` | support inbox |

## download the Mac app

**[https://macwall.app/download](https://macwall.app/download)**

or grab `MacWall.dmg` from the latest GitHub Release on this repo.

## AI disclosure

I used Cursor while building this website — mostly for components, Stripe checkout wiring, SEO pages, admin tools, and some early copy drafts.

the idea, product direction, pricing, branding, and design decisions are mine. the native Mac app is built separately by me.

Cursor helped me move faster; I still reviewed and changed the code for what MacWall actually needed. this README was written and edited for the project — not pasted AI boilerplate.
