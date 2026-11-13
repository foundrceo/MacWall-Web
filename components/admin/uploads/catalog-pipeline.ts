/**
 * Network side of the bulk catalog uploader: AI metadata, presigned URLs,
 * the R2 upload itself (multipart for large videos) and the catalog commit.
 * Request and response shapes match app/api/admin/wallpapers/bulk-upload/*.
 */

import {
  MULTIPART_THRESHOLD_BYTES,
  uploadR2ObjectDirect,
  uploadR2VideoMultipart,
} from "@/lib/admin/r2-browser-upload"

import { catalogDraftPayload, tagsFromText } from "./catalog-drafts"
import { blobToResizedJpegDataUrl } from "./catalog-media"
import type {
  AiMetadataItem,
  AiMetadataResponse,
  CatalogDraft,
  CommitResponse,
  SignedUploadResponse,
  SignedUploadTarget,
} from "./catalog-types"

export function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError"
}

export async function uploadStorageTarget({
  target,
  fileBody,
  contentType,
  objectKey,
  onProgress,
}: {
  target: SignedUploadTarget
  fileBody: File | Blob
  contentType: string
  objectKey: string
  onProgress?: (event: { loadedBytes: number; totalBytes: number }) => void
}) {
  if (target.alreadyUploaded) {
    onProgress?.({ loadedBytes: fileBody.size, totalBytes: fileBody.size })
    return
  }

  try {
    const useMultipart =
      objectKey.startsWith("videos/") &&
      fileBody.size >= MULTIPART_THRESHOLD_BYTES

    if (useMultipart) {
      await uploadR2VideoMultipart({
        key: objectKey,
        file: fileBody,
        contentType,
        onProgress,
      })
      return
    }

    if (!target.signedUrl) {
      throw new Error(`Missing presigned upload URL for ${target.path}.`)
    }

    await uploadR2ObjectDirect({
      signedUrl: target.signedUrl,
      body: fileBody,
      contentType,
      onProgress,
    })
  } catch (error) {
    throw new Error(`${target.path}: ${storageErrorMessage(error)}`)
  }
}

export function storageErrorMessage(error: unknown) {
  if (!error || typeof error !== "object") return "Storage upload failed."
  const record = error as {
    message?: unknown
    error?: unknown
    name?: unknown
    status?: unknown
    statusCode?: unknown
  }
  const message =
    typeof record.message === "string" && record.message.trim()
      ? record.message.trim()
      : "Storage upload failed."
  const details = [record.error, record.name, record.statusCode, record.status]
    .filter(
      (value): value is string | number =>
        typeof value === "string" || typeof value === "number"
    )
    .map(String)
    .filter((value) => value && value !== message)

  return details.length ? `${message} (${details.join(", ")})` : message
}

export function runPool<T>(
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
  return Promise.all(workers)
}

export function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size))
  }
  return chunks
}

export async function readJsonResponse<T extends { error?: string }>(
  response: Response,
  fallback: string
): Promise<T> {
  try {
    return (await response.json()) as T
  } catch {
    return { error: fallback } as T
  }
}

export async function signCatalogDraft(draft: CatalogDraft) {
  const signRes = await fetch("/api/admin/wallpapers/bulk-upload/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({
      items: [
        {
          clientId: draft.localId,
          id: draft.id,
          videoKey: draft.videoKey,
          thumbKey: draft.thumbKey,
          videoContentType: draft.videoContentType,
          thumbContentType: "image/jpeg",
          videoSizeBytes: draft.fileSizeBytes,
          thumbSizeBytes: draft.thumbBlob?.size ?? 0,
        },
      ],
    }),
  })
  const signed = await readJsonResponse<SignedUploadResponse>(
    signRes,
    "Could not prepare upload."
  )
  if (!signRes.ok) {
    throw new Error(signed.error ?? "Could not prepare upload.")
  }
  return signed
}

export async function commitCatalogDraft(draft: CatalogDraft) {
  const commitRes = await fetch("/api/admin/wallpapers/bulk-upload/commit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({
      items: [catalogDraftPayload(draft)],
    }),
  })
  const commit = await readJsonResponse<CommitResponse>(
    commitRes,
    "Could not publish wallpaper."
  )
  if (!commitRes.ok) {
    throw new Error(commit.error ?? "Could not publish wallpaper.")
  }
  return commit
}

/**
 * Takes one draft from staged to live: sign, video to R2, thumbnail to R2,
 * commit to the catalog. Reports each stage through `update` as the row's
 * `progress` (5 signing, 10-80 video, 82 thumbnail, 90 commit). A draft that
 * already reached "uploaded" skips to the commit. Throws on any failure; the
 * caller marks the draft "committed" or "error".
 */
export async function publishCatalogDraft(
  draft: CatalogDraft,
  {
    findLive,
    update,
  }: {
    /** Latest version of a draft, including edits made since the run began. */
    findLive: (localId: string) => CatalogDraft | undefined
    update: (
      localId: string,
      updater: (draft: CatalogDraft) => CatalogDraft
    ) => void
  }
) {
  if (!draft.thumbBlob) {
    throw new Error("Missing thumbnail.")
  }

  const liveDraft = findLive(draft.localId) ?? draft

  if (liveDraft.status !== "uploaded") {
    update(liveDraft.localId, (current) => ({
      ...current,
      status: "uploading",
      progress: 5,
      error: null,
    }))

    const signed = await signCatalogDraft(liveDraft)
    const upload = signed.uploads[0]
    if (!upload) {
      throw new Error("Could not prepare upload tokens.")
    }

    update(liveDraft.localId, (current) => ({
      ...current,
      progress: 10,
    }))

    await uploadStorageTarget({
      target: upload.video,
      fileBody: liveDraft.file,
      contentType: liveDraft.videoContentType,
      objectKey: liveDraft.videoKey,
      onProgress: ({ loadedBytes, totalBytes }) => {
        const ratio = totalBytes > 0 ? loadedBytes / totalBytes : 0
        // Video is ~10% → 80% of the row progress bar.
        const progress = Math.min(80, Math.round(10 + ratio * 70))
        update(liveDraft.localId, (current) => ({
          ...current,
          progress: Math.max(current.progress, progress),
        }))
      },
    })

    update(liveDraft.localId, (current) => ({
      ...current,
      progress: 82,
    }))

    await uploadStorageTarget({
      target: upload.thumb,
      fileBody: liveDraft.thumbBlob!,
      contentType: "image/jpeg",
      objectKey: liveDraft.thumbKey,
    })

    update(liveDraft.localId, (current) => ({
      ...current,
      status: "uploaded",
      progress: 90,
    }))
  } else {
    update(liveDraft.localId, (current) => ({
      ...current,
      status: "uploading",
      progress: 90,
      error: null,
    }))
  }

  await commitCatalogDraft(findLive(draft.localId) ?? liveDraft)
}

/**
 * Asks the model for a name, category and tags for each draft, from a small
 * copy of its thumbnail. Every draft must have a thumbnail.
 */
export async function requestAiMetadata(
  chunk: CatalogDraft[]
): Promise<AiMetadataItem[]> {
  const items = await Promise.all(
    chunk.map(async (draft) => ({
      clientId: draft.localId,
      sourceFileName: draft.sourceFileName,
      initialName: draft.name,
      initialCategory: draft.category,
      initialTags: tagsFromText(draft.tagsText),
      thumbDataUrl: await blobToResizedJpegDataUrl(draft.thumbBlob!),
    }))
  )

  const response = await fetch("/api/admin/wallpapers/bulk-upload/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ items }),
  })
  const analysis = await readJsonResponse<AiMetadataResponse>(
    response,
    "Could not analyze wallpaper thumbnails."
  )
  if (!response.ok) {
    throw new Error(analysis.error ?? "Could not analyze wallpaper thumbnails.")
  }

  return analysis.items
}
