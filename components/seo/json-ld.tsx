/** Emits deterministic `application/ld+json`; payloads must come from trusted server constants only. */
export function JsonLd({ payload }: Readonly<{ payload: object }>) {
  // Escape `<` so a malicious string in JSON cannot break out of the script tag.
  const html = JSON.stringify(payload).replace(/</g, "\\u003c")
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
