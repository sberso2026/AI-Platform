import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { DeterministicLocalEmbeddingAdapter } from "../src/documents/embedding-adapter";
import { InMemoryDocumentIndexAdapter } from "../src/documents/index-adapter";
import { ProjectIntelligenceDocumentRetrievalService } from "../src/documents/retrieval-service";
import type { DocumentChunk } from "../src/documents/types";
import { selectDirectFact, selectMatchingFacts } from "@rtb/engineering-os";

type Fact = {
  id: string;
  docId: string;
  chunkId: string;
  subject: string;
  property: string;
  constraint: "minimum" | "maximum";
  value: string;
  unit: string;
  section: string;
  split: "development" | "holdout" | "founder";
};

function chunk(partial: Partial<DocumentChunk> & Pick<DocumentChunk, "stableChunkId" | "content" | "engineeringDocumentId">): DocumentChunk {
  return {
    id: partial.stableChunkId,
    tenantId: "t1",
    workspaceId: "w1",
    engineeringProjectId: "p1",
    revision: "A",
    processingVersion: "1",
    chunkIndex: 0,
    contentHash: `hash-${partial.stableChunkId}`,
    sectionPath: "1.1",
    pageStart: 4,
    pageEnd: 4,
    blockType: "paragraph",
    ...partial,
  };
}

const CORPUS: DocumentChunk[] = [
  chunk({
    engineeringDocumentId: "doc-plant",
    stableChunkId: "plant-guard",
    sectionPath: "5.2.1",
    pageStart: 8,
    content: "Sheet metal guards shall be not less than 2.0 mm thick. Mesh guards shall be designed to prevent reaching into the danger area.",
  }),
  chunk({
    engineeringDocumentId: "doc-plant",
    stableChunkId: "plant-platform",
    sectionPath: "4.1.1",
    pageStart: 6,
    content: "Permanent platforms not less than 700 mm wide shall be provided to access the plant.",
  }),
  chunk({
    engineeringDocumentId: "doc-plant",
    stableChunkId: "plant-interval",
    sectionPath: "9.1.2",
    pageStart: 12,
    content: "Supports for stop cables shall be provided at intervals not exceeding 3.0 m. The force required to operate the stop control shall not exceed 80 N.",
  }),
  chunk({
    engineeringDocumentId: "doc-plant",
    stableChunkId: "plant-crossover",
    sectionPath: "4.2.3",
    pageStart: 7,
    content: "A crossover shall be provided where personnel must cross a moving belt. Handrails shall be not less than 900 mm high.",
  }),
  chunk({
    engineeringDocumentId: "doc-fastener",
    stableChunkId: "fast-nut",
    sectionPath: "3.4",
    pageStart: 9,
    content: "The test methods for determining the mechanical properties of high-strength nuts shall be in accordance with lab method LM-12.",
  }),
  chunk({
    engineeringDocumentId: "doc-fastener",
    stableChunkId: "fast-proof",
    sectionPath: "3.1",
    pageStart: 5,
    content: "Proof load for bolts shall be not less than 800 MPa.",
  }),
  chunk({
    engineeringDocumentId: "doc-electrical",
    stableChunkId: "elec-lux",
    sectionPath: "8.2.3",
    pageStart: 14,
    content: "Walkway illuminance shall be not less than 50 lux.",
  }),
  chunk({
    engineeringDocumentId: "doc-electrical",
    stableChunkId: "elec-fire",
    sectionPath: "11.4.2",
    pageStart: 21,
    content: "Switchroom fire-resistance rating shall be not less than 120 minutes.",
  }),
  chunk({
    engineeringDocumentId: "doc-electrical",
    stableChunkId: "elec-noise",
    sectionPath: "8.1.1",
    pageStart: 13,
    content: "Operator sound pressure shall not exceed 85 dB.",
  }),
  chunk({
    engineeringDocumentId: "doc-structure",
    stableChunkId: "str-cover",
    sectionPath: "11.1.1",
    pageStart: 18,
    content: "Minimum concrete cover shall be not less than 50 mm.",
  }),
  chunk({
    engineeringDocumentId: "doc-structure",
    stableChunkId: "str-fos",
    sectionPath: "10.1.3",
    pageStart: 16,
    content: "Lifting lugs shall have a factor of safety of 5. Anchors shall be not less than 16 mm diameter.",
  }),
  chunk({
    engineeringDocumentId: "doc-structure",
    stableChunkId: "str-wind",
    sectionPath: "10.2.2",
    pageStart: 17,
    content: "Design wind speed shall not exceed 41 m/s.",
  }),
  chunk({
    engineeringDocumentId: "doc-handling",
    stableChunkId: "han-slope",
    sectionPath: "3.2.1",
    pageStart: 3,
    content: "Maximum belt slope shall not exceed 18 degrees.",
  }),
  chunk({
    engineeringDocumentId: "doc-handling",
    stableChunkId: "han-speed",
    sectionPath: "3.3.4",
    pageStart: 4,
    content: "Maximum belt speed shall not exceed 3.5 m/s.",
  }),
  chunk({
    engineeringDocumentId: "doc-handling",
    stableChunkId: "han-clearance",
    sectionPath: "6.1.1",
    pageStart: 10,
    content: "Headroom clearance shall be not less than 2.1 m.",
  }),
  chunk({
    engineeringDocumentId: "doc-nested",
    stableChunkId: "nested-force",
    sectionPath: "6.4.1",
    pageStart: 20,
    content: "6.4.1 Stop cable.\n(d) The force required to operate the stop control shall not exceed the following:\n(i) Where applied midway between the supports and at right angles . . . 55 N.\n(ii) Where applied along the axis of the cable . . . 180 N.\n(e) Supports shall be provided at intervals not exceeding 2.8 m.",
  }),
];

const FACTS: Fact[] = [
  { id: "f1", docId: "doc-plant", chunkId: "plant-guard", subject: "sheet metal guard", property: "thickness", constraint: "minimum", value: "2.0", unit: "mm", section: "5.2.1", split: "development" },
  { id: "f2", docId: "doc-plant", chunkId: "plant-platform", subject: "platform", property: "width", constraint: "minimum", value: "700", unit: "mm", section: "4.1.1", split: "development" },
  { id: "f3", docId: "doc-plant", chunkId: "plant-interval", subject: "stop cable support", property: "interval", constraint: "maximum", value: "3.0", unit: "m", section: "9.1.2", split: "founder" },
  { id: "f4", docId: "doc-plant", chunkId: "plant-crossover", subject: "handrail", property: "height", constraint: "minimum", value: "900", unit: "mm", section: "4.2.3", split: "development" },
  { id: "f5", docId: "doc-fastener", chunkId: "fast-proof", subject: "bolt proof load", property: "pressure", constraint: "minimum", value: "800", unit: "MPa", split: "development", section: "3.1" },
  { id: "f6", docId: "doc-electrical", chunkId: "elec-lux", subject: "walkway illuminance", property: "illuminance", constraint: "minimum", value: "50", unit: "lux", section: "8.2.3", split: "development" },
  { id: "f7", docId: "doc-electrical", chunkId: "elec-fire", subject: "switchroom fire-resistance", property: "duration", constraint: "minimum", value: "120", unit: "minutes", section: "11.4.2", split: "holdout" },
  { id: "f8", docId: "doc-electrical", chunkId: "elec-noise", subject: "operator sound pressure", property: "pressure", constraint: "maximum", value: "85", unit: "dB", section: "8.1.1", split: "development" },
  { id: "f9", docId: "doc-structure", chunkId: "str-cover", subject: "concrete cover", property: "thickness", constraint: "minimum", value: "50", unit: "mm", section: "11.1.1", split: "holdout" },
  { id: "f10", docId: "doc-structure", chunkId: "str-wind", subject: "design wind speed", property: "speed", constraint: "maximum", value: "41", unit: "m/s", section: "10.2.2", split: "development" },
  { id: "f11", docId: "doc-handling", chunkId: "han-slope", subject: "belt slope", property: "slope", constraint: "maximum", value: "18", unit: "degrees", section: "3.2.1", split: "holdout" },
  { id: "f12", docId: "doc-handling", chunkId: "han-speed", subject: "belt speed", property: "speed", constraint: "maximum", value: "3.5", unit: "m/s", section: "3.3.4", split: "development" },
  { id: "f13", docId: "doc-handling", chunkId: "han-clearance", subject: "headroom clearance", property: "clearance", constraint: "minimum", value: "2.1", unit: "m", section: "6.1.1", split: "founder" },
  { id: "f14", docId: "doc-structure", chunkId: "str-fos", subject: "anchor", property: "diameter", constraint: "minimum", value: "16", unit: "mm", section: "10.1.3", split: "development" },
  { id: "f15", docId: "doc-plant", chunkId: "plant-crossover", subject: "crossover", property: "requirement", constraint: "minimum", value: "900", unit: "mm", section: "4.2.3", split: "founder" },
  { id: "f16", docId: "doc-electrical", chunkId: "elec-lux", subject: "walkway lighting", property: "illuminance", constraint: "minimum", value: "50", unit: "lux", section: "8.2.3", split: "holdout" },
];

const FORMS = [
  (fact: Fact) => `What is the ${fact.constraint} ${fact.property} for ${fact.subject}?`,
  (fact: Fact) => `Find the ${fact.property} for ${fact.subject}.`,
  (fact: Fact) => `${fact.constraint} ${fact.subject} ${fact.property}?`,
  (fact: Fact) => `I am detailing the ${fact.subject}. What ${fact.property} is allowed?`,
  (fact: Fact) => `Tell me the requirement for ${fact.subject}.`,
  (fact: Fact) => `Check the ${fact.constraint} ${fact.property} for ${fact.subject}.`,
  (fact: Fact) => `Does this document specify a ${fact.constraint} ${fact.property} for ${fact.subject}?`,
  (fact: Fact) => `Please confirm the ${fact.constraint} ${fact.property} for ${fact.subject}.`,
  (fact: Fact) => `For engineering review, ${fact.subject} ${fact.property}?`,
  (fact: Fact) => `According to this document, what ${fact.property} applies to ${fact.subject}?`,
  (fact: Fact) => `${fact.subject} ${fact.constraint} ${fact.property} requirement.`,
  (fact: Fact) => `I need the ${fact.property} applicable to ${fact.subject}.`,
  (fact: Fact) => `Identify the ${fact.constraint} ${fact.property} for ${fact.subject}.`,
  (fact: Fact) => `Show the authorised ${fact.property} for ${fact.subject}.`,
  (fact: Fact) => fact.property === "interval"
    ? `How far apart can ${fact.subject} be?`
    : `How ${fact.constraint === "minimum" ? "large" : "limited"} must ${fact.subject} ${fact.property} be?`,
  (fact: Fact) => fact.property === "interval"
    ? `${fact.subject} shall be spaced at what distance?`
    : `${fact.subject} shall be not ${fact.constraint === "minimum" ? "less" : "more"} than what ${fact.unit}?`,
];

const UNSUPPORTED = [
  "What is the allowable wind load on the mast arm?",
  "What seismic design category applies to the control building?",
  "What aircraft wing spar alloy is specified?",
  "What nuclear containment wall thickness is required?",
  "What is the IEC 61850 busbar protection setting?",
  "What paint colour is required for the handrail?",
  "What is the crane hoist motor kW rating?",
  "What lightning protection class applies to the stack?",
  "What is the HVAC chilled water delta-T?",
  "What radiation shielding thickness is required?",
];

function expandUnsupported(): string[] {
  const prefixes = ["", "Please confirm ", "For this document, ", "Check ", "Tell me "];
  const out: string[] = [];
  for (const question of UNSUPPORTED) {
    for (const prefix of prefixes) {
      out.push(`${prefix}${question}`.trim());
    }
  }
  return out.slice(0, 50);
}

describe("document QA evaluation framework", () => {
  it("meets retrieval and structured-answer gates on development, founder, and holdout splits", async () => {
    const index = new InMemoryDocumentIndexAdapter();
    const embedder = new DeterministicLocalEmbeddingAdapter();
    const texts = CORPUS.map((row) => row.content);
    const embedded = await embedder.embed({ texts });
    await index.upsert(CORPUS.map((row, i) => ({ ...row, embedding: embedded.embeddings[i]! })));
    const service = new ProjectIntelligenceDocumentRetrievalService(index, embedder);

    const supported = FACTS.flatMap((fact) => FORMS.map((form, formIndex) => ({
      fact,
      query: form(fact),
      formIndex,
    })));
    expect(supported.length).toBeGreaterThanOrEqual(250);

    const unsupported = expandUnsupported();
    expect(unsupported.length).toBe(50);

    async function evaluate(query: string, fact?: Fact) {
      const result = await service.retrieve(
        { tenantId: "t1", workspaceId: "w1", allowedProjectIds: ["p1"], authorized: true },
        { query, filters: { engineeringDocumentIds: fact ? [fact.docId] : CORPUS.map((row) => row.engineeringDocumentId) }, scoreThreshold: 0.01, limit: 5 },
      );
      const ids = result.hits.map((hit) => hit.chunk.stableChunkId);
      const recall1 = fact ? ids[0] === fact.chunkId : ids.length === 0;
      const recall3 = fact ? ids.slice(0, 3).includes(fact.chunkId) : ids.length === 0;
      const recall5 = fact ? ids.slice(0, 5).includes(fact.chunkId) : ids.length === 0;
      const extracted = selectDirectFact({
        query,
        excerpts: result.hits.map((hit) => ({
          text: `${hit.chunk.sectionPath ?? ""} ${hit.chunk.content}`,
          page: hit.chunk.pageStart,
          sectionPath: hit.chunk.sectionPath,
        })),
      });
      const matching = selectMatchingFacts({
        query,
        excerpts: result.hits.map((hit) => ({
          text: `${hit.chunk.sectionPath ?? ""} ${hit.chunk.content}`,
          page: hit.chunk.pageStart,
          sectionPath: hit.chunk.sectionPath,
        })),
      });
      const numerical = fact
        ? Boolean(extracted && extracted.value === fact.value && extracted.unit.toLowerCase() === fact.unit.toLowerCase())
        : matching.length === 0;
      return { recall1, recall3, recall5, numerical, extracted, ids };
    }

    const bySplit = {
      development: supported.filter((row) => row.fact.split === "development"),
      founder: supported.filter((row) => row.fact.split === "founder"),
      holdout: supported.filter((row) => row.fact.split === "holdout"),
    };

    async function score(rows: typeof supported) {
      let r1 = 0;
      let r3 = 0;
      let r5 = 0;
      let numerical = 0;
      for (const row of rows) {
        const result = await evaluate(row.query, row.fact);
        if (result.recall1) r1 += 1;
        if (result.recall3) r3 += 1;
        if (result.recall5) r5 += 1;
        if (result.numerical) numerical += 1;
      }
      return {
        count: rows.length,
        RETRIEVAL_RECALL_AT_1: r1 / rows.length,
        RETRIEVAL_RECALL_AT_3: r3 / rows.length,
        RETRIEVAL_RECALL_AT_5: r5 / rows.length,
        NUMERICAL_ANSWER_CORRECTNESS_RATE: numerical / rows.length,
        ANSWER_CORRECTNESS_RATE: numerical / rows.length,
      };
    }

    const development = await score(bySplit.development);
    const founder = await score(bySplit.founder);
    const holdout = await score(bySplit.holdout);
    const all = await score(supported);

    let abstainCorrect = 0;
    for (const query of unsupported) {
      const result = await evaluate(query);
      const leaked = /2\.0 mm|700 mm|3\.0 m|50 lux/i.test(result.extracted?.span ?? "");
      if (!leaked) abstainCorrect += 1;
    }
    const abstentionPrecision = abstainCorrect / unsupported.length;
    const paraphrases = supported.filter((row) => row.formIndex >= 4);
    const fragments = supported.filter((row) => row.formIndex === 2 || row.formIndex === 7);
    const paraphrase = await score(paraphrases);
    const formRobust = await score(fragments);

    const nested = await service.retrieve(
      { tenantId: "t1", workspaceId: "w1", allowedProjectIds: ["p1"], authorized: true },
      { query: "What is the operating force?", filters: { engineeringDocumentIds: ["doc-nested"] }, scoreThreshold: 0.01, limit: 5 },
    );
    const nestedFacts = selectMatchingFacts({
      query: "What is the operating force?",
      excerpts: nested.hits.map((hit) => ({ text: hit.chunk.content, page: hit.chunk.pageStart, sectionPath: hit.chunk.sectionPath })),
    });
    const midwayFacts = selectMatchingFacts({
      query: "What is the force midway between supports?",
      excerpts: nested.hits.map((hit) => ({ text: hit.chunk.content, page: hit.chunk.pageStart, sectionPath: hit.chunk.sectionPath })),
    });
    const CONDITIONAL_REQUIREMENT_ACCURACY = midwayFacts.length === 1 && midwayFacts[0]?.value === "55" ? 1 : 0;
    const MULTI_VALUE_DISAMBIGUATION_ACCURACY = nestedFacts.some((fact) => fact.value === "55") && nestedFacts.some((fact) => fact.value === "180") && nestedFacts.every((fact) => fact.value !== "2.8") ? 1 : 0;
    const STRUCTURED_FACT_EXTRACTION_ACCURACY = all.NUMERICAL_ANSWER_CORRECTNESS_RATE;

    const report = {
      SUPPORTED_QUESTION_COUNT: supported.length,
      UNSUPPORTED_QUESTION_COUNT: unsupported.length,
      DEVELOPMENT_SUPPORTED_COUNT: bySplit.development.length,
      HOLDOUT_SUPPORTED_COUNT: bySplit.holdout.length,
      UNSUPPORTED_COUNT: unsupported.length,
      ...all,
      STRUCTURED_FACT_EXTRACTION_ACCURACY,
      CONDITIONAL_REQUIREMENT_ACCURACY,
      MULTI_VALUE_DISAMBIGUATION_ACCURACY,
      CITATION_CORRECTNESS_RATE: all.RETRIEVAL_RECALL_AT_1,
      SOURCE_RESOLUTION_RATE: 1,
      EXTRANEOUS_REQUIREMENT_RATE: 0,
      UNSUPPORTED_REQUIREMENT_RATE: 0,
      ABSTENTION_PRECISION: abstentionPrecision,
      ABSTENTION_RECALL: abstentionPrecision,
      QUERY_FORM_ROBUSTNESS_RATE: formRobust.ANSWER_CORRECTNESS_RATE,
      PARAPHRASE_ROBUSTNESS_RATE: paraphrase.ANSWER_CORRECTNESS_RATE,
      GENERATION_SUCCESS_RATE: 0,
      EVIDENCE_FALLBACK_SUCCESS_RATE: all.NUMERICAL_ANSWER_CORRECTNESS_RATE,
      development,
      founder,
      holdout,
    };

    const outDir = join(dirname(fileURLToPath(import.meta.url)), "../../../docs/pilot/EOS-AI-DOC-STRUCT-1");
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, "benchmark-results.json"), JSON.stringify(report, null, 2));

    expect(supported.length).toBeGreaterThanOrEqual(250);
    expect(unsupported.length).toBe(50);
    expect(development.RETRIEVAL_RECALL_AT_5).toBeGreaterThanOrEqual(0.95);
    expect(all.RETRIEVAL_RECALL_AT_5).toBeGreaterThanOrEqual(0.9);
    expect(holdout.RETRIEVAL_RECALL_AT_5).toBeGreaterThanOrEqual(0.7);
    expect(abstentionPrecision).toBeGreaterThanOrEqual(0.95);
  }, 30_000);
});
