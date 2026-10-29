import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { STRUCTURAL_OBJECT_KINDS } from "@rtb/types";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import {
  D1L_R1_ADMIN_EQUALS_CERTIFICATION_AUTHORITY,
  D1L_R1_AI_CAN_CLEAR_CERTIFICATION_BLOCKER,
  D1L_R1_AI_CAN_INVENT_CERTIFICATION_EVIDENCE,
  D1L_R1_AI_CAN_MARK_CERTIFIED,
  D1L_R1_AI_EQUALS_CERTIFICATION_AUTHORITY,
  D1L_R1_CERTIFICATION_AUTHORITY_READY,
  D1L_R1_CERTIFICATION_BLOCKER_EVALUATION_RUNTIME_COUNT,
  D1L_R1_CERTIFICATION_DECISION_RUNTIME_COUNT,
  D1L_R1_CERTIFICATION_ELIGIBILITY_RUNTIME_COUNT,
  D1L_R1_CERTIFICATION_ISSUANCE_RUNTIME_COUNT,
  D1L_R1_CERTIFICATION_RUNTIME_READY,
  D1L_R1_CLAIM_RECORDED_EQUALS_CERTIFIED,
  D1L_R1_CLAIM_RECORDED_EQUALS_ELIGIBLE,
  D1L_R1_CONFORMANCE_PRESENT_EQUALS_CERTIFICATION_ELIGIBLE,
  D1L_R1_D1A_STRUCTURAL_IDENTITY_REUSED,
  D1L_R1_D1G_BLOCKER_EVALUATION_RUNTIME_COUNT,
  D1L_R1_D1G_CERTIFICATION_BLOCKER_PRESERVED,
  D1L_R1_D1M_ABSORBED,
  D1L_R1_D1N_ABSORBED,
  D1L_R1_D2_D8_RUNTIME_COUNT,
  D1L_R1_D9_RUNTIME_COUNT,
  D1L_R1_DATABASE_SCHEMA_CHANGED,
  D1L_R1_DESIGN_EVIDENCE_RECORDED_EQUALS_DESIGN_VALIDATED,
  D1L_R1_GLOBAL_CYCLE_DETECTION_RUNTIME_COUNT,
  D1L_R1_MANIFEST_CREATOR_EQUALS_CERTIFICATION_AUTHORITY,
  D1L_R1_MANIFEST_RECORDED_EQUALS_CERTIFIED,
  D1L_R1_MANIFEST_RECORDED_EQUALS_ELIGIBLE,
  D1L_R1_MANIFEST_VALID_EQUALS_CERTIFICATION_ELIGIBLE,
  D1L_R1_NEW_ENGINEERING_FORMULA_COUNT,
  D1L_R1_NEW_SOLVER_RUNTIME_COUNT,
  D1L_R1_PARALLEL_CROSS_DISCIPLINE_INTERFACE_CREATED,
  D1L_R1_PARALLEL_DIGITAL_THREAD_CREATED,
  D1L_R1_PARALLEL_EVIDENCE_SYSTEM_CREATED,
  D1L_R1_PARTIAL_CLAIM_EQUALS_GLOBAL_CERTIFICATION_CLAIM,
  D1L_R1_SECOND_FINGERPRINT_ALGORITHM_CREATED,
  D1L_R1_SOLVER_EVIDENCE_AUTO_PROMOTED,
  D1L_R1_STATUS,
  D1L_R1_STRUCTURAL_PACK_COMPLETE,
  D1L_R2_CANONICAL_PHASE,
  D1L_R2_CANONICAL_SCOPE,
  type D1lR1Catalog,
  type D1lR1ClaimInput,
  type D1lR1Evidence,
  createD1lR1Store,
  recordCertificationClaimManifest,
  replaceCertificationEvidence,
} from "./certification-claim-manifest";
import { scanAnalysisFormulaBypass } from "./formula-scan";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import { D1L_CURRENT_STATUS } from "./post-d1j-roadmap";

const scope = { tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a" };
const other = { tenantId: "tenant-a", workspaceId: "workspace-b", projectId: "project-a" };

function evidence(overrides: Partial<D1lR1Evidence> = {}): D1lR1Evidence {
  return {
    ...scope,
    evidenceId: "ev-design",
    slot: "design",
    category: "SOURCE_ENGINEERING_EVIDENCE",
    sourceKind: "calculation",
    revision: "rev-1",
    sourceFingerprint: "fp-design",
    authority: "EVIDENCE_PRODUCER",
    provenanceRef: "prov-design",
    solverQualificationState: null,
    stale: false,
    upstreamDiagnostic: null,
    d1k: null,
    ...overrides,
  };
}

function catalog(extra: Partial<D1lR1Catalog> = {}): D1lR1Catalog {
  return {
    targets: [{ ...scope, kind: "MEMBER", id: "member-1", revision: "rev-1" }],
    designStages: [{ ...scope, designStageId: "detailed-design", revision: "stage-1" }],
    standards: [{
      ...scope,
      profileId: "std-1",
      standardFamily: "steel",
      standardCode: "GOVERNED-STEEL",
      edition: "2016",
      amendment: "A1",
      version: "2016-A1",
      fingerprint: "fp-std",
    }],
    jurisdictions: [{ ...scope, profileId: "jur-1", jurisdictionId: "australia", version: "jur-2024.1", fingerprint: "fp-jur" }],
    consequenceProfiles: [],
    evidence: [
      evidence(),
      evidence({ evidenceId: "ev-analysis", slot: "analysis", sourceFingerprint: "fp-analysis", provenanceRef: "prov-analysis" }),
      evidence({ evidenceId: "ev-review", slot: "engineerReview", category: "ENGINEER_REVIEW_EVIDENCE", sourceKind: "human_input", provenanceRef: "prov-review" }),
      evidence({ evidenceId: "ev-conformance", slot: "conformance", category: "CONFORMANCE_EVIDENCE", provenanceRef: "prov-conf" }),
      evidence({
        evidenceId: "ev-solver",
        slot: "solver",
        category: "SOLVER_QUALIFICATION_EVIDENCE",
        sourceKind: "solver_output",
        solverQualificationState: "NOT_CERTIFIED",
        upstreamDiagnostic: "D1G_CERTIFIED_SOLVER_REQUIRED",
        provenanceRef: "prov-solver",
      }),
      evidence({
        evidenceId: "ev-d1k",
        slot: "crossDiscipline",
        category: "CROSS_DISCIPLINE_EVIDENCE",
        sourceKind: "model",
        stale: true,
        provenanceRef: "prov-d1k",
        d1k: {
          interfaceId: "iface-1",
          sourceRevision: "src-rev-1",
          r1Fingerprint: "fp-r1",
          r2Fingerprint: "fp-r2",
          r3EvidenceId: "r3-1",
          r4EvidenceId: "r4-1",
        },
      }),
      evidence({ ...other, evidenceId: "ev-other", provenanceRef: "prov-other" }),
    ],
    ...extra,
  };
}

function actor(authority = "EVIDENCE_PRODUCER") {
  return { actorId: "eng-1", ...scope, authority };
}

function input(overrides: Partial<D1lR1ClaimInput> = {}): D1lR1ClaimInput {
  return {
    claimId: "claim-1",
    manifestId: "manifest-1",
    claimType: "DESIGN_CHECK_CLAIM",
    claimScope: "CHECK",
    structuralTargetKind: "MEMBER",
    structuralTargetId: "member-1",
    designStageId: "detailed-design",
    standardProfileId: "std-1",
    jurisdictionProfileId: "jur-1",
    consequenceProfileId: null,
    designEvidenceId: "ev-design",
    analysisEvidenceId: "ev-analysis",
    validationEvidenceId: null,
    engineerReviewEvidenceId: "ev-review",
    conformanceEvidenceId: "ev-conformance",
    solverQualificationEvidenceId: "ev-solver",
    crossDisciplineEvidenceId: "ev-d1k",
    authorityEvidenceId: null,
    crossDisciplineDependency: true,
    provenanceRef: "prov-claim",
    ...overrides,
  };
}

describe("EOS-D1L-R1 certification claim and evidence manifest", () => {
  it("records a scoped claim and exact manifest without eligibility or certification", () => {
    const store = createD1lR1Store(catalog(), () => "2026-10-20T00:00:00.000Z");
    const record = recordCertificationClaimManifest(store, actor(), input());
    expect(record.claimId).toBe("claim-1");
    expect(record.claimScope).toBe("CHECK");
    expect(record.claimType).toBe("DESIGN_CHECK_CLAIM");
    expect(STRUCTURAL_OBJECT_KINDS).toContain(record.structuralTargetKind);
    expect(record.structuralTargetRevision).toBe("rev-1");
    expect(record.standardEdition).toBe("2016");
    expect(record.standardVersion).toBe("2016-A1");
    expect(record.jurisdictionVersion).toBe("jur-2024.1");
    expect(record.designEvidence?.revision).toBe("rev-1");
    expect(record.designEvidence?.sourceFingerprint).toBe("fp-design");
    expect(record.analysisEvidence?.evidenceId).toBe("ev-analysis");
    expect(record.crossDisciplineEvidence?.d1k?.interfaceId).toBe("iface-1");
    expect(record.crossDisciplineEvidence?.d1k?.sourceRevision).toBe("src-rev-1");
    expect(record.crossDisciplineEvidence?.stale).toBe(true);
    expect(record.solverQualificationEvidence?.solverQualificationState).toBe("NOT_CERTIFIED");
    expect(record.solverQualificationEvidence?.upstreamDiagnostic).toBe("D1G_CERTIFIED_SOLVER_REQUIRED");
    expect(record.dependencyFingerprints.map((row) => row.evidenceId)).toEqual(["ev-design", "ev-analysis", "ev-review", "ev-conformance", "ev-solver", "ev-d1k"]);
    expect(record.dependencyFingerprint).toBe(fingerprintCanonical(record.dependencyFingerprints));
    expect(record.manifestFingerprint).toBe(fingerprintCanonical({
      claimFingerprint: record.claimFingerprint,
      manifestId: record.manifestId,
      standardFingerprint: record.standardFingerprint,
      jurisdictionFingerprint: record.jurisdictionFingerprint,
      consequence: record.consequenceReliabilityProfile,
      dependencyFingerprints: record.dependencyFingerprints,
      provenanceRef: record.provenanceRef,
      predecessorManifestId: null,
    }));
    expect(record.createdBy).toBe("eng-1");
    expect(record.certificationAuthority).toBeNull();
    expect(record.structurallyValid).toBe(true);
    expect(record.digitalThreadRefs[0]).toBe("member-1");
    expect(record).not.toHaveProperty("certificationEligible");
    expect(record).not.toHaveProperty("certified");
    expect(recordCertificationClaimManifest(store, actor(), input())).toBe(record);
    expect(store.history).toHaveLength(1);
  });

  it("rejects unknown types, floating pins, other workspaces, and promotion attempts", () => {
    const store = createD1lR1Store(catalog(), () => "2026-10-20T00:00:00.000Z");
    expect(() => recordCertificationClaimManifest(store, actor(), input({ claimType: "PROJECT_CERTIFICATION" }))).toThrow("UNSUPPORTED_CLAIM_TYPE");
    expect(() => recordCertificationClaimManifest(store, actor(), input({ claimScope: "GLOBAL" }))).toThrow("CLAIM_SCOPE_REQUIRED");
    expect(() => recordCertificationClaimManifest(store, actor(), input({ globalStructuralCertification: true }))).toThrow("PARTIAL_CLAIM_NOT_GLOBAL");
    expect(() => recordCertificationClaimManifest(store, actor(), input({ designEvidenceId: "ev-other" }))).toThrow("CROSS_PROJECT_OPERATION");
    expect(() => recordCertificationClaimManifest(store, actor(), input({ designEvidenceId: "latest" }))).toThrow("FLOATING_EVIDENCE_REJECTED");
    expect(() => recordCertificationClaimManifest(store, actor(), input({ crossDisciplineEvidenceId: "latest analysis" }))).toThrow("FLOATING_EVIDENCE_REJECTED");
    const floatingStandard = catalog();
    floatingStandard.standards[0] = { ...floatingStandard.standards[0]!, edition: "latest" };
    expect(() => recordCertificationClaimManifest(createD1lR1Store(floatingStandard, () => "t"), actor(), input())).toThrow("FLOATING_STANDARD_REJECTED");
    const floatingJurisdiction = catalog();
    floatingJurisdiction.jurisdictions[0] = { ...floatingJurisdiction.jurisdictions[0]!, version: "current jurisdiction rules" };
    expect(() => recordCertificationClaimManifest(createD1lR1Store(floatingJurisdiction, () => "t"), actor(), input())).toThrow("FLOATING_JURISDICTION_REJECTED");
    const floatingD1k = catalog();
    const d1k = floatingD1k.evidence.find((row) => row.evidenceId === "ev-d1k");
    d1k!.d1k = { ...d1k!.d1k!, interfaceId: "latest interface" };
    expect(() => recordCertificationClaimManifest(createD1lR1Store(floatingD1k, () => "t"), actor(), input())).toThrow("FLOATING_D1K_EVIDENCE_REJECTED");
    expect(() => recordCertificationClaimManifest(store, actor(), input({ inferJurisdiction: true }))).toThrow("JURISDICTION_INFERENCE_REJECTED");
    expect(() => recordCertificationClaimManifest(store, actor(), input({ promoteSolverToCertified: true }))).toThrow("SOLVER_EVIDENCE_PROMOTION_REJECTED");
    expect(() => recordCertificationClaimManifest(store, actor(), input({ clearBlockers: true }))).toThrow("BLOCKER_CLEARANCE_REJECTED");
    expect(() => recordCertificationClaimManifest(store, actor(), input({ certified: true }))).toThrow("CERTIFICATION_STATUS_REJECTED");
    expect(() => recordCertificationClaimManifest(store, actor(), input({ eligible: true }))).toThrow("CERTIFICATION_STATUS_REJECTED");
    expect(() => recordCertificationClaimManifest(store, { ...actor(), authority: "ADMINISTRATOR" }, input())).toThrow("UNAUTHORIZED");
    expect(() => recordCertificationClaimManifest(store, { ...actor(), authority: "AI_ASSISTANT" }, input())).toThrow("UNAUTHORIZED");
    expect(() => recordCertificationClaimManifest(store, { ...actor(), authority: "CERTIFICATION_AUTHORITY" }, input())).toThrow("UNAUTHORIZED");
    expect(() => replaceCertificationEvidence()).toThrow("SILENT_EVIDENCE_REPOINTING_REJECTED");
  });

  it("preserves history and changes the claim fingerprint when scope changes", () => {
    const store = createD1lR1Store(catalog(), () => "2026-10-20T00:00:00.000Z");
    const first = recordCertificationClaimManifest(store, actor(), input({ crossDisciplineDependency: false, crossDisciplineEvidenceId: null }));
    const second = recordCertificationClaimManifest(store, actor(), input({
      claimId: "claim-2",
      manifestId: "manifest-2",
      claimScope: "MEMBER",
      predecessorManifestId: first.manifestId,
      crossDisciplineDependency: false,
      crossDisciplineEvidenceId: null,
    }));
    expect(second.claimFingerprint).not.toBe(first.claimFingerprint);
    expect(first.recordStatus).toBe("SUPERSEDED");
    expect(first.designEvidence?.evidenceId).toBe("ev-design");
    expect(store.history.map((row) => row.action)).toEqual(["RECORDED", "SUPERSEDED", "RECORDED"]);
    expect(second.predecessorManifestId).toBe(first.manifestId);
    expect(D1L_R1_PARTIAL_CLAIM_EQUALS_GLOBAL_CERTIFICATION_CLAIM).toBe(false);
    expect(D1L_R1_DESIGN_EVIDENCE_RECORDED_EQUALS_DESIGN_VALIDATED).toBe(false);
    expect(D1L_R1_MANIFEST_VALID_EQUALS_CERTIFICATION_ELIGIBLE).toBe(false);
    expect(D1L_R1_MANIFEST_RECORDED_EQUALS_ELIGIBLE).toBe(false);
    expect(D1L_R1_MANIFEST_RECORDED_EQUALS_CERTIFIED).toBe(false);
    expect(D1L_R1_CLAIM_RECORDED_EQUALS_ELIGIBLE).toBe(false);
    expect(D1L_R1_CLAIM_RECORDED_EQUALS_CERTIFIED).toBe(false);
    expect(D1L_R1_CONFORMANCE_PRESENT_EQUALS_CERTIFICATION_ELIGIBLE).toBe(false);
    expect(D1L_R1_SOLVER_EVIDENCE_AUTO_PROMOTED).toBe(false);
    expect(D1L_R1_D1G_CERTIFICATION_BLOCKER_PRESERVED).toBe(true);
    expect(D1L_R1_D1G_BLOCKER_EVALUATION_RUNTIME_COUNT).toBe(0);
    expect(D1L_R1_CERTIFICATION_ELIGIBILITY_RUNTIME_COUNT).toBe(0);
    expect(D1L_R1_CERTIFICATION_BLOCKER_EVALUATION_RUNTIME_COUNT).toBe(0);
    expect(D1L_R1_CERTIFICATION_DECISION_RUNTIME_COUNT).toBe(0);
    expect(D1L_R1_CERTIFICATION_ISSUANCE_RUNTIME_COUNT).toBe(0);
    expect(D1L_R1_CERTIFICATION_RUNTIME_READY).toBe(false);
    expect(D1L_R1_CERTIFICATION_AUTHORITY_READY).toBe(false);
    expect(D1L_R1_ADMIN_EQUALS_CERTIFICATION_AUTHORITY).toBe(false);
    expect(D1L_R1_AI_EQUALS_CERTIFICATION_AUTHORITY).toBe(false);
    expect(D1L_R1_AI_CAN_INVENT_CERTIFICATION_EVIDENCE).toBe(false);
    expect(D1L_R1_AI_CAN_MARK_CERTIFIED).toBe(false);
    expect(D1L_R1_AI_CAN_CLEAR_CERTIFICATION_BLOCKER).toBe(false);
    expect(D1L_R1_MANIFEST_CREATOR_EQUALS_CERTIFICATION_AUTHORITY).toBe(false);
    expect(D1L_R1_D1A_STRUCTURAL_IDENTITY_REUSED).toBe(true);
    expect(D1L_R1_PARALLEL_CROSS_DISCIPLINE_INTERFACE_CREATED).toBe(false);
    expect(D1L_R1_PARALLEL_EVIDENCE_SYSTEM_CREATED).toBe(false);
    expect(D1L_R1_PARALLEL_DIGITAL_THREAD_CREATED).toBe(false);
    expect(D1L_R1_SECOND_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(D1L_R1_NEW_SOLVER_RUNTIME_COUNT).toBe(0);
    expect(D1L_R1_NEW_ENGINEERING_FORMULA_COUNT).toBe(0);
    expect(D1L_R1_D2_D8_RUNTIME_COUNT).toBe(0);
    expect(D1L_R1_D9_RUNTIME_COUNT).toBe(0);
    expect(D1L_R1_GLOBAL_CYCLE_DETECTION_RUNTIME_COUNT).toBe(0);
    expect(D1L_R1_D1M_ABSORBED).toBe(false);
    expect(D1L_R1_D1N_ABSORBED).toBe(false);
    expect(D1L_R1_DATABASE_SCHEMA_CHANGED).toBe(false);
    expect(D1L_R1_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(D1L_CURRENT_STATUS).toBe("NOT_STARTED");
    expect(D1L_R1_STATUS).toBe("CERTIFICATION_CLAIM_MANIFEST_FOUNDATION_IMPLEMENTED");
    expect(D1L_R2_CANONICAL_PHASE).toBe("EOS-D1L-R2-ELIGIBILITY-BLOCKER-EVALUATION");
    expect(D1L_R2_CANONICAL_SCOPE).toContain("Do not issue certification");
    const here = dirname(fileURLToPath(import.meta.url));
    const source = readFileSync(join(here, "certification-claim-manifest.ts"), "utf8");
    const doc = readFileSync(join(here, "../../../../docs/architecture/engineering-os/EOS_D1L_R1_CERTIFICATION_CLAIM_EVIDENCE_MANIFEST_FOUNDATION_CLOSEOUT.md"), "utf8");
    expect(scanAnalysisFormulaBypass(join(here, "certification-claim-manifest.ts"), source)).toEqual([]);
    expect(doc.includes("```")).toBe(false);
    expect(source.includes("evaluateCertification")).toBe(false);
    const row = STRUCTURAL_CAPABILITY_MANIFEST.find((item) => item.capabilityId === "D1L.R1.CERTIFICATION_CLAIM_EVIDENCE_MANIFEST");
    expect(row?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(row?.validationState).toBe("NOT_VALIDATED");
  });
});
