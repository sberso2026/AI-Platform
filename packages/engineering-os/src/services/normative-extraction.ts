import {
  assembleStructuralEvidence,
  parseEngineeringStructure,
  type StructuralRequirement,
} from "./document-structure";

export type NormativeOperator = "MIN" | "MAX" | "EQ" | "PROHIBITED" | "REQUIRED" | "PERMITTED";

export type NormativeFact = {
  subject: string | null;
  property: string | null;
  operator: NormativeOperator;
  value: string;
  unit: string;
  condition: string | null;
  exception: string | null;
  sourceClause: string | null;
  page: number | null;
  span: string;
};

const UNIT = "(mm|m|kPa|MPa|lux|dB(?:\\(A\\))?|degrees|m\\/s|N|minutes?)";
const NUMBER = "(\\d+(?:\\.\\d+)?)";

const PATTERNS: Array<{ operator: NormativeOperator; regex: RegExp }> = [
  { operator: "MAX", regex: new RegExp(`not\\s+exceed(?:ing)?\\s+${NUMBER}\\s*${UNIT}`, "i") },
  { operator: "MAX", regex: new RegExp(`not\\s+more\\s+than\\s+${NUMBER}\\s*${UNIT}`, "i") },
  { operator: "MIN", regex: new RegExp(`not\\s+less\\s+than\\s+${NUMBER}\\s*${UNIT}`, "i") },
  { operator: "MIN", regex: new RegExp(`at\\s+least\\s+${NUMBER}\\s*${UNIT}`, "i") },
  { operator: "MIN", regex: new RegExp(`minimum(?:\\s+of)?\\s+${NUMBER}\\s*${UNIT}`, "i") },
  { operator: "MAX", regex: new RegExp(`maximum(?:\\s+of)?\\s+${NUMBER}\\s*${UNIT}`, "i") },
  { operator: "EQ", regex: new RegExp(`shall\\s+be\\s+${NUMBER}\\s*${UNIT}`, "i") },
  { operator: "MAX", regex: new RegExp(`shall\\s+not\\s+exceed\\s+${NUMBER}\\s*${UNIT}`, "i") },
];

function nearbySubject(hay: string, index: number): string | null {
  const window = hay.slice(Math.max(0, index - 160), index).toLowerCase();
  const match = window.match(/([a-z][a-z0-9-]*(?:\s+[a-z][a-z0-9-]*){0,4})\s+(?:shall|must|should|may|to be|are)\b/);
  return match?.[1]?.trim() ?? null;
}

function inferProperty(span: string): string | null {
  if (/interval|spacing|apart|distance|provided at/i.test(span)) return "interval";
  if (/force/i.test(span)) return "force";
  if (/\bthick|\bcover\b/i.test(span)) return "thickness";
  if (/width|wide/i.test(span)) return "width";
  if (/height|high/i.test(span)) return "height";
  if (/force/i.test(span)) return "force";
  if (/clearance|headroom/i.test(span)) return "clearance";
  if (/illuminance|lux/i.test(span)) return "illuminance";
  if (/wind speed|m\/s|belt speed/i.test(span)) return "speed";
  if (/slope|degrees/i.test(span)) return "slope";
  if (/diameter/i.test(span)) return "diameter";
  if (/MPa|kPa|sound pressure/i.test(span)) return "pressure";
  if (/minutes|fire-resistance/i.test(span)) return "duration";
  return null;
}

function queryProperty(query: string): string | null {
  if (/interval|spacing|spaced|apart|distance|how far/i.test(query)) return "interval";
  if (/\bforce\b/i.test(query)) return "force";
  if (/\bthick|\bcover\b/i.test(query)) return "thickness";
  if (/width|wide/i.test(query)) return "width";
  if (/height|high|handrail/i.test(query)) return "height";
  if (/force/i.test(query)) return "force";
  if (/clearance|headroom/i.test(query)) return "clearance";
  if (/illuminance|lux|lighting/i.test(query)) return "illuminance";
  if (/speed/i.test(query)) return "speed";
  if (/slope/i.test(query)) return "slope";
  if (/diameter/i.test(query)) return "diameter";
  if (/pressure|proof load|MPa|dB/i.test(query)) return "pressure";
  if (/fire-resistance|minutes|duration/i.test(query)) return "duration";
  return null;
}

function queryConstraint(query: string): "minimum" | "maximum" | null {
  if (/max(?:imum)?|not exceed|not more than/i.test(query)) return "maximum";
  if (/min(?:imum)?|not less than|at least/i.test(query)) return "minimum";
  return null;
}

export function extractNormativeFacts(input: {
  text: string;
  page?: number | null;
  sectionPath?: string | null;
}): NormativeFact[] {
  const hay = input.text.replace(/\s+/g, " ");
  const facts: NormativeFact[] = [];
  for (const pattern of PATTERNS) {
    const regex = new RegExp(pattern.regex.source, "gi");
    let match: RegExpExecArray | null;
    while ((match = regex.exec(hay))) {
      const value = match[1] ?? "";
      const unit = match[2] ?? "";
      const spanStart = Math.max(0, match.index - 80);
      const span = hay.slice(spanStart, match.index + match[0].length + 40).trim();
      facts.push({
        subject: nearbySubject(hay, match.index),
        property: inferProperty(span),
        operator: pattern.operator,
        value,
        unit,
        condition: /where|when|if /i.test(span) ? span.slice(0, 120) : null,
        exception: /except|unless/i.test(span) ? span.slice(0, 120) : null,
        sourceClause: input.sectionPath?.match(/\b(\d+(?:\.\d+){1,4}(?:\([a-z]\))?)/i)?.[1]
          ?? span.match(/\([a-z]\)/)?.[0]
          ?? input.sectionPath
          ?? null,
        page: input.page ?? null,
        span,
      });
    }
  }
  return facts;
}

export function factMatchesQuery(fact: NormativeFact, query: string): boolean {
  const constraint = queryConstraint(query);
  const property = queryProperty(query);
  if (constraint === "maximum" && fact.operator !== "MAX") return false;
  if (constraint === "minimum" && fact.operator !== "MIN") return false;
  if (property && fact.property && fact.property !== property) return false;
  if (property && !fact.property) {
    const hay = fact.span.toLowerCase();
    if (property === "interval" && !/interval|spacing|apart|distance|provided at/i.test(hay)) return false;
    if (property === "thickness" && !/thick/i.test(hay)) return false;
    if (property === "width" && !/width|wide/i.test(hay)) return false;
  }
  return true;
}

function toNormativeFact(fact: StructuralRequirement): NormativeFact | null {
  if (!fact.value || !fact.unit) return null;
  const operator = fact.operator === "MIN" || fact.operator === "MAX" || fact.operator === "EQ"
    || fact.operator === "PROHIBITED" || fact.operator === "REQUIRED" || fact.operator === "PERMITTED"
    ? fact.operator
    : "EQ";
  return {
    subject: fact.subject,
    property: fact.property,
    operator,
    value: fact.value,
    unit: fact.unit,
    condition: fact.condition,
    exception: fact.exception,
    sourceClause: fact.sourceClause,
    page: fact.page,
    span: fact.sourceSpan,
  };
}

export function selectMatchingFacts(input: {
  query: string;
  excerpts: Array<{ text: string; page?: number | null; sectionPath?: string | null }>;
}): NormativeFact[] {
  const joined = input.excerpts.map((excerpt) => `${excerpt.sectionPath ?? ""} ${excerpt.text}`).join("\n");
  const assembled = assembleStructuralEvidence(parseEngineeringStructure(joined, input.excerpts[0]?.page ?? null), {
    query: input.query,
    properties: queryProperty(input.query) ? [queryProperty(input.query)!] : [],
    constraints: queryConstraint(input.query) ? [queryConstraint(input.query)!] : [],
  });
  const structural = assembled.facts.map(toNormativeFact).filter((fact): fact is NormativeFact => Boolean(fact));
  const property = queryProperty(input.query);
  const constraint = queryConstraint(input.query);
  const lexical = input.excerpts.flatMap((excerpt) => extractNormativeFacts(excerpt));
  const facts = [...structural, ...lexical];
  return facts
    .map((fact) => {
      let score = 0;
      if (!factMatchesQuery(fact, input.query)) {
        if (!property && !constraint && fact.value) score = 1;
        else return { fact, score: 0 };
      } else {
        if (constraint === "maximum" && fact.operator === "MAX") score += 2;
        if (constraint === "minimum" && fact.operator === "MIN") score += 2;
        if (property && fact.property === property) score += 4;
        if (property && !fact.property) score += 1;
        if (!property) score += 1;
      }
      const hay = fact.span.toLowerCase();
      if (input.query.toLowerCase().split(/\s+/).some((word) => word.length > 4 && hay.includes(word))) score += 1;
      return { fact, score };
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((row) => row.fact);
}

export function selectDirectFact(input: {
  query: string;
  excerpts: Array<{ text: string; page?: number | null; sectionPath?: string | null }>;
}): NormativeFact | null {
  return selectMatchingFacts(input)[0] ?? null;
}

export function formatStructuredFactAnswer(fact: NormativeFact): { answer: string; basis: string } {
  const operator = fact.operator === "MAX" ? "maximum" : fact.operator === "MIN" ? "minimum" : "";
  const answer = operator
    ? `${fact.value} ${fact.unit} ${operator}.`
    : `${fact.value} ${fact.unit}.`;
  return {
    answer,
    basis: fact.span.replace(/\s+/g, " ").trim(),
  };
}
