import "server-only"

import { AwsClient } from "aws4fetch"

const INSTALLERS_BUCKET = "installers"

type R2Config = {
  accountId: string
  bucket: string
  accessKeyId: string
  secretAccessKey: string
}

function readR2Config(): R2Config {
  const accountId = process.env.R2_ACCOUNT_ID?.trim()
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim()
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim()
  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "R2 is not configured (set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY)."
    )
  }
  return {
    accountId,
    bucket: process.env.R2_INSTALLERS_BUCKET?.trim() || INSTALLERS_BUCKET,
    accessKeyId,
    secretAccessKey,
  }
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

function clientFor(config: R2Config): AwsClient {
  return new AwsClient({
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    region: "auto",
    service: "s3",
  })
}

/** Presigned GET for an object in the R2 `installers` bucket. */
export async function r2InstallersPresignGetUrl(
  key: string,
  expiresSeconds = 3600
): Promise<string> {
  const config = readR2Config()
  const client = clientFor(config)
  const url = new URL(objectEndpoint(config, key))
  url.searchParams.set("X-Amz-Expires", String(expiresSeconds))
  const signed = await client.sign(url.toString(), {
    method: "GET",
    aws: { signQuery: true },
  })
  return signed.url
}

/** Read a small text object from the installers bucket (e.g. version.json). */
export async function r2InstallersGetText(key: string): Promise<string> {
  const config = readR2Config()
  const client = clientFor(config)
  const response = await client.fetch(objectEndpoint(config, key), {
    method: "GET",
  })
  if (!response.ok) {
    throw new Error(`R2 installers GET ${key}: HTTP ${response.status}`)
  }
  return response.text()
}
