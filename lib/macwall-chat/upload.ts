/** Upload a support-chat image (jpg/png/webp, max 4MB). */

export async function uploadChatImage(
  sessionId: string,
  file: File
): Promise<string> {
  const form = new FormData()
  form.append("sessionId", sessionId)
  form.append("file", file)

  const directRes = await fetch("/api/support/upload", {
    method: "POST",
    body: form,
  })
  const directJson = (await directRes.json()) as {
    publicUrl?: string
    error?: string
  }
  if (directRes.ok && directJson.publicUrl) {
    return directJson.publicUrl
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg"
  const presignRes = await fetch("/api/support/upload", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      sessionId,
      extension: ext,
      contentType: file.type || "image/jpeg",
    }),
  })
  const presignJson = (await presignRes.json()) as {
    uploadUrl?: string
    publicUrl?: string
    contentType?: string
    error?: string
  }
  if (!presignRes.ok || !presignJson.uploadUrl || !presignJson.publicUrl) {
    throw new Error(directJson.error ?? presignJson.error ?? "upload_failed")
  }

  const putRes = await fetch(presignJson.uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type":
        presignJson.contentType ?? file.type ?? "image/jpeg",
    },
    body: file,
  })
  if (!putRes.ok) throw new Error("upload_failed")
  return presignJson.publicUrl
}

export function isAllowedChatImage(file: File): boolean {
  const type = file.type.toLowerCase()
  if (type === "image/jpeg" || type === "image/png" || type === "image/webp") {
    return file.size > 0 && file.size <= 4 * 1024 * 1024
  }
  const ext = file.name.split(".").pop()?.toLowerCase()
  return (
    Boolean(ext && ["jpg", "jpeg", "png", "webp"].includes(ext)) &&
    file.size > 0 &&
    file.size <= 4 * 1024 * 1024
  )
}
