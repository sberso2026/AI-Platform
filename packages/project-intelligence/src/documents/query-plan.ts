/**
 * Deterministic engineering retrieval query planning.
 * Strips conversational/question scaffolding and emits multi-channel search queries.
 * No document- or fixture-specific phrases belong here.
 */

export type EngineeringRetrievalIntent =
  | "property_lookup"
  | "procedure"
  | "requirement"
  | "definition"
  | "comparison"
  | "unspecified";

export interface EngineeringQueryPlan {
  rawQuery: string;
  normalizedQuery: string;
  engineeringIntent: EngineeringRetrievalIntent;
  entities: string[];
  properties: string[];
  constraints: string[];
  distinctiveTerms: string[];
  retrievalQueries: string[];
}

const STOPWORDS = new Set([
  "what", "which", "when", "where", "with", "from", "that", "this", "have", "been",
  "were", "does", "into", "about", "the", "for", "and", "are", "not", "how", "who",
  "why", "can", "may", "will", "shall", "must", "being", "their", "them", "than",
  "you", "your", "please", "would", "could", "should", "need", "know", "tell",
  "show", "find", "identify", "confirm", "explain", "provide", "give",
]);

const GENERIC_FRAMES = new Set([
  "conveyor", "conveyors", "standard", "australian", "safety", "design", "designing",
  "construction", "document", "section", "page", "requirements", "requirement",
  "installation", "operation", "contents", "general", "engineering", "review",
  "purposes", "purpose", "according", "specify", "specified", "source", "clause",
  "material", "materials",
]);

const PROPERTY_ALIASES: Array<{ pattern: RegExp; property: string }> = [
  { pattern: /\bthick(?:ness|nesses)?\b/i, property: "thickness" },
  { pattern: /\bwide|width\b/i, property: "width" },
  { pattern: /\bhigh|height\b/i, property: "height" },
  { pattern: /\blong|length\b/i, property: "length" },
  { pattern: /\bclearance\b/i, property: "clearance" },
  { pattern: /\btolerance\b/i, property: "tolerance" },
  { pattern: /\btemperature\b/i, property: "temperature" },
  { pattern: /\bpressure\b/i, property: "pressure" },
  { pattern: /\bspeed\b/i, property: "speed" },
  { pattern: /\bload\b/i, property: "load" },
  { pattern: /\bcapacity\b/i, property: "capacity" },
  { pattern: /\bdiameter\b/i, property: "diameter" },
  { pattern: /\binterval\b/i, property: "interval" },
];

const CONSTRAINT_ALIASES: Array<{ pattern: RegExp; constraint: string }> = [
  { pattern: /\bmin(?:imum)?\b/i, constraint: "minimum" },
  { pattern: /\bmax(?:imum)?\b/i, constraint: "maximum" },
  { pattern: /\brequired|requirement\b/i, constraint: "required" },
  { pattern: /\bshall\b/i, constraint: "shall" },
  { pattern: /\bnot less than\b/i, constraint: "minimum" },
  { pattern: /\bnot more than\b/i, constraint: "maximum" },
];

const LEADING_FRAMES: RegExp[] = [
  /^(please\s+)?(can you|could you|would you)\s+/i,
  /^(please\s+)?(tell me|show me|find|identify|confirm|explain)\s+(me\s+)?/i,
  /^(i need to know|i want to know|i am asking)\s+/i,
  /^(we need to know|we want to know)\s+/i,
  /^(?:i am|we are) designing\b.{0,80}?\b(?:and\s+)?(?:need to know|need)\s+/i,
  /^(in the (?:design|context|case) of)\s+/i,
  /^(for\s+\w+(?:\s+\w+)?\s+design)\b,?\s*/i,
  /^(according to (?:this |the )?(?:document|standard|code))\s*,?\s*/i,
  /^(for (?:engineering )?review)\s*,?\s*/i,
  /^(does (?:the )?(?:standard|document|code) specify)\s+/i,
];

const TRAILING_FRAMES: RegExp[] = [
  /\s*,?\s*(according to (?:the )?(?:standard|document|code))\s*[?.!]?\s*$/i,
  /\s+for design purposes\s*[?.!]?\s*$/i,
  /\s+and\s+(?:please\s+)?(?:provide the clause|show me the source|explain why|cite (?:the )?source)\s*[?.!]?\s*$/i,
  /\s+and\s+provide the clause\s*[?.!]?\s*$/i,
];

function tokenize(value: string): string[] {
  return [...new Set(
    (value.toLowerCase().match(/[a-z][a-z0-9./'-]{2,}|\d+(?:\.\d+)*/g) ?? [])
      .filter((term) => !STOPWORDS.has(term)),
  )];
}

function stripFrames(raw: string): string {
  let text = raw.trim().replace(/\s+/g, " ");
  for (const pattern of LEADING_FRAMES) {
    text = text.replace(pattern, "");
  }
  for (const pattern of TRAILING_FRAMES) {
    text = text.replace(pattern, "");
  }
  return text.replace(/^[,\s]+|[,\s]+$/g, "").trim() || raw.trim();
}

function detectIntent(text: string): EngineeringRetrievalIntent {
    if (/\b(how to|procedure|method|test method|steps?)\b/i.test(text)) return "procedure";
    if (/\b(thicker|wider|compare|difference|versus|vs\.?)\b/i.test(text)) return "comparison";
    if (PROPERTY_ALIASES.some((row) => row.pattern.test(text))) return "property_lookup";
    if (/\b(shall|must|required|requirement|minimum|maximum)\b/i.test(text)) return "requirement";
    if (/\b(what is|define|definition|meaning of)\b/i.test(text)) return "definition";
  return "unspecified";
}

function nounishPhrases(text: string): string[] {
  const words = text.toLowerCase().match(/[a-z][a-z0-9-]{2,}/g) ?? [];
  const skip = new Set([...STOPWORDS, ...GENERIC_FRAMES, "minimum", "maximum", "required"]);
  const phrases: string[] = [];
  for (let i = 0; i < words.length; i += 1) {
    const first = words[i]!;
    const second = words[i + 1];
    if (skip.has(first)) continue;
    if (second && !skip.has(second)) {
      phrases.push(`${first} ${second}`);
    }
  }
  return [...new Set(phrases)].slice(0, 6);
}

export function planEngineeringQuery(rawQuery: string): EngineeringQueryPlan {
  const raw = (rawQuery ?? "").replace(/\s+/g, " ").trim();
  const stripped = stripFrames(raw);
  const engineeringIntent = detectIntent(raw);
  const properties = [...new Set(PROPERTY_ALIASES.filter((row) => row.pattern.test(raw) || row.pattern.test(stripped)).map((row) => row.property))];
  const constraints = [...new Set(CONSTRAINT_ALIASES.filter((row) => row.pattern.test(raw) || row.pattern.test(stripped)).map((row) => row.constraint))];
  const entities = nounishPhrases(stripped);
  const strippedTerms = tokenize(stripped);
  const distinctiveTerms = [...new Set([
    ...strippedTerms.filter((term) => !GENERIC_FRAMES.has(term)),
    ...properties,
    ...constraints,
  ])];
  const normalizedQuery = [
    ...constraints,
    ...distinctiveTerms.filter((term) => !constraints.includes(term)),
  ].join(" ").trim() || stripped || raw;

  const conceptQuery = [...entities.slice(0, 2), ...properties, ...constraints]
    .filter(Boolean)
    .join(" ")
    .trim();

  const orQuery = distinctiveTerms.slice(0, 8).join(" OR ");
  const retrievalQueries = [...new Set([
    normalizedQuery,
    conceptQuery,
    orQuery,
    distinctiveTerms.slice(0, 8).join(" "),
  ].filter((value) => value && value.length >= 3))];

  return {
    rawQuery: raw,
    normalizedQuery,
    engineeringIntent,
    entities,
    properties,
    constraints,
    distinctiveTerms,
    retrievalQueries,
  };
}

export function queryPlanToDiagnostic(plan: EngineeringQueryPlan): string {
  return [
    `raw_query=${plan.rawQuery}`,
    `normalized_query=${plan.normalizedQuery}`,
    `engineering_intent=${plan.engineeringIntent}`,
    `entities=${plan.entities.join("|")}`,
    `properties=${plan.properties.join("|")}`,
    `constraints=${plan.constraints.join("|")}`,
    `retrieval_queries=${plan.retrievalQueries.join(" || ")}`,
  ].join("; ");
}
