import "server-only"

import { timingSafeEqual } from "node:crypto"

/** Compare secrets without leaking length via a cheap early return. */
export function secretsEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a)
  const bBuf = Buffer.from(b)
  if (aBuf.length !== bBuf.length) {
    const pad = Buffer.alloc(aBuf.length)
    timingSafeEqual(aBuf, pad)
    return false
  }
  return timingSafeEqual(aBuf, bBuf)
}
