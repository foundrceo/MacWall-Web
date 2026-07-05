/** Emits deterministic `application/ld+json`; payloads must come from trusted server constants only. */
export function JsonLd({ payload }: Readonly<{ payload: object }>) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  )
}
