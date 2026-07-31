# MacWall Web

Live site: https://macwall.app

This is the web side of MacWall, a native macOS app for cinematic live wallpapers.

You can download the free app, browse all the wallpapers and upgrade to Pro from the website. We have both annual and permanent plans, payments are handled with Stripe.

After checkout the license activates inside the Mac app using a `macwall://activate` deep link.

If you just want to try MacWall, open the website and download it. You dont need to setup this repo locally.

## Download

Latest Mac installer:

**MacWall 2.9 DMG**

You can get `MacWall.dmg` from the latest GitHub release or download it here:

https://macwall.app/download

## Screenshots

### Homepage

MacWall homepage

### Pricing

MacWall pricing

### App settings

Battery and playback controls inside the app.

MacWall settings

## What this repo includes

This repo has pretty much everything related to the MacWall website:

Main homepage and product pages
Live wallpaper hero demo
Lock Screen and Screen Saver pages
Pricing and Stripe Checkout
Annual, permanent and 5 Mac plans
India coupon support
Thank you and license activation flow
Blog and SEO pages
Wallpaper category pages
Community wallpaper submissions
Affiliate program
Support inbox
Admin tools for managing wallpapers
License emails using Supabase

The actual Mac app is written in Swift and is in a seperate repo. This repository is only for the website and commerce side.

## Stack

Next.js App Router
Stripe
Supabase
Vercel
Tailwind CSS
shadcn/ui

## Run locally

```bash
npm install
```

Copy your actual secrets into `.env` for local development only. Dont commit them.

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

Some useful routes:

```text
/
/pricing
/download
/blog
/submit
/affiliate
/support
```

## AI use

I used Cursor while building this website. Mostly for helping with components, Stripe checkout wiring, SEO pages, admin tools and some early copy drafts.

The idea, product direction, pricing, branding and design decisions are mine. The native Mac app is also built seperately by me.

Cursor helped me move faster, but I still reviewed and changed the code based on what MacWall actually needed. This README was also written and edited by me, its not just generated boilerplate.

