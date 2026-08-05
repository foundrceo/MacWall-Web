import "server-only"

import { AwsClient } from "aws4fetch"

import { getR2PublicBaseUrl } from "@/lib/env/catalog-storage"

/**
 * Server-side Cloudflare R2 (S3-compatible) access for the catalog bucket.
 *
 * Holds the R2 access keys (server-only). Used to mint presigned PUT/GET URLs
 * for uploads/reviews and to delete objects. Public reads are served directly
 * from the R2 public base URL (see `lib/env/catalog-storage.ts`).
 *
 * Ops (Cloudflare dashboard): enable Smart Tiered Cache on the zone that fronts
 * `cdn.macwall.app` to cut R2 egress — catalog uploads already set long immutable
 * Cache-Control.
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
  expiresSeconds: number,
  headers?: Record<string, string>
): Promise<string> {
  const { client, config } = requireR2()
  const url = new URL(objectEndpoint(config, key))
  url.searchParams.set("X-Amz-Expires", String(expiresSeconds))

  // Bind Content-Type (and any other required headers) into the signature so
  // clients must upload with the declared type — Cloudflare R2 / S3 best practice.
  if (headers && Object.keys(headers).length > 0) {
    const request = new Request(url.toString(), { method, headers })
    const signed = await client.sign(request, {
      aws: { signQuery: true },
    })
    return signed.url
  }

  const signed = await client.sign(url.toString(), {
    method,
    aws: { signQuery: true },
  })
  return signed.url
}

/** Presigned URL for uploading an object via HTTP PUT. */
export function r2PresignPutUrl(
  key: string,
  expiresSeconds = 3600,
  options?: { contentType?: string }
) {
  const headers = options?.contentType
    ? { "Content-Type": options.contentType }
    : undefined
  return presign(key, "PUT", expiresSeconds, headers)
}

/** Presigned URL for downloading an object via HTTP GET. */
export function r2PresignGetUrl(key: string, expiresSeconds = 3600) {
  return presign(key, "GET", expiresSeconds)
}

export type R2CompletedPart = {
  partNumber: number
  etag: string
}

/**
 * Start an S3-compatible multipart upload.
 * Content-Type / Cache-Control are set on the final object at create time.
 */
export async function r2CreateMultipartUpload(
  key: string,
  options: { contentType: string; cacheControl?: string }
): Promise<{ uploadId: string }> {
  const { client, config } = requireR2()
  const url = new URL(objectEndpoint(config, key))
  url.searchParams.set("uploads", "")

  const headers: Record<string, string> = {
    "Content-Type": options.contentType,
  }
  if (options.cacheControl) {
    headers["Cache-Control"] = options.cacheControl
  }

  const response = await client.fetch(url.toString(), {
    method: "POST",
    headers,
  })
  if (!response.ok) {
    const body = await response.text().catch(() => "")
    throw new Error(
      `R2 multipart create failed for ${key}: HTTP ${response.status} ${body}`
    )
  }

  const xml = await response.text()
  const uploadId = xml.match(/<UploadId>([^<]+)<\/UploadId>/)?.[1]
  if (!uploadId) {
    throw new Error(`R2 multipart create missing UploadId for ${key}.`)
  }
  return { uploadId }
}

/** Presigned PUT URL for a single multipart part (browser → R2 direct). */
export async function r2PresignUploadPartUrl(
  key: string,
  uploadId: string,
  partNumber: number,
  expiresSeconds = 3600
): Promise<string> {
  if (!Number.isInteger(partNumber) || partNumber < 1 || partNumber > 10_000) {
    throw new Error(`Invalid multipart part number: ${partNumber}`)
  }

  const { client, config } = requireR2()
  const url = new URL(objectEndpoint(config, key))
  url.searchParams.set("partNumber", String(partNumber))
  url.searchParams.set("uploadId", uploadId)
  url.searchParams.set("X-Amz-Expires", String(expiresSeconds))
  const signed = await client.sign(url.toString(), {
    method: "PUT",
    aws: { signQuery: true },
  })
  return signed.url
}

/** List uploaded parts for an in-progress multipart upload. */
export async function r2ListMultipartParts(
  key: string,
  uploadId: string
): Promise<R2CompletedPart[]> {
  const { client, config } = requireR2()
  const parts: R2CompletedPart[] = []
  let partNumberMarker = 0

  // Paginate until IsTruncated is false (R2 returns up to 1000 parts/page).
  for (let page = 0; page < 20; page += 1) {
    const url = new URL(objectEndpoint(config, key))
    url.searchParams.set("uploadId", uploadId)
    if (partNumberMarker > 0) {
      url.searchParams.set("part-number-marker", String(partNumberMarker))
    }

    const response = await client.fetch(url.toString(), { method: "GET" })
    if (!response.ok) {
      const body = await response.text().catch(() => "")
      throw new Error(
        `R2 list parts failed for ${key}: HTTP ${response.status} ${body}`
      )
    }

    const xml = await response.text()
    const partBlocks = xml.match(/<Part>[\s\S]*?<\/Part>/g) ?? []
    for (const block of partBlocks) {
      const partNumber = Number(
        block.match(/<PartNumber>(\d+)<\/PartNumber>/)?.[1]
      )
      const etag = block.match(/<ETag>([^<]+)<\/ETag>/)?.[1]
      if (!Number.isInteger(partNumber) || !etag) continue
      parts.push({ partNumber, etag })
    }

    const truncated = /<IsTruncated>\s*true\s*<\/IsTruncated>/i.test(xml)
    if (!truncated) break

    const nextMarker = Number(
      xml.match(/<NextPartNumberMarker>(\d+)<\/NextPartNumberMarker>/)?.[1]
    )
    if (!Number.isInteger(nextMarker) || nextMarker <= partNumberMarker) {
      break
    }
    partNumberMarker = nextMarker
  }

  return parts.sort((a, b) => a.partNumber - b.partNumber)
}

/** Finish a multipart upload. Prefers client-provided ETags; falls back to ListParts. */
export async function r2CompleteMultipartUpload(
  key: string,
  uploadId: string,
  parts?: R2CompletedPart[]
): Promise<void> {
  const { client, config } = requireR2()
  const completed =
    parts && parts.length > 0
      ? [...parts].sort((a, b) => a.partNumber - b.partNumber)
      : await r2ListMultipartParts(key, uploadId)

  if (!completed.length) {
    throw new Error(`R2 multipart complete has no parts for ${key}.`)
  }

  const body = [
    "<CompleteMultipartUpload>",
    ...completed.map(
      ({ partNumber, etag }) =>
        `<Part><PartNumber>${partNumber}</PartNumber><ETag>${etag}</ETag></Part>`
    ),
    "</CompleteMultipartUpload>",
  ].join("")

  const url = new URL(objectEndpoint(config, key))
  url.searchParams.set("uploadId", uploadId)
  const response = await client.fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/xml" },
    body,
  })
  if (!response.ok) {
    const text = await response.text().catch(() => "")
    throw new Error(
      `R2 multipart complete failed for ${key}: HTTP ${response.status} ${text}`
    )
  }
}

/** Abort an incomplete multipart upload (best-effort cleanup). */
export async function r2AbortMultipartUpload(
  key: string,
  uploadId: string
): Promise<void> {
  const { client, config } = requireR2()
  const url = new URL(objectEndpoint(config, key))
  url.searchParams.set("uploadId", uploadId)
  const response = await client.fetch(url.toString(), { method: "DELETE" })
  if (!response.ok && response.status !== 404) {
    const text = await response.text().catch(() => "")
    throw new Error(
      `R2 multipart abort failed for ${key}: HTTP ${response.status} ${text}`
    )
  }
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
