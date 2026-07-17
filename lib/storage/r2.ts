import "server-only"

import { AwsClient } from "aws4fetch"

import { getR2PublicBaseUrl } from "@/lib/env/catalog-storage"

/**
 * Server-side Cloudflare R2 (S3-compatible) access for the catalog bucket.
 *
 * Holds the R2 access keys (server-only). Used to mint presigned PUT/GET URLs
 * for uploads/reviews and to delete objects. Public reads are served directly
 * from the R2 public base URL (see `lib/env/catalog-storage.ts`).
 */

const DEFAULT_BUCKET = "wallpaper-catalog"

type R2Config = {
  accountId: string
  bucket: string
  accessKeyId: string
  secretAccessKey: string
}

function readR2Config(): R2Config | null {
  const accountId = process.env.R2_ACCOUNT_ID?.trim()
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim()
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim()
  const bucket = process.env.R2_BUCKET?.trim() || DEFAULT_BUCKET
  if (!accountId || !accessKeyId || !secretAccessKey) return null
  return { accountId, bucket, accessKeyId, secretAccessKey }
}

/** True when R2 write credentials (presign/delete) are configured. */
export function isR2WriteEnabled(): boolean {
  return readR2Config() !== null
}

function requireR2(): { client: AwsClient; config: R2Config } {
  const config = readR2Config()
  if (!config) {
    throw new Error(
      "R2 is not configured (set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY)."
    )
  }
  const client = new AwsClient({
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    region: "auto",
    service: "s3",
  })
  return { client, config }
}

function encodeObjectKey(key: string): string {
  return key
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/")
}

function objectEndpoint(config: R2Config, key: string): string {
  return `https://${config.accountId}.r2.cloudflarestorage.com/${config.bucket}/${encodeObjectKey(key)}`
}

async function presign(
  key: string,
  method: "PUT" | "GET",
  expiresSeconds: number
): Promise<string> {
  const { client, config } = requireR2()
  const url = new URL(objectEndpoint(config, key))
  url.searchParams.set("X-Amz-Expires", String(expiresSeconds))
  const signed = await client.sign(url.toString(), {
    method,
    aws: { signQuery: true },
  })
  return signed.url
}

/** Presigned URL for uploading an object via HTTP PUT. */
export function r2PresignPutUrl(key: string, expiresSeconds = 3600) {
  return presign(key, "PUT", expiresSeconds)
}

/** Presigned URL for downloading an object via HTTP GET. */
export function r2PresignGetUrl(key: string, expiresSeconds = 3600) {
  return presign(key, "GET", expiresSeconds)
}

/** Delete an object (idempotent — a missing object is treated as success). */
export async function r2DeleteObject(key: string): Promise<void> {
  const { client, config } = requireR2()
  const response = await client.fetch(objectEndpoint(config, key), {
    method: "DELETE",
  })
  if (!response.ok && response.status !== 404) {
    throw new Error(`R2 delete failed for ${key} (HTTP ${response.status}).`)
  }
}

/** HEAD against the private R2 API (authoritative for copy/skip logic). */
export async function r2ObjectExists(key: string): Promise<boolean> {
  const { client, config } = requireR2()
  const response = await client.fetch(objectEndpoint(config, key), {
    method: "HEAD",
  })
  return response.ok
}

/**
 * Server-side copy within the catalog bucket (`x-amz-copy-source`).
 * Idempotent when the destination already exists.
 */
export async function r2CopyObject(
  sourceKey: string,
  destKey: string
): Promise<void> {
  if (sourceKey === destKey) return

  const { client, config } = requireR2()
  if (await r2ObjectExists(destKey)) return

  const response = await client.fetch(objectEndpoint(config, destKey), {
    method: "PUT",
    headers: {
      "x-amz-copy-source": `/${config.bucket}/${encodeObjectKey(sourceKey)}`,
    },
  })
  if (!response.ok) {
    const body = await response.text().catch(() => "")
    throw new Error(
      `R2 copy ${sourceKey} -> ${destKey}: HTTP ${response.status} ${body}`
    )
  }
}

export type R2ObjectInfo = { exists: boolean; sizeBytes: number | null }

/** Existence + size via a HEAD against the public read base (objects are public). */
export async function r2HeadPublicObject(key: string): Promise<R2ObjectInfo> {
  const base = getR2PublicBaseUrl()
  const url = `${base}/${encodeObjectKey(key)}`
  try {
    const response = await fetch(url, { method: "HEAD", cache: "no-store" })
    if (!response.ok) return { exists: false, sizeBytes: null }
    const size = Number(response.headers.get("content-length"))
    return {
      exists: true,
      sizeBytes: Number.isFinite(size) && size > 0 ? Math.trunc(size) : null,
    }
  } catch {
    return { exists: false, sizeBytes: null }
  }
}
