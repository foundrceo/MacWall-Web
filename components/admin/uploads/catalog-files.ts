/**
 * Getting video files into the bulk catalog uploader: the native file picker
 * and drag and drop. Both keep the File System Access handle when the browser
 * offers one, so a saved session can reopen the file after a reload.
 */

import type { DragEvent } from "react"

import type {
  DataTransferItemWithHandle,
  FilePickerWindow,
  StagedFileInput,
} from "./catalog-types"

export function isFileDrag(event: DragEvent<HTMLElement>) {
  return Array.from(event.dataTransfer.types).includes("Files")
}

export async function filesFromDrop(event: DragEvent<HTMLElement>) {
  const items = Array.from(event.dataTransfer.items ?? [])
  if (items.length) {
    return Promise.all(
      items
        .filter((item) => item.kind === "file")
        .map(async (item) => {
          const withHandle = item as DataTransferItemWithHandle
          const fileHandle = await withHandle.getAsFileSystemHandle?.()
          const file = fileHandle
            ? await fileHandle.getFile()
            : item.getAsFile()
          return file ? { file, fileHandle } : null
        })
    ).then((results) =>
      results.filter((item): item is StagedFileInput => Boolean(item))
    )
  }

  return Array.from(event.dataTransfer.files).map((file) => ({
    file,
    fileHandle: null,
  }))
}

/** False where only `<input type="file">` is available (Safari, Firefox). */
export function hasVideoFilePicker() {
  return Boolean((window as FilePickerWindow).showOpenFilePicker)
}

/**
 * Opens the File System Access picker. Rejects with an AbortError when the
 * dialog is cancelled. Check `hasVideoFilePicker()` first.
 */
export async function pickVideoFiles(): Promise<StagedFileInput[]> {
  const picker = window as FilePickerWindow
  if (!picker.showOpenFilePicker) return []

  const handles = await picker.showOpenFilePicker({
    multiple: true,
    excludeAcceptAllOption: false,
    types: [
      {
        description: "Videos",
        accept: {
          "video/mp4": [".mp4", ".m4v"],
          "video/quicktime": [".mov"],
          "video/webm": [".webm"],
        },
      },
    ],
  })
  return Promise.all(
    handles.map(async (fileHandle) => ({
      file: await fileHandle.getFile(),
      fileHandle,
    }))
  )
}
