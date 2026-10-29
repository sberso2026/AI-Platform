import { describe, expect, it } from "vitest";
import { buildDocumentGroundedAnswer, buildDocumentQaPresentation, isDocumentBodyEvidence } from "./document-grounded-answer";
import { presentAskLimitations } from "./engineering-retrieval-service";
import { stripFabricatedAuthorityClaims } from "../phase-e5/reasoning-service";
import type { EngineeringEvidence } from "../phase-e2/contracts";

function ev(partial: Partial<EngineeringEvidence> & Pick<EngineeringEvidence, "sourceId" | "excerpt">): EngineeringEvidence {
  return {
    sourceType: "document",
    title: "AS/NZS 1252:1996 — High-strength steel bolts",
    canonicalObjectId: "doc-1",
    revision: "1996",
    authorityStatus: "CURRENT",
    sourceLocation: "/engineering/documents/doc-1?page=8",
    provenance: "engineering_os_native",
    permissionsApplied: true,
    documentNumber: "AS/NZS 1252:1996",
    pageStart: 8,
    sectionPath: "Section 3.4 Test Methods",
    chunkId: partial.sourceId,
    ...partial,
  };
}

describe("EOS document Q&A contracts", () => {
  it("TEST 1 cites Section 3.4 / AS/NZS 4291.2 and does not invent 4291.2 procedures", () => {
    const result = buildDocumentGroundedAnswer({
      query: "What is the test method for determining the mechanical properties of high-strength nuts?",
      evidence: [
        ev({
          sourceId: "c1",
          excerpt:
            "Section 3.4 Test Methods. The test methods for determining the mechanical properties of high-strength nuts shall be in accordance with AS/NZS 4291.2.",
        }),
      ],
    });
    expect(result.abstained).toBe(false);
    expect(result.answer).toMatch(/DOCUMENT FACT/i);
    expect(result.answer).toMatch(/3\.4/);
    expect(result.answer).toMatch(/AS\/NZS 4291\.2/);
    expect(result.answer).toMatch(/MISSING EVIDENCE/i);
    expect(result.answer).not.toMatch(/tensile test specimen preparation|proof load procedure invented/i);
  });

  it("TEST 2 retrieves Figure 2.3 and refuses a numeric M20 value without l'", () => {
    const result = buildDocumentGroundedAnswer({
      query: "What is the tolerance for M20 bolt shank straightness?",
      evidence: [
        ev({
          sourceId: "c2",
          pageStart: 15,
          sectionPath: "Figure 2.3 Tolerance on Straightness of High-Strength Steel Bolts",
          figureLabel: "Figure 2.3",
          excerpt:
            "Figure 2.3 Tolerance on Straightness of High-Strength Steel Bolts\n\nt = 2(0.0025 l' + 0.05)",
        }),
      ],
    });
    expect(result.answer).toMatch(/Figure 2\.3/);
    expect(result.answer).toMatch(/t\s*=\s*2\(0\.0025/);
    expect(result.answer).toMatch(/M20/);
    expect(result.answer).toMatch(/cannot be derived/i);
    expect(result.answer).toMatch(/Page 15/);
  });

  it("TEST 3 abstains when the answer is not in the document", () => {
    const result = buildDocumentGroundedAnswer({
      query: "What is the allowable wind load on the mast arm?",
      evidence: [],
    });
    expect(result.abstained).toBe(true);
    expect(result.answer).toMatch(/enough authorised evidence/i);
  });

  it("does not treat metadata-only rows as document body evidence", () => {
    expect(
      isDocumentBodyEvidence([
        ev({
          sourceId: "meta",
          excerpt: "AS/NZS 1252:1996",
          pageStart: null,
          sectionPath: null,
          chunkId: null,
          figureLabel: null,
        }),
      ]),
    ).toBe(false);
  });

  it("keeps evidenced standard citations and strips unevidenced ones", () => {
    const cleaned = stripFabricatedAuthorityClaims(
      "Per AS/NZS 4291.2 and AS/NZS 1170 the calculated stress = 120 MPa approved by Alice",
      "in accordance with AS/NZS 4291.2",
    );
    expect(cleaned).toMatch(/AS\/NZS 4291\.2/);
    expect(cleaned).not.toMatch(/AS\/NZS 1170/);
    expect(cleaned).not.toMatch(/calculated stress = 120/);
  });

  it("replaces implementation jargon with user-facing limitations", () => {
    const presented = presentAskLimitations([
      "Semantic embeddings not configured; lexical retrieval active.",
      "semantic_embeddings_not_configured",
      "Document content/body is unavailable; metadata-only search applied.",
      "document_body_hits:3",
    ]);
    expect(presented.user.join(" ")).not.toMatch(/semantic embeddings not configured/i);
    expect(presented.user.join(" ")).not.toMatch(/semantic_embeddings_not_configured/i);
    expect(presented.user.join(" ")).toMatch(/Keyword search|source text is not searchable/i);
    expect(presented.details.length).toBeGreaterThan(0);
  });

  it("surfaces generation failure as retrieved-evidence degraded copy", () => {
    const presented = presentAskLimitations([
      "generation_failed_retrieval_shown",
      "AI generation unavailable; returned retrieval-grounded answer without fabricated fallback.",
    ]);
    expect(presented.user.join(" ")).toMatch(/could not generate an answer/i);
    expect(presented.user.join(" ")).not.toMatch(/unexpected error/i);
  });

  it("prefers the 600 mm platform clause over the start of a mixed page excerpt", () => {
    const result = buildDocumentGroundedAnswer({
      query: "What is the minimum platform width to access the conveyor?",
      evidence: [
        ev({
          sourceId: "c-width",
          title: "AS 1755-1986 — Conveyors",
          documentNumber: "AS 1755-1986",
          pageStart: 11,
          sectionPath: "4.2.1",
          excerpt:
            "4.2.1 Platforms to be provided. Permanent platforms not less than 600 mm wide shall be provided to enable all parts of the plant which need to be reached.",
        }),
      ],
    });
    expect(result.abstained).toBe(false);
    expect(result.answer).toMatch(/600 mm/);
    expect(result.answer).toMatch(/4\.2\.1/);
  });

  it("answers both conditional operating-force cases instead of picking one sibling", () => {
    const result = buildDocumentQaPresentation({
      query: "What is the operating force?",
      evidence: [
        ev({
          sourceId: "force",
          documentNumber: "STD-9",
          title: "Plant safety",
          pageStart: 9,
          sectionPath: "6.4.1",
          excerpt: "6.4.1 Stop cable. (d) The force required to operate the stop control shall not exceed the following: (i) Where applied midway between the supports and at right angles . . . 55 N. (ii) Where applied along the axis of the cable . . . 180 N. (e) Supports shall be provided at intervals not exceeding 2.8 m.",
        }),
      ],
    });
    expect(result.answer).toMatch(/55\s*N/i);
    expect(result.answer).toMatch(/180\s*N/i);
    expect(result.answer).not.toMatch(/2\.8\s*m/i);
  });
});
