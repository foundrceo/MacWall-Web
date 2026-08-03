# macwall

live wallpapers for mac. this repo is the site at [macwall.app](https://macwall.app) — download, pricing, checkout, licenses, that kind of thing.

mac only. not for windows or phones.

## try the app

1. get it from https://macwall.app/download
2. install and open it
3. when it asks for a key, paste one in

reviewers: the demo key isn't written out here. run this and it'll print it:

```sh
echo TVctVjdOOC1SWUxKLUg5OVY= | base64 --decode
```

please don't share that key around.

## run the site

```sh
git clone https://github.com/foundrceo/MacWall-Web.git
cd MacWall-Web
npm install
cp .env.example .env
npm run dev
```

then open http://localhost:3000. checkout only works if you fill in real keys in `.env`.

## stuff used

next.js, typescript, tailwind, stripe, supabase, vercel, cloudflare r2

## license

see [LICENSE](./LICENSE). you can look at the code, but it's not open to copy or ship as your own.
