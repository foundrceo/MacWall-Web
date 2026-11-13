/**
 * Browser-side media work for the bulk catalog uploader: reading a video's
 * size and length, capturing its thumbnail, and shrinking images for upload
 * and for the AI metadata request.
 */

import {
  AI_THUMB_MAX_WIDTH,
  AI_THUMB_QUALITY,
  THUMB_MAX_WIDTH,
  THUMB_QUALITY,
} from "./catalog-types"

export async function inspectVideoFile(file: File): Promise<{
  width: number
  height: number
  durationSeconds: number
  thumbBlob: Blob
  thumbUrl: string
}> {
  const objectUrl = URL.createObjectURL(file)
  const video = document.createElement("video")
  video.preload = "metadata"
  video.muted = true
  video.playsInline = true
  video.src = objectUrl

  try {
    await waitForMediaEvent(video, "loadedmetadata", "error", 15_000)
    const width = video.videoWidth
    const height = video.videoHeight
    const durationSeconds = Number.isFinite(video.duration) ? video.duration : 0
    if (!width || !height) throw new Error("Video dimensions are missing.")

    const seekTime = Math.min(
      Math.max(durationSeconds * 0.08, 0.12),
      Math.max(durationSeconds - 0.05, 0)
    )
    if (seekTime > 0) {
      video.currentTime = seekTime
      await waitForMediaEvent(video, "seeked", "error", 15_000)
    }

    const thumbBlob = await videoFrameToJpeg(video, width, height)
    return {
      width,
      height,
      durationSeconds,
      thumbBlob,
      thumbUrl: URL.createObjectURL(thumbBlob),
    }
  } finally {
    video.removeAttribute("src")
    video.load()
    URL.revokeObjectURL(objectUrl)
  }
}

export async function imageFileToJpegBlob(file: File): Promise<{
  blob: Blob
  url: string
}> {
  const objectUrl = URL.createObjectURL(file)
  const image = new Image()
  image.src = objectUrl
  await image.decode()

  try {
    const canvas = scaledCanvas(image.naturalWidth, image.naturalHeight)
    const context = canvas.getContext("2d")
    if (!context) throw new Error("Canvas is not available.")
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    const blob = await canvasToJpegBlob(canvas)
    return { blob, url: URL.createObjectURL(blob) }
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

export async function videoFrameToJpeg(
  video: HTMLVideoElement,
  width: number,
  height: number
) {
  const canvas = scaledCanvas(width, height)
  const context = canvas.getContext("2d")
  if (!context) throw new Error("Canvas is not available.")
  context.drawImage(video, 0, 0, canvas.width, canvas.height)
  return canvasToJpegBlob(canvas)
}

export function scaledCanvas(width: number, height: number) {
  const scale = Math.min(1, THUMB_MAX_WIDTH / Math.max(width, 1))
  const canvas = document.createElement("canvas")
  canvas.width = Math.max(1, Math.round(width * scale))
  canvas.height = Math.max(1, Math.round(height * scale))
  return canvas
}

export function canvasToJpegBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error("Could not create thumbnail."))
        else resolve(blob)
      },
      "image/jpeg",
      THUMB_QUALITY
    )
  })
}

export function waitForMediaEvent(
  element: HTMLMediaElement,
  eventName: keyof HTMLMediaElementEventMap,
  errorEventName: keyof HTMLMediaElementEventMap,
  timeoutMs: number
) {
  return new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      cleanup()
      reject(new Error("Timed out while reading video metadata."))
    }, timeoutMs)

    function cleanup() {
      window.clearTimeout(timeout)
      element.removeEventListener(eventName, onSuccess)
      element.removeEventListener(errorEventName, onError)
    }

    function onSuccess() {
      cleanup()
      resolve()
    }

    function onError() {
      cleanup()
      reject(new Error("Browser could not decode this media file."))
    }

    element.addEventListener(eventName, onSuccess, { once: true })
    element.addEventListener(errorEventName, onError, { once: true })
  })
}

export async function blobToResizedJpegDataUrl(blob: Blob): Promise<string> {
  const objectUrl = URL.createObjectURL(blob)
  const image = new Image()
  image.src = objectUrl

  try {
    await image.decode()
    const scale = Math.min(
      1,
      AI_THUMB_MAX_WIDTH / Math.max(image.naturalWidth, image.naturalHeight, 1)
    )
    const canvas = document.createElement("canvas")
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
    const context = canvas.getContext("2d")
    if (!context) throw new Error("Canvas is not available.")
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL("image/jpeg", AI_THUMB_QUALITY)
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}
