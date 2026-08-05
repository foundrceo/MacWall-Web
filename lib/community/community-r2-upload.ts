/**
 * Browser-side community R2 uploads.
 * Large videos use S3 multipart with parallel parts (bytes go browser → R2).
 * @see https://developers.cloudflare.com/r2/objects/upload-objects/
 */

import {
  COMMUNITY_MULTIPART_THRESHOLD_BYTES,
} from "@/lib/community/community-multipart-constants"

export const COMMUNITY_PART_CONCURRENCY = 6
export const COMMUNITY_UPLOAD_RETRY_ATTEMPTS = 3
export const COMMUNITY_UPLOAD_RETRY_BASE_DELAY_MS = 800

export { COMMUNITY_MULTIPART_THRESHOLD_BYTES }

type MultipartCreateResponse = {
  mode?: string
  key: string
  videoKey?: string
  thumbKey?: string
  uploadId: string
  partSizeBytes: number
  partCount: number
  partUrls: Array<{ partNumber: number; url: string }>
  thumbUploadUrl?: string
  videoContentType?: string
  thumbContentType?: string
  error?: string
}

type MultipartCompleteResponse = {
  completed?: boolean
  error?: string
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

async function readJsonResponse<T extends { error?: string }>(
  response: Response,
  fallback: string
): Promise<T> {
  try {
    return (await response.json()) as T
  } catch {
    return { error: fallback } as T
  }
}

function putBlobWithProgress(
  url: string,
  body: Blob,
  headers: Record<string, string>,
  onProgress?: (loadedBytes: number) => void
): Promise<{ etag: string | null }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open("PUT", url)
    for (const [key, value] of Object.entries(headers)) {
      xhr.setRequestHeader(key, value)
    }

    xhr.upload.onprogress = (event) => {
      if (!onProgress) return
      onProgress(event.loaded)
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({ etag: xhr.getResponseHeader("etag") })
        return
      }
      reject(new Error(`HTTP ${xhr.status}`))
    }
    xhr.onerror = () => reject(new Error("Network error during R2 upload."))
    xhr.onabort = () => reject(new Error("Upload aborted."))
    xhr.send(body)
  })
}

async function putWithRetries(
  url: string,
  body: Blob,
  headers: Record<string, string>,
  onProgress?: (loadedBytes: number) => void
): Promise<{ etag: string | null }> {
  let lastError: unknown = null
  for (let attempt = 1; attempt <= COMMUNITY_UPLOAD_RETRY_ATTEMPTS; attempt += 1) {
    try {
      return await putBlobWithProgress(url, body, headers, onProgress)
    } catch (error) {
      lastError = error
      if (attempt < COMMUNITY_UPLOAD_RETRY_ATTEMPTS) {
        await sleep(COMMUNITY_UPLOAD_RETRY_BASE_DELAY_MS * 2 ** (attempt - 1))
      }
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error("R2 upload failed after retries.")
}

async function runPool<T>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<void>
) {
  let next = 0
  const workers = Array.from({
    length: Math.min(limit, items.length),
  }).map(async () => {
    while (next < items.length) {
      const item = items[next]
      next += 1
      await worker(item)
    }
  })
  await Promise.all(workers)
}

/** Single-object PUT with retries (small videos / thumbnails). */
export async function uploadCommunityObjectDirect({
  signedUrl,
  body,
  contentType,
}: {
  signedUrl: string
  body: Blob
  contentType: string
}) {
  await putWithRetries(signedUrl, body, { "Content-Type": contentType })
}

/** Parallel multipart PUT for large community videos (+ thumb in parallel). */
export async function uploadCommunityVideoMultipart({
  uploadId,
  videoExtension,
  videoContentType,
  file,
  thumbBlob,
  onProgress,
}: {
  uploadId: string
  videoExtension: string
  videoContentType: string
  file: Blob
  thumbBlob: Blob
  onProgress?: (fraction: number) => void
}): Promise<{
  videoKey: string
  thumbKey: string
  videoContentType: string
}> {
  const createRes = await fetch("/api/community/upload/multipart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "create",
      uploadId,
      videoExtension,
      videoContentType,
      sizeBytes: file.size,
    }),
  })
  const created = await readJsonResponse<MultipartCreateResponse>(
    createRes,
    "Could not start multipart upload."
  )
  if (!createRes.ok) {
    throw new Error(created.error ?? "Could not start multipart upload.")
  }
  if (!created.thumbUploadUrl) {
    throw new Error("Multipart create missing thumbnail upload URL.")
  }

  const partProgress = new Map<number, number>()
  const reportProgress = () => {
    if (!onProgress) return
    let loaded = 0
    for (const value of partProgress.values()) loaded += value
    onProgress(Math.min(1, loaded / Math.max(1, file.size)))
  }

  const thumbUpload = uploadCommunityObjectDirect({
    signedUrl: created.thumbUploadUrl,
    body: thumbBlob,
    contentType: "image/jpeg",
  })

  try {
    const completedParts: Array<{ partNumber: number; etag: string }> = []

    await runPool(
      created.partUrls,
      COMMUNITY_PART_CONCURRENCY,
      async ({ partNumber, url }) => {
        const start = (partNumber - 1) * created.partSizeBytes
        const end = Math.min(start + created.partSizeBytes, file.size)
        const chunk = file.slice(start, end)

        const { etag } = await putWithRetries(url, chunk, {}, (loadedBytes) => {
          partProgress.set(partNumber, loadedBytes)
          reportProgress()
        })

        partProgress.set(partNumber, chunk.size)
        reportProgress()

        if (etag) {
          completedParts.push({ partNumber, etag })
        }
      }
    )

    const completeRes = await fetch("/api/community/upload/multipart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "complete",
        key: created.key,
        uploadId: created.uploadId,
        parts:
          completedParts.length === created.partCount
            ? completedParts
            : undefined,
      }),
    })
    const completed = await readJsonResponse<MultipartCompleteResponse>(
      completeRes,
      "Could not finalize multipart upload."
    )
    if (!completeRes.ok) {
      throw new Error(completed.error ?? "Could not finalize multipart upload.")
    }

    await thumbUpload
    onProgress?.(1)

    return {
      videoKey: created.videoKey ?? created.key,
      thumbKey: created.thumbKey ?? "",
      videoContentType: created.videoContentType ?? videoContentType,
    }
  } catch (error) {
    await fetch("/api/community/upload/multipart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "abort",
        key: created.key,
        uploadId: created.uploadId,
      }),
    }).catch(() => {})
    throw error
  }
}
