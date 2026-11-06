/** The slice of a Workers KV namespace binding the app uses. */
export type KvNamespaceLike = {
  get(key: string): Promise<string | null>
  put(
    key: string,
    value: string,
    options?: { expirationTtl?: number }
  ): Promise<void>
}

/**
 * KV namespace vinext already binds for its data cache (wrangler.jsonc). App
 * state shares it under its own `macwall:` key prefix, which never collides
 * with vinext's `cache:` / `__tag:` keys.
 */
export const APP_KV_BINDING = "VINEXT_KV_CACHE"

/**
 * workerd's built-in module for `env`. Imported at runtime by name: the
 * project's types don't declare it, and Node (`next dev`, tests) can't load
 * it, which the catch below turns into "no binding".
 */
const CLOUDFLARE_WORKERS_MODULE = "cloudflare:workers"

/**
 * A binding from the running Worker's `env`, or null outside workerd
 * (`next dev`, node tests) or when the Worker has no such binding. String
 * vars and secrets are on `process.env`; this is for KV and other objects.
 */
export async function workerBinding<T>(name: string): Promise<T | null> {
  try {
    const workers = (await import(
      /* webpackIgnore: true */ /* turbopackIgnore: true */ /* @vite-ignore */ CLOUDFLARE_WORKERS_MODULE
    )) as { env?: Record<string, unknown> }
    return (workers.env?.[name] as T | undefined) ?? null
  } catch {
    return null
  }
}

/** The app's KV namespace, or null when unavailable. */
export function appKv(): Promise<KvNamespaceLike | null> {
  return workerBinding<KvNamespaceLike>(APP_KV_BINDING)
}
