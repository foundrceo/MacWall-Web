# MacWall Web

hey! this is the website for **[MacWall](https://macwall.app)** — a native macOS app for cinematic live wallpapers.

**demo (no setup needed):** [https://macwall.app](https://macwall.app)

you can download the free app, browse the wallpaper catalog, and upgrade to Pro from the site. payments go through Stripe. after checkout, the license opens the Mac app with a `macwall://activate` deep link.

if you just want to try MacWall, open the site and hit download. you dont need this repo for that.

![MacWall homepage](public/screenshots/homepage.png)

## why I made this

I built MacWall (the Mac app) first, then realized the product needed a real home on the web — not just a landing page. this repo is that home: pricing, Stripe checkout, license delivery, blog/SEO pages, community wallpaper submissions, affiliates, and support.

the actual Mac app is Swift and lives in a separate repo. this one is everything on the web + commerce side.

## screenshots

### homepage

the marketing site with the live wallpaper hero.

![MacWall homepage](public/screenshots/homepage.png)

### pricing

free, annual Pro, permanent Pro Plus, and the Reel Refund offer.

![MacWall pricing](public/screenshots/pricing.png)

### app settings

battery + playback controls inside the Mac app (shown so you can see what the site is selling).

![MacWall settings](public/screenshots/settings.jpg)

## what this repo does

- main homepage + product pages (hero demo, lock screen / screen saver pitches)
- pricing + Stripe Checkout (annual, permanent, 5-Mac plans, India coupon support)
- thank-you / license activation flow (`macwall://activate`)
- blog + SEO landing pages + wallpaper category pages
- community wallpaper submissions
- affiliate program pages
- support inbox UI
- admin tools for managing the wallpaper catalog
- license emails via Supabase edge functions

## how this was made

stack is pretty straightforward once you see the pieces:

- **[Next.js](https://nextjs.org)** App Router for the site (React + TypeScript)
- **[Stripe](https://stripe.com)** Checkout for payments
- **[Supabase](https://supabase.com)** for licenses, device limits, and edge functions that send license emails
- **[Vercel](https://vercel.com)** for hosting
- **[Tailwind CSS](https://tailwindcss.com)** + **[shadcn/ui](https://ui.shadcn.com)** for the UI
- **Cloudflare R2** (`cdn.macwall.app`) for wallpaper posters / clips

### problems I had to fix

a few things that actually took work:

1. **abandoned checkout recovery** — Stripe does not tell you “this person abandoned after 5 minutes.” I ended up with a DB queue + cron edge function that sends a recovery email if payment never completed.
2. **making the hero feel like the real app** — the homepage demo uses real catalog clips (not fake mockups), so the marketing site matches what you get after download.
3. **keeping secrets out of the public repo** — Stripe / Supabase / R2 keys stay in env only. the open-source tree should be safe to clone without leaking production credentials.

## tech stack

| piece | what its for |
| --- | --- |
| Next.js 16 (App Router) | website + API routes |
| React 19 + TypeScript | UI |
| Stripe | Checkout / payments |
| Supabase | licenses, edge functions, emails |
| Vercel | deploy + hosting |
| Tailwind CSS + shadcn/ui | styling / components |
| Cloudflare R2 | wallpaper media CDN |
| Motion | marketing animations |

## heres how to run the project

### 1. clone the source code

```sh
git clone https://github.com/foundrceo/MacWall-Web.git
cd MacWall-Web
```

### 2. install dependencies

```sh
npm install
```

### 3. add env vars

create a `.env` file in the project root (do **not** commit it). for local development youll want at least:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
STRIPE_SECRET_KEY=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
NEXT_PUBLIC_R2_PUBLIC_BASE_URL=https://cdn.macwall.app
```

checkout, admin, and license email flows need the Stripe + Supabase keys. marketing pages can still render without every secret filled in.

### 4. start the dev server

```sh
npm run dev
```

open [http://localhost:3000](http://localhost:3000)

### 5. build for production (optional)

```sh
npm run build
npm start
```

### useful routes

| route | what it is |
| --- | --- |
| `/` | homepage |
| `/pricing` | plans + Stripe checkout |
| `/download` | Mac installer |
| `/blog` | blog |
| `/submit` | community wallpaper submissions |
| `/affiliate` | affiliate program |
| `/support` | support inbox |

## download the Mac app

latest installer is on the site:

**[https://macwall.app/download](https://macwall.app/download)**

or grab `MacWall.dmg` from the latest GitHub Release on this repo.

## AI disclosure

I used Cursor while building this website — mostly for components, Stripe checkout wiring, SEO pages, admin tools, and some early copy drafts.

the idea, product direction, pricing, branding, and design decisions are mine. the native Mac app is also built separately by me.

Cursor helped me move faster, but I still reviewed and changed the code based on what MacWall actually needed. this README was written and edited by me for the project — it is not pasted AI boilerplate.
