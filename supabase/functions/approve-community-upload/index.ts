import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2";
import { AwsClient } from "npm:aws4fetch@1.0.20";

const BUCKET = "wallpaper-catalog";
const JSON_HEADERS = { "Content-Type": "application/json" };
const IMMUTABLE_CACHE_CONTROL = "public, max-age=31536000, immutable";

type R2Config = {
  accountId: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
};

/** R2 config from edge-function secrets (required for community approve copy). */
function readR2Config(): R2Config | null {
  const accountId = Deno.env.get("R2_ACCOUNT_ID")?.trim();
  const accessKeyId = Deno.env.get("R2_ACCESS_KEY_ID")?.trim();
  const secretAccessKey = Deno.env.get("R2_SECRET_ACCESS_KEY")?.trim();
  const bucket = Deno.env.get("R2_BUCKET")?.trim() || BUCKET;
  if (!accountId || !accessKeyId || !secretAccessKey) return null;
  return { accountId, bucket, accessKeyId, secretAccessKey };
}

function r2Client(config: R2Config): AwsClient {
  return new AwsClient({
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    region: "auto",
    service: "s3",
  });
}

function encodeR2Key(key: string): string {
  return key.split("/").filter(Boolean).map(encodeURIComponent).join("/");
}

function r2ObjectURL(config: R2Config, key: string): string {
  return `https://${config.accountId}.r2.cloudflarestorage.com/${config.bucket}/${encodeR2Key(key)}`;
}

function contentTypeForKey(key: string): string {
  const ext = key.split(".").pop()?.toLowerCase() ?? "";
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "mp4":
      return "video/mp4";
    case "mov":
      return "video/quicktime";
    case "m4v":
      return "video/x-m4v";
    case "webm":
      return "video/webm";
    default:
      return "application/octet-stream";
  }
}

async function r2ObjectExists(
  client: AwsClient,
  config: R2Config,
  key: string,
): Promise<boolean> {
  const response = await client.fetch(r2ObjectURL(config, key), {
    method: "HEAD",
  });
  return response.ok;
}

async function r2CopyObject(
  client: AwsClient,
  config: R2Config,
  sourceKey: string,
  destKey: string,
): Promise<void> {
  if (sourceKey === destKey) return;
  if (await r2ObjectExists(client, config, destKey)) return;

  const response = await client.fetch(r2ObjectURL(config, destKey), {
    method: "PUT",
    headers: {
      "x-amz-copy-source": `/${config.bucket}/${encodeR2Key(sourceKey)}`,
      "x-amz-metadata-directive": "REPLACE",
      "Cache-Control": IMMUTABLE_CACHE_CONTROL,
      "Content-Type": contentTypeForKey(destKey),
    },
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `R2 copy ${sourceKey} -> ${destKey}: HTTP ${response.status} ${body}`,
    );
  }
}

type UploadRow = {
  id: string;
  title: string;
  category: string;
  video_key: string;
  thumb_key: string;
  resolution: string;
  duration_seconds: number;
  file_size_bytes: number;
  status: string;
  approved_wallpaper_id: string | null;
  rights_attested_at: string | null;
};

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: JSON_HEADERS,
  });
}

function bearerToken(req: Request): string | null {
  const value = req.headers.get("authorization")?.trim() ?? "";
  const match = value.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

/** Constant-time compare for equal-length byte arrays. */
function timingSafeEqualBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.byteLength !== b.byteLength) return false;
  const subtle = crypto.subtle as SubtleCrypto & {
    timingSafeEqual?: (x: BufferSource, y: BufferSource) => boolean;
  };
  if (typeof subtle.timingSafeEqual === "function") {
    return subtle.timingSafeEqual(a, b);
  }
  let diff = 0;
  for (let i = 0; i < a.byteLength; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

/** Constant-time admin secret compare (fail closed on length mismatch). */
function hasAdminAccess(req: Request): boolean {
  const secret = Deno.env.get("MACWALL_ADMIN_SECRET")?.trim();
  if (!secret) return false;

  const supplied =
    bearerToken(req) ?? req.headers.get("x-macwall-admin-secret")?.trim() ?? "";
  if (!supplied || supplied.length !== secret.length) return false;

  const enc = new TextEncoder();
  return timingSafeEqualBytes(enc.encode(supplied), enc.encode(secret));
}

function isUUID(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function isSafeWallpaperID(value: string): boolean {
  return /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(value);
}

function videoExtension(videoKey: string): string {
  const ext = videoKey.split(".").pop()?.toLowerCase() ?? "mp4";
  return ["mp4", "mov", "m4v", "webm"].includes(ext) ? ext : "mp4";
}

function canonicalKeys(wallpaperId: string, videoKey: string) {
  const ext = videoExtension(videoKey);
  return {
    videoKey: `videos/${wallpaperId}.${ext}`,
    thumbKey: `thumbs/${wallpaperId}.jpg`,
  };
}

async function copyObject(
  _supabase: SupabaseClient,
  sourceKey: string,
  destKey: string,
) {
  if (sourceKey === destKey) return;

  const r2 = readR2Config();
  if (!r2) {
    throw new Error(
      "R2 is not configured for approve-community-upload (set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET).",
    );
  }
  await r2CopyObject(r2Client(r2), r2, sourceKey, destKey);
}

async function publishUpload(
  supabase: SupabaseClient,
  upload: UploadRow,
  wallpaperId: string,
) {
  const { videoKey, thumbKey } = canonicalKeys(wallpaperId, upload.video_key);
  const started = performance.now();

  await copyObject(supabase, upload.video_key, videoKey);
  await copyObject(supabase, upload.thumb_key, thumbKey);

  // One transaction: checks the rights declaration, publishes the wallpaper
  // with its attribution and provenance, marks the upload approved and writes
  // the moderation log.
  const { error: approveError } = await supabase.rpc(
    "approve_and_publish_community_upload",
    {
      p_upload_id: upload.id,
      p_wallpaper_id: wallpaperId,
      p_video_key: videoKey,
      p_thumb_key: thumbKey,
      p_review_notes: null,
      p_actor: "admin",
    },
  );
  if (approveError) {
    throw new Error(`approve_and_publish_community_upload: ${approveError.message}`);
  }

  console.log(
    JSON.stringify({
      event: "approve_community_upload",
      upload_id: upload.id,
      wallpaper_id: wallpaperId,
      video_key: videoKey,
      thumb_key: thumbKey,
      r2_copy: "ok",
      latency_ms: Math.round(performance.now() - started),
    }),
  );

  return { wallpaperId, videoKey, thumbKey };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  if (req.method !== "POST") {
    return json(405, { error: "method_not_allowed" });
  }

  if (!Deno.env.get("MACWALL_ADMIN_SECRET")?.trim()) {
    return json(500, { error: "admin_secret_missing" });
  }

  if (!hasAdminAccess(req)) {
    return json(401, { error: "unauthorized" });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return json(500, { error: "server_misconfigured" });
  }

  let body: { upload_id?: string; wallpaper_id?: string };
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "invalid_json" });
  }

  const uploadId = body.upload_id?.trim();
  if (!uploadId) {
    return json(400, { error: "upload_id_required" });
  }
  if (!isUUID(uploadId)) {
    return json(400, { error: "invalid_upload_id" });
  }

  const requestedWallpaperId = body.wallpaper_id?.trim();
  if (requestedWallpaperId && !isSafeWallpaperID(requestedWallpaperId)) {
    return json(400, { error: "invalid_wallpaper_id" });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: upload, error: fetchError } = await supabase
    .from("community_uploads")
    .select("*")
    .eq("id", uploadId)
    .maybeSingle<UploadRow>();

  if (fetchError) {
    return json(500, { error: fetchError.message });
  }
  if (!upload) {
    return json(404, { error: "upload_not_found" });
  }

  if (upload.status === "rejected") {
    return json(409, { error: "upload_rejected" });
  }
  if (upload.status !== "pending") {
    return json(409, { error: "upload_not_pending" });
  }
  if (!upload.rights_attested_at) {
    return json(409, { error: "rights_declaration_missing" });
  }

  const wallpaperId =
    requestedWallpaperId ||
    upload.approved_wallpaper_id?.trim() ||
    crypto.randomUUID();

  try {
    const result = await publishUpload(supabase, upload, wallpaperId);
    return json(200, { status: "approved", ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.log(
      JSON.stringify({
        event: "approve_community_upload_error",
        upload_id: uploadId,
        error: message,
      }),
    );
    return json(500, { error: message });
  }
});
