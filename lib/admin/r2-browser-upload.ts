/**
 * Browser-side R2 upload helpers for admin bulk catalog publishing.
 * Large videos use S3 multipart with parallel parts (bytes go browser → R2).
 */

export const UPLOAD_FILE_CONCURRENCY = 3
export const MULTIPART_THRESHOLD_BYTES = 32 * 1024 * 1024
export const MULTIPART_PART_CONCURRENCY = 6
export const UPLOAD_RETRY_ATTEMPTS = 3
export const UPLOAD_RETRY_BASE_DELAY_MS = 800

export type BrowserUploadProgress = {
  loadedBytes: number
  totalBytes: number
}

type MultipartCreateResponse = {
  key: string
  uploadId: string
  partSizeBytes: number
  partCount: number
  partUrls: Array<{ partNumber: number; url: string }>
  error?: string
}

type MultipartCompleteResponse = {
  completed?: boolean
  error?: string
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms))
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
  onProgress?: (event: BrowserUploadProgress) => void
): Promise<{ etag: string | null }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open("PUT", url)
    for (const [key, value] of Object.entries(headers)) {
      xhr.setRequestHeader(key, value)
    }

    xhr.upload.onprogress = (event) => {
      if (!onProgress) return
      if (event.lengthComputable) {
        onProgress({ loadedBytes: event.loaded, totalBytes: event.total })
      } else {
        onProgress({ loadedBytes: event.loaded, totalBytes: body.size })
      }
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
  onProgress?: (event: BrowserUploadProgress) => void
): Promise<{ etag: string | null }> {
  let lastError: unknown = null
  for (let attempt = 1; attempt <= UPLOAD_RETRY_ATTEMPTS; attempt += 1) {
    try {
      return await putBlobWithProgress(url, body, headers, onProgress)
    } catch (error) {
      lastError = error
      if (attempt < UPLOAD_RETRY_ATTEMPTS) {
        await sleep(UPLOAD_RETRY_BASE_DELAY_MS * 2 ** (attempt - 1))
      }
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error("R2 upload failed after retries.")
}

export async function uploadR2ObjectDirect({
  signedUrl,
  body,
  contentType,
  onProgress,
}: {
  signedUrl: string
  body: Blob
  contentType: string
  onProgress?: (event: BrowserUploadProgress) => void
}) {
  await putWithRetries(
    signedUrl,
    body,
    {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
    onProgress
  )
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

export async function uploadR2VideoMultipart({
  key,
  file,
  contentType,
  onProgress,
}: {
  key: string
  file: Blob
  contentType: string
  onProgress?: (event: BrowserUploadProgress) => void
}) {
  const createRes = await fetch(
    "/api/admin/wallpapers/bulk-upload/multipart",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        action: "create",
        key,
        contentType,
        sizeBytes: file.size,
      }),
    }
  )
  const created = await readJsonResponse<MultipartCreateResponse>(
    createRes,
    "Could not start multipart upload."
  )
  if (!createRes.ok) {
    throw new Error(created.error ?? "Could not start multipart upload.")
  }

  const partProgress = new Map<number, number>()
  const reportProgress = () => {
    if (!onProgress) return
    let loaded = 0
    for (const value of partProgress.values()) loaded += value
    onProgress({ loadedBytes: loaded, totalBytes: file.size })
  }

  try {
    const completedParts: Array<{ partNumber: number; etag: string }> = []

    await runPool(
      created.partUrls,
      MULTIPART_PART_CONCURRENCY,
      async ({ partNumber, url }) => {
        const start = (partNumber - 1) * created.partSizeBytes
        const end = Math.min(start + created.partSizeBytes, file.size)
        const chunk = file.slice(start, end)

        const { etag } = await putWithRetries(
          url,
          chunk,
          {},
          ({ loadedBytes }) => {
            partProgress.set(partNumber, loadedBytes)
            reportProgress()
          }
        )

        partProgress.set(partNumber, chunk.size)
        reportProgress()

        if (etag) {
          completedParts.push({ partNumber, etag })
        }
      }
    )

    const completeRes = await fetch(
      "/api/admin/wallpapers/bulk-upload/multipart",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          action: "complete",
          key: created.key,
          uploadId: created.uploadId,
          // Prefer client ETags when CORS exposes them; server ListParts otherwise.
          parts: completedParts.length === created.partCount ? completedParts : undefined,
        }),
      }
    )
    const completed = await readJsonResponse<MultipartCompleteResponse>(
      completeRes,
      "Could not finalize multipart upload."
    )
    if (!completeRes.ok) {
      throw new Error(completed.error ?? "Could not finalize multipart upload.")
    }

    onProgress?.({ loadedBytes: file.size, totalBytes: file.size })
  } catch (error) {
    await fetch("/api/admin/wallpapers/bulk-upload/multipart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        action: "abort",
        key: created.key,
        uploadId: created.uploadId,
      }),
    }).catch(() => {})
    throw error
  }
}
