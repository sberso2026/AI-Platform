import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { DeterministicLocalEmbeddingAdapter } from "../src/documents/embedding-adapter";
import { InMemoryDocumentIndexAdapter } from "../src/documents/index-adapter";
import { planEngineeringQuery } from "../src/documents/query-plan";
import { ProjectIntelligenceDocumentRetrievalService } from "../src/documents/retrieval-service";
import type { DocumentChunk } from "../src/documents/types";

const PRODUCTION_ROOT = join(dirname(fileURLToPath(import.meta.url)), "../src");
const CONTROL_QUERY = "what is the minimum sheet metal guard thickness";
const PERTURBED_QUERY =
  "in the design of sheet metal guard, what is the minimum sheet metal guard thickness?";

interface InformationNeed {
  id: string;
  goldChunkId: string;
  goldSection: string;
  evidence: RegExp;
  formulations: string[];
}

function chunk(
  partial: Partial<DocumentChunk> & Pick<DocumentChunk, "stableChunkId" | "content" | "sectionPath">,
): DocumentChunk {
  return {
    id: partial.stableChunkId,
    tenantId: "t1",
    workspaceId: "w1",
    engineeringDocumentId: "d1",
    engineeringProjectId: "p1",
    revision: "A",
    processingVersion: "1",
    chunkIndex: Number(partial.stableChunkId.replace(/\D/g, "") || 0),
    contentHash: partial.stableChunkId,
    pageStart: 12,
    pageEnd: 12,
    blockType: "paragraph",
    ...partial,
  };
}

function formulations(core: string, extra: string[] = []): string[] {
  return [
    `what is the ${core}`,
    `how ${core.replace(/^minimum /, "")} is required`,
    `tell me the ${core}`,
    `find the ${core}`,
    `identify the ${core}`,
    ...extra,
  ].slice(0, 5);
}

const CORPUS: DocumentChunk[] = [
  chunk({
    stableChunkId: "cover",
    sectionPath: "Title",
    pageStart: 1,
    content:
      "Plant handbook. Conveyors. Design, construction, installation and operation. Safety requirements. General contents.",
  }),
  chunk({
    stableChunkId: "need-guard-thickness",
    sectionPath: "5.2.1",
    content:
      "5.2.1 Sheet metal guards. Sheet metal used for guarding shall have a thickness of not less than 1.5 mm.",
  }),
  chunk({
    stableChunkId: "need-platform-width",
    sectionPath: "4.2.1",
    content: "4.2.1 Platforms. Permanent platforms not less than 600 mm wide shall be provided for access.",
  }),
  chunk({
    stableChunkId: "need-crossover-interval",
    sectionPath: "4.2.3",
    content: "4.2.3 Crossovers or underpasses should be provided at intervals not exceeding 100 m.",
  }),
  chunk({
    stableChunkId: "need-design-pressure",
    sectionPath: "6.1.2",
    content: "6.1.2 The maximum allowable working pressure of the receiver is 1600 kPa.",
  }),
  chunk({
    stableChunkId: "need-temperature-rating",
    sectionPath: "6.3.1",
    content: "6.3.1 Insulation shall be rated for a continuous temperature of 400 degrees C.",
  }),
  chunk({
    stableChunkId: "need-pipe-diameter",
    sectionPath: "6.4.2",
    content: "6.4.2 The hydraulic pipe inside diameter shall be not less than 25 mm.",
  }),
  chunk({
    stableChunkId: "need-nip-clearance",
    sectionPath: "5.4.1",
    content: "5.4.1 Nip-point clearance at pulleys shall be not less than 50 mm.",
  }),
  chunk({
    stableChunkId: "need-fence-height",
    sectionPath: "5.5.2",
    content: "5.5.2 Perimeter fencing shall be not less than 1800 mm high.",
  }),
  chunk({
    stableChunkId: "need-fillet-weld",
    sectionPath: "7.1.4",
    content: "7.1.4 Fillet welds on guard frames shall have a minimum leg length of 6 mm.",
  }),
  chunk({
    stableChunkId: "need-coating-thickness",
    sectionPath: "7.3.2",
    content: "7.3.2 Galvanized coating thickness on outdoor members shall be at least 85 micrometres.",
  }),
  chunk({
    stableChunkId: "need-noise-limit",
    sectionPath: "8.1.1",
    content: "8.1.1 Sound pressure level at the operator station shall not exceed 85 dB(A).",
  }),
  chunk({
    stableChunkId: "need-illuminance",
    sectionPath: "8.2.3",
    content: "8.2.3 Walkway illuminance shall be not less than 50 lux.",
  }),
  chunk({
    stableChunkId: "need-belt-slope",
    sectionPath: "3.2.1",
    content: "3.2.1 Troughed belt conveyors shall not exceed a slope of 18 degrees.",
  }),
  chunk({
    stableChunkId: "need-belt-speed",
    sectionPath: "3.3.4",
    content: "3.3.4 Maximum belt speed for the bulk handling conveyor is 3.5 m/s.",
  }),
  chunk({
    stableChunkId: "need-pullcord-interval",
    sectionPath: "9.1.2",
    content: "9.1.2 Pull-wire switches shall be spaced at intervals not exceeding 30 m.",
  }),
  chunk({
    stableChunkId: "need-estop-reach",
    sectionPath: "9.2.1",
    content: "9.2.1 An emergency stop actuator shall be reachable within 600 mm of any operator position.",
  }),
  chunk({
    stableChunkId: "need-factor-of-safety",
    sectionPath: "10.1.3",
    content: "10.1.3 Lifting lugs shall be designed with a factor of safety of 5.",
  }),
  chunk({
    stableChunkId: "need-wind-speed",
    sectionPath: "10.2.2",
    content: "10.2.2 Outdoor structures shall be checked for a design wind speed of 41 m/s.",
  }),
  chunk({
    stableChunkId: "need-concrete-cover",
    sectionPath: "11.1.1",
    content: "11.1.1 Minimum concrete cover to reinforcement in footings is 50 mm.",
  }),
  chunk({
    stableChunkId: "need-fire-rating",
    sectionPath: "11.4.2",
    content: "11.4.2 Switchroom walls shall have a fire-resistance rating of 120 minutes.",
  }),
  chunk({
    stableChunkId: "need-bolt-grade",
    sectionPath: "12.1.1",
    content: "12.1.1 Structural bolts for guard supports shall be property class 8.8.",
  }),
];

const NEEDS: InformationNeed[] = [
  {
    id: "guard-thickness",
    goldChunkId: "need-guard-thickness",
    goldSection: "5.2.1",
    evidence: /1\.5\s*mm/i,
    formulations: [
      CONTROL_QUERY,
      PERTURBED_QUERY,
      "How thick must a sheet metal guard be?",
      "What thickness is required for sheet metal guarding?",
      "Minimum material thickness for a sheet metal conveyor guard",
    ],
  },
  {
    id: "platform-width",
    goldChunkId: "need-platform-width",
    goldSection: "4.2.1",
    evidence: /600\s*mm/i,
    formulations: formulations("minimum platform width"),
  },
  {
    id: "crossover-interval",
    goldChunkId: "need-crossover-interval",
    goldSection: "4.2.3",
    evidence: /100\s*m/i,
    formulations: formulations("crossover interval"),
  },
  {
    id: "working-pressure",
    goldChunkId: "need-design-pressure",
    goldSection: "6.1.2",
    evidence: /1600\s*kPa/i,
    formulations: formulations("maximum allowable working pressure"),
  },
  {
    id: "temperature-rating",
    goldChunkId: "need-temperature-rating",
    goldSection: "6.3.1",
    evidence: /400/i,
    formulations: formulations("insulation temperature rating"),
  },
  {
    id: "pipe-diameter",
    goldChunkId: "need-pipe-diameter",
    goldSection: "6.4.2",
    evidence: /25\s*mm/i,
    formulations: formulations("minimum hydraulic pipe diameter"),
  },
  {
    id: "nip-clearance",
    goldChunkId: "need-nip-clearance",
    goldSection: "5.4.1",
    evidence: /50\s*mm/i,
    formulations: formulations("nip-point clearance"),
  },
  {
    id: "fence-height",
    goldChunkId: "need-fence-height",
    goldSection: "5.5.2",
    evidence: /1800\s*mm/i,
    formulations: formulations("minimum fence height"),
  },
  {
    id: "fillet-weld",
    goldChunkId: "need-fillet-weld",
    goldSection: "7.1.4",
    evidence: /6\s*mm/i,
    formulations: formulations("minimum fillet weld leg length"),
  },
  {
    id: "coating-thickness",
    goldChunkId: "need-coating-thickness",
    goldSection: "7.3.2",
    evidence: /85/i,
    formulations: formulations("galvanized coating thickness"),
  },
  {
    id: "noise-limit",
    goldChunkId: "need-noise-limit",
    goldSection: "8.1.1",
    evidence: /85\s*dB/i,
    formulations: formulations("operator sound pressure limit"),
  },
  {
    id: "illuminance",
    goldChunkId: "need-illuminance",
    goldSection: "8.2.3",
    evidence: /50\s*lux/i,
    formulations: formulations("walkway illuminance"),
  },
  {
    id: "belt-slope",
    goldChunkId: "need-belt-slope",
    goldSection: "3.2.1",
    evidence: /18\s*degrees/i,
    formulations: formulations("maximum belt slope"),
  },
  {
    id: "belt-speed",
    goldChunkId: "need-belt-speed",
    goldSection: "3.3.4",
    evidence: /3\.5\s*m\/s/i,
    formulations: formulations("maximum belt speed"),
  },
  {
    id: "pullcord-interval",
    goldChunkId: "need-pullcord-interval",
    goldSection: "9.1.2",
    evidence: /30\s*m/i,
    formulations: formulations("pull-wire switch interval"),
  },
  {
    id: "estop-reach",
    goldChunkId: "need-estop-reach",
    goldSection: "9.2.1",
    evidence: /600\s*mm/i,
    formulations: formulations("emergency stop reach distance"),
  },
  {
    id: "factor-of-safety",
    goldChunkId: "need-factor-of-safety",
    goldSection: "10.1.3",
    evidence: /factor of safety of 5/i,
    formulations: formulations("lifting lug factor of safety"),
  },
  {
    id: "wind-speed",
    goldChunkId: "need-wind-speed",
    goldSection: "10.2.2",
    evidence: /41\s*m\/s/i,
    formulations: formulations("design wind speed"),
  },
  {
    id: "concrete-cover",
    goldChunkId: "need-concrete-cover",
    goldSection: "11.1.1",
    evidence: /50\s*mm/i,
    formulations: formulations("minimum concrete cover"),
  },
  {
    id: "fire-rating",
    goldChunkId: "need-fire-rating",
    goldSection: "11.4.2",
    evidence: /120\s*minutes/i,
    formulations: formulations("switchroom fire-resistance rating"),
  },
];

const PREFIXES = [
  "in the design of",
  "for conveyor design",
  "according to this document",
  "for engineering review",
  "please confirm",
  "can you tell me",
  "we are designing a conveyor and need to know",
];
const SUFFIXES = [
  "according to the standard",
  "for design purposes",
  "and provide the clause",
  "and show me the source",
  "and explain why",
];
const QUESTION_FORMS = [
  "what is the minimum sheet metal guard thickness",
  "how thick must a sheet metal guard be",
  "tell me the minimum sheet metal guard thickness",
  "find the minimum sheet metal guard thickness",
  "identify the minimum sheet metal guard thickness",
  "confirm the minimum sheet metal guard thickness",
  "minimum sheet metal guard thickness",
  "required sheet metal guard thickness",
  "does the standard specify the minimum sheet metal guard thickness",
  "I need to know the minimum sheet metal guard thickness",
];
const PARAPHRASES = [
  "How thick must a sheet metal guard be?",
  "What thickness is required for sheet metal guarding?",
  "Minimum material thickness for a sheet metal conveyor guard",
  "I am designing a conveyor guard using sheet metal. What thickness should I specify?",
];

describe("query perturbation robustness", () => {
  async function setup() {
    const index = new InMemoryDocumentIndexAdapter();
    const embedder = new DeterministicLocalEmbeddingAdapter();
    const embedded = await embedder.embed({ texts: CORPUS.map((item) => item.content) });
    await index.upsert(CORPUS.map((item, offset) => ({ ...item, embedding: embedded.embeddings[offset] })));
    const service = new ProjectIntelligenceDocumentRetrievalService(index, embedder);
    const retrieve = (query: string) =>
      service.retrieve(
        { tenantId: "t1", workspaceId: "w1", allowedProjectIds: ["p1"], authorized: true },
        { query, filters: { engineeringDocumentIds: ["d1"] }, limit: 8, scoreThreshold: 0 },
      );
    return { retrieve, embedder };
  }

  function selectedGold(result: Awaited<ReturnType<ProjectIntelligenceDocumentRetrievalService["retrieve"]>>, need: InformationNeed) {
    return result.hits.some(
      (hit) => hit.chunk.stableChunkId === need.goldChunkId || (hit.chunk.sectionPath ?? "").includes(need.goldSection),
    );
  }

  it("keeps the same gold clause for the control and perturbed pair and records traces", async () => {
    const { retrieve } = await setup();
    const control = await retrieve(CONTROL_QUERY);
    const perturbed = await retrieve(PERTURBED_QUERY);
    const gold = NEEDS[0]!;
    const controlRank = control.candidates?.find((row) => row.chunkId === gold.goldChunkId)?.rank ?? -1;
    const perturbedRank = perturbed.candidates?.find((row) => row.chunkId === gold.goldChunkId)?.rank ?? -1;
    const controlScore = control.candidates?.find((row) => row.chunkId === gold.goldChunkId)?.combinedScore ?? 0;
    const perturbedScore = perturbed.candidates?.find((row) => row.chunkId === gold.goldChunkId)?.combinedScore ?? 0;

    expect(control.queryPlan?.rawQuery).toBe(CONTROL_QUERY);
    expect(perturbed.queryPlan?.normalizedQuery.toLowerCase()).not.toMatch(/\bdesign\b/);
    expect(selectedGold(control, gold)).toBe(true);
    expect(selectedGold(perturbed, gold)).toBe(true);
    expect(controlRank).toBeGreaterThan(0);
    expect(perturbedRank).toBeGreaterThan(0);
    expect(control.vectorAttempted).toBe(true);
    expect(perturbed.vectorAttempted).toBe(true);
    expect((control.vectorHitCount ?? 0) + (perturbed.vectorHitCount ?? 0)).toBeGreaterThan(0);

    (globalThis as { __perturbationTrace?: unknown }).__perturbationTrace = {
      CONTROL_CORRECT_CHUNK_RANK: controlRank,
      PERTURBED_CORRECT_CHUNK_RANK: perturbedRank,
      CONTROL_CORRECT_CHUNK_SCORE: controlScore,
      PERTURBED_CORRECT_CHUNK_SCORE: perturbedScore,
      CONTROL_CANDIDATES: control.candidates,
      PERTURBED_CANDIDATES: perturbed.candidates,
    };
  });

  it("keeps gold evidence retrievable across prefixes, suffixes, question forms, and paraphrases", async () => {
    const { retrieve } = await setup();
    const gold = NEEDS[0]!;
    const prefixQueries = PREFIXES.map((prefix) => `${prefix} ${CONTROL_QUERY}`);
    const suffixQueries = SUFFIXES.map((suffix) => `${CONTROL_QUERY} ${suffix}`);
    const groups = [
      ["PREFIX", prefixQueries],
      ["SUFFIX", suffixQueries],
      ["QUESTION", QUESTION_FORMS],
      ["PARAPHRASE", PARAPHRASES],
    ] as const;
    for (const [label, queries] of groups) {
      for (const query of queries) {
        const result = await retrieve(query);
        expect(selectedGold(result, gold), `${label}: ${query}`).toBe(true);
        expect(result.hits.some((hit) => gold.evidence.test(hit.chunk.content)), `${label} evidence: ${query}`).toBe(true);
      }
    }
  });

  it("meets the 20x5 variant retrieval and answer gate without fixture-specific production strings", async () => {
    const { retrieve } = await setup();
    const variants = NEEDS.flatMap((need) => need.formulations.map((query) => ({ need, query })));
    expect(NEEDS).toHaveLength(20);
    expect(variants.length).toBeGreaterThanOrEqual(100);

    let retrievalHits = 0;
    let answerHits = 0;
    let hybridMeasured = false;
    const failed: string[] = [];
    for (const variant of variants) {
      const result = await retrieve(variant.query);
      if ((result.vectorAttempted && (result.vectorHitCount ?? 0) > 0) || result.hits.some((hit) => hit.source === "hybrid" || hit.source === "vector")) {
        hybridMeasured = true;
      }
      const retrieved = selectedGold(result, variant.need);
      const answered = retrieved && result.hits.some((hit) => variant.need.evidence.test(`${hit.chunk.sectionPath} ${hit.chunk.content}`));
      if (retrieved) retrievalHits += 1;
      if (answered) answerHits += 1;
      if (!retrieved) {
        failed.push(`${variant.need.id}: ${variant.query} -> ${result.hits.map((hit) => hit.chunk.stableChunkId).join(",") || "none"}`);
      }
    }

    const retrievalRate = retrievalHits / variants.length;
    const answerRate = answerHits / variants.length;
    expect(retrievalRate, failed.join("\n")).toBeGreaterThanOrEqual(0.95);
    expect(answerRate).toBeGreaterThanOrEqual(0.95);
    expect(hybridMeasured).toBe(true);

    const control = await retrieve(CONTROL_QUERY);
    const perturbed = await retrieve(PERTURBED_QUERY);
    expect(selectedGold(control, NEEDS[0]!)).toBe(true);
    expect(selectedGold(perturbed, NEEDS[0]!)).toBe(true);

    const retrievalFiles = [
      join(PRODUCTION_ROOT, "documents/query-plan.ts"),
      join(PRODUCTION_ROOT, "documents/retrieval-service.ts"),
      join(PRODUCTION_ROOT, "documents/lexical-overlap.ts"),
      join(PRODUCTION_ROOT, "documents/index-adapter.ts"),
      join(PRODUCTION_ROOT, "documents/postgres-index-adapter.ts"),
    ];
    for (const file of retrievalFiles) {
      const text = readFileSync(file, "utf8");
      expect(text, file).not.toMatch(/AS 1755/i);
      expect(text, file).not.toMatch(/5\.2\.1/);
      expect(text, file).not.toMatch(/1\.5 mm/);
      expect(text, file).not.toMatch(/sheet metal guard/i);
      expect(text, file).not.toContain(CONTROL_QUERY);
      expect(text, file).not.toContain(PERTURBED_QUERY);
    }
    expect(planEngineeringQuery(PERTURBED_QUERY).retrievalQueries.join(" ")).not.toMatch(/\bdesign\b/);
  });
});
