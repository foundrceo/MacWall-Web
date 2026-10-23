import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

// ROADMAP H4: the app needs macOS 15, and every price says it is paid once.
const read = rel => fs.readFileSync(rel, 'utf8')
const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
  const full = path.join(dir, entry.name)
  if (entry.isDirectory()) return entry.name === 'admin' || entry.name === '(protected)' ? [] : walk(full)
  return /\.(ts|tsx)$/.test(entry.name) ? [full] : []
})

test('the minimum macOS is 15 and reads as one phrase', () => {
  const site = read('lib/macwall-site.ts')
  assert.match(site, /macwallMinimumMacOSVersion = "macOS 15"/)
  assert.match(site, /macwallMinimumMacOSRequirementOrLater =\s*`\$\{macwallMinimumMacOSVersion\} or later`/)
})

test('no MacWall page or assistant prompt claims macOS 14 or older', () => {
  for (const file of [...walk('app'), ...walk('lib'), ...walk('components')]) {
    const text = read(file)
    for (const claim of ['14.0 or later', 'macOS 14 or later', 'macOS 13 or later', 'Sonoma or later'])
      assert.ok(!text.includes(claim), `${file} says "${claim}"`)
  }
})

test('every rendered Pro price says one-time next to it', () => {
  const phrase = /one-time|paid once|\bonce\b|no subscription/i
  for (const file of [...walk('app'), ...walk('components')]) {
    const lines = read(file).split('\n')
    lines.forEach((line, index) => {
      // Rendered as text (a `price={…}` prop goes to PlanCard, which says it under the price).
      if (!/(^|[^=$])\{(pricing\.permanentPrice|selected\.price)\}/.test(line)) return
      // The price element or the card it sits in (same component, a few lines around).
      const around = lines.slice(Math.max(0, index - 12), index + 40).join('\n')
      assert.match(around, phrase, `${file}:${index + 1} shows a price without "one-time"`)
    })
  }
})
