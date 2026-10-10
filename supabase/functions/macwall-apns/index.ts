import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

/**
 * MacWall APNs provider (Apple token-based auth).
 *
 * Apple flow:
 * 1) App registers with APNs → device token
 * 2) App POSTs token here (action=register)
 * 3) We POST alerts to api.push.apple.com with a JWT signed by the .p8 key
 *
 * Secrets (Supabase Edge only — never in MacWall-Web / Vercel):
 *   APNS_KEY_ID, APNS_TEAM_ID, APNS_BUNDLE_ID, APNS_PRIVATE_KEY
 */

const JSON_HEADERS = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
};

const BUNDLE_ID =
  Deno.env.get("APNS_BUNDLE_ID")?.trim() || "com.macwall.ogapps";
const KEY_ID = Deno.env.get("APNS_KEY_ID")?.trim() || "";
const TEAM_ID = Deno.env.get("APNS_TEAM_ID")?.trim() || "";
const PRIVATE_KEY_RAW = Deno.env.get("APNS_PRIVATE_KEY")?.trim() || "";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const HEX_TOKEN_RE = /^[0-9a-f]{64,200}$/i;

type Environment = "development" | "production";

type RegisterBody = {
  action: "register";
  visitorId?: string;
  deviceToken?: string;
  apnsToken?: string;
  environment?: string;
};

type NotifyBody = {
  action: "notify";
  visitorId?: string;
  title?: string;
  body?: string;
  mwId?: string;
};

type BroadcastBody = {
  action: "broadcast";
  broadcastSecret?: string;
  title?: string;
  body?: string;
  mwId?: string;
};

type RequestBody =
  | RegisterBody
  | NotifyBody
  | BroadcastBody
  | Record<string, unknown>;

type AlertUserInfo = {
  mw_id: string;
  mw_action?: string;
  mw_offer?: string;
  mw_promo?: string;
};

let cachedJwt: { value: string; exp: number } | null = null;

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

function normalizePem(raw: string): string {
  const trimmed = raw.trim().replace(/\\n/g, "\n");
  if (trimmed.includes("BEGIN PRIVATE KEY")) return trimmed;
  try {
    const decoded = atob(trimmed);
    if (decoded.includes("BEGIN PRIVATE KEY")) return decoded;
  } catch {
    // ignore
  }
  return trimmed;
}

function base64url(data: ArrayBuffer | Uint8Array | string): string {
  let bytes: Uint8Array;
  if (typeof data === "string") {
    bytes = new TextEncoder().encode(data);
  } else if (data instanceof Uint8Array) {
    bytes = data;
  } else {
    bytes = new Uint8Array(data);
  }
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]!);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function pemToPkcs8(pem: string): ArrayBuffer {
  const b64 = normalizePem(pem)
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s+/g, "");
  const raw = atob(b64);
  const buf = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) buf[i] = raw.charCodeAt(i);
  return buf.buffer;
}

// Apple: refresh no more than once every 20 minutes and at least hourly, and
// the same token must be shared. Every edge instance minting its own token (50
// parallel sends per cold start) got 429 TooManyProviderTokenUpdates.
const TOKEN_REUSE_SECONDS = 40 * 60;
let jwtInFlight: Promise<string> | null = null;
let sharedTokenStore:
  | { load(): Promise<{ jwt: string; issued_at: number } | null>; save(jwt: string, iat: number): Promise<void> }
  | null = null;

async function providerJwt(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedJwt && cachedJwt.exp > now + 60) return cachedJwt.value;
  // Concurrent sends in this instance share one lookup / mint.
  if (!jwtInFlight) {
    jwtInFlight = resolveProviderJwt(now).finally(() => {
      jwtInFlight = null;
    });
  }
  return jwtInFlight;
}

async function resolveProviderJwt(now: number): Promise<string> {
  // Another instance's token, if still fresh.
  try {
    const shared = await sharedTokenStore?.load();
    if (shared && now - shared.issued_at < TOKEN_REUSE_SECONDS) {
      cachedJwt = { value: shared.jwt, exp: shared.issued_at + TOKEN_REUSE_SECONDS };
      return shared.jwt;
    }
  } catch (error) {
    console.warn("[macwall-apns] shared token load failed:", String(error));
  }
  const jwt = await mintProviderJwt(now);
  try {
    await sharedTokenStore?.save(jwt, now);
  } catch (error) {
    console.warn("[macwall-apns] shared token save failed:", String(error));
  }
  return jwt;
}

async function mintProviderJwt(now: number): Promise<string> {

  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToPkcs8(PRIVATE_KEY_RAW),
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"],
  );
  const header = base64url(JSON.stringify({ alg: "ES256", kid: KEY_ID }));
  const payload = base64url(JSON.stringify({ iss: TEAM_ID, iat: now }));
  const signingInput = `${header}.${payload}`;
  const sig = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    key,
    new TextEncoder().encode(signingInput),
  );
  const jwt = `${signingInput}.${base64url(sig)}`;
  cachedJwt = { value: jwt, exp: now + TOKEN_REUSE_SECONDS };
  return jwt;
}

function apnsHost(environment: Environment): string {
  return environment === "development"
    ? "api.sandbox.push.apple.com"
    : "api.push.apple.com";
}

function alertUserInfo(mwId: string): AlertUserInfo {
  const info: AlertUserInfo = { mw_id: mwId };
  if (mwId.includes(".notify.conversion.")) {
    info.mw_action = "mac10_checkout";
    if (mwId.includes(".mac10")) {
      info.mw_offer = "mac10";
      info.mw_promo = "MAC10";
    } else if (mwId.includes(".mac20")) {
      info.mw_offer = "mac20";
      info.mw_promo = "MAC20";
    } else if (mwId.includes(".mac30")) {
      info.mw_offer = "mac30";
      info.mw_promo = "MAC30";
    }
  }
  return info;
}

async function sendAlert(
  environment: Environment,
  deviceToken: string,
  title: string,
  body: string,
  mwId: string,
): Promise<{ ok: boolean; status: number; reason?: string }> {
  const jwt = await providerJwt();
  const url = `https://${apnsHost(environment)}/3/device/${deviceToken}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      authorization: `bearer ${jwt}`,
      "apns-topic": BUNDLE_ID,
      "apns-push-type": "alert",
      "apns-priority": "10",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      aps: {
        alert: { title, body },
        sound: "default",
      },
      ...alertUserInfo(mwId),
    }),
  });

  if (res.status === 200) return { ok: true, status: 200 };
  let reason: string | undefined;
  try {
    const parsed = (await res.json()) as { reason?: string };
    reason = parsed.reason;
  } catch {
    reason = await res.text().catch(() => undefined);
  }
  return { ok: false, status: res.status, reason };
}

function bearerToken(req: Request): string {
  const auth = req.headers.get("Authorization")?.trim() ?? "";
  if (auth.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7).trim();
  }
  return "";
}

function broadcastSecretExpected(): string {
  return Deno.env.get("MACWALL_BROADCAST_SECRET")?.trim() ?? "";
}

/** Broadcast/notify is server-only: service_role or MACWALL_BROADCAST_SECRET. */
function isBroadcastAuthorized(
  req: Request,
  body: Record<string, unknown>,
  serviceRoleKey: string,
): boolean {
  if (isServiceRole(req, serviceRoleKey)) return true;
  const expected = broadcastSecretExpected();
  if (expected.length < 32) return false;
  const secret =
    typeof body.broadcastSecret === "string" ? body.broadcastSecret.trim() : "";
  return secret === expected;
}

/** Privileged sends require the exact server credential, never a decoded role claim. */
function isServiceRole(req: Request, serviceRoleKey: string): boolean {
  if (!serviceRoleKey) return false;
  const token = bearerToken(req);
  const apikey = req.headers.get("apikey")?.trim() ?? "";
  return token === serviceRoleKey || apikey === serviceRoleKey;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }
  if (req.method !== "POST") {
    return json(405, { ok: false, error: "method_not_allowed" });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return json(500, { ok: false, error: "server_misconfigured" });
  }

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return json(400, { ok: false, error: "invalid_json" });
  }

  const action = typeof body.action === "string" ? body.action : "";
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  sharedTokenStore ??= {
    async load() {
      const { data } = await admin
        .from("macwall_apns_provider_token")
        .select("jwt, issued_at")
        .eq("id", 1)
        .maybeSingle();
      return data ? { jwt: data.jwt as string, issued_at: Number(data.issued_at) } : null;
    },
    async save(jwt: string, iat: number) {
      await admin
        .from("macwall_apns_provider_token")
        .upsert({ id: 1, jwt, issued_at: iat }, { onConflict: "id" });
    },
  };

  if (action === "register") {
    const visitorId =
      typeof body.visitorId === "string"
        ? body.visitorId.trim().toLowerCase()
        : "";
    const deviceToken =
      typeof body.deviceToken === "string" ? body.deviceToken.trim() : "";
    const apnsToken =
      typeof body.apnsToken === "string"
        ? body.apnsToken.trim().toLowerCase()
        : "";
    const environmentRaw =
      typeof body.environment === "string"
        ? body.environment.trim().toLowerCase()
        : "";
    const environment: Environment | null =
      environmentRaw === "development" || environmentRaw === "production"
        ? environmentRaw
        : null;

    if (!UUID_RE.test(visitorId)) {
      return json(400, { ok: false, error: "invalid_visitor_id" });
    }
    if (deviceToken.length < 32) {
      return json(400, { ok: false, error: "device_token_required" });
    }
    if (!HEX_TOKEN_RE.test(apnsToken)) {
      return json(400, { ok: false, error: "invalid_apns_token" });
    }
    if (!environment) {
      return json(400, { ok: false, error: "invalid_environment" });
    }

    const { error: assertError } = await admin.rpc(
      "assert_macwall_device_token",
      {
        p_visitor_id: visitorId,
        p_device_token: deviceToken,
      },
    );
    if (assertError) {
      const msg = assertError.message.toLowerCase();
      if (msg.includes("device_token_mismatch")) {
        return json(403, { ok: false, error: "device_token_mismatch" });
      }
      return json(400, { ok: false, error: "device_attestation_failed" });
    }

    const now = new Date().toISOString();
    const { error: upsertError } = await admin
      .from("macwall_apns_tokens")
      .upsert(
        {
          visitor_id: visitorId,
          apns_token: apnsToken,
          environment,
          bundle_id: BUNDLE_ID,
          updated_at: now,
        },
        { onConflict: "apns_token" },
      );
    if (upsertError) {
      console.error("[macwall-apns] upsert failed:", upsertError.message);
      return json(500, { ok: false, error: "register_failed" });
    }

    await admin
      .from("macwall_apns_tokens")
      .delete()
      .eq("visitor_id", visitorId)
      .eq("environment", environment)
      .neq("apns_token", apnsToken);

    return json(200, { ok: true });
  }

  /** PostgREST returns at most 1000 rows per request; page until a short page. */
  async function selectAllPages<T>(
    page: (
      from: number,
      to: number,
    ) => PromiseLike<{ data: unknown; error: { message: string } | null }>,
  ): Promise<{ rows: T[]; error: string | null }> {
    const pageSize = 1000;
    const rows: T[] = [];
    for (let from = 0; ; from += pageSize) {
      const { data, error } = await page(from, from + pageSize - 1);
      if (error) return { rows, error: error.message };
      const batch = (data ?? []) as T[];
      rows.push(...batch);
      if (batch.length < pageSize) return { rows, error: null };
    }
  }

  async function deliverAlerts(
    tokens: { apns_token: string; environment: Environment }[],
    title: string,
    text: string,
    mwId: string,
    recordDeliveries = false,
  ): Promise<{ sent: number; failed: number }> {
    const chunkSize = 25;
    let sent = 0;
    let failed = 0;

    for (let index = 0; index < tokens.length; index += chunkSize) {
      const chunk = tokens.slice(index, index + chunkSize);
      const results = await Promise.all(
        chunk.map(async (row) => {
          const result = await sendAlert(
            row.environment,
            row.apns_token,
            title,
            text,
            mwId,
          );
          return { row, result };
        }),
      );

      const delivered = results.filter(({ result }) => result.ok).map(({ row }) => row.apns_token);
      if (recordDeliveries && delivered.length) {
        const { error: ledgerError } = await admin
          .from("macwall_push_deliveries")
          .upsert(
            delivered.map((apns_token) => ({ mw_id: mwId, apns_token })),
            { onConflict: "mw_id,apns_token", ignoreDuplicates: true },
          );
        if (ledgerError) {
          console.error("[macwall-apns] delivery ledger failed:", ledgerError.message);
        }
      }

      for (const { row, result } of results) {
        if (result.ok) {
          sent += 1;
          continue;
        }
        failed += 1;
        console.error(
          `[macwall-apns] send failed status=${result.status} reason=${result.reason ?? "unknown"}`,
        );
        if (
          result.status === 410 ||
          result.reason === "Unregistered" ||
          result.reason === "BadDeviceToken"
        ) {
          await admin
            .from("macwall_apns_tokens")
            .delete()
            .eq("apns_token", row.apns_token);
        }
      }
    }

    return { sent, failed };
  }

  if (action === "notify") {
    if (
      !isBroadcastAuthorized(
        req,
        body as Record<string, unknown>,
        serviceRoleKey,
      )
    ) {
      return json(401, { ok: false, error: "unauthorized" });
    }
    if (!KEY_ID || !TEAM_ID || !PRIVATE_KEY_RAW) {
      console.warn("[macwall-apns] APNS secrets not configured");
      return json(503, { ok: false, error: "apns_not_configured" });
    }

    const visitorId =
      typeof body.visitorId === "string"
        ? body.visitorId.trim().toLowerCase()
        : "";
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const text = typeof body.body === "string" ? body.body.trim() : "";
    const mwId = typeof body.mwId === "string" ? body.mwId.trim() : "";
    if (!visitorId || !title || !text || !mwId.startsWith("com.macwall.")) {
      return json(400, { ok: false, error: "invalid_notify_payload" });
    }

    const { data: tokens, error } = await admin
      .from("macwall_apns_tokens")
      .select("apns_token,environment")
      .eq("visitor_id", visitorId);
    if (error) {
      console.error("[macwall-apns] token lookup failed:", error.message);
      return json(500, { ok: false, error: "lookup_failed" });
    }
    if (!tokens?.length) {
      return json(200, { ok: true, sent: 0, failed: 0, total: 0 });
    }

    const result = await deliverAlerts(
      tokens as { apns_token: string; environment: Environment }[],
      title,
      text,
      mwId,
    );
    return json(200, { ok: true, ...result, total: tokens.length });
  }

  if (action === "broadcast") {
    if (
      !isBroadcastAuthorized(
        req,
        body as Record<string, unknown>,
        serviceRoleKey,
      )
    ) {
      return json(401, { ok: false, error: "unauthorized" });
    }
    if (!KEY_ID || !TEAM_ID || !PRIVATE_KEY_RAW) {
      console.warn("[macwall-apns] APNS secrets not configured");
      return json(503, { ok: false, error: "apns_not_configured" });
    }

    const title = typeof body.title === "string" ? body.title.trim() : "";
    const text = typeof body.body === "string" ? body.body.trim() : "";
    const mwId = typeof body.mwId === "string" ? body.mwId.trim() : "";
    if (!title || !text || !mwId.startsWith("com.macwall.")) {
      return json(400, { ok: false, error: "invalid_broadcast_payload" });
    }

    const { rows: tokens, error } = await selectAllPages<{
      apns_token: string;
      environment: Environment;
    }>((from, to) =>
      admin
        .from("macwall_apns_tokens")
        .select("apns_token,environment")
        .order("apns_token", { ascending: true })
        .range(from, to)
    );
    if (error) {
      console.error("[macwall-apns] broadcast lookup failed:", error);
      return json(500, { ok: false, error: "lookup_failed" });
    }
    if (!tokens.length) {
      return json(200, {
        ok: true,
        sent: 0,
        failed: 0,
        total: 0,
        status: "empty",
      });
    }

    // Re-running the same mwId only reaches Macs that did not get it yet.
    const { rows: deliveredRows, error: deliveredError } = await selectAllPages<{
      apns_token: string;
    }>((from, to) =>
      admin
        .from("macwall_push_deliveries")
        .select("apns_token")
        .eq("mw_id", mwId)
        .order("apns_token", { ascending: true })
        .range(from, to)
    );
    if (deliveredError) {
      console.error("[macwall-apns] delivery lookup failed:", deliveredError);
      return json(500, { ok: false, error: "lookup_failed" });
    }
    const alreadyDelivered = new Set(deliveredRows.map((row) => row.apns_token));
    const tokenRows = tokens.filter((row) => !alreadyDelivered.has(row.apns_token));
    const work = deliverAlerts(tokenRows, title, text, mwId, true).then((result) => {
      console.info(
        `[macwall-apns] broadcast mwId=${mwId} sent=${result.sent} failed=${result.failed} total=${tokenRows.length} skipped=${alreadyDelivered.size}`,
      );
      return result;
    });

    // Return immediately; APNs fan-out can exceed the HTTP idle timeout.
    // @ts-expect-error Supabase Edge runtime
    EdgeRuntime.waitUntil(work);

    return json(202, {
      ok: true,
      status: "processing",
      total: tokenRows.length,
    });
  }

  return json(400, { ok: false, error: "unknown_action" });
});
