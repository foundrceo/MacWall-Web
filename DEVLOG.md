# MacWall Web — Devlog

**Live:** https://macwall.app  
**Repo:** https://github.com/foundrceo/MacWall-Web  
**Installer:** [MacWall 2.9 DMG](https://github.com/foundrceo/MacWall-Web/releases/tag/v2.9)

---

I built MacWall because I wanted live wallpapers on Mac that feel native — not an Electron wrapper eating battery. The Swift app is the product. This repo is the storefront: marketing, Stripe checkout, license activation, downloads, blog, community submit, and admin tools.

## Why the web mattered

Shipping a Mac app without a clean buy/download flow is half a product. I needed:

1. A page that shows the app in motion (hero demo + Lock Screen pitch)
2. One-click Stripe checkout → license email → `macwall://activate`
3. A stable `/download/latest` that always hits the current DMG
4. Pricing that isn’t confusing (permanent, annual, 5-Mac, Reel refund)

That’s what this site is.

## What I actually built (timeline)

**Foundation**  
Next.js App Router site on Vercel. Marketing pages, SEO landings, wallpaper category routes, blog. Public catalog reads from Supabase; media on Cloudflare R2 (`cdn.macwall.app`).

**Payments**  
Moved off Whop to Stripe Checkout. Server creates a pending license row, redirects to Stripe, then activation deep-links into the Mac app. India gets an automatic coupon path so pricing stays fair without showing fake INR UI.

**Pricing iterations**  
This changed a lot. Early-bird $7.99 → permanent $9.99 / annual $4.99 / 5-Mac $14.99. I rewrote the pricing UI, added NumberFlow animations, and shipped a dedicated Reel Refund page (post with `#macwall`, earn money back on views).

**Growth / partners**  
Affiliate landing + Affonso first-party pixel (`/r` proxy) so attribution survives ad blockers. DataFast for Stripe revenue attribution. Affiliate CTA points at `affiliates.macwall.app`.

**Polish & trust**  
Homepage and pricing screenshots in the README. GitHub Release with `MacWall.dmg` only (no app source in the release tag). Removed Discord from nav/footer when it stopped being the main support channel. Support lives at `/support` + email.

**Open source cleanup**  
Stripped skills folders, local supabase deploy sources, and ops docs from the public repo. Scrubbed old commits that had baked-in project IDs / anon key leftovers. Production secrets stay in `.env` / Vercel only.

## Hard parts

- **Checkout edge cases:** abandoned sessions, recovery emails, license already pending, India coupon only when geo says India.
- **Installer delivery:** DMG isn’t in git. It’s on R2, served through `/api/installers/releases/MacWall.dmg` and `/download/latest`.
- **Not leaking internals:** public APIs used to return raw R2/Supabase error strings. Tightened those so users only get generic failures.
- **Price copy drift:** marketing, SEO, blog, and Stripe prices got out of sync more than once. Fixed by treating Stripe offers as source of truth.

## Stack

Next.js 16, React 19, Stripe, Supabase, R2, Vercel, Tailwind / shadcn.

## AI use (honest)

I used Cursor as a coding assistant for speed — scaffolding, some checkout wiring, SEO pages, and debugging. Product decisions, pricing, brand, and the Mac app are mine. This site is not “AI wrote the whole thing.”

## Try it

1. Open https://macwall.app
2. Hit **Download for macOS** (or grab the [DMG release](https://github.com/foundrceo/MacWall-Web/releases/tag/v2.9))
3. Browse `/pricing` if you want to see Pro / annual / Reel refund

That’s the ship: a real live URL, a real installer, and a checkout path that activates the native app.
