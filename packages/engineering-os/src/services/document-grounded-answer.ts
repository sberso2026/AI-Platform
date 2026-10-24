import type { EngineeringEvidence } from "../phase-e2/contracts";
import {
  formatStructuredFactAnswer,
  selectMatchingFacts,
} from "./normative-extraction";
import { formatStructuralFacts } from "./document-structure";

const STANDARD_RE = /\b(?:AS\/NZS|AS|NZS|ISO)\s*\d+(?:\.\d+)*/gi;
const REFERENCED_RE =
  /(?:in accordance with|as given in|as specified in|as required by|refer(?:red)? to)\s+(AS\/NZS|AS|NZS|ISO)\s*[\d.]+/i;

export function isDocumentBodyEvidence(evidence: EngineeringEvidence[]): boolean {
  return evidence.some(
    (item) =>
      item.sourceType === "document"
      && Boolean(item.pageStart || item.sectionPath || item.figureLabel || item.chunkId),
  );
}

export function formatDocumentCitation(evidence: EngineeringEvidence): string {
  const name = evidence.documentNumber || evidence.title;
  const revision = evidence.revision ? ` rev ${evidence.revision}` : "";
  const figure = evidence.figureLabel;
  const clause = evidence.sectionPath?.match(/\b(\d+(?:\.\d+){1,4}(?:\([a-z0-9]+\))*)/i)?.[0];
  const section = clause ? `Clause ${clause}` : (evidence.sectionPath && !figure ? evidence.sectionPath : null);
  const page = evidence.pageStart ? `Page ${evidence.pageStart}` : null;
  return [name + revision, figure, section, page].filter(Boolean).join("\n");
}

export function extractEvidencedStandards(evidence: EngineeringEvidence[]): string[] {
  const hay = evidence.map((item) => `${item.title} ${item.excerpt}`).join("\n");
  return [...new Set((hay.match(STANDARD_RE) ?? []).map((value) => value.replace(/\s+/g, " ").toUpperCase()))];
}

export type DocumentQaPresentation = {
  answer: string;
  basis: string;
  sources: string[];
  context?: string;
  mode: "structured" | "evidence" | "abstain";
};

export function buildDocumentQaPresentation(input: {
  query: string;
  evidence: EngineeringEvidence[];
}): DocumentQaPresentation & { abstained: boolean; limitations: string[] } {
  const grounded = buildDocumentGroundedAnswer(input);
  const facts = selectMatchingFacts({
    query: input.query,
    excerpts: input.evidence.map((item) => ({
      text: `${item.sectionPath ?? ""} ${item.excerpt}`,
      page: item.pageStart,
      sectionPath: item.sectionPath,
    })),
  });
  if (grounded.abstained) {
    return {
      answer: grounded.answer,
      basis: "No authorised excerpt in the current document supports this question.",
      sources: [],
      mode: "abstain",
      abstained: true,
      limitations: grounded.limitations,
    };
  }
  const lead = input.evidence[0];
  const sources = input.evidence.slice(0, 3).map((item) => formatDocumentCitation(item).replace(/\n/g, " · "));
  if (facts.length) {
    const formatted = facts.length === 1
      ? formatStructuredFactAnswer(facts[0]!)
      : formatStructuralFacts(
        facts.map((row) => ({
          subject: row.subject,
          property: row.property,
          operator: row.operator,
          value: row.value,
          unit: row.unit,
          condition: row.condition,
          exception: row.exception,
          qualifier: null,
          modality: null,
          sourceClause: row.sourceClause,
          page: row.page,
          sourceSpan: row.span,
        })),
        facts.length > 1 ? "multi" : "single",
      );
    return {
      answer: formatted.answer,
      basis: formatted.basis,
      sources,
      mode: "structured",
      abstained: false,
      limitations: grounded.limitations,
    };
  }
  return {
    answer: grounded.answer.split("\n").find((line) => line.trim()) ?? grounded.answer,
    basis: lead?.excerpt.replace(/\s+/g, " ").trim().slice(0, 420) ?? grounded.answer,
    sources,
    mode: "evidence",
    abstained: false,
    limitations: grounded.limitations,
  };
}

export function buildDocumentGroundedAnswer(input: {
  query: string;
  evidence: EngineeringEvidence[];
}): { answer: string; abstained: boolean; limitations: string[] } {
  const evidence = input.evidence.filter((item) => item.sourceType === "document");
  if (!evidence.length) {
    return {
      abstained: true,
      answer: "Engineering OS does not have enough authorised evidence to answer this reliably. No sources were invented.",
      limitations: ["MISSING EVIDENCE: no authorised document excerpts matched this question."],
    };
  }

  const query = input.query.toLowerCase();
  const matching = selectMatchingFacts({
    query: input.query,
    excerpts: evidence.map((item) => ({
      text: `${item.sectionPath ?? ""} ${item.excerpt}`,
      page: item.pageStart,
      sectionPath: item.sectionPath,
    })),
  });
  const fact = matching[0] ?? null;
  const hay = evidence.map((item) => item.excerpt).join("\n");
  const limitations: string[] = [];
  const facts: string[] = [];
  const inferences: string[] = [];
  const missing: string[] = [];

  const referenced = hay.match(REFERENCED_RE);
  const asksProcedure = /procedure|test method|how (?:do|does|to)|steps?|method for/.test(query);
  if (referenced && asksProcedure) {
    const lead = evidence.find((item) => REFERENCED_RE.test(item.excerpt)) ?? evidence[0]!;
    facts.push(
      `DOCUMENT FACT: ${lead.sectionPath ? `${lead.sectionPath} states` : "The authorised document states"} that the required method is given in ${referenced[0].replace(/^(?:in accordance with|as given in|as specified in|as required by|refer(?:red)? to)\s+/i, "")}.`,
    );
    missing.push(
      "MISSING EVIDENCE: The referenced standard is not itself authorised in this search, so its detailed procedures are not stated.",
    );
  } else if (matching.length > 1) {
    const formatted = formatStructuralFacts(
      matching.map((row) => ({
        subject: row.subject,
        property: row.property,
        operator: row.operator,
        value: row.value,
        unit: row.unit,
        condition: row.condition,
        exception: row.exception,
        qualifier: null,
        modality: null,
        sourceClause: row.sourceClause,
        page: row.page,
        sourceSpan: row.span,
      })),
      "multi",
    );
    facts.push(`DOCUMENT FACT: ${formatted.answer}`);
  } else if (fact) {
    const formatted = formatStructuredFactAnswer(fact);
    facts.push(`DOCUMENT FACT: ${formatted.answer} ${formatted.basis}`);
  } else {
    const lead = evidence[0]!;
    facts.push(`DOCUMENT FACT: ${lead.excerpt.replace(/\s+/g, " ").trim().slice(0, 400)}`);
  }

  const formula = hay.match(/t\s*=\s*2\s*\(\s*0\.0025\s*l['′]?\s*\+\s*0\.05\s*\)/i);
  const asksDerivedNumeric = /\b[a-z]?\d{1,3}\b/.test(query) && /straightness|tolerance|shank|formula|derive/i.test(query);
  if (formula && asksDerivedNumeric) {
    const figure = evidence.find((item) => item.figureLabel || /figure/i.test(`${item.sectionPath} ${item.excerpt}`));
    facts.push(`DOCUMENT FACT: ${figure?.figureLabel ?? "The figure"} shows ${formula[0].replace(/\s+/g, " ")}.`);
    inferences.push(
      "INFERENCE: A numerical value cannot be derived solely from the available formula if a required input variable is not established by the authorised excerpt.",
    );
    const designation = input.query.match(/\b([A-Za-z]?\d{1,3})\b/)?.[1];
    if (designation && !new RegExp(designation, "i").test(hay)) {
      missing.push(`MISSING EVIDENCE: The authorised excerpt does not establish the missing formula input for the asked designation (${designation}).`);
    }
  }

  const citations = evidence.slice(0, 4).map((item) => formatDocumentCitation(item));
  const answer = [
    ...facts,
    ...inferences,
    ...missing,
    "",
    "Why?",
    facts[0] ?? "The answer is limited to the authorised excerpts cited below.",
    "",
    "Sources",
    ...citations.map((citation, index) => `${index + 1}. ${citation.replace(/\n/g, " · ")}`),
    "",
    "ASSUMPTION: Interpretation is limited to the authorised excerpts above. This is advisory — not an engineering approval.",
  ].join("\n");

  if (missing.length) limitations.push(...missing);
  return { answer, abstained: false, limitations };
}

export function formatGeneratedDocumentAnswer(input: {
  generated: string;
  query: string;
  evidence: EngineeringEvidence[];
}): string {
  const presentation = buildDocumentQaPresentation({ query: input.query, evidence: input.evidence });
  if (presentation.mode === "structured" || presentation.mode === "evidence") {
    return [
      `ANSWER\n${presentation.answer}`,
      `BASIS\n${presentation.basis}`,
      presentation.sources.length ? `SOURCE\n${presentation.sources.join("\n")}` : "",
      "LIMITATION: Advisory only. No autonomous engineering approval.",
    ]
      .filter(Boolean)
      .join("\n\n");
  }
  const evidence = input.evidence.filter((item) => item.sourceType === "document");
  const citations = evidence.slice(0, 6).map((item, index) => `${index + 1}. ${formatDocumentCitation(item).replace(/\n/g, " · ")}`);
  const body = input.generated.replace(/\s+$/g, "").trim();
  const hasWhy = /\bwhy\b/i.test(body);
  const hasSources = /\bsources?\b/i.test(body);
  return [
    body,
    hasWhy ? "" : `Why?\nAuthorised excerpts were retrieved for: ${input.query}`,
    hasSources ? "" : ["Sources", ...citations].join("\n"),
    "LIMITATION: Advisory only. No autonomous engineering approval.",
  ]
    .filter(Boolean)
    .join("\n\n");
}
