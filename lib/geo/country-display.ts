/** Countries that read naturally as "the X" in English copy. */
const COUNTRIES_WITH_THE = new Set([
  "US",
  "GB",
  "NL",
  "PH",
  "AE",
  "CZ",
  "DO",
  "BS",
  "MV",
  "SC",
  "KM",
  "SB",
  "MH",
  "FM",
  "CD",
  "CG",
  "CF",
  "CI",
  "GM",
  "GN",
])

function normalizeCountryCode(value: string | null | undefined): string | null {
  const code = value?.trim().toUpperCase()
  if (!code || !/^[A-Z]{2}$/.test(code) || code === "XX") return null
  return code
}

/**
 * English country name for social proof ("India", "the United States").
 * Returns null when the code is missing or unknown.
 */
export function countryDisplayName(
  countryCode: string | null | undefined
): string | null {
  const code = normalizeCountryCode(countryCode)
  if (!code) return null

  try {
    const name = new Intl.DisplayNames(["en"], { type: "region" }).of(code)
    if (!name || name === code) return null
    return COUNTRIES_WITH_THE.has(code) ? `the ${name}` : name
  } catch {
    return null
  }
}
