# macwall-web

this repo is the **website** for [macwall.app](https://macwall.app) — marketing pages, download, pricing, stripe checkout, and license activation.

it is **not** the native mac app. the desktop app lives in a separate private repo. this open source project is web only.

![macwall homepage](public/screenshots/homepage.png)

## what this repo is

- next.js site for https://macwall.app
- download + pricing + checkout flows
- license key activation helpers used by the mac app
- blog, docs, changelog, community submission pages
- legal center at [/legal](https://macwall.app/legal)

## what this repo is not

- not the macOS app source
- not a browser wallpaper player
- not windows / ios

## try the live site

- **site:** https://macwall.app
- **download page:** https://macwall.app/download

the marketing site works without paying. checkout and licensing need real env keys if you run those flows locally.

### reviewers (optional product check)

if you want to see the full product the site sells:

1. open https://macwall.app/download and install the free mac app
2. when it asks for a license key, paste one in

demo key (not plain text):

```sh
echo TVctVjdOOC1SWUxKLUg5OVY= | base64 --decode
```

please don’t share that key around. mac only for the app binary.

## run this website locally

needs **node** 18+.

```sh
git clone https://github.com/foundrceo/MacWall-Web.git
cd MacWall-Web
npm install
cp .env.example .env
npm run dev
```

open http://localhost:3000. most of the marketing site runs with empty env; checkout and licensing need real keys in `.env` (see `.env.example`).

```sh
npm run lint
npm run typecheck
npm run build
```

## stack

next.js, typescript, tailwind, stripe, supabase, vercel, cloudflare r2 for media/installers.

## credits

see [CREDITS.md](./CREDITS.md).

## security

see [SECURITY.md](./SECURITY.md) — report issues to support@macwall.app.

## license

mit — see [LICENSE](./LICENSE).
