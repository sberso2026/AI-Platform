import type { UntrustedDocumentText } from "./trust-boundary";
import type { ReviewDocumentFixture, ExtractedRequirement, DeclaredAssumption } from "./detectors/types";
import { canonicalizeQuantity, type EngineeringFact } from "./facts";

export type ReferencedRevision = {
  documentNumber: string;
  revision: string;
  sourceDocumentId: string;
  span: string;
};

export type ExtractedPackageContent = {
  facts: EngineeringFact[];
  revisionRefs: ReferencedRevision[];
  requirements: ExtractedRequirement[];
  assumptions: DeclaredAssumption[];
};

function unwrap(text: UntrustedDocumentText | string | undefined): string {
  if (!text) return "";
  if (typeof text === "string") return text;
  return text.text;
}

type Pattern = {
  subject: string;
  property: string;
  qualifier?: string;
  regex: RegExp;
};

const QUANTITY_PATTERNS: readonly Pattern[] = [
  {
    subject: "concrete",
    property: "compressive_strength",
    regex: /(?:concrete(?:\s+compressive)?\s+strength|f'?c)\s*[=:]\s*([0-9]+(?:\.[0-9]+)?)\s*(MPa|N\/mm²|N\/mm2)/gi,
  },
  {
    subject: "equipment",
    property: "operating_load",
    qualifier: "operating",
    regex: /(?:equipment\s+)?operating\s+load\s*[=:]\s*([0-9]+(?:\.[0-9]+)?)\s*(kN)/gi,
  },
  {
    subject: "foundation",
    property: "allowable_bearing_pressure",
    qualifier: "allowable",
    regex: /(?:allowable\s+)?bearing\s+pressure\s*[=:]\s*([0-9]+(?:\.[0-9]+)?)\s*(kPa)/gi,
  },
  {
    subject: "project",
    property: "design_life",
    regex: /design\s+life\s*[=:]\s*([0-9]+(?:\.[0-9]+)?)\s*(years?)/gi,
  },
  {
    subject: "element",
    property: "design_pressure",
    regex: /design\s+pressure\s*[=: ]\s*([0-9]+(?:\.[0-9]+)?)\s*(kPa)/gi,
  },
];

const REVISION_REF =
  /(?:drawing|dwg)\s+([A-Z0-9][A-Z0-9-]+)\s+rev(?:ision)?\.?\s*([A-Z0-9]+)/gi;

function factsFromFields(doc: ReviewDocumentFixture): EngineeringFact[] {
  const facts: EngineeringFact[] = [];
  for (const [field, raw] of Object.entries(doc.fields)) {
    const quantity = raw.match(/^([0-9]+(?:\.[0-9]+)?)\s*(.+)$/);
    facts.push({
      subject: "document",
      property: field,
      value: quantity?.[1] ?? raw,
      unit: quantity?.[2]?.trim(),
      sourceDocumentId: doc.documentId,
      revision: doc.revision,
      role: doc.role,
      span: `${field}=${raw}`,
    });
  }
  return facts;
}

export function extractFactsFromDocument(doc: ReviewDocumentFixture): EngineeringFact[] {
  const text = unwrap(doc.extractedText);
  const facts = factsFromFields(doc);
  for (const pattern of QUANTITY_PATTERNS) {
    const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text))) {
      const magnitude = Number(match[1]);
      const canonical = canonicalizeQuantity(magnitude, match[2]);
      if (!canonical) continue;
      facts.push({
        subject: pattern.subject,
        property: pattern.property,
        value: String(canonical.magnitude),
        unit: canonical.unit,
        qualifier: pattern.qualifier,
        sourceDocumentId: doc.documentId,
        revision: doc.revision,
        role: doc.role,
        span: match[0],
      });
    }
  }
  return facts;
}

export function extractRevisionRefs(doc: ReviewDocumentFixture): ReferencedRevision[] {
  const text = unwrap(doc.extractedText);
  const refs: ReferencedRevision[] = [];
  const regex = new RegExp(REVISION_REF.source, REVISION_REF.flags);
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text))) {
    refs.push({
      documentNumber: match[1],
      revision: match[2],
      sourceDocumentId: doc.documentId,
      span: match[0],
    });
  }
  return refs;
}

export function extractDeclaredAssumptions(doc: ReviewDocumentFixture): DeclaredAssumption[] {
  const existing = [...(doc.assumptions ?? [])];
  const text = unwrap(doc.extractedText);
  const regex = /allowable\s+bearing\s+pressure\s*[=:]\s*([0-9]+(?:\.[0-9]+)?)\s*kPa/gi;
  if (regex.test(text) && !existing.some((item) => item.id === "ASM-BEARING")) {
    existing.push({
      id: "ASM-BEARING",
      text: text.match(/allowable\s+bearing\s+pressure\s*[=:][^\n.]+/i)?.[0] ?? "Allowable bearing pressure declared",
      supported: false,
    });
  }
  return existing;
}

export function extractRequirements(doc: ReviewDocumentFixture): ExtractedRequirement[] {
  const existing = [...(doc.requirements ?? [])];
  const text = unwrap(doc.extractedText);
  if (/design\s+life\s*[=:]\s*[0-9]+/i.test(text) && !existing.some((item) => item.id === "REQ-DESIGN-LIFE")) {
    existing.push({
      id: "REQ-DESIGN-LIFE",
      text: text.match(/design\s+life\s*[=:][^\n.]+/i)?.[0] ?? "Design life requirement",
      mappedEvidence: false,
    });
  }
  return existing;
}

export function extractPackageContent(documents: readonly ReviewDocumentFixture[]): ExtractedPackageContent {
  const facts = documents.flatMap(extractFactsFromDocument);
  const revisionRefs = documents.flatMap(extractRevisionRefs);
  const requirements: ExtractedRequirement[] = [];
  const assumptions: DeclaredAssumption[] = [];
  for (const doc of documents) {
    requirements.push(...extractRequirements(doc));
    assumptions.push(...extractDeclaredAssumptions(doc));
  }

  const hasDesignLifeSupport = facts.some(
    (fact) => fact.property === "design_life" && fact.role === "basis",
  );
  const requirementsResolved = requirements.map((item) =>
    item.id === "REQ-DESIGN-LIFE" ? { ...item, mappedEvidence: hasDesignLifeSupport } : item,
  );

  const hasBearingSupport = documents.some(
    (doc) => doc.role === "basis" || doc.role === "specification" || Boolean(doc.fields.geotechnical_source),
  );
  const assumptionsResolved = assumptions.map((item) =>
    item.id === "ASM-BEARING" ? { ...item, supported: hasBearingSupport } : item,
  );

  return {
    facts,
    revisionRefs,
    requirements: requirementsResolved,
    assumptions: assumptionsResolved,
  };
}

export function enrichDocumentsWithExtraction(
  documents: readonly ReviewDocumentFixture[],
): { documents: ReviewDocumentFixture[]; extracted: ExtractedPackageContent } {
  const extracted = extractPackageContent(documents);
  const documentsById = new Map(documents.map((doc) => [doc.documentId, doc]));
  const next = documents.map((doc) => {
    const reqs = extractRequirements(doc).map((item) => {
      if (item.id !== "REQ-DESIGN-LIFE") return item;
      return { ...item, mappedEvidence: extracted.requirements.find((req) => req.id === item.id)?.mappedEvidence ?? item.mappedEvidence };
    });
    const assumptions = extractDeclaredAssumptions(doc).map((item) => {
      if (item.id !== "ASM-BEARING") return item;
      return { ...item, supported: extracted.assumptions.find((row) => row.id === item.id)?.supported ?? item.supported };
    });
    return {
      ...doc,
      requirements: reqs,
      assumptions,
    };
  });
  void documentsById;
  return { documents: next, extracted };
}
