export class HttpRequestError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message)
    this.name = "HttpRequestError"
  }
}

export async function readJsonRequestBody<T>(
  request: Request,
  options: { maxBytes: number }
): Promise<T> {
  const contentLength = request.headers.get("content-length")
  if (contentLength) {
    const bytes = Number(contentLength)
    if (Number.isFinite(bytes) && bytes > options.maxBytes) {
      throw new HttpRequestError("Request body too large.", 413)
    }
  }

  const raw = await request.text()
  if (new TextEncoder().encode(raw).byteLength > options.maxBytes) {
    throw new HttpRequestError("Request body too large.", 413)
  }
  if (!raw.trim()) return {} as T

  try {
    return JSON.parse(raw) as T
  } catch {
    throw new HttpRequestError("Invalid JSON.", 400)
  }
}
