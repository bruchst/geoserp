/**
 * UULE encoding for Google's canonical location names.
 *
 * The uule value is a base64 payload prefixed with the literal "w+".
 * The payload is a small protobuf-style message:
 *
 *   0x08 0x02   role     = 2
 *   0x10 0x20   producer = 32
 *   0x22 <len>  canonical_name (length-delimited, varint length)
 *
 * Encoding the whole byte array at once (rather than string-concatenating
 * a precomputed prefix) is what makes this correct for names longer than
 * 63 bytes and for non-ASCII names, where the widely copied
 * `"w+CAIQICI" + alphabet[len] + base64(name)` shortcut breaks: with
 * len >= 64 the length varint no longer fits in the low 6 bits of the
 * final prefix character.
 *
 * Verified against live seoroast.com output (2026-07-25):
 *   "Berlin,Berlin,Germany"            -> w+CAIQICIVQmVybGluLEJlcmxpbixHZXJtYW55
 *   "New York,New York,United States"  -> w+CAIQICIfTmV3IFlvcmssTmV3IFlvcmssVW5pdGVkIFN0YXRlcw
 */

export const UULE_LITERAL_PREFIX = "w+";
export const UULE_MESSAGE_HEADER = [0x08, 0x02, 0x10, 0x20, 0x22] as const;

/** Protobuf base-128 varint, little-endian groups of 7 bits. */
export function varint(value: number): number[] {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`varint expects a non-negative integer, got ${value}`);
  }
  const out: number[] = [];
  let n = value;
  do {
    let byte = n & 0x7f;
    n >>>= 7;
    if (n > 0) byte |= 0x80;
    out.push(byte);
  } while (n > 0);
  return out;
}

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  if (typeof btoa === "function") return btoa(binary);
  // Node fallback (tests, build-time scripts)
  return Buffer.from(bytes).toString("base64");
}

/**
 * Encode a Google canonical location name (e.g. "Berlin,Berlin,Germany")
 * into a uule parameter value. Padding is stripped: Google accepts the
 * unpadded form and it keeps URLs shorter.
 */
export function encodeUule(canonicalName: string): string {
  const name = canonicalName.trim();
  if (!name) return "";
  const nameBytes = new TextEncoder().encode(name);
  const payload = new Uint8Array([
    ...UULE_MESSAGE_HEADER,
    ...varint(nameBytes.length),
    ...nameBytes,
  ]);
  return UULE_LITERAL_PREFIX + toBase64(payload).replace(/=+$/, "");
}

/**
 * Normalize user-typed locations toward Google's canonical form:
 * collapse whitespace and drop spaces around the comma separators.
 * "Berlin, Berlin, Germany" and "berlin,Berlin ,Germany" both become
 * "Berlin,Berlin,Germany" — but casing is left alone, because Google's
 * canonical names are case sensitive.
 */
export function normalizeCanonicalName(input: string): string {
  return input
    .replace(/\s+/g, " ")
    .split(",")
    .map((part) => part.trim())
    .filter((part, index, all) => part.length > 0 || index === all.length - 1)
    .join(",")
    .trim();
}

/** Byte length of a canonical name, which is what the uule varint encodes. */
export function canonicalByteLength(canonicalName: string): number {
  return new TextEncoder().encode(canonicalName.trim()).length;
}

/**
 * Decide which exact string to encode into the uule.
 *
 * A verbatim hit in Google's own location list always wins, because some
 * canonical names contain a comma followed by a space inside one component
 * ("...Peloponnese, Western Greece and the Ionian,Greece"). Normalizing those
 * would strip a space that is part of the name. Only when the input is not a
 * known location do we apply the lenient normalization, which is what fixes
 * the common "Berlin, Berlin, Germany" paste.
 */
export function resolveCanonical(
  raw: string,
  isKnown: (candidate: string) => boolean,
): { canonical: string; verified: boolean } {
  const trimmed = raw.trim();
  if (!trimmed) return { canonical: "", verified: false };
  if (isKnown(trimmed)) return { canonical: trimmed, verified: true };
  const normalized = normalizeCanonicalName(trimmed);
  if (isKnown(normalized)) return { canonical: normalized, verified: true };
  return { canonical: normalized, verified: false };
}
