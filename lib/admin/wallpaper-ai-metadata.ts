import {
  DEFAULT_WALLPAPER_CATEGORY,
  WALLPAPER_CATEGORIES,
} from "@/lib/wallpaper-categories"

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses"
const DEFAULT_MODEL = "gpt-5.4-mini"
const MAX_ANALYSIS_ITEMS = 12
const MAX_THUMB_DATA_URL_LENGTH = 1_200_000

type RawAnalysisItem = {
  clientId: string
  sourceFileName: string
  initialName: string
  initialCategory: string
  initialTags: string[]
  thumbDataUrl: string
}

export type WallpaperAiMetadataItem = {
  clientId: string
  name: string
  category: string
  tags: string[]
}

type OpenAiMetadataResponse = {
  items: Array<{
    clientId: string
    name: string
    category: string
    tags: string[]
    confidence: number
  }>
}

type OpenAiResponseBody = {
  error?: { message?: string }
  output_text?: string
  output?: Array<{
    type?: string
    content?: Array<{
      type?: string
      text?: string
    }>
  }>
}

const METADATA_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          clientId: { type: "string" },
          name: { type: "string" },
          category: { type: "string", enum: WALLPAPER_CATEGORIES },
          tags: {
            type: "array",
            items: { type: "string" },
          },
          confidence: { type: "number" },
        },
        required: ["clientId", "name", "category", "tags", "confidence"],
      },
    },
  },
  required: ["items"],
} as const

export async function analyzeWallpaperMetadataBatch(
  rawItems: unknown
): Promise<{ items: WallpaperAiMetadataItem[] }> {
  const items = normalizeAnalysisItems(rawItems)
  const apiKey = process.env.OPENAI_API_KEY?.trim()
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured.")

  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model:
        process.env.OPENAI_WALLPAPER_METADATA_MODEL?.trim() || DEFAULT_MODEL,
      store: false,
      max_output_tokens: 2500,
      instructions: metadataInstructions(),
      input: [
        {
          role: "user",
          content: metadataContent(items),
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "wallpaper_metadata_batch",
          strict: true,
          schema: METADATA_SCHEMA,
        },
        verbosity: "low",
      },
    }),
  })

  const body = (await safeJson(response)) as OpenAiResponseBody
  if (!response.ok) {
    throw new Error(
      body.error?.message ?? "OpenAI could not analyze wallpaper metadata."
    )
  }

  const parsed = parseOpenAiMetadata(body)
  return { items: mergeWithFallback(items, parsed.items) }
}

function normalizeAnalysisItems(rawItems: unknown): RawAnalysisItem[] {
  if (!Array.isArray(rawItems)) throw new Error("items must be an array.")
  if (rawItems.length < 1) throw new Error("Select at least one wallpaper.")
  if (rawItems.length > MAX_ANALYSIS_ITEMS) {
    throw new Error(`Analyze at most ${MAX_ANALYSIS_ITEMS} wallpapers at once.`)
  }

  return rawItems.map((raw, index) => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      throw new Error(`Item ${index + 1} must be an object.`)
    }
    const record = raw as Record<string, unknown>
    const clientId = requiredString(record.clientId, `clientId ${index + 1}`)
    const thumbDataUrl = requiredString(
      record.thumbDataUrl,
      `thumbnail ${index + 1}`
    )
    if (!/^data:image\/jpe?g;base64,[a-z0-9+/=\s]+$/i.test(thumbDataUrl)) {
      throw new Error(`Thumbnail ${index + 1} must be a JPEG data URL.`)
    }
    if (thumbDataUrl.length > MAX_THUMB_DATA_URL_LENGTH) {
      throw new Error(`Thumbnail ${index + 1} is too large for AI analysis.`)
    }

    return {
      clientId,
      sourceFileName: optionalString(record.sourceFileName),
      initialName: optionalString(record.initialName),
      initialCategory: optionalString(record.initialCategory),
      initialTags: Array.isArray(record.initialTags)
        ? record.initialTags.filter(
            (tag): tag is string => typeof tag === "string"
          )
        : [],
      thumbDataUrl,
    }
  })
}

function metadataInstructions() {
  return [
    "You are a Mac live-wallpaper catalog naming expert with expert visual ID skills.",
    "For each item, carefully LOOK at the thumbnail, identify the real subject, then GENERATE a precise catalog title, one exact category, and search tags.",
    `Allowed categories (pick exactly one): ${WALLPAPER_CATEGORIES.join(", ")}.`,
    "",
    "IDENTITY FIRST (most important):",
    "- Identify the most specific subject you can see: car make/model (Lamborghini, Ferrari, Porsche 911, BMW M3, Toyota Supra…), character/franchise (Spider-Man, Goku, Batman…), actor/celebrity if clearly recognizable, place/landmark, animal breed, game title, spacecraft, etc.",
    "- If you recognize a brand, model, character, franchise, or person — USE THAT NAME in the title. Never replace it with a vague class word.",
    "- BAD → GOOD examples:",
    "  · 'Yellow Supercar at Night' → 'Lamborghini Aventador Night' (or closest true model you can identify)",
    "  · 'Sports Car Drift' → 'Nissan GT-R Drift'",
    "  · 'Anime Girl Portrait' → 'Asuka Neon Glow' (if that character is clear)",
    "  · 'City Lights' → 'Tokyo Rain Neon' when the city/mood is clear",
    "- If you are unsure of the exact model but sure of the brand, use the brand + a precise cue (color/pose/setting): 'Yellow Lamborghini Night'.",
    "- Only fall back to generic class words (supercar, sports car, warrior, landscape) when you truly cannot identify anything more specific.",
    "",
    "TITLE RULES:",
    "- GENERATE from the thumbnail. Do NOT polish the filename or current title.",
    "- Ignore empty titles and junk filenames (IMG_1234, Screen Recording, Untitled, UUIDs, timestamps).",
    "- Filename is only a hint for proper nouns that also match the image.",
    "- Pattern: [Specific subject] + [setting/mood/action], 2–5 words.",
    "- Natural English, catalog-ready. No extensions, dimensions, codecs, 'live wallpaper', 'wallpaper', '4k', '8k', 'HD', 'loop', 'aesthetic', 'background', 'scene', 'vibe', 'clip', 'video'.",
    "- Prefer concrete identity over adjectives alone.",
    "",
    "CATEGORY RULES:",
    "- Choose from the allowed list using visual evidence.",
    "- Cars with recognizable vehicles → Cars. Anime characters → Anime. etc.",
    "",
    "TAG RULES:",
    "- Lowercase, concise, hyphenated when needed.",
    "- Include identity tags (brand, model, franchise, character) when visible.",
    "- Never include: wallpaper, live, video, 4k, hd, mac.",
  ].join("\n")
}

function metadataContent(items: RawAnalysisItem[]) {
  const content: Array<
    | { type: "input_text"; text: string }
    | { type: "input_image"; image_url: string; detail: "high" }
  > = [
    {
      type: "input_text",
      text: [
        `Study each thumbnail closely and GENERATE precise catalog metadata for ${items.length} wallpaper(s).`,
        "Return exactly one metadata object for each clientId.",
        "Name the real subject (brand/model/character/place) — never a vague label when identity is visible.",
      ].join(" "),
    },
  ]

  items.forEach((item, index) => {
    const hasUserTitle = item.initialName.trim().length > 0
    content.push({
      type: "input_text",
      text: [
        `Item ${index + 1}`,
        `clientId: ${item.clientId}`,
        `filename hint (not a title draft): ${item.sourceFileName || "(none)"}`,
        hasUserTitle
          ? `user-provided title (respect only if it already correctly names the subject): ${item.initialName}`
          : "user-provided title: (none — GENERATE a specific title from what you see)",
        item.initialCategory.trim()
          ? `category hint (optional): ${item.initialCategory}`
          : "category hint: (none — choose from the image)",
        `current tags: ${item.initialTags.join(", ") || "(none)"}`,
        "Task: identify the subject precisely, then write the title.",
      ].join("\n"),
    })
    content.push({
      type: "input_image",
      image_url: item.thumbDataUrl,
      detail: "high",
    })
  })

  return content
}

function parseOpenAiMetadata(body: OpenAiResponseBody): OpenAiMetadataResponse {
  const text = extractResponseText(body)
  if (!text) throw new Error("OpenAI returned no metadata.")

  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error("OpenAI returned invalid metadata JSON.")
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("OpenAI returned metadata in an unexpected shape.")
  }
  const items = (parsed as { items?: unknown }).items
  if (!Array.isArray(items)) {
    throw new Error("OpenAI metadata response did not include items.")
  }

  return {
    items: items
      .filter((item): item is OpenAiMetadataResponse["items"][number] => {
        if (!item || typeof item !== "object" || Array.isArray(item))
          return false
        const record = item as Record<string, unknown>
        return (
          typeof record.clientId === "string" &&
          typeof record.name === "string" &&
          typeof record.category === "string" &&
          Array.isArray(record.tags)
        )
      })
      .map((item) => ({
        clientId: item.clientId,
        name: item.name,
        category: item.category,
        tags: item.tags.filter((tag): tag is string => typeof tag === "string"),
        confidence: Number(item.confidence),
      })),
  }
}

function extractResponseText(body: OpenAiResponseBody): string {
  if (typeof body.output_text === "string") return body.output_text

  return (body.output ?? [])
    .flatMap((output) => output.content ?? [])
    .filter((content) => content.type === "output_text" && content.text)
    .map((content) => content.text)
    .join("\n")
    .trim()
}

function mergeWithFallback(
  requests: RawAnalysisItem[],
  responses: OpenAiMetadataResponse["items"]
): WallpaperAiMetadataItem[] {
  const byClientId = new Map(responses.map((item) => [item.clientId, item]))

  return requests.map((request) => {
    const response = byClientId.get(request.clientId)
    const category = normalizeCategory(
      response?.category ?? request.initialCategory
    )
    const name = normalizeTitle(response?.name ?? request.initialName)
    const tags = normalizeTags(
      response?.tags?.length ? response.tags : request.initialTags,
      name,
      category
    )

    return {
      clientId: request.clientId,
      name,
      category,
      tags,
    }
  })
}

function normalizeTitle(value: string) {
  const cleaned = value
    .replace(/\.[a-z0-9]{2,5}$/i, "")
    .replace(
      /\b(4k|5k|8k|uhd|fhd|hd|hdr|sdr|live wallpaper|wallpaper)\b/gi,
      " "
    )
    .replace(/[_+.]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/[^A-Za-z0-9\s:.'&-]/g, "")
    .trim()

  return toTitleCase(cleaned || "Untitled Wallpaper").slice(0, 140)
}

function normalizeCategory(value: string) {
  return WALLPAPER_CATEGORIES.includes(value)
    ? value
    : DEFAULT_WALLPAPER_CATEGORY
}

function normalizeTags(tags: string[], title: string, category: string) {
  const blocked = new Set(["wallpaper", "live", "video", "4k", "hd", "mac"])
  const fallback = `${title} ${category}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !blocked.has(word))

  return [...tags, ...fallback]
    .map((tag) =>
      tag
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, " ")
        .replace(/\s+/g, "-")
        .replace(/^-+|-+$/g, "")
    )
    .filter((tag) => tag.length >= 2 && tag.length <= 32 && !blocked.has(tag))
    .filter((tag, index, all) => all.indexOf(tag) === index)
    .slice(0, 10)
}

function toTitleCase(value: string) {
  const small = new Set(["and", "or", "the", "of", "in", "on", "with", "by"])
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word, index) => {
      const lower = word.toLowerCase()
      if (index > 0 && small.has(lower)) return lower
      if (/^[ivx]+$/i.test(word)) return word.toUpperCase()
      return lower.charAt(0).toUpperCase() + lower.slice(1)
    })
    .join(" ")
}

function requiredString(value: unknown, label: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} is required.`)
  }
  return value.trim()
}

function optionalString(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

async function safeJson(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    return {}
  }
}
