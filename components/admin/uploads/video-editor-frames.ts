/**
 * Frame capture and time helpers for the video trim editor.
 */

/** Shortest range the trim handles allow, in seconds. */
export const MIN_TRIM_SECONDS = 0.1

export type TrimTarget = "start" | "end" | "playhead"

export function waitForEvent(
  element: HTMLMediaElement,
  eventName: keyof HTMLMediaElementEventMap
) {
  return new Promise<void>((resolve, reject) => {
    function cleanup() {
      element.removeEventListener(eventName, onSuccess)
      element.removeEventListener("error", onError)
    }
    function onSuccess() {
      cleanup()
      resolve()
    }
    function onError() {
      cleanup()
      reject(new Error("Could not read video frame."))
    }
    element.addEventListener(eventName, onSuccess, { once: true })
    element.addEventListener("error", onError, { once: true })
  })
}

export function captureFrame(video: HTMLVideoElement) {
  const canvas = document.createElement("canvas")
  canvas.width = Math.max(1, Math.round(video.videoWidth / 4))
  canvas.height = Math.max(1, Math.round(video.videoHeight / 4))
  const context = canvas.getContext("2d")
  if (!context) throw new Error("Canvas unavailable.")
  context.drawImage(video, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL("image/jpeg", 0.72)
}

export function captureFrameElement(video: HTMLVideoElement) {
  const canvas = document.createElement("canvas")
  const scale = Math.min(1, 1280 / Math.max(video.videoWidth, 1))
  canvas.width = Math.max(1, Math.round(video.videoWidth * scale))
  canvas.height = Math.max(1, Math.round(video.videoHeight * scale))
  const context = canvas.getContext("2d")
  if (!context) throw new Error("Canvas unavailable.")
  context.drawImage(video, 0, 0, canvas.width, canvas.height)
  return canvas
}

export function canvasToJpeg(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error("Could not create thumbnail."))
        else resolve(blob)
      },
      "image/jpeg",
      0.86
    )
  })
}

export function roundTenth(seconds: number) {
  return Math.round(seconds * 10) / 10
}

/** 0:07.5 — tenths matter when a range can be a second long. */
export function formatTimecode(seconds: number) {
  const tenths = Math.round(Math.max(0, seconds) * 10)
  const mins = Math.floor(tenths / 600)
  const secs = Math.floor((tenths % 600) / 10)
  return `${mins}:${secs.toString().padStart(2, "0")}.${tenths % 10}`
}
