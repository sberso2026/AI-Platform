const STOPWORDS = new Set([
  "what", "which", "when", "where", "with", "from", "that", "this", "have", "been",
  "were", "does", "into", "about", "the", "for", "and", "are", "not", "how", "who",
  "why", "can", "may", "will", "shall", "must", "being", "their", "them", "than",
]);

const GENERIC_ENGINEERING_TERMS = new Set([
  "conveyor", "conveyors", "standard", "australian", "safety", "design",
  "construction", "document", "section", "page", "requirements", "requirement",
  "installation", "operation", "contents", "general",
]);

export function engineeringQueryTerms(query: string): string[] {
  const raw = query.toLowerCase().match(/[a-z][a-z0-9./'-]{2,}|\d+(?:\.\d+)*/g) ?? [];
  return [...new Set(raw.filter((term) => !STOPWORDS.has(term)))];
}

const PROPERTY_VARIANTS: Record<string, readonly string[]> = {
  width: ["width", "wide", "widths"],
  height: ["height", "high", "heights"],
  thickness: ["thickness", "thick"],
  length: ["length", "long"],
  diameter: ["diameter"],
  clearance: ["clearance"],
  temperature: ["temperature"],
  pressure: ["pressure"],
  speed: ["speed"],
};

export function termSearchVariants(term: string): string[] {
  const variants = PROPERTY_VARIANTS[term] ?? [term];
  const extra = term.length >= 5 ? [`${term}ing`] : [];
  return [...new Set([...variants, ...extra])];
}

export function contentContainsTerm(content: string, term: string): boolean {
  const hay = content;
  if (term === "minimum" && /not\s+less\s+than|at\s+least/i.test(hay)) return true;
  if (term === "maximum" && /not\s+more\s+than|not\s+exceed/i.test(hay)) return true;
  const candidates = PROPERTY_VARIANTS[term] ?? [term];
  return candidates.some((candidate) => {
    const escaped = candidate.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (/\d/.test(candidate)) {
      return new RegExp(escaped, "i").test(hay);
    }
    if (new RegExp(`\\b${escaped}s?\\b`, "i").test(hay)) return true;
    if (/(?:ch|sh|s|x|z)$/i.test(candidate) && new RegExp(`\\b${escaped}es\\b`, "i").test(hay)) return true;
    if (candidate.length >= 5 && new RegExp(`\\b${escaped}ing\\b`, "i").test(hay)) return true;
    if (
      candidate.length >= 4
      && candidate.endsWith("e")
      && new RegExp(`\\b${escaped.slice(0, -1)}ing\\b`, "i").test(hay)
    ) return true;
    if (
      candidate.endsWith("ing")
      && candidate.length >= 7
      && new RegExp(`\\b${escaped.slice(0, -3)}e?s?\\b`, "i").test(hay)
    ) return true;
    return false;
  });
}

const ENTITY_PROPERTY_SKIP = new Set([
  ...Object.keys(PROPERTY_VARIANTS),
  ...GENERIC_ENGINEERING_TERMS,
  "load",
  "capacity",
  "interval",
  "minimum",
  "maximum",
  "required",
  "shall",
  "designing",
  "engineering",
  "review",
  "specified",
  "specify",
  "material",
  "materials",
]);

const LIGHT_VERBS = new Set([
  "using", "used", "based", "including", "include", "applies", "apply",
  "making", "made", "taking", "given", "shown",
]);

export function entityEvidenceNeedles(entity: string): string[] {
  const parts = entity
    .toLowerCase()
    .replace(/-/g, " ")
    .match(/[a-z][a-z0-9./'-]{2,}|\d+(?:\.\d+)*/g) ?? [];
  return parts.filter((part) => !ENTITY_PROPERTY_SKIP.has(part) && !/\d/.test(part) && !LIGHT_VERBS.has(part));
}

export function contentContainsEntity(content: string, entity: string): boolean {
  const parts = entityEvidenceNeedles(entity);
  if (parts.length === 0) return false;
  return parts.every((part) => contentContainsTerm(content, part));
}

export function excerptAroundQuery(content: string, query: string, maxChars = 420): string {
  const compact = content.replace(/\s+/g, " ").trim();
  if (compact.length <= maxChars) return compact;
  const terms = engineeringQueryTerms(query).filter((term) => !GENERIC_ENGINEERING_TERMS.has(term));
  if (terms.length === 0) return compact.slice(0, maxChars);
  const lower = compact.toLowerCase();
  let bestStart = 0;
  let bestScore = -1;
  const step = 24;
  const last = Math.max(0, compact.length - maxChars);
  for (let start = 0; start <= last; start += step) {
    const window = lower.slice(start, start + maxChars);
    const score = terms.reduce((sum, term) => sum + (contentContainsTerm(window, term) ? (term.length >= 5 ? 2 : 1) : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      bestStart = start;
    }
  }
  return compact.slice(bestStart, bestStart + maxChars).trim();
}

export function lexicalOverlap(content: string, terms: readonly string[]): {
  matched: string[];
  score: number;
} {
  if (terms.length === 0) return { matched: [], score: 0 };
  const matched = terms.filter((term) => contentContainsTerm(content, term));
  return { matched, score: matched.length / terms.length };
}

export function isLexicallyRelevantEvidence(
  content: string,
  query: string,
  distinctiveTerms?: readonly string[],
  entities?: readonly string[],
): boolean {
  const planned = (distinctiveTerms ?? []).filter(Boolean);
  const terms = planned.length ? [...planned] : engineeringQueryTerms(query);
  if (terms.length === 0) return false;
  const { matched, score } = lexicalOverlap(`${content}`, terms);
  const specific = matched.filter((term) => !GENERIC_ENGINEERING_TERMS.has(term));
  const entityPhrases = (entities ?? [])
    .map((value) => value.trim())
    .filter((entity) => {
      if (entityEvidenceNeedles(entity).length === 0) return false;
      const words = entity.toLowerCase().split(/\s+/);
      return !words.some((word) => LIGHT_VERBS.has(word));
    });
  if (entityPhrases.length > 0) {
    const topicHit = contentContainsEntity(content, entityPhrases[0]!);
    const supportHit = entityPhrases.slice(1).some((entity) => (
      entityEvidenceNeedles(entity).length >= 2
      && contentContainsEntity(content, entity)
    ));
    if (!topicHit && !supportHit) return false;
  }
  if (specific.some((term) => /\d/.test(term))) return true;
  if (specific.length >= 2) return true;
  const specificQueryTerms = terms.filter((term) => !GENERIC_ENGINEERING_TERMS.has(term));
  if (specificQueryTerms.length >= 3 && specific.length < 2) return false;
  if (specific.length === 1 && (specific[0].length >= 8 || score >= 0.5)) return true;
  return false;
}

export function rerankHitsByQueryOverlap<T extends { chunk: { content: string; sectionPath?: string }; score: number }>(
  hits: readonly T[],
  query: string,
  distinctiveTerms?: readonly string[],
  entities?: readonly string[],
): T[] {
  const terms = (distinctiveTerms?.length ? [...distinctiveTerms] : engineeringQueryTerms(query));
  return hits
    .map((hit) => {
      const overlap = lexicalOverlap(`${hit.chunk.sectionPath ?? ""} ${hit.chunk.content}`, terms);
      const blended = Math.min(1, hit.score * 0.35 + overlap.score * 0.65);
      return { hit: { ...hit, score: blended }, overlap };
    })
    .filter((row) => isLexicallyRelevantEvidence(
      `${row.hit.chunk.sectionPath ?? ""} ${row.hit.chunk.content}`,
      query,
      distinctiveTerms,
      entities,
    ))
    .sort((a, b) => b.hit.score - a.hit.score)
    .map((row) => row.hit);
}
