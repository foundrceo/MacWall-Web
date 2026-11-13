/**
 * Saves the staged batch to IndexedDB so a reload or crash does not lose it,
 * and turns a saved session back into drafts. Files picked through the File
 * System Access API are stored as handles; others are stored as blobs.
 */

import {
  UPLOAD_SESSION_DB_NAME,
  UPLOAD_SESSION_KEY,
  UPLOAD_SESSION_STORE,
  UPLOAD_SESSION_VERSION,
  type CatalogDraft,
  type PersistedCatalogDraft,
  type PersistedUploadSession,
} from "./catalog-types"

export async function recoverPersistedDrafts(
  drafts: PersistedCatalogDraft[]
): Promise<{ drafts: CatalogDraft[]; failed: number }> {
  const restored: CatalogDraft[] = []
  let failed = 0

  for (const draft of drafts) {
    const file = await recoverPersistedFile(draft)
    if (!file) {
      failed += 1
      continue
    }

    const hasThumb = Boolean(draft.thumbBlob)
    const status =
      draft.status === "committed" || draft.status === "uploaded"
        ? draft.status
        : hasThumb
          ? "ready"
          : "error"

    restored.push({
      ...draft,
      file,
      trimStartSeconds: draft.trimStartSeconds ?? 0,
      trimEndSeconds: draft.trimEndSeconds ?? null,
      thumbUrl: draft.thumbBlob ? URL.createObjectURL(draft.thumbBlob) : null,
      status,
      progress: status === "uploaded" || status === "committed" ? 100 : 0,
      error:
        status === "error"
          ? "Recovered session is missing a thumbnail. Replace the thumbnail or restage this file."
          : draft.status === "uploading"
            ? "Recovered after reload. Upload can resume."
            : null,
    })
  }

  return { drafts: restored, failed }
}

export async function recoverPersistedFile(draft: PersistedCatalogDraft) {
  if (draft.file) return draft.file
  if (!draft.fileHandle) return null

  try {
    const permission = await draft.fileHandle.queryPermission?.({
      mode: "read",
    })
    if (permission === "denied") {
      const requested = await draft.fileHandle.requestPermission?.({
        mode: "read",
      })
      if (requested === "denied") return null
    }
    return await draft.fileHandle.getFile()
  } catch {
    return null
  }
}

export function formatRecoveryTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "recently"
  return date.toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

export async function savePersistedUploadSession(drafts: CatalogDraft[]) {
  try {
    await navigator.storage?.persist?.()
    const db = await openUploadSessionDb()
    await idbRequest(
      db
        .transaction(UPLOAD_SESSION_STORE, "readwrite")
        .objectStore(UPLOAD_SESSION_STORE)
        .put(
          {
            version: UPLOAD_SESSION_VERSION,
            updatedAt: new Date().toISOString(),
            drafts: drafts.map(serializeDraftForPersistence),
          } satisfies PersistedUploadSession,
          UPLOAD_SESSION_KEY
        )
    )
    db.close()
  } catch (err) {
    console.warn("[admin] could not save upload recovery session", err)
  }
}

export async function loadPersistedUploadSession(): Promise<PersistedUploadSession | null> {
  try {
    const db = await openUploadSessionDb()
    const session = await idbRequest<PersistedUploadSession | undefined>(
      db
        .transaction(UPLOAD_SESSION_STORE, "readonly")
        .objectStore(UPLOAD_SESSION_STORE)
        .get(UPLOAD_SESSION_KEY)
    )
    db.close()

    if (session?.version !== UPLOAD_SESSION_VERSION || !session.drafts.length) {
      return null
    }
    return session
  } catch (err) {
    console.warn("[admin] could not load upload recovery session", err)
    return null
  }
}

export async function deletePersistedUploadSession() {
  try {
    const db = await openUploadSessionDb()
    await idbRequest(
      db
        .transaction(UPLOAD_SESSION_STORE, "readwrite")
        .objectStore(UPLOAD_SESSION_STORE)
        .delete(UPLOAD_SESSION_KEY)
    )
    db.close()
  } catch (err) {
    console.warn("[admin] could not clear upload recovery session", err)
  }
}

export function serializeDraftForPersistence(
  draft: CatalogDraft
): PersistedCatalogDraft {
  return {
    localId: draft.localId,
    file: draft.fileHandle ? null : draft.file,
    fileHandle: draft.fileHandle,
    sourceFileName: draft.sourceFileName,
    id: draft.id,
    videoExtension: draft.videoExtension,
    videoKey: draft.videoKey,
    thumbKey: draft.thumbKey,
    name: draft.name,
    category: draft.category,
    tagsText: draft.tagsText,
    resolution: draft.resolution,
    durationSeconds: draft.durationSeconds,
    fileSizeBytes: draft.fileSizeBytes,
    videoContentType: draft.videoContentType,
    thumbBlob: draft.thumbBlob,
    isPro: draft.isPro,
    isFeatured: draft.isFeatured,
    isCuratedPick: draft.isCuratedPick,
    trimStartSeconds: draft.trimStartSeconds,
    trimEndSeconds: draft.trimEndSeconds,
    status: draft.status,
    progress: draft.progress,
    error: draft.error,
  }
}

export function openUploadSessionDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(
      UPLOAD_SESSION_DB_NAME,
      UPLOAD_SESSION_VERSION
    )

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(UPLOAD_SESSION_STORE)) {
        db.createObjectStore(UPLOAD_SESSION_STORE)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () =>
      reject(request.error ?? new Error("Could not open upload session DB."))
  })
}

export function idbRequest<T = unknown>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () =>
      reject(request.error ?? new Error("Upload session DB request failed."))
  })
}
