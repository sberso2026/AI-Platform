import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { EU_CONCRETE_PACK_CERTIFIED, EU_CONCRETE_STANDARD_CONFORMANCE_STATE } from "@rtb/types";
import { D1E_INTERNAL_ROADMAP } from "./capability";
import { executeEuC10R2Benchmarks } from "./eu-c10/benchmarks";
import {
  AI_GENERATED_REVIEW_APPROVAL_ALLOWED,
  AUTO_APPROVED_REVIEW_PACK_COUNT,
  CORNER_PUNCHING_ENGINEER_REVIEW_PACK_PRESENT,
  EDGE_PUNCHING_ENGINEER_REVIEW_PACK_PRESENT,
  EU_C10_R3A_BLOCKED_INDEPENDENCE_CAPABILITIES,
  EU_C10_R3A_C3_INTERACTION_REGION_COVERAGE,
  EU_C10_R3A_C3_NONZERO_NM_INDEPENDENT_CASE_PRESENT,
  EU_C10_R3A_C3_SUPPLEMENTAL_EVIDENCE_ITEM,
  EU_C10_R3A_C4_UNIAXIAL_REDUCTION_COVERAGE,
  EU_C10_R3A_C6_C_CLASSIFIED_AS_NDP,
  EU_C10_R3A_C6_PHIEF_CLASSIFIED_AS_NDP,
  EU_C10_R3A_C7_C8_PACKS_HIDE_INDEPENDENCE_GAP,
  EU_C10_R3A_DEFAULT_REVIEW_OUTCOME,
  EU_C10_R3A_ENGINEER_VALIDATED_METHOD_COUNT,
  EU_C10_R3A_ENGINEER_VALIDATED_ORCHESTRATOR_COUNT,
  EU_C10_R3A_ENGINEER_VALIDATED_PACK_COUNT,
  EU_C10_R3A_METHOD_REVIEW_QUESTIONS,
  EU_C10_R3A_ORCHESTRATOR_REVIEW_QUESTIONS,
  buildEuC10R3aReviewPacks,
  classifyHumanReviewEvidence,
  reviewPackIsCurrent,
  type HumanReviewEvidenceInput,
} from "./eu-c10/review-packs";

const packs = buildEuC10R3aReviewPacks();

function evidenceFor(packId: string, outcome: string): HumanReviewEvidenceInput {
  const pack = packs.find((item) => item.packId === packId);
  if (!pack) throw new Error(packId);
  return {
    reviewPackId: pack.packId,
    reviewPackFingerprint: pack.packFingerprint,
    reviewerRef: "reviewer-ref",
    competenceBasis: "reinforced-concrete design of the reviewed method",
    reviewScope: pack.scope,
    reviewOutcome: outcome,
    reviewDate: "2026-10-14",
    reviewNotes: "human notes",
    limitations: "bounded scope",
    exceptions: "",
    supplementalEvidenceRefs: pack.supplementalRequirement ? ["human-calc-ref"] : [],
    signedEvidenceRef: "attestation-ref",
    reviewedMethodFingerprint: pack.formulaFingerprint,
    reviewedProfileFingerprint: pack.parameterFingerprint,
    assuranceLevel: "EXTERNAL_QUALIFIED_REVIEW",
    aiGeneratedApproval: false,
    blanketAllConcreteApproval: false,
    involvedInFormulaImplementation: false,
    involvedInBenchmarkPreparation: false,
    involvedInSourceRuleExtraction: false,
    involvedInOrchestratorImplementation: false,
  };
}

describe("EOS-D1E-EU-C10-R3A engineer review packs", () => {
  it("prepares 16 pending packs from the audited R2 ledger", () => {
    const ledger = executeEuC10R2Benchmarks().ledger;
    expect(ledger).toHaveLength(16);
    expect(packs).toHaveLength(16);
    expect(new Set(packs.map((pack) => pack.packId)).size).toBe(16);
    expect(EU_C10_R3A_DEFAULT_REVIEW_OUTCOME).toBe("PENDING_HUMAN_REVIEW");
    expect(AUTO_APPROVED_REVIEW_PACK_COUNT).toBe(0);
    expect(EU_C10_R3A_ENGINEER_VALIDATED_PACK_COUNT).toBe(0);
    expect(EU_C10_R3A_ENGINEER_VALIDATED_METHOD_COUNT).toBe(0);
    expect(EU_C10_R3A_ENGINEER_VALIDATED_ORCHESTRATOR_COUNT).toBe(0);
    expect(EU_CONCRETE_PACK_CERTIFIED).toBe(false);
    expect(EU_CONCRETE_STANDARD_CONFORMANCE_STATE).toBe("INTENDED_PROFILE");
    for (const pack of packs) {
      expect(pack.capabilityId.length).toBeGreaterThan(0);
      expect(pack.methodVersion.length).toBeGreaterThan(0);
      expect(pack.formulaFingerprint.length).toBeGreaterThan(0);
      expect(pack.parameterFingerprint.length).toBeGreaterThan(0);
      expect(pack.scope.length).toBeGreaterThan(0);
      expect(pack.exclusions.length).toBeGreaterThan(0);
      expect(pack.benchmarkIds.length).toBeGreaterThan(0);
      expect(pack.benchmarkResults.length).toBeGreaterThan(0);
      expect(pack.profileId.length).toBeGreaterThan(0);
      expect(pack.questions.length).toBeGreaterThanOrEqual(EU_C10_R3A_METHOD_REVIEW_QUESTIONS.length);
      expect(pack.reviewOutcome).toBe("PENDING_HUMAN_REVIEW");
      expect(pack.engineerValidationState).toBe("PENDING_HUMAN_REVIEW");
      expect(pack.conformanceState).toBe("INTENDED_PROFILE");
      expect(pack.certified).toBe(false);
      expect(pack.nationalProfileState).toBe("NOT_VALIDATED");
      expect(pack.reviewerRef).toBe("");
      expect(pack.reviewSignature).toBe("");
      expect(pack.packFingerprint).toHaveLength(16);
      expect(["PENDING_HUMAN_REVIEW", "REQUIRES_SUPPLEMENTAL_INDEPENDENT_CALCULATION"]).toContain(pack.reviewStatus);
    }
  });

  it("keeps C3 partial and requires a nonzero axial-moment calculation", () => {
    const c3 = packs.find((pack) => pack.packId === "C10-R3A-PACK-C3-UNIAXIAL");
    expect(EU_C10_R3A_C3_NONZERO_NM_INDEPENDENT_CASE_PRESENT).toBe(false);
    expect(EU_C10_R3A_C3_INTERACTION_REGION_COVERAGE).toBe("MISSING");
    expect(c3?.coverageState).toBe("PARTIAL_EVIDENCE");
    expect(c3?.benchmarkIds).toEqual(["C10-R2-C3-ZERO-AXIAL"]);
    expect(c3?.reviewStatus).toBe("REQUIRES_SUPPLEMENTAL_INDEPENDENT_CALCULATION");
    expect(c3?.supplementalRequirement).toBe(EU_C10_R3A_C3_SUPPLEMENTAL_EVIDENCE_ITEM.id);
    expect(c3?.reviewerAttention).toContain("SUPPLEMENTAL_INDEPENDENT_NM_CALCULATION_REQUIRED");
    expect(c3?.reviewOutcome).not.toBe("VALIDATED");
  });

  it("records the missing C4 one-axis reduction without treating the diagonal case as complete", () => {
    const c4 = packs.find((pack) => pack.packId === "C10-R3A-PACK-C4-BIAXIAL");
    expect(EU_C10_R3A_C4_UNIAXIAL_REDUCTION_COVERAGE).toBe("MISSING");
    expect(c4?.coverageState).toBe("PARTIAL_EVIDENCE");
    expect(c4?.benchmarkIds).toEqual(["C10-R2-C4-DIAGONAL"]);
    expect(c4?.reviewerAttention).toContain("ONE_AXIS_REDUCTION_MISSING");
    expect(c4?.reviewerAttention).toContain("SECTION_RESULT_IS_NOT_MEMBER_STABILITY");
  });

  it("keeps C7 and C8 independence gaps visible", () => {
    expect(EU_C10_R3A_C7_C8_PACKS_HIDE_INDEPENDENCE_GAP).toBe(false);
    const ledger = executeEuC10R2Benchmarks().ledger;
    for (const capabilityId of EU_C10_R3A_BLOCKED_INDEPENDENCE_CAPABILITIES) {
      expect(ledger.find((row) => row.capabilityId === capabilityId)?.evidenceStatus).toBe("BLOCKED_INDEPENDENCE");
      const pack = packs.find((item) => item.capabilityId === capabilityId);
      expect(pack?.reviewStatus).toBe("REQUIRES_SUPPLEMENTAL_INDEPENDENT_CALCULATION");
      expect(pack?.eligibility).toBe("REQUIRES_SUPPLEMENTAL_INDEPENDENT_CALCULATION");
      expect(pack?.knownLimitations.join(" ")).toContain("BLOCKED_INDEPENDENCE");
      expect(pack?.reviewOutcome).not.toBe("VALIDATED");
    }
  });

  it("does not create edge or corner punching packs", () => {
    expect(EDGE_PUNCHING_ENGINEER_REVIEW_PACK_PRESENT).toBe(false);
    expect(CORNER_PUNCHING_ENGINEER_REVIEW_PACK_PRESENT).toBe(false);
    expect(packs.filter((pack) => pack.capabilityId === "D1E.EU.C5.PUNCHING")).toHaveLength(1);
    expect(packs.some((pack) => pack.packId.includes("EDGE") || pack.packId.includes("CORNER"))).toBe(false);
  });

  it("marks a pack stale when a bound fingerprint changes", () => {
    const pack = packs.find((item) => item.packId === "C10-R3A-PACK-C2-FLEXURE");
    expect(pack).toBeDefined();
    if (!pack) return;
    const live = {
      formulaFingerprint: pack.formulaFingerprint,
      parameterFingerprint: pack.parameterFingerprint,
      methodVersion: pack.methodVersion,
      scope: pack.scope,
    };
    expect(reviewPackIsCurrent(pack, live)).toBe(true);
    expect(reviewPackIsCurrent(pack, { ...live, formulaFingerprint: `${pack.formulaFingerprint}-stale` })).toBe(false);
    expect(reviewPackIsCurrent(pack, { ...live, parameterFingerprint: `${pack.parameterFingerprint}-stale` })).toBe(false);
    expect(reviewPackIsCurrent(pack, { ...live, scope: `${pack.scope} changed` })).toBe(false);
  });

  it("cannot promote generated packs to engineer validation, conformance, or certification", () => {
    expect(AI_GENERATED_REVIEW_APPROVAL_ALLOWED).toBe(false);
    for (const pack of packs) {
      expect(pack.reviewOutcome).not.toBe("VALIDATED");
      expect(pack.reviewOutcome).not.toBe("VALIDATED_WITH_LIMITATIONS");
      expect(pack.engineerValidationState).not.toBe("ENGINEER_VALIDATED");
      expect(pack.conformanceState).not.toBe("CONFORMANCE_VALIDATED");
      expect(pack.certified).toBe(false);
    }
    const source = readFileSync(new URL("./eu-c10/review-packs.ts", import.meta.url), "utf8");
    expect(source).not.toMatch(/ENGINEER_VALIDATED\s*=\s*true/);
    expect(source).not.toMatch(/engineerValidated:\s*true/);
    expect(source).not.toMatch(/releaseEligible/);
    expect(source).not.toMatch(/CONCRETE_PACK_CERTIFIED\s*=\s*true/);
  });

  it("rejects invalid human evidence and does not let R3A ingest a valid review as validation", () => {
    const c2 = packs.find((pack) => pack.packId === "C10-R3A-PACK-C2-FLEXURE");
    const c3 = packs.find((pack) => pack.packId === "C10-R3A-PACK-C3-UNIAXIAL");
    expect(c2 && c3).toBeTruthy();
    if (!c2 || !c3) return;
    const complete = evidenceFor(c2.packId, "VALIDATED_WITH_LIMITATIONS");
    const accepted = classifyHumanReviewEvidence(complete, c2);
    expect(accepted.promotableByR3a).toBe(false);
    expect(accepted.wouldBeEligibleForR3bIngestion).toBe(true);
    expect(c2.engineerValidationState).toBe("PENDING_HUMAN_REVIEW");
    expect(classifyHumanReviewEvidence({ ...complete, competenceBasis: "" }, c2).rejectionReasons).toContain("MISSING_REVIEWER_COMPETENCE_BASIS");
    expect(classifyHumanReviewEvidence({ ...complete, reviewPackFingerprint: "unknown" }, c2).rejectionReasons).toContain("UNKNOWN_PACK_FINGERPRINT");
    expect(classifyHumanReviewEvidence({ ...complete, reviewedMethodFingerprint: "stale" }, c2).rejectionReasons).toContain("STALE_METHOD_FINGERPRINT");
    expect(classifyHumanReviewEvidence({ ...complete, aiGeneratedApproval: true }, c2).rejectionReasons).toContain("AI_GENERATED_APPROVAL");
    expect(classifyHumanReviewEvidence({ ...complete, signedEvidenceRef: "" }, c2).rejectionReasons).toContain("UNSIGNED_OR_UNATTESTED_APPROVAL");
    expect(classifyHumanReviewEvidence({ ...complete, blanketAllConcreteApproval: true }, c2).rejectionReasons).toContain("GENERIC_BLANKET_APPROVAL");
    const c3Evidence = evidenceFor(c3.packId, "VALIDATED");
    expect(classifyHumanReviewEvidence({ ...c3Evidence, supplementalEvidenceRefs: [], limitations: "" }, c3).rejectionReasons).toContain("UNRESOLVED_EVIDENCE_GAP_WITHOUT_LIMITATIONS");
  });

  it("asks method and orchestrator reviewers the required questions", () => {
    const method = packs.find((pack) => pack.packId === "C10-R3A-PACK-C5-SHEAR");
    const beam = packs.find((pack) => pack.packId === "C10-R3A-PACK-C9-BEAM");
    for (const question of EU_C10_R3A_METHOD_REVIEW_QUESTIONS) expect(method?.questions).toContain(question);
    for (const question of EU_C10_R3A_ORCHESTRATOR_REVIEW_QUESTIONS) expect(beam?.questions).toContain(question);
    expect(EU_C10_R3A_C6_PHIEF_CLASSIFIED_AS_NDP).toBe(false);
    expect(EU_C10_R3A_C6_C_CLASSIFIED_AS_NDP).toBe(false);
    expect(packs.find((pack) => pack.packId === "C10-R3A-PACK-C6-NOMINAL-CURVATURE")?.ndpState).toContain("PHIEF_EXPLICIT_GOVERNED_ENGINEERING_INPUT");
  });

  it("leaves engineer validation and R3B unstarted", () => {
    expect(D1E_INTERNAL_ROADMAP.find((row) => row.id === "EOS-D1E-EU-C10-R3A-ENGINEER-REVIEW-PACK-PREPARATION")?.status).toBe("CLOSED");
    expect(D1E_INTERNAL_ROADMAP.find((row) => row.id === "EOS-D1E-EU-C10-R3-ENGINEER-VALIDATION-EVIDENCE")?.status).toBe("NOT_STARTED");
    expect(D1E_INTERNAL_ROADMAP.find((row) => row.id === "EOS-D1E-EU-C10-R3B-ENGINEER-VALIDATION-EVIDENCE-INGESTION")?.status).toBe("NOT_STARTED");
  });
});
