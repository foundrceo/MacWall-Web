# macwall

a native macOS app for cinematic live wallpapers — plus this website (download, pricing, checkout, licenses).

![macwall homepage](public/screenshots/homepage.png)

## try it

- **site:** https://macwall.app  
- **download (free):** https://macwall.app/download  
- **mac only** — not for windows, ios, or the browser

the website works without paying. the free app installs without an account. pro unlocks the full catalog and extras.

### reviewers / unlock without buying

1. download and open the app  
2. when it asks for a license key, paste one in  

the demo key isn’t written in plain text. decode it:

```sh
echo TVctVjdOOC1SWUxKLUg5OVY= | base64 --decode
```

please don’t share that key around.

## features

- browse wallpapers on the web and open them in the mac app
- free download + one-time pro license (no subscription required)
- stripe checkout and in-app license activation
- community wallpaper submissions
- blog, docs, changelog, and creator offer pages
- legal center at [/legal](https://macwall.app/legal) (privacy, dmca, etc.)

## run the site locally

needs a recent **node** (18+ recommended).

```sh
git clone https://github.com/foundrceo/MacWall-Web.git
cd MacWall-Web
npm install
cp .env.example .env
npm run dev
```

open http://localhost:3000. most of the marketing site runs with empty env; checkout and licensing need real keys in `.env` (see `.env.example`).

useful checks:

```sh
npm run lint
npm run typecheck
npm run build
```

## how it works

this repo is the **next.js** site for macwall.app. the desktop product is a separate native mac app. purchases go through a payment processor; license keys activate in-app via a deep link. catalog media and installers are served from cloud storage. private ops stay out of this public tree.

## credits

see [CREDITS.md](./CREDITS.md) for attribution and copyright notes.

## security

see [SECURITY.md](./SECURITY.md) — report issues to support@macwall.app.

## license

mit — see [LICENSE](./LICENSE).
