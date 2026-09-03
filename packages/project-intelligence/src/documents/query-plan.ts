/**
 * Deterministic engineering retrieval query planning.
 * Strips conversational/question scaffolding and emits multi-channel search queries.
 * No document- or fixture-specific phrases belong here.
 */

export type EngineeringRetrievalIntent =
  | "requirement_lookup"
  | "property_lookup"
  | "procedure"
  | "definition"
  | "prohibition"
  | "comparison"
  | "unspecified";

export type EngineeringExpectedAnswerType =
  | "quantity_with_unit"
  | "boolean_requirement"
  | "definition"
  | "procedure"
  | "prohibition"
  | "qualitative"
  | "unspecified";

export interface EngineeringQueryPlan {
  rawQuery: string;
  normalizedQuery: string;
  engineeringIntent: EngineeringRetrievalIntent;
  intent: EngineeringRetrievalIntent;
  subject: string | null;
  subjects: string[];
  entities: string[];
  property: string | null;
  properties: string[];
  constraint: string | null;
  constraints: string[];
  qualifier: string | null;
  unitExpectation: string | null;
  relationship: string | null;
  expectedAnswerType: EngineeringExpectedAnswerType;
  distinctiveTerms: string[];
  retrievalQueries: string[];
}

const STOPWORDS = new Set([
  "what", "which", "when", "where", "with", "from", "that", "this", "have", "been",
  "were", "does", "into", "about", "the", "for", "and", "are", "not", "how", "who",
  "why", "can", "may", "will", "shall", "must", "being", "their", "them", "than",
  "you", "your", "please", "would", "could", "should", "need", "know", "tell",
  "show", "find", "identify", "confirm", "explain", "provide", "give", "check",
]);

const GENERIC_FRAMES = new Set([
  "conveyor", "conveyors", "standard", "australian", "safety", "design", "designing",
  "construction", "document", "section", "page", "requirements", "requirement",
  "installation", "operation", "contents", "general", "engineering", "review",
  "purposes", "purpose", "according", "specify", "specified", "source", "clause",
  "material", "materials", "detailing", "allowed", "applicable",
]);

export const PROPERTY_ALIASES: Array<{ pattern: RegExp; property: string }> = [
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
  { pattern: /\binterval|spacing|spaced|apart|distance\b/i, property: "interval" },
  { pattern: /\bhow far\b/i, property: "interval" },
  { pattern: /\billuminance|lux\b/i, property: "illuminance" },
  { pattern: /\bslope\b/i, property: "slope" },
  { pattern: /\bclearance|headroom\b/i, property: "clearance" },
  { pattern: /\bduration|minutes\b/i, property: "duration" },
];

export const CONSTRAINT_ALIASES: Array<{ pattern: RegExp; constraint: string }> = [
  { pattern: /\bmin(?:imum)?\b/i, constraint: "minimum" },
  { pattern: /\bmax(?:imum)?\b/i, constraint: "maximum" },
  { pattern: /\brequired|requirement\b/i, constraint: "required" },
  { pattern: /\bshall not\b/i, constraint: "prohibited" },
  { pattern: /\bshall\b/i, constraint: "shall" },
  { pattern: /\bshould\b/i, constraint: "should" },
  { pattern: /\bmay\b/i, constraint: "permitted" },
  { pattern: /\bnot less than|at least\b/i, constraint: "minimum" },
  { pattern: /\bnot more than|not exceed(?:ing)?\b/i, constraint: "maximum" },
  { pattern: /\bprohibited|not permitted|shall not\b/i, constraint: "prohibited" },
];

const UNIT_ALIASES: Array<{ pattern: RegExp; unit: string }> = [
  { pattern: /\bmm\b/i, unit: "mm" },
  { pattern: /\bm\b/i, unit: "m" },
  { pattern: /\bkpa\b/i, unit: "kPa" },
  { pattern: /\bmpa\b/i, unit: "MPa" },
  { pattern: /\blux\b/i, unit: "lux" },
  { pattern: /\bdb(?:\(a\))?\b/i, unit: "dB" },
  { pattern: /\bdegrees?\b/i, unit: "degrees" },
  { pattern: /\bm\/s\b/i, unit: "m/s" },
  { pattern: /\bn\b/i, unit: "N" },
];

const LEADING_FRAMES: RegExp[] = [
  /^(please\s+)?(can you|could you|would you)\s+/i,
  /^(please\s+)?(tell me|show me|find|identify|confirm|explain|check)\s+(me\s+)?(the\s+)?/i,
  /^(i need to know|i want to know|i am asking)\s+/i,
  /^(we need to know|we want to know)\s+/i,
  /^(?:i am|we are) (?:designing|detailing|reviewing)\b.{0,80}?\b(?:and\s+)?(?:need to know|need|what)\s+/i,
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
  text = text
    .replace(/\bshall be (?:spaced|provided|located) at what\b/i, " ")
    .replace(/\bat what (?:maximum |minimum )?(?:interval|spacing|distance|thickness|width)\b/i, " ")
    .replace(/[?!.]+/g, " ")
    .replace(/^[,\s]+|[,\s]+$/g, "")
    .trim();
  return text || raw.trim();
}

function detectIntent(text: string): EngineeringRetrievalIntent {
  if (/\b(how to|procedure|method|test method|steps?)\b/i.test(text)) return "procedure";
  if (/\b(thicker|wider|compare|difference|versus|vs\.?)\b/i.test(text)) return "comparison";
  if (/\b(shall not|must not|prohibited|not permitted)\b/i.test(text)) return "prohibition";
  if (/\b(define|definition|meaning of|what is a)\b/i.test(text)) return "definition";
  if (PROPERTY_ALIASES.some((row) => row.pattern.test(text))) return "property_lookup";
  if (/\b(shall|must|required|requirement|minimum|maximum)\b/i.test(text)) return "requirement_lookup";
  return "unspecified";
}

function expectedAnswerType(
  intent: EngineeringRetrievalIntent,
  properties: string[],
  constraints: string[],
): EngineeringExpectedAnswerType {
  if (intent === "procedure") return "procedure";
  if (intent === "definition") return "definition";
  if (intent === "prohibition" || constraints.includes("prohibited")) return "prohibition";
  if (properties.length && (constraints.includes("minimum") || constraints.includes("maximum") || constraints.includes("required"))) {
    return "quantity_with_unit";
  }
  if (properties.length) return "quantity_with_unit";
  if (intent === "requirement_lookup") return "boolean_requirement";
  return "unspecified";
}

function alternativeSubjects(text: string): string[] {
  const matches = [...text.matchAll(
    /\b([a-z][a-z0-9-]*(?:\s+[a-z][a-z0-9-]*){0,3})\s+or\s+([a-z][a-z0-9-]*(?:\s+[a-z][a-z0-9-]*){0,3})\b/gi,
  )];
  const found: string[] = [];
  for (const match of matches) {
    const left = match[1]?.trim();
    const right = match[2]?.trim();
    if (left && !GENERIC_FRAMES.has(left) && !STOPWORDS.has(left)) found.push(left);
    if (right && !GENERIC_FRAMES.has(right) && !STOPWORDS.has(right)) found.push(right);
  }
  return [...new Set(found)];
}

function nounishPhrases(text: string): string[] {
  const words = text.toLowerCase().match(/[a-z][a-z0-9-]{2,}/g) ?? [];
  const skip = new Set([...STOPWORDS, ...GENERIC_FRAMES, "minimum", "maximum", "required", "interval", "spacing"]);
  const phrases: string[] = [];
  for (let i = 0; i < words.length; i += 1) {
    const first = words[i]!;
    const second = words[i + 1];
    if (skip.has(first)) continue;
    if (second && !skip.has(second)) {
      phrases.push(`${first} ${second}`);
    } else if (!skip.has(first)) {
      phrases.push(first);
    }
  }
  return [...new Set(phrases)].slice(0, 8);
}

function detectRelationship(text: string): string | null {
  if (/\bbetween\b/i.test(text)) return "between";
  if (/\bprovided at\b/i.test(text)) return "provided_at";
  if (/\blocated at\b/i.test(text)) return "located_at";
  if (/\bspaced\b/i.test(text)) return "spaced_at";
  return null;
}

function detectQualifier(text: string): string | null {
  if (/\bmidway\b/i.test(text)) return "midway";
  if (/\balong the axis\b/i.test(text)) return "along_axis";
  if (/\bat right angles\b/i.test(text)) return "right_angles";
  return null;
}

export function planEngineeringQuery(rawQuery: string): EngineeringQueryPlan {
  const raw = (rawQuery ?? "").replace(/\s+/g, " ").trim();
  const stripped = stripFrames(raw);
  const engineeringIntent = detectIntent(raw);
  const properties = [...new Set(PROPERTY_ALIASES.filter((row) => row.pattern.test(raw) || row.pattern.test(stripped)).map((row) => row.property))];
  const constraints = [...new Set(CONSTRAINT_ALIASES.filter((row) => row.pattern.test(raw) || row.pattern.test(stripped)).map((row) => row.constraint))];
  const orSubjects = alternativeSubjects(stripped);
  const entities = orSubjects.length ? orSubjects : nounishPhrases(stripped);
  const strippedTerms = tokenize(stripped);
  const distinctiveTerms = [...new Set([
    ...strippedTerms.filter((term) => !GENERIC_FRAMES.has(term)),
    ...properties,
    ...constraints.filter((value) => value !== "shall" && value !== "should" && value !== "permitted"),
  ])];
  const normalizedQuery = [
    ...constraints.filter((value) => value === "minimum" || value === "maximum"),
    ...distinctiveTerms.filter((term) => !constraints.includes(term)),
  ].join(" ").trim() || stripped || raw;

  const conceptQuery = [...entities.slice(0, 2), ...properties, ...constraints.filter((value) => value === "minimum" || value === "maximum")]
    .filter(Boolean)
    .join(" ")
    .trim();

  const orQuery = distinctiveTerms.slice(0, 8).join(" OR ");
  const propertyConstraintQuery = [...properties, ...constraints.filter((value) => value === "minimum" || value === "maximum"), ...entities.slice(0, 2)]
    .filter(Boolean)
    .join(" ");
  const retrievalQueries = [...new Set([
    normalizedQuery,
    conceptQuery,
    propertyConstraintQuery,
    orQuery,
    distinctiveTerms.slice(0, 8).join(" "),
  ].filter((value) => value && value.length >= 3))];

  return {
    rawQuery: raw,
    normalizedQuery,
    engineeringIntent,
    intent: engineeringIntent,
    subject: entities[0] ?? null,
    subjects: entities,
    entities,
    property: properties[0] ?? null,
    properties,
    constraint: constraints.find((value) => value === "minimum" || value === "maximum" || value === "prohibited") ?? constraints[0] ?? null,
    constraints,
    qualifier: detectQualifier(raw),
    unitExpectation: UNIT_ALIASES.find((row) => row.pattern.test(raw))?.unit ?? (properties.includes("interval") || properties.includes("width") || properties.includes("thickness") ? "length" : null),
    relationship: detectRelationship(raw),
    expectedAnswerType: expectedAnswerType(engineeringIntent, properties, constraints),
    distinctiveTerms,
    retrievalQueries,
  };
}

export function queryPlanToDiagnostic(plan: EngineeringQueryPlan): string {
  return [
    `raw_query=${plan.rawQuery}`,
    `normalized_query=${plan.normalizedQuery}`,
    `engineering_intent=${plan.engineeringIntent}`,
    `subject=${plan.subject ?? ""}`,
    `entities=${plan.entities.join("|")}`,
    `property=${plan.property ?? ""}`,
    `constraint=${plan.constraint ?? ""}`,
    `expected_answer_type=${plan.expectedAnswerType}`,
    `retrieval_queries=${plan.retrievalQueries.join(" || ")}`,
  ].join("; ");
}
