/** Shared community multipart thresholds (safe for client + server). */

/** R2 recommends ~16 MiB parts with parallel uploads for large objects. */
export const COMMUNITY_MULTIPART_PART_SIZE_BYTES = 16 * 1024 * 1024

/** Use multipart above this size; smaller files stay on a single PUT. */
export const COMMUNITY_MULTIPART_THRESHOLD_BYTES = 32 * 1024 * 1024
