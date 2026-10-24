/** Strip PostgREST `.or()` separators so natural-language questions cannot break ILIKE filters. */
export function sanitizePostgrestIlike(query: string): string {
  return query
    .replace(/[%*,()]/g, " ")
    .replace(/[?!]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}
