import { macwall } from "@/lib/macwall-site"
import { canonicalSiteOrigin } from "@/lib/site-url"

export const dynamic = "force-static"
export const revalidate = 86400

/** OpenAPI 3.1 description of the read-only public endpoints, linked from the API catalog. */
export function GET(): Response {
  const origin = canonicalSiteOrigin()

  const document = {
    openapi: "3.1.0",
    info: {
      title: `${macwall.name} Public API`,
      version: "1.0.0",
      summary: "Read-only public endpoints for the MacWall wallpaper catalog and release metadata.",
      description:
        "Unauthenticated, read-only HTTP endpoints. There is no write API and no user data is exposed. Wallpaper metadata may be reused with attribution; wallpaper video files are licensed for use inside the MacWall app only.",
      termsOfService: `${origin}/terms`,
      contact: {
        name: `${macwall.name} support`,
        email: macwall.supportEmail,
        url: `${origin}/docs/public-api`,
      },
    },
    servers: [{ url: origin, description: "Production" }],
    externalDocs: {
      description: "Public API documentation",
      url: `${origin}/docs/public-api`,
    },
    tags: [
      { name: "catalog", description: "Public wallpaper catalog" },
      { name: "releases", description: "App release metadata and installers" },
    ],
    paths: {
      "/api/wallpapers": {
        get: {
          tags: ["catalog"],
          operationId: "listWallpapers",
          summary: "List public wallpapers",
          description:
            "Paginated public wallpaper catalog. Responses are CDN-cached; please cache client-side and keep request rates modest.",
          parameters: [
            {
              name: "q",
              in: "query",
              description: "Free-text search across wallpaper name and tags.",
              required: false,
              schema: { type: "string" },
            },
            {
              name: "category",
              in: "query",
              description: "Filter by catalog category.",
              required: false,
              schema: { type: "string", enum: [...macwall.categories] },
            },
            {
              name: "tag",
              in: "query",
              description: "Filter by a single tag.",
              required: false,
              schema: { type: "string" },
            },
            {
              name: "sort",
              in: "query",
              required: false,
              schema: {
                type: "string",
                enum: ["newest", "popular", "older"],
                default: "newest",
              },
            },
            {
              name: "page",
              in: "query",
              description: "1-based page number.",
              required: false,
              schema: { type: "integer", minimum: 1, default: 1 },
            },
            {
              name: "limit",
              in: "query",
              description: "Items per page.",
              required: false,
              schema: { type: "integer", minimum: 1, default: 24 },
            },
          ],
          responses: {
            "200": {
              description: "A page of wallpapers.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/WallpaperListResult" },
                },
              },
            },
            "500": {
              description: "Catalog temporarily unavailable.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
          },
        },
      },
      "/api/installers/releases/version.json": {
        get: {
          tags: ["releases"],
          operationId: "getLatestRelease",
          summary: "Current release metadata",
          description:
            "Version, build, download URL, and release notes for the current macOS build. Intentionally uncached so a new release is visible immediately.",
          responses: {
            "200": {
              description: "Current release metadata.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Release" },
                },
              },
            },
            "502": {
              description: "Release metadata temporarily unavailable.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
          },
        },
      },
      "/download/latest": {
        get: {
          tags: ["releases"],
          operationId: "downloadLatestInstaller",
          summary: "Redirect to the latest signed installer",
          description:
            "Stable path that responds with a 302 redirect to the current signed DMG. Link to this rather than a versioned file.",
          responses: {
            "302": {
              description: "Redirect to the current installer.",
              headers: {
                Location: {
                  description: "Absolute URL of the current signed DMG.",
                  schema: { type: "string", format: "uri" },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        Wallpaper: {
          type: "object",
          required: [
            "id",
            "name",
            "category",
            "tags",
            "resolution",
            "durationSeconds",
            "fileSizeBytes",
            "thumbUrl",
            "videoUrl",
            "isPro",
            "isFeatured",
            "likeCount",
            "createdAt",
          ],
          properties: {
            id: { type: "string", description: "Stable wallpaper identifier." },
            name: { type: "string" },
            category: { type: "string", enum: [...macwall.categories] },
            tags: { type: "array", items: { type: "string" } },
            resolution: {
              type: "string",
              description: "Source resolution, e.g. `3840x2160`.",
            },
            durationSeconds: { type: "number" },
            fileSizeBytes: { type: "integer" },
            videoKey: { type: "string" },
            thumbKey: { type: "string" },
            videoUrl: { type: "string", format: "uri" },
            thumbUrl: { type: "string", format: "uri" },
            isPro: {
              type: "boolean",
              description: "Requires a Pro license in the app.",
            },
            isFeatured: { type: "boolean" },
            isCuratedPick: { type: "boolean" },
            likeCount: { type: "integer" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        WallpaperListResult: {
          type: "object",
          required: ["wallpapers", "total", "page", "limit", "hasMore"],
          properties: {
            wallpapers: {
              type: "array",
              items: { $ref: "#/components/schemas/Wallpaper" },
            },
            total: { type: "integer" },
            page: { type: "integer" },
            limit: { type: "integer" },
            hasMore: { type: "boolean" },
          },
        },
        Release: {
          type: "object",
          required: ["version", "url"],
          properties: {
            version: { type: "string", examples: ["2.9"] },
            build: { type: "integer" },
            url: { type: "string", format: "uri" },
            notes: { type: "string" },
          },
        },
        Error: {
          type: "object",
          required: ["error"],
          properties: { error: { type: "string" } },
        },
      },
    },
  }

  return new Response(JSON.stringify(document, null, 2), {
    headers: {
      "Content-Type": "application/openapi+json; charset=utf-8",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      "Access-Control-Allow-Origin": "*",
    },
  })
}
