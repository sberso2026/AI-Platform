/**
 * Generic engineering document structure: clauses, lists, requirements, completeness.
 * No document-specific clause numbers, values, or founder question strings.
 */

export type StructuralKind =
  | "document"
  | "section"
  | "clause"
  | "subclause"
  | "paragraph"
  | "requirement"
  | "condition"
  | "exception"
  | "table_row"
  | "figure_reference";

export type EvidenceCompleteness =
  | "COMPLETE"
  | "REQUIRES_CHILD"
  | "REQUIRES_PARENT"
  | "REQUIRES_CONTINUATION"
  | "REQUIRES_TABLE"
  | "REQUIRES_FIGURE"
  | "INSUFFICIENT";

export type StructuralOperator = "MIN" | "MAX" | "EQ" | "PROHIBITED" | "REQUIRED" | "PERMITTED" | "BETWEEN";

export type StructuralModality = "shall" | "shall_not" | "should" | "may" | "must" | null;

export type StructuralRequirement = {
  subject: string | null;
  property: string | null;
  operator: StructuralOperator | null;
  value: string | null;
  unit: string | null;
  condition: string | null;
  exception: string | null;
  qualifier: string | null;
  modality: StructuralModality;
  sourceClause: string | null;
  page: number | null;
  sourceSpan: string;
};

export type StructuralNode = {
  id: string;
  kind: StructuralKind;
  clauseNumber: string | null;
  marker: string | null;
  title: string | null;
  text: string;
  sourceText: string;
  parentId: string | null;
  childIds: string[];
  page: number | null;
  completeness: EvidenceCompleteness;
  requirement: StructuralRequirement | null;
  requirements: StructuralRequirement[];
};

export type StructuralQueryNeed = {
  query: string;
  subjects?: string[];
  properties?: string[];
  constraints?: string[];
  qualifier?: string | null;
};

export type StructuralAssembly = {
  completeness: EvidenceCompleteness;
  mode: "single" | "multi" | "clarify" | "none";
  facts: StructuralRequirement[];
  nodes: StructuralNode[];
  excerpt: string;
};

const UNIT = "(mm|m|kPa|MPa|lux|dB(?:\\(A\\))?|degrees|m\\/s|N|minutes?)";
const NUMBER = "(\\d+(?:\\.\\d+)?)";
const MARKER_BODY = "viii|vii|vi|iv|ix|iii|ii|x|v|i|[a-z]";
const LIST_MARKER = new RegExp(`\\(\\s*(${MARKER_BODY})\\s*\\)`, "gi");
const CLAUSE_START = /(?:^|[\n;])\s*(\d+(?:\.\d+){1,4})\s+(?=[A-Z(])/g;
const ROMAN = /^(i|ii|iii|iv|v|vi|vii|viii|ix|x)$/i;
const PROPERTY_CUES: Array<{ pattern: RegExp; property: string }> = [
  { pattern: /\binterval|spacing|spaced|apart|distance|provided at\b/i, property: "interval" },
  { pattern: /\bthick(?:ness)?|cover\b/i, property: "thickness" },
  { pattern: /\bwidth|wide\b/i, property: "width" },
  { pattern: /\bheight|high\b/i, property: "height" },
  { pattern: /\bforce\b/i, property: "force" },
  { pattern: /\bclearance|headroom\b/i, property: "clearance" },
  { pattern: /\btolerance\b/i, property: "tolerance" },
  { pattern: /\btemperature\b/i, property: "temperature" },
  { pattern: /\bpressure|MPa|kPa|dB\b/i, property: "pressure" },
  { pattern: /\bspeed\b/i, property: "speed" },
  { pattern: /\bcapacity\b/i, property: "capacity" },
  { pattern: /\bdiameter\b/i, property: "diameter" },
  { pattern: /\billuminance|lux\b/i, property: "illuminance" },
  { pattern: /\bslope\b/i, property: "slope" },
  { pattern: /\bduration|minutes|fire-resistance\b/i, property: "duration" },
];

function compact(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function markerKind(raw: string, parentKind: StructuralKind | null): "letter" | "roman" {
  const value = raw.toLowerCase();
  if (value.length > 1 && ROMAN.test(value)) return "roman";
  if (ROMAN.test(value) && (parentKind === "condition" || parentKind === "subclause" || parentKind === "requirement")) {
    return "roman";
  }
  if (/^[a-z]$/.test(value)) return "letter";
  if (ROMAN.test(value)) return "roman";
  return "letter";
}

export function detectEvidenceCompleteness(text: string, childCount = 0): EvidenceCompleteness {
  const hay = compact(text);
  if (/\b(?:as shown in|see|comply with)\s+tables?\b/i.test(hay) && childCount === 0) return "REQUIRES_TABLE";
  if (/\b(?:as shown in|see)\s+figures?\b/i.test(hay) && childCount === 0) return "REQUIRES_FIGURE";
  if (/\b(the following|as follows|shall comply with)\s*:?\s*$/i.test(hay)) {
    return childCount > 0 ? "COMPLETE" : "REQUIRES_CHILD";
  }
  if (/:\s*$/.test(hay) && /\b(shall|must|not exceed|comply)\b/i.test(hay)) {
    return childCount > 0 ? "COMPLETE" : "REQUIRES_CHILD";
  }
  if (/^\(?\s*(?:[a-z]|i{1,3}|iv|vi{0,3})\s*\)?\s*(where|when|if)\b/i.test(hay) && childCount === 0 && !new RegExp(`${NUMBER}\\s*${UNIT}`, "i").test(hay)) {
    return "REQUIRES_PARENT";
  }
  if (/\b\d+(?:\.\d+)?\s*(mm|m|kPa|MPa|lux|dB(?:\(A\))?|degrees|m\/s|N|minutes?)\b/i.test(hay)) return "COMPLETE";
  if (/\b(shall not|must not|shall|must|should|may|prohibited|required)\b/i.test(hay) && !/:\s*$/.test(hay)) {
    return "COMPLETE";
  }
  if (/[A-Za-z,]$/.test(hay) && hay.length < 80) return "REQUIRES_CONTINUATION";
  return hay.length ? "INSUFFICIENT" : "INSUFFICIENT";
}

function inferProperty(text: string): string | null {
  return PROPERTY_CUES.find((row) => row.pattern.test(text))?.property ?? null;
}

function inferModality(text: string): StructuralModality {
  if (/\bshall not\b/i.test(text)) return "shall_not";
  if (/\bmust not\b/i.test(text)) return "must";
  if (/\bshall\b/i.test(text)) return "shall";
  if (/\bmust\b/i.test(text)) return "must";
  if (/\bshould\b/i.test(text)) return "should";
  if (/\bmay\b/i.test(text)) return "may";
  return null;
}

function inferOperator(text: string): StructuralOperator | null {
  if (/\bbetween\s+\d/i.test(text) || /\bwithin\b/i.test(text) && /\band\b/i.test(text)) return "BETWEEN";
  if (/\bshall not\b|\bmust not\b|\bprohibited\b|\bnot permitted\b/i.test(text) && !/\bnot exceed|\bnot less|\bnot more/i.test(text)) {
    return "PROHIBITED";
  }
  if (/\bnot exceed(?:ing)?|\bnot more than|\bmaximum\b/i.test(text)) return "MAX";
  if (/\bnot less than|\bat least|\bminimum\b/i.test(text)) return "MIN";
  if (/\bshall be\b|\brequired\b/i.test(text)) return "REQUIRED";
  if (/\bmay\b|\bpermitted\b/i.test(text)) return "PERMITTED";
  return null;
}

function extractQuantities(text: string): Array<{ value: string; unit: string; index: number }> {
  const found: Array<{ value: string; unit: string; index: number }> = [];
  const regex = new RegExp(`${NUMBER}\\s*${UNIT}`, "gi");
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text))) {
    found.push({ value: match[1] ?? "", unit: match[2] ?? "", index: match.index });
  }
  return found;
}

function inferCondition(text: string): string | null {
  const match = compact(text).match(/\b(?:where|when|if)\b[^.]{4,180}/i);
  return match ? compact(match[0]) : null;
}

function inferException(text: string): string | null {
  const match = compact(text).match(/\b(?:except|unless|provided that)\b[^.]{4,160}/i);
  return match ? compact(match[0]) : null;
}

function inferQualifier(text: string): string | null {
  if (/\bmidway\b/i.test(text)) return "midway";
  if (/\balong (?:the )?axis\b/i.test(text)) return "along_axis";
  if (/\bright angles?\b/i.test(text)) return "right_angles";
  return null;
}

function nearbySubject(text: string): string | null {
  const match = compact(text).match(
    /\b([A-Za-z][A-Za-z0-9-]*(?:\s+[A-Za-z][A-Za-z0-9-]*){0,5})\s+(?:shall|must|should|may)\b/i,
  );
  return match?.[1]?.trim() ?? null;
}

function extractAllRequirements(text: string, sourceClause: string | null, page: number | null): StructuralRequirement[] {
  const sentences = compact(text).split(/(?<=\.)\s+/).filter(Boolean);
  const facts = sentences
    .map((sentence) => extractRequirement(sentence, sourceClause, page))
    .filter((fact): fact is StructuralRequirement => Boolean(fact?.value && fact.unit));
  if (facts.length) return facts;
  const fallback = extractRequirement(text, sourceClause, page);
  return fallback ? [fallback] : [];
}

function extractRequirement(text: string, sourceClause: string | null, page: number | null): StructuralRequirement | null {
  const hay = compact(text);
  const quantities = extractQuantities(hay);
  const operator = inferOperator(hay);
  const property = inferProperty(hay);
  const modality = inferModality(hay);
  if (!operator && !property && !quantities.length && !modality) return null;
  const primary = quantities[0] ?? null;
  return {
    subject: nearbySubject(hay),
    property,
    operator,
    value: primary?.value ?? null,
    unit: primary?.unit ?? null,
    condition: inferCondition(hay),
    exception: inferException(hay),
    qualifier: inferQualifier(hay),
    modality,
    sourceClause,
    page,
    sourceSpan: hay.slice(0, 420),
  };
}

type OpenNode = {
  node: StructuralNode;
  kind: "clause" | "letter" | "roman" | "paragraph";
};

function makeId(clause: string | null, markers: string[]): string {
  const suffix = markers.map((marker) => `(${marker})`).join("");
  return `${clause ?? "clause"}${suffix}`;
}

function splitSegments(text: string): Array<{ marker?: string; clause?: string; body: string; raw: string }> {
  const hay = text.replace(/\r\n/g, "\n");
  const hits: Array<{ index: number; length: number; clause?: string; marker?: string }> = [];
  for (const match of hay.matchAll(new RegExp(CLAUSE_START.source, "g"))) {
    const number = match[1];
    if (!number) continue;
    const at = match.index ?? 0;
    const inner = match[0].lastIndexOf(number);
    hits.push({ index: at + inner, length: number.length, clause: number });
  }
  for (const match of hay.matchAll(/(?<!\d)(\d+(?:\.\d+){2,4})\s+(?=[A-Z])/g)) {
    const number = match[1];
    if (!number) continue;
    hits.push({ index: match.index ?? 0, length: number.length, clause: number });
  }
  for (const match of hay.matchAll(new RegExp(LIST_MARKER.source, "gi"))) {
    hits.push({ index: match.index ?? 0, length: match[0].length, marker: (match[1] ?? "").toLowerCase() });
  }
  hits.sort((a, b) => a.index - b.index || b.length - a.length);
  const unique: typeof hits = [];
  let lastEnd = -1;
  for (const hit of hits) {
    if (hit.index < lastEnd) continue;
    unique.push(hit);
    lastEnd = hit.index + hit.length;
  }
  if (!unique.length) {
    return hay.trim() ? [{ body: hay, raw: hay }] : [];
  }
  const segments: Array<{ marker?: string; clause?: string; body: string; raw: string }> = [];
  if (unique[0]!.index > 0) {
    const lead = hay.slice(0, unique[0]!.index);
    if (compact(lead)) segments.push({ body: lead, raw: lead });
  }
  for (let i = 0; i < unique.length; i += 1) {
    const current = unique[i]!;
    const next = unique[i + 1];
    const start = current.index;
    const end = next?.index ?? hay.length;
    const raw = hay.slice(start, end);
    const headLen = current.length;
    segments.push({
      clause: current.clause,
      marker: current.marker,
      body: hay.slice(start + headLen, end),
      raw,
    });
  }
  return segments;
}

export function parseEngineeringStructure(text: string, page: number | null = null): StructuralNode[] {
  const segments = splitSegments(text);
  const nodes: StructuralNode[] = [];
  const byId = new Map<string, StructuralNode>();
  let currentClause: string | null = null;
  let currentTitle: string | null = null;
  const stack: OpenNode[] = [];

  function attach(parent: StructuralNode | null, child: StructuralNode) {
    if (parent) {
      child.parentId = parent.id;
      parent.childIds.push(child.id);
    }
    nodes.push(child);
    byId.set(child.id, child);
  }

  function currentOf(kind: OpenNode["kind"]): OpenNode | undefined {
    for (let i = stack.length - 1; i >= 0; i -= 1) {
      if (stack[i]?.kind === kind) return stack[i];
    }
    return undefined;
  }

  for (const segment of segments) {
    if (segment.clause) {
      currentClause = segment.clause;
      const title = compact(segment.body).slice(0, 80) || null;
      currentTitle = title;
      const node: StructuralNode = {
        id: segment.clause,
        kind: segment.clause.split(".").length <= 2 ? "section" : "clause",
        clauseNumber: segment.clause,
        marker: null,
        title,
        text: compact(segment.raw),
        sourceText: segment.raw,
        parentId: null,
        childIds: [],
        page,
        completeness: "INSUFFICIENT",
        requirement: null,
        requirements: [],
      };
      stack.length = 0;
      stack.push({ node, kind: "clause" });
      attach(null, node);
      continue;
    }
    if (segment.marker) {
      const parentLetter = currentOf("letter");
      const parentClause = currentOf("clause");
      const kind = markerKind(segment.marker, parentLetter ? "condition" : parentClause?.node.kind ?? null);
      while (stack.length && kind === "letter" && stack[stack.length - 1]?.kind !== "clause") stack.pop();
      while (stack.length && kind === "roman" && stack[stack.length - 1]?.kind === "roman") stack.pop();
      const parent = kind === "roman"
        ? currentOf("letter")?.node ?? currentOf("clause")?.node ?? null
        : currentOf("clause")?.node ?? null;
      const id = makeId(currentClause ?? parent?.clauseNumber ?? null, kind === "roman" && parent?.marker
        ? [parent.marker, segment.marker]
        : [segment.marker]);
      const node: StructuralNode = {
        id,
        kind: kind === "roman" ? "condition" : "subclause",
        clauseNumber: currentClause ?? parent?.clauseNumber ?? null,
        marker: segment.marker,
        title: currentTitle,
        text: compact(segment.raw),
        sourceText: segment.raw,
        parentId: null,
        childIds: [],
        page,
        completeness: "INSUFFICIENT",
        requirement: null,
        requirements: [],
      };
      attach(parent, node);
      stack.push({ node, kind: kind === "roman" ? "roman" : "letter" });
      continue;
    }
    const parent = stack[stack.length - 1]?.node ?? null;
    if (!compact(segment.body)) continue;
    const node: StructuralNode = {
      id: `${parent?.id ?? "p"}-p${nodes.length}`,
      kind: "paragraph",
      clauseNumber: currentClause,
      marker: null,
      title: currentTitle,
      text: compact(segment.raw),
      sourceText: segment.raw,
      parentId: null,
      childIds: [],
      page,
      completeness: "INSUFFICIENT",
      requirement: null,
      requirements: [],
    };
    attach(parent, node);
  }

  for (const node of nodes) {
    node.completeness = detectEvidenceCompleteness(node.text, node.childIds.length);
    node.requirements = extractAllRequirements(node.text, node.id, page);
    node.requirement = node.requirements[0] ?? extractRequirement(node.text, node.id, page);
  }

  for (const node of nodes) {
    const parent = node.parentId ? byId.get(node.parentId) : undefined;
    const inherit = parent?.completeness === "REQUIRES_CHILD" || Boolean(parent?.requirement?.operator && !parent.requirement.value);
    if (!inherit) continue;
    const inherited = node.requirements.length ? node.requirements : (node.requirement ? [node.requirement] : []);
    for (const fact of inherited) {
      if (!fact.property) fact.property = parent?.requirement?.property ?? inferProperty(parent?.text ?? "");
      if (!fact.operator) fact.operator = parent?.requirement?.operator ?? inferOperator(parent?.text ?? "");
      if (!fact.subject) fact.subject = parent?.requirement?.subject ?? nearbySubject(parent?.text ?? "");
      if (!fact.value) {
        const qty = extractQuantities(node.text)[0];
        if (qty) {
          fact.value = qty.value;
          fact.unit = qty.unit;
        }
      }
      if (!fact.condition) fact.condition = inferCondition(node.text);
      if (!fact.qualifier) fact.qualifier = inferQualifier(node.text);
      fact.sourceClause = node.id;
    }
    node.requirements = inherited.filter((fact) => fact.value);
    node.requirement = node.requirements[0] ?? null;
    if (node.completeness === "REQUIRES_PARENT" && node.requirement?.value) node.completeness = "COMPLETE";
    if (parent && parent.completeness === "REQUIRES_CHILD" && parent.childIds.length) parent.completeness = "COMPLETE";
  }

  return nodes;
}

function inferredSubjects(query: string): string[] {
  const words = query.toLowerCase().match(/[a-z][a-z0-9-]{2,}/g) ?? [];
  const skip = new Set(["what", "which", "the", "for", "and", "minimum", "maximum", "required", "requirement", "tell", "find", "check", "show", "please", "this", "document", "shall"]);
  const phrases: string[] = [];
  for (let i = 0; i < words.length; i += 1) {
    const first = words[i]!;
    const second = words[i + 1];
    if (skip.has(first)) continue;
    if (second && !skip.has(second)) phrases.push(`${first} ${second}`);
    else phrases.push(first);
  }
  return [...new Set(phrases)].slice(0, 8);
}

function needFromQuery(need: StructuralQueryNeed): Required<Pick<StructuralQueryNeed, "subjects" | "properties" | "constraints">> & {
  qualifier: string | null;
  query: string;
} {
  const query = need.query;
  const properties = need.properties?.length
    ? need.properties
    : PROPERTY_CUES.filter((row) => row.pattern.test(query)).map((row) => row.property);
  const constraints = need.constraints?.length ? [...need.constraints] : [];
  if (/\bmax(?:imum)?|not exceed|not more than\b/i.test(query)) constraints.push("maximum");
  if (/\bmin(?:imum)?|not less than|at least\b/i.test(query)) constraints.push("minimum");
  let qualifier = need.qualifier ?? null;
  if (!qualifier) {
    if (/\bmidway\b/i.test(query)) qualifier = "midway";
    else if (/\balong (?:the )?axis\b/i.test(query)) qualifier = "along_axis";
    else if (/\bright angles?\b/i.test(query)) qualifier = "right_angles";
  }
  return {
    query,
    subjects: need.subjects?.length ? need.subjects : inferredSubjects(query),
    properties: [...new Set(properties)],
    constraints: [...new Set(constraints)],
    qualifier,
  };
}

function scoreFact(fact: StructuralRequirement, need: ReturnType<typeof needFromQuery>): number {
  let score = 0;
  const hay = `${fact.subject ?? ""} ${fact.property ?? ""} ${fact.condition ?? ""} ${fact.sourceSpan}`.toLowerCase();
  if (need.properties.length && fact.property && !need.properties.includes(fact.property)) return 0;
  if (need.properties.includes(fact.property ?? "")) score += 6;
  if (!fact.property && need.properties.some((property) => hay.includes(property))) score += 3;
  if (need.constraints.includes("maximum") && fact.operator === "MAX") score += 3;
  if (need.constraints.includes("minimum") && fact.operator === "MIN") score += 3;
  if (need.qualifier && fact.qualifier === need.qualifier) score += 5;
  if (need.qualifier && fact.condition && fact.condition.toLowerCase().includes(need.qualifier.replace("_", " "))) score += 4;
  if (need.subjects.some((subject) => hay.includes(subject.toLowerCase()))) score += 2;
  if (fact.value && fact.unit && (!need.properties.length || need.properties.includes(fact.property ?? "") || !fact.property)) {
    score += 1;
  }
  return score;
}

function smallestSpan(nodes: StructuralNode[], facts: StructuralRequirement[]): string {
  const spans = facts.map((fact) => fact.sourceSpan);
  const parentTexts = nodes
    .filter((node) => node.completeness === "COMPLETE" && node.childIds.length && /the following|as follows/i.test(node.text))
    .map((node) => node.text);
  const unique = [...new Set([...parentTexts.slice(0, 1), ...spans])];
  return unique.join(" ").replace(/\s+/g, " ").trim();
}

export function checkEvidenceCompleteness(nodes: StructuralNode[]): EvidenceCompleteness {
  if (!nodes.length) return "INSUFFICIENT";
  if (nodes.some((node) => node.completeness === "REQUIRES_CHILD" && !node.childIds.length)) return "REQUIRES_CHILD";
  if (nodes.some((node) => node.completeness === "REQUIRES_TABLE")) return "REQUIRES_TABLE";
  if (nodes.some((node) => node.completeness === "REQUIRES_FIGURE")) return "REQUIRES_FIGURE";
  if (nodes.some((node) => node.completeness === "REQUIRES_PARENT")) return "REQUIRES_PARENT";
  if (nodes.some((node) => node.completeness === "REQUIRES_CONTINUATION")) return "REQUIRES_CONTINUATION";
  if (nodes.some((node) => node.completeness === "COMPLETE" || node.requirement?.value)) return "COMPLETE";
  return "INSUFFICIENT";
}

export function assembleStructuralEvidence(nodes: StructuralNode[], need: StructuralQueryNeed): StructuralAssembly {
  const resolved = needFromQuery(need);
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const scored = nodes
    .flatMap((node) => {
      const facts = (node.requirements?.length ? node.requirements : node.requirement ? [node.requirement] : [])
        .filter((fact) => fact.value && fact.unit);
      return facts.map((fact) => ({ node, fact, score: scoreFact(fact, resolved) }));
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score);

  if (!scored.length) {
    return { completeness: checkEvidenceCompleteness(nodes), mode: "none", facts: [], nodes: [], excerpt: "" };
  }

  const property = resolved.properties[0];
  const sameProperty = scored.filter((row) => !property || row.fact.property === property || scoreFact(row.fact, resolved) >= scored[0]!.score - 1);
  const top = sameProperty.filter((row) => row.score >= Math.max(3, sameProperty[0]!.score - 2));
  const distinctValues = [...new Map(top.map((row) => [`${row.fact.value}|${row.fact.unit}|${row.fact.qualifier ?? row.fact.condition ?? ""}`, row])).values()];
  const qualifierFiltered = resolved.qualifier
    ? distinctValues.filter((row) => row.fact.qualifier === resolved.qualifier || (row.fact.condition ?? "").toLowerCase().includes(resolved.qualifier!.replace("_", " ")))
    : distinctValues;

  const chosen = qualifierFiltered.length ? qualifierFiltered : distinctValues;
  const facts = chosen.map((row) => row.fact);
  const selectedNodes = chosen.map((row) => row.node);
  for (const node of [...selectedNodes]) {
    const parent = node.parentId ? byId.get(node.parentId) : undefined;
    if (parent && !selectedNodes.includes(parent)) selectedNodes.push(parent);
  }

  const uniqueConditions = new Set(facts.map((fact) => fact.qualifier ?? fact.condition ?? ""));
  const mode = facts.length > 1 && uniqueConditions.size > 1
    ? (resolved.qualifier ? "single" : "multi")
    : "single";
  const displayFacts = mode === "single" && resolved.qualifier && qualifierFiltered.length
    ? qualifierFiltered.map((row) => row.fact)
    : facts;

  return {
    completeness: checkEvidenceCompleteness(selectedNodes),
    mode: mode === "multi" && !resolved.qualifier ? (need.query.replace(/\?+$/, "").split(/\s+/).length <= 8 ? "clarify" : "multi") : mode,
    facts: displayFacts,
    nodes: selectedNodes,
    excerpt: smallestSpan(selectedNodes, displayFacts),
  };
}

export function formatStructuralFacts(facts: StructuralRequirement[], mode: StructuralAssembly["mode"]): { answer: string; basis: string } {
  if (!facts.length) return { answer: "", basis: "" };
  const line = (fact: StructuralRequirement) => {
    const op = fact.operator === "MAX" ? "maximum" : fact.operator === "MIN" ? "minimum" : "";
    const value = fact.value && fact.unit ? `${fact.value} ${fact.unit}${op ? ` ${op}` : ""}` : compact(fact.sourceSpan);
    const when = fact.condition ? ` Applicable when ${fact.condition.replace(/^(where|when|if)\s+/i, "")}.` : "";
    return { value: `${value}.`, when, basis: fact.sourceSpan };
  };
  if (facts.length === 1 || mode === "single") {
    const formatted = line(facts[0]!);
    return { answer: formatted.value, basis: `${formatted.basis}${formatted.when}` };
  }
  return {
    answer: facts.map((fact) => {
      const formatted = line(fact);
      return `${formatted.value.replace(/\.$/, "")}${formatted.when}`.trim();
    }).join(" "),
    basis: facts.map((fact) => fact.sourceSpan).join(" "),
  };
}

export function splitStructuralListUnits(text: string): string[] {
  const parts = text.split(new RegExp(`(?=\\(\\s*(?:${MARKER_BODY})\\s*\\))`, "i")).map((part) => part.trim()).filter(Boolean);
  return parts.length ? parts : [text];
}
