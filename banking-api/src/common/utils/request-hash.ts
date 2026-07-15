import { createHash } from 'crypto';

/**
 * Serializes a value to text with object keys sorted recursively, so that two payloads which are logically
 * identical but were written with a different key order produce the same text. Hashing a raw request body
 * directly would make `{"type":"deposit","amount":1}` and `{"amount":1,"type":"deposit"}` produce different
 * digests, causing a legitimate retry to be rejected as though the key had been reused for another request.
 * @param value - Any JSON-compatible value. Primitives, arrays, and plain objects are supported, and nested objects are sorted at every depth. Keys holding undefined are omitted, so an absent optional field and one explicitly set to undefined produce the same text.
 * @returns - A deterministic string representation of the value, intended only as input to a hash function and not to be parsed back into the original value.
 */
function canonicalize(value: unknown): string {
  if (value === undefined) return 'null';

  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value) ?? 'null';
  }

  if (Array.isArray(value)) {
    return `[${value.map(canonicalize).join(',')}]`;
  }

  const sortedEntries = Object.entries(value as Record<string, unknown>)
    .filter(([, entryValue]) => entryValue !== undefined)
    .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
    .map(([key, entryValue]) => `${JSON.stringify(key)}:${canonicalize(entryValue)}`);

  return `{${sortedEntries.join(',')}}`;
}

export function hashRequestPayload(payload: unknown): string {
  return createHash('sha256').update(canonicalize(payload)).digest('hex');
}
