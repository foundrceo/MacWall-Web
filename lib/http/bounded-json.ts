export class RequestBodyError extends Error {
  constructor(public status: number, message: string) { super(message) }
}

/** Limits actual streamed bytes, including clients that omit Content-Length. */
export async function readBoundedJson<T>(request: Request, maxBytes: number): Promise<T> {
  const declared = Number(request.headers.get("content-length"))
  if (Number.isFinite(declared) && declared > maxBytes) throw new RequestBodyError(413, "body_too_large")
  const reader = request.body?.getReader()
  if (!reader) throw new RequestBodyError(400, "invalid_json")
  const chunks: Uint8Array[] = []
  let length = 0
  try {
    for (;;) {
      const { value, done } = await reader.read()
      if (done) break
      length += value.byteLength
      if (length > maxBytes) {
        await reader.cancel()
        throw new RequestBodyError(413, "body_too_large")
      }
      chunks.push(value)
    }
    const bytes = new Uint8Array(length)
    let offset = 0
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength }
    const result: unknown = JSON.parse(new TextDecoder().decode(bytes))
    if (!result || typeof result !== "object" || Array.isArray(result)) throw new Error("object_required")
    return result as T
  } catch (error) {
    if (error instanceof RequestBodyError) throw error
    throw new RequestBodyError(400, "invalid_json")
  } finally { reader.releaseLock() }
}
