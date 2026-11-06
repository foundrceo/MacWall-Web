import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { matchRedirect, requestContextFromRequest } from 'vinext/config/config-matchers'

import nextConfig from '../next.config.mjs'

// next.config redirects run through vinext's own matcher (first match wins), as
// on the Worker. Every redirect is one hop to a page that renders.
const ORIGIN = 'https://macwall.app'
const redirects = await nextConfig.redirects()

function resolve(url) {
  const request = new Request(new URL(url, ORIGIN))
  return matchRedirect(new URL(request.url).pathname, redirects, requestContextFromRequest(request))
}

/** Follows config redirects on this origin; returns every hop. */
function follow(url) {
  const hops = []
  let current = url
  for (let i = 0; i < 10; i += 1) {
    const match = resolve(current)
    if (!match) return hops
    hops.push(match)
    if (!match.destination.startsWith('/')) return hops
    current = match.destination
  }
  assert.fail(`${url} loops: ${hops.map(hop => hop.destination).join(' -> ')}`)
}

const LEGACY_SLUGS = ['city', 'cats', 'fantasy', 'sci-fi', 'video-games']
const CATEGORY_SLUGS = ['anime', 'nature', 'cars', 'gaming', 'space', 'heroes', 'dark', 'abstract', 'others']

test('old and trimmed URLs land on the page that owns them, with a 308', () => {
  const expected = {
    '/live-wallpaper-mac': '/',
    '/support': '/docs',
    '/alternatives': '/compare',
    '/wallpapers/page/1': '/wallpapers',
    '/wallpapers/anime/page/1': '/wallpapers/anime',
    '/wallpapers/collections/city/page/1': '/wallpapers/collections/city',
    '/wallpaper/anime': '/wallpapers/anime',
    '/wallpapers/city': '/wallpapers/collections/city',
    '/wallpapers/cats': '/wallpapers/collections/cat',
    '/wallpapers/fantasy': '/wallpapers/collections/dark-fantasy',
    '/wallpapers/sci-fi': '/wallpapers/collections/cyberpunk',
    '/wallpapers/video-games': '/wallpapers/gaming',
    '/wallpaper/city': '/wallpapers/collections/city',
    '/wallpapers/city/page/1': '/wallpapers/collections/city',
    '/wallpapers/city/page/3': '/wallpapers/dark/page/3',
    '/wallpapers/cats/page/2': '/wallpapers/others/page/2',
    '/wallpapers/fantasy/page/2': '/wallpapers/others/page/2',
    '/wallpapers/sci-fi/page/2': '/wallpapers/heroes/page/2',
    '/wallpapers/video-games/page/4': '/wallpapers/gaming/page/4',
  }
  for (const [source, destination] of Object.entries(expected)) {
    const match = resolve(source)
    assert.ok(match, `${source} is not redirected`)
    assert.equal(match.destination, destination, source)
    assert.equal(match.permanent, true, `${source} is not permanent`)
  }
})

test('/lock-screen-wallpaper is a permanent redirect to a page', () => {
  const match = resolve('/lock-screen-wallpaper')
  assert.ok(match?.permanent)
  assert.equal(resolve(match.destination), null)
})

test('the pages themselves are never redirected', () => {
  for (const path of [
    '/',
    '/wallpapers',
    '/wallpapers/page/2',
    '/wallpapers/collections',
    '/wallpapers/collections/city',
    '/compare',
    '/docs',
    '/alternatives/plash',
    ...CATEGORY_SLUGS.flatMap(slug => [`/wallpapers/${slug}`, `/wallpapers/${slug}/page/2`]),
  ])
    assert.equal(resolve(path), null, `${path} redirects`)
})

test('detail URLs are left to the Worker, legacy categories included', () => {
  for (const { source } of redirects)
    assert.doesNotMatch(source, /^\/wallpaper\/[^/]+\/[^/]+/, `next.config has a detail-URL rule: ${source}`)
  for (const category of [...CATEGORY_SLUGS, ...LEGACY_SLUGS])
    assert.equal(resolve(`/wallpaper/${category}/example-1a2b3c4d`), null, category)
})

test('no redirect chains or loops', () => {
  const sample = { page: '2', category: 'anime', slug: 'city' }
  const fromRules = redirects
    .filter(rule => !rule.has && !rule.missing)
    .map(rule =>
      rule.source
        .replace(/:(\w+)\(([^|)]+)[^)]*\)/g, '$2')
        .replace(/:(\w+)[*+]/g, 'a')
        .replace(/:(\w+)/g, (_, name) => sample[name] ?? 'sample')
    )
  const probes = [
    ...fromRules,
    ...[...CATEGORY_SLUGS, ...LEGACY_SLUGS, 'collections'].flatMap(slug => [
      `/wallpaper/${slug}`,
      `/wallpapers/${slug}`,
      `/wallpapers/${slug}/page/1`,
      `/wallpapers/${slug}/page/2`,
    ]),
    '/wallpapers/city?tag=night',
  ]
  for (const url of probes) {
    const hops = follow(url)
    assert.ok(hops.length <= 1, `${url} chains: ${hops.map(hop => hop.destination).join(' -> ')}`)
  }
})

test('robots.txt keeps noindexed pages crawlable and blocks the installer download', () => {
  const robots = fs.readFileSync('app/robots.ts', 'utf8')
  const disallow = robots.match(/const DISALLOW = \[([\s\S]*?)\n\]/)?.[1] ?? ''
  const rules = [...disallow.matchAll(/^\s*"([^"]+)",/gm)].map(match => match[1])
  for (const rule of ['/download/latest', '/api/installers/', '/open$', '/auth/'])
    assert.ok(rules.includes(rule), `robots.txt is missing Disallow: ${rule}`)
  // These carry their own noindex, which a Disallow would hide.
  for (const page of ['/thank-you', '/open', '/activate', '/tiktok', '/unsubscribe'])
    assert.ok(!rules.includes(page), `robots.txt disallows ${page}`)
  assert.doesNotMatch(robots, /\bhost:/)
})
