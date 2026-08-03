# MacWall Web

Website for **[MacWall](https://macwall.app)**, a native macOS app that brings live wallpapers to your desktop.

**Website:** https://macwall.app

This repository contains the website, pricing pages, checkout flow, licensing, blog, and a few other supporting pages.
![MacWall homepage](public/screenshots/homepage.png)

## Features

* Homepage
* Pricing (Free, Pro, Pro+)
* Stripe Checkout
* License activation
* Blog
* Community wallpaper submissions
* Affiliate pages
* Support inbox UI

## Screenshots

### Homepage

![MacWall homepage](public/screenshots/homepage.png)

### Pricing

![MacWall pricing](public/screenshots/pricing.png)

### App Settings

![MacWall settings](public/screenshots/settings.jpg)

## Tech Stack

| Technology               | Purpose                |
| ------------------------ | ---------------------- |
| Next.js (App Router)     | Website and API routes |
| React + TypeScript       | Frontend               |
| Stripe                   | Payments               |
| Supabase                 | Backend and licensing  |
| Vercel                   | Hosting                |
| Tailwind CSS + shadcn/ui | UI                     |
| Cloudflare R2            | Wallpaper storage      |

## Local Development

```sh
git clone https://github.com/foundrceo/MacWall-Web.git
cd MacWall-Web
npm install
cp .env.example .env
npm run dev
```

Create a `.env` file from `.env.example`.

Most of the website will run without much setup. To test checkout or licensing, you'll need valid Stripe and Supabase credentials.

A few useful commands:

```sh
npm run lint
npm run typecheck
npm run build
```

The development server runs at:

```
http://localhost:3000
```

## Routes

| Route        | Description       |
| ------------ | ----------------- |
| `/`          | Home              |
| `/pricing`   | Pricing           |
| `/download`  | Download page     |
| `/blog`      | Blog              |
| `/submit`    | Submit wallpapers |
| `/affiliate` | Affiliate program |
| `/support`   | Support           |

## Project Structure

```text
app/            Next.js App Router (pages + API routes)
components/     UI and marketing components
lib/            Shared utilities
public/         Static assets
scripts/        Build helpers (changelog + blog thumbs)
```

Private backend (Supabase Edge Functions, DB migrations, ops scripts) lives outside this repo and is not published.

## Download

https://macwall.app/download

## License

This project is proprietary. See [LICENSE](./LICENSE) for details.
