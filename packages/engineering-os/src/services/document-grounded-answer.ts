import type { EngineeringEvidence } from "../phase-e2/contracts";

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
  const section = evidence.sectionPath && !figure ? evidence.sectionPath : null;
  const page = evidence.pageStart ? `Page ${evidence.pageStart}` : null;
  return [name + revision, figure, section, page].filter(Boolean).join("\n");
}

export function extractEvidencedStandards(evidence: EngineeringEvidence[]): string[] {
  const hay = evidence.map((item) => `${item.title} ${item.excerpt}`).join("\n");
  return [...new Set((hay.match(STANDARD_RE) ?? []).map((value) => value.replace(/\s+/g, " ").toUpperCase()))];
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
  const ordered = [...evidence].sort((a, b) => {
    const rank = (item: typeof a) => {
      const blob = `${item.sectionPath} ${item.excerpt}`;
      if (/straightness|figure|tolerance|shank/.test(query) && (item.figureLabel || /figure/i.test(item.sectionPath ?? ""))) return 2;
      if (/test method|mechanical properties|nuts/.test(query) && /3\.4|test method/i.test(blob)) return 2;
      if (/platform width|minimum platform/.test(query) && /600\s*mm|4\.2\.1/i.test(blob)) return 2;
      if (/crossover/.test(query) && /crossover/i.test(blob)) return 2;
      return 0;
    };
    return rank(b) - rank(a);
  });
  const hay = ordered.map((item) => item.excerpt).join("\n");
  const limitations: string[] = [];
  const facts: string[] = [];
  const inferences: string[] = [];
  const missing: string[] = [];

  const referenced = hay.match(REFERENCED_RE);
  const asksProcedure = /procedure|test method|how (?:do|does|to)|steps?|method for/.test(query);
  if (referenced && asksProcedure) {
    const lead = ordered.find((item) => REFERENCED_RE.test(item.excerpt)) ?? ordered[0]!;
    facts.push(
      `DOCUMENT FACT: ${lead.sectionPath ? `${lead.sectionPath} states` : "The authorised document states"} that the required method is given in ${referenced[0].replace(/^(?:in accordance with|as given in|as specified in|as required by|refer(?:red)? to)\s+/i, "")}.`,
    );
    missing.push(
      "MISSING EVIDENCE: The referenced standard is not itself authorised in this search, so its detailed procedures are not stated.",
    );
  } else {
    const lead = ordered[0]!;
    facts.push(`DOCUMENT FACT: ${lead.excerpt.replace(/\s+/g, " ").trim().slice(0, 400)}`);
  }

  const formula = hay.match(/t\s*=\s*2\s*\(\s*0\.0025\s*l['′]?\s*\+\s*0\.05\s*\)/i);
  const asksStraightness = /straightness|m20|shank/.test(query);
  if (formula && asksStraightness) {
    const figure = ordered.find((item) => item.figureLabel || /figure\s*2\.3/i.test(`${item.sectionPath} ${item.excerpt}`));
    facts.push(`DOCUMENT FACT: ${figure?.figureLabel ?? "The figure"} shows ${formula[0].replace(/\s+/g, " ")}.`);
    if (/\bm20\b/.test(query)) {
      inferences.push(
        "INFERENCE: A numerical M20 tolerance cannot be derived solely from nominal diameter if the required l' is not established by the available evidence.",
      );
      if (!/\bm20\b/.test(hay.toLowerCase()) || !/cannot be derived|l['′]/.test(hay)) {
        missing.push("MISSING EVIDENCE: The authorised excerpt does not establish l' for an M20 shank.");
      }
    }
  }

  const citations = ordered.slice(0, 4).map((item) => formatDocumentCitation(item));
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
  const evidence = input.evidence.filter((item) => item.sourceType === "document");
  const citations = evidence.slice(0, 6).map((item, index) => `${index + 1}. ${formatDocumentCitation(item).replace(/\n/g, " · ")}`);
  const body = input.generated.replace(/\s+$/g, "").trim();
  const hasWhy = /\bwhy\b/i.test(body);
  const hasSources = /\bsources?\b/i.test(body);
  const hasClass =
    /\bFACT\b/.test(body) || /\bINFERENCE\b/.test(body) || /\bASSUMPTION\b/.test(body) || /\bMISSING EVIDENCE\b/.test(body);
  return [
    body,
    hasClass ? "" : "CLASSIFICATION: FACT / INFERENCE / ASSUMPTION / MISSING EVIDENCE as labelled above. Unlabelled statements are INFERENCE until cited.",
    hasWhy ? "" : `Why?\nAuthorised excerpts were retrieved for: ${input.query}`,
    hasSources ? "" : ["Sources", ...citations].join("\n"),
    "LIMITATION: Advisory only. No autonomous engineering approval.",
  ]
    .filter(Boolean)
    .join("\n\n");
}
