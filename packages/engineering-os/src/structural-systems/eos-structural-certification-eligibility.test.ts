import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import {
  type D1lR1Catalog,
  type D1lR1ClaimInput,
  type D1lR1Evidence,
  createD1lR1Store,
  recordCertificationClaimManifest,
} from "./certification-claim-manifest";
import {
  D1L_R2_ADMIN_CAN_OVERRIDE_HARD_BLOCKER,
  D1L_R2_AI_CAN_MARK_CERTIFIED,
  D1L_R2_AI_CAN_WAIVE_HARD_BLOCKER,
  D1L_R2_AI_IS_GOVERNING_ELIGIBILITY_ENGINE,
  D1L_R2_CAN_MUTATE_R1_MANIFEST,
  D1L_R2_CERTIFICATION_ELIGIBILITY_SATISFIED,
  D1L_R2_CERTIFICATION_RUNTIME_READY,
  D1L_R2_CLAIM_ELIGIBLE_EQUALS_CERTIFIED,
  D1L_R2_CONFIDENCE_SCORE_IMPLEMENTED,
  D1L_R2_DECISION_RUNTIME_COUNT,
  D1L_R2_DETERMINISTIC_ENGINE_CAN_MARK_CLAIM_ELIGIBLE,
  D1L_R2_D1M_ABSORBED,
  D1L_R2_D1N_ABSORBED,
  D1L_R2_D2_D8_RUNTIME_COUNT,
  D1L_R2_D9_RUNTIME_COUNT,
  D1L_R2_ELIGIBILITY_MODEL_READY,
  D1L_R2_GENERIC_OVERRIDE_IMPLEMENTED,
  D1L_R2_GLOBAL_CYCLE_DETECTION_RUNTIME_COUNT,
  D1L_R2_GLOBAL_DEPENDENCY_REASONING_IMPLEMENTED,
  D1L_R2_GLOBAL_PACK_ELIGIBILITY_FROM_SINGLE_CLAIM,
  D1L_R2_HARD_BLOCKER_CAN_BE_OFFSET,
  D1L_R2_ISSUANCE_RUNTIME_COUNT,
  D1L_R2_NEW_CONFORMANCE_RUNTIME_COUNT,
  D1L_R2_NEW_ENGINEER_VALIDATION_RUNTIME_COUNT,
  D1L_R2_NEW_ENGINEERING_FORMULA_COUNT,
  D1L_R2_NEW_SOLVER_CERTIFICATION_RUNTIME_COUNT,
  D1L_R2_NEW_SOLVER_RUNTIME_COUNT,
  D1L_R2_REQUIREMENT_SET_ID,
  D1L_R2_REQUIREMENT_SET_VERSION,
  D1L_R2_REVOCATION_RUNTIME_COUNT,
  D1L_R2_STATUS,
  D1L_R2_STRUCTURAL_PACK_COMPLETE,
  D1L_R2_WEIGHTED_SCORE_IMPLEMENTED,
  D1L_R3_CANONICAL_PHASE,
  D1L_R3_CANONICAL_SCOPE,
  type D1lR2LedgerRow,
  createD1lR2Store,
  evaluateCertificationEligibility,
  resolveCertificationRequirements,
} from "./certification-eligibility";
import { scanAnalysisFormulaBypass } from "./formula-scan";

const scope = { tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a" };

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

function catalog(rows: D1lR1Evidence[] = []): D1lR1Catalog {
  return {
    targets: [{ ...scope, kind: "MEMBER", id: "member-1", revision: "rev-1" }],
    designStages: [{ ...scope, designStageId: "detailed-design", revision: "stage-1" }],
    standards: [{ ...scope, profileId: "std-1", standardFamily: "steel", standardCode: "GOVERNED-STEEL", edition: "2016", amendment: "A1", version: "2016-A1", fingerprint: "fp-std" }],
    jurisdictions: [{ ...scope, profileId: "jur-1", jurisdictionId: "australia", version: "jur-2024.1", fingerprint: "fp-jur" }],
    consequenceProfiles: [],
    evidence: [
      evidence(),
      evidence({ evidenceId: "ev-analysis", slot: "analysis", sourceFingerprint: "fp-analysis", provenanceRef: "prov-analysis" }),
      evidence({ evidenceId: "ev-validation", slot: "validation", category: "VALIDATION_EVIDENCE", sourceFingerprint: "fp-validation", provenanceRef: "prov-validation" }),
      evidence({ evidenceId: "ev-review", slot: "engineerReview", category: "ENGINEER_REVIEW_EVIDENCE", sourceKind: "human_input", sourceFingerprint: "fp-review", provenanceRef: "prov-review" }),
      evidence({ evidenceId: "ev-conformance", slot: "conformance", category: "CONFORMANCE_EVIDENCE", sourceFingerprint: "fp-conformance", provenanceRef: "prov-conf" }),
      evidence({ evidenceId: "ev-solver", slot: "solver", category: "SOLVER_QUALIFICATION_EVIDENCE", sourceKind: "solver_output", sourceFingerprint: "fp-solver", solverQualificationState: "NOT_CERTIFIED", upstreamDiagnostic: "D1G_CERTIFIED_SOLVER_REQUIRED", provenanceRef: "prov-solver" }),
      evidence({
        evidenceId: "ev-d1k",
        slot: "crossDiscipline",
        category: "CROSS_DISCIPLINE_EVIDENCE",
        sourceKind: "model",
        sourceFingerprint: "fp-d1k",
        provenanceRef: "prov-d1k",
        d1k: { interfaceId: "iface-1", sourceRevision: "src-rev-1", r1Fingerprint: "fp-r1", r2Fingerprint: "fp-r2", r3EvidenceId: "r3-1", r4EvidenceId: "r4-1" },
      }),
      ...rows,
    ],
  };
}

function claim(overrides: Partial<D1lR1ClaimInput> = {}): D1lR1ClaimInput {
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
    analysisEvidenceId: null,
    validationEvidenceId: "ev-validation",
    engineerReviewEvidenceId: "ev-review",
    conformanceEvidenceId: "ev-conformance",
    solverQualificationEvidenceId: null,
    crossDisciplineEvidenceId: null,
    authorityEvidenceId: null,
    crossDisciplineDependency: false,
    provenanceRef: "prov-claim",
    ...overrides,
  };
}

function row(evidenceId: string, sourceFingerprint: string, overrides: Partial<D1lR2LedgerRow> = {}): D1lR2LedgerRow {
  return { evidenceId, revision: "rev-1", sourceFingerprint, authority: "EVIDENCE_PRODUCER", ...overrides };
}

function satisfiedLedger(): D1lR2LedgerRow[] {
  return [
    row("ev-design", "fp-design"),
    row("ev-validation", "fp-validation", { validationState: "SATISFIED" }),
    row("ev-review", "fp-review", { authority: "ENGINEER_REVIEWER", reviewState: "SATISFIED" }),
    row("ev-conformance", "fp-conformance", { authority: "CONFORMANCE_AUTHORITY", conformanceState: "SATISFIED" }),
  ];
}

function actor(authority = "EVIDENCE_PRODUCER") {
  return { actorId: "eng-1", ...scope, authority };
}

function evaluate(overrides: Partial<D1lR1ClaimInput> = {}, ledger = satisfiedLedger(), inputOverrides = {}) {
  const claims = createD1lR1Store(catalog(), () => "2026-10-20T00:00:00.000Z");
  const manifest = recordCertificationClaimManifest(claims, actor(), claim(overrides));
  const results = createD1lR2Store(() => "2026-10-20T00:00:00.000Z");
  const result = evaluateCertificationEligibility(claims, results, actor(), {
    claimId: manifest.claimId,
    manifestId: manifest.manifestId,
    expectedManifestFingerprint: manifest.manifestFingerprint,
    ledger,
    ...inputOverrides,
  });
  return { claims, manifest, results, result };
}

describe("EOS-D1L-R2 eligibility and blocker evaluation", () => {
  it("marks one satisfied design-check claim eligible without certifying it", () => {
    const { manifest, result, results } = evaluate();
    expect(result.eligibilityState).toBe("ELIGIBLE");
    expect(result.hardBlockers).toEqual([]);
    expect(result.advisories.map((item) => item.severity)).toEqual(["ADVISORY", "ADVISORY"]);
    expect(result.requirementSetIdentity).toBe(D1L_R2_REQUIREMENT_SET_ID);
    expect(result.requirementSetVersion).toBe(D1L_R2_REQUIREMENT_SET_VERSION);
    expect(result.manifestFingerprint).toBe(manifest.manifestFingerprint);
    expect(result.producer).toBe("D1L_R2_DETERMINISTIC_EVALUATOR");
    expect(result.certificationAuthority).toBeNull();
    expect(result).not.toHaveProperty("certified");
    expect(result).not.toHaveProperty("score");
    expect(D1L_R2_CLAIM_ELIGIBLE_EQUALS_CERTIFIED).toBe(false);
    expect(D1L_R2_CERTIFICATION_ELIGIBILITY_SATISFIED).toBe(false);
    expect(D1L_R2_GLOBAL_PACK_ELIGIBILITY_FROM_SINGLE_CLAIM).toBe(false);
    expect(evaluateCertificationEligibility(evaluate().claims, results, actor(), {
      claimId: manifest.claimId,
      manifestId: manifest.manifestId,
      expectedManifestFingerprint: manifest.manifestFingerprint,
      ledger: satisfiedLedger(),
    })).toBe(result);
  });

  it("blocks missing, stale, invalid, review, conformance, and authority defects", () => {
    expect(evaluate({ designEvidenceId: null }).result.hardBlockers.some((item) => item.code === "MISSING_EVIDENCE")).toBe(true);
    expect(evaluate({ validationEvidenceId: null }).result.hardBlockers.some((item) => item.code === "MISSING_VALIDATION")).toBe(true);
    const failedValidation = evaluate({}, satisfiedLedger().map((item) => item.evidenceId === "ev-validation" ? { ...item, validationState: "FAILED" } : item));
    expect(failedValidation.result.hardBlockers.some((item) => item.code === "FAILED_VALIDATION")).toBe(true);
    expect(evaluate({ designEvidenceId: null }).result.eligibilityState).toBe("BLOCKED");
    const staleDesign = catalog([evidence({ evidenceId: "ev-stale", sourceFingerprint: "fp-stale", stale: true })]);
    const staleClaims = createD1lR1Store(staleDesign, () => "t");
    const staleManifest = recordCertificationClaimManifest(staleClaims, actor(), claim({ designEvidenceId: "ev-stale" }));
    const staleResult = evaluateCertificationEligibility(staleClaims, createD1lR2Store(() => "t"), actor(), {
      claimId: staleManifest.claimId,
      manifestId: staleManifest.manifestId,
      expectedManifestFingerprint: staleManifest.manifestFingerprint,
      ledger: satisfiedLedger().concat(row("ev-stale", "fp-stale")),
    });
    expect(staleResult.hardBlockers.some((item) => item.code === "STALE_EVIDENCE")).toBe(true);
    const tampered = evaluate({}, satisfiedLedger().map((item) => item.evidenceId === "ev-design" ? { ...item, sourceFingerprint: "tampered" } : item));
    expect(tampered.result.eligibilityState).toBe("STALE");
    expect(tampered.result.hardBlockers.some((item) => item.code === "INVALID_EVIDENCE")).toBe(true);
    expect(tampered.manifest.designEvidence?.sourceFingerprint).toBe("fp-design");
    const pendingReview = evaluate({}, satisfiedLedger().map((item) => item.evidenceId === "ev-review" ? { ...item, reviewState: "PENDING" } : item));
    expect(pendingReview.result.eligibilityState).toBe("PENDING");
    expect(pendingReview.result.pendingConditions.some((item) => item.code === "PENDING_ENGINEER_REVIEW")).toBe(true);
    const failedReview = evaluate({}, satisfiedLedger().map((item) => item.evidenceId === "ev-review" ? { ...item, authority: "ENGINEER_REVIEWER", reviewState: "FAILED" } : item));
    expect(failedReview.result.hardBlockers.some((item) => item.code === "FAILED_ENGINEER_REVIEW")).toBe(true);
    expect(evaluate({ conformanceEvidenceId: null }).result.hardBlockers.some((item) => item.code === "MISSING_CONFORMANCE")).toBe(true);
    const failedConformance = evaluate({}, satisfiedLedger().map((item) => item.evidenceId === "ev-conformance" ? { ...item, authority: "CONFORMANCE_AUTHORITY", conformanceState: "FAILED" } : item));
    expect(failedConformance.result.hardBlockers.some((item) => item.code === "FAILED_CONFORMANCE")).toBe(true);
    const weakAuthority = evaluate({}, satisfiedLedger().map((item) => item.evidenceId === "ev-review" ? { ...item, authority: "ADMINISTRATOR", reviewState: "SATISFIED" } : item));
    expect(weakAuthority.result.eligibilityState).not.toBe("ELIGIBLE");
  });

  it("applies D1G, C10, D1F, D1H, D1I, and D1J blockers only to the dependent claim", () => {
    const design = evaluate();
    expect(design.result.hardBlockers.some((item) => item.requirementId.startsWith("D1G_"))).toBe(false);
    const analysis = evaluate({
      claimType: "ANALYSIS_RESULT_CLAIM",
      designEvidenceId: null,
      analysisEvidenceId: "ev-analysis",
      solverQualificationEvidenceId: "ev-solver",
    }, satisfiedLedger().concat(row("ev-analysis", "fp-analysis"), row("ev-solver", "fp-solver")));
    expect(analysis.result.eligibilityState).toBe("BLOCKED");
    expect(analysis.result.hardBlockers.map((item) => item.requirementId)).toEqual(expect.arrayContaining(["D1G_LIVE_VALIDATION", "D1G_ENGINEER_VALIDATION", "D1G_CONFORMANCE", "D1G_CERTIFIED_SOLVER"]));
    const c10 = catalog([evidence({ evidenceId: "ev-c10", upstreamDiagnostic: "C10_REVIEW_PENDING", sourceFingerprint: "fp-c10" })]);
    const c10Claims = createD1lR1Store(c10, () => "t");
    const c10Manifest = recordCertificationClaimManifest(c10Claims, actor(), claim({ designEvidenceId: "ev-c10" }));
    const c10Result = evaluateCertificationEligibility(c10Claims, createD1lR2Store(() => "t"), actor(), {
      claimId: c10Manifest.claimId,
      manifestId: c10Manifest.manifestId,
      expectedManifestFingerprint: c10Manifest.manifestFingerprint,
      ledger: satisfiedLedger().concat(row("ev-c10", "fp-c10")),
    });
    expect(c10Result.hardBlockers.some((item) => item.requirementId === "C10_REVIEW")).toBe(true);
    expect(design.result.hardBlockers.some((item) => item.requirementId === "C10_REVIEW")).toBe(false);
    const system = catalog([evidence({ evidenceId: "ev-system", upstreamDiagnostic: "D1F_ORCHESTRATOR_REVIEW_PENDING", sourceFingerprint: "fp-system" })]);
    const systemClaims = createD1lR1Store(system, () => "t");
    const systemManifest = recordCertificationClaimManifest(systemClaims, actor(), claim({ claimScope: "STRUCTURAL_SYSTEM", designEvidenceId: "ev-system" }));
    const systemResult = evaluateCertificationEligibility(systemClaims, createD1lR2Store(() => "t"), actor(), {
      claimId: systemManifest.claimId,
      manifestId: systemManifest.manifestId,
      expectedManifestFingerprint: systemManifest.manifestFingerprint,
      ledger: satisfiedLedger().concat(row("ev-system", "fp-system")),
    });
    expect(systemResult.hardBlockers.some((item) => item.requirementId === "D1F_ORCHESTRATOR_REVIEW")).toBe(true);
    const checkScope = recordCertificationClaimManifest(createD1lR1Store(system, () => "t"), actor(), claim({ claimId: "claim-check", manifestId: "manifest-check", designEvidenceId: "ev-system" }));
    expect(resolveCertificationRequirements(checkScope)).not.toContain("D1F_ORCHESTRATOR_REVIEW");
    for (const [diagnostic, requirementId] of [
      ["D1H_ENGINEER_VALIDATION_PENDING", "D1H_ENGINEER_VALIDATION"],
      ["D1I_ENGINEER_VALIDATION_PENDING", "D1I_ENGINEER_VALIDATION"],
      ["D1I_CONFORMANCE_PENDING", "D1I_CONFORMANCE"],
    ] as const) {
      const rows = catalog([evidence({ evidenceId: "ev-debt", upstreamDiagnostic: diagnostic, sourceFingerprint: "fp-debt" })]);
      const claims = createD1lR1Store(rows, () => "t");
      const manifest = recordCertificationClaimManifest(claims, actor(), claim({ designEvidenceId: "ev-debt" }));
      const result = evaluateCertificationEligibility(claims, createD1lR2Store(() => "t"), actor(), {
        claimId: manifest.claimId,
        manifestId: manifest.manifestId,
        expectedManifestFingerprint: manifest.manifestFingerprint,
        ledger: satisfiedLedger().concat(row("ev-debt", "fp-debt")),
      });
      expect(result.hardBlockers.some((item) => item.requirementId === requirementId)).toBe(true);
    }
    const study = evaluate({ claimType: "OPTIMIZATION_STUDY_EVIDENCE_CLAIM", validationEvidenceId: null, engineerReviewEvidenceId: null, conformanceEvidenceId: null });
    expect(study.result.hardBlockers.map((item) => item.requirementId)).toEqual(expect.arrayContaining(["D1J_ENGINEER_VALIDATION", "D1J_CONFORMANCE"]));
    expect(study.result.hardBlockers.some((item) => item.requirementId === "D1J_PARAMETER_SEMANTICS")).toBe(false);
    const semantics = catalog([evidence({ evidenceId: "ev-param", upstreamDiagnostic: "PARAMETER_SEMANTICS_NOT_AVAILABLE", sourceFingerprint: "fp-param" })]);
    const semanticsClaims = createD1lR1Store(semantics, () => "t");
    const semanticsManifest = recordCertificationClaimManifest(semanticsClaims, actor(), claim({ claimType: "OPTIMIZATION_STUDY_EVIDENCE_CLAIM", designEvidenceId: "ev-param", validationEvidenceId: null, engineerReviewEvidenceId: null, conformanceEvidenceId: null }));
    const semanticsResult = evaluateCertificationEligibility(semanticsClaims, createD1lR2Store(() => "t"), actor(), {
      claimId: semanticsManifest.claimId,
      manifestId: semanticsManifest.manifestId,
      expectedManifestFingerprint: semanticsManifest.manifestFingerprint,
      ledger: [row("ev-param", "fp-param")],
    });
    expect(semanticsResult.hardBlockers.some((item) => item.code === "UNRESOLVED_PARAMETER_SEMANTICS")).toBe(true);
  });

  it("treats D1K defects conservatively and keeps the R1 manifest unchanged", () => {
    const d1kLedger = satisfiedLedger().concat(row("ev-d1k", "fp-d1k", { d1kCompatibility: "INDETERMINATE", d1kConflict: "NONE", d1kDispositionRecorded: true }));
    const indeterminate = evaluate({ crossDisciplineDependency: true, crossDisciplineEvidenceId: "ev-d1k" }, d1kLedger);
    expect(indeterminate.result.eligibilityState).toBe("INDETERMINATE");
    expect(indeterminate.result.certificationAuthority).toBeNull();
    const conflict = evaluate({ crossDisciplineDependency: true, crossDisciplineEvidenceId: "ev-d1k" }, satisfiedLedger().concat(row("ev-d1k", "fp-d1k", { d1kCompatibility: "MATCHING", d1kConflict: "UNRESOLVED" })));
    expect(conflict.result.hardBlockers.some((item) => item.code === "UNRESOLVED_D1K_INTERFACE")).toBe(true);
    const incompatible = evaluate({ crossDisciplineDependency: true, crossDisciplineEvidenceId: "ev-d1k" }, satisfiedLedger().concat(row("ev-d1k", "fp-d1k", { d1kCompatibility: "INCOMPATIBLE", d1kConflict: "NONE" })));
    expect(incompatible.result.hardBlockers.some((item) => item.code === "INCOMPATIBLE_D1K_INTERFACE")).toBe(true);
    const staleRows = catalog();
    const staleEvidence = staleRows.evidence.find((item) => item.evidenceId === "ev-d1k");
    staleEvidence!.stale = true;
    const staleClaims = createD1lR1Store(staleRows, () => "t");
    const staleManifest = recordCertificationClaimManifest(staleClaims, actor(), claim({ crossDisciplineDependency: true, crossDisciplineEvidenceId: "ev-d1k" }));
    const staleResult = evaluateCertificationEligibility(staleClaims, createD1lR2Store(() => "t"), actor(), {
      claimId: staleManifest.claimId,
      manifestId: staleManifest.manifestId,
      expectedManifestFingerprint: staleManifest.manifestFingerprint,
      ledger: satisfiedLedger().concat(row("ev-d1k", "fp-d1k", { d1kCompatibility: "MATCHING", d1kConflict: "NONE" })),
    });
    expect(staleResult.hardBlockers.some((item) => item.code === "STALE_D1K_INTERFACE")).toBe(true);
    expect(staleManifest.crossDisciplineEvidence?.d1k?.interfaceId).toBe("iface-1");
  });

  it("rejects bypasses and preserves history, provenance, and boundaries", () => {
    const first = evaluate();
    const snapshot = JSON.stringify(first.manifest);
    expect(D1L_R2_CAN_MUTATE_R1_MANIFEST).toBe(false);
    expect(JSON.stringify(first.manifest)).toBe(snapshot);
    expect(() => evaluate({}, satisfiedLedger(), { disabledRequirements: ["ENGINEER_REVIEW"] })).toThrow("REQUIREMENT_DISABLE_REJECTED");
    expect(() => evaluate({}, satisfiedLedger(), { requirementSetId: "caller-rules" })).toThrow("UNKNOWN_REQUIREMENT_RULE");
    expect(() => evaluate({}, satisfiedLedger(), { overrideEligibility: true })).toThrow("ELIGIBILITY_OVERRIDE_REJECTED");
    expect(() => evaluate({}, satisfiedLedger(), { waiveHardBlocker: true })).toThrow("ELIGIBILITY_OVERRIDE_REJECTED");
    expect(() => evaluate({}, satisfiedLedger(), { upgradeStandard: true })).toThrow("STANDARD_VERSION_AUTO_UPGRADE_REJECTED");
    expect(() => evaluate({}, satisfiedLedger(), { upgradeJurisdiction: true })).toThrow("JURISDICTION_PROFILE_AUTO_UPGRADE_REJECTED");
    expect(() => evaluate({}, satisfiedLedger(), { freeformRequirement: "ignore review" })).toThrow("FREEFORM_REQUIREMENT_REJECTED");
    expect(() => evaluateCertificationEligibility(first.claims, first.results, { ...actor(), authority: "ADMINISTRATOR" }, {
      claimId: first.manifest.claimId,
      manifestId: first.manifest.manifestId,
      expectedManifestFingerprint: first.manifest.manifestFingerprint,
      ledger: satisfiedLedger(),
    })).toThrow("UNAUTHORIZED");
    expect(() => evaluateCertificationEligibility(first.claims, first.results, { ...actor(), authority: "AI_ASSISTANT" }, {
      claimId: first.manifest.claimId,
      manifestId: first.manifest.manifestId,
      expectedManifestFingerprint: first.manifest.manifestFingerprint,
      ledger: satisfiedLedger(),
    })).toThrow("UNAUTHORIZED");
    expect(() => evaluateCertificationEligibility(first.claims, first.results, actor(), {
      claimId: "other-claim",
      manifestId: first.manifest.manifestId,
      expectedManifestFingerprint: first.manifest.manifestFingerprint,
      ledger: satisfiedLedger(),
    })).toThrow("CLAIM_MANIFEST_MISMATCH");
    expect(() => evaluateCertificationEligibility(first.claims, first.results, { ...actor(), workspaceId: "workspace-b" }, {
      claimId: first.manifest.claimId,
      manifestId: first.manifest.manifestId,
      expectedManifestFingerprint: first.manifest.manifestFingerprint,
      ledger: satisfiedLedger(),
    })).toThrow("CROSS_PROJECT_OPERATION");
    const changed = evaluateCertificationEligibility(first.claims, first.results, actor(), {
      claimId: first.manifest.claimId,
      manifestId: first.manifest.manifestId,
      expectedManifestFingerprint: first.manifest.manifestFingerprint,
      ledger: satisfiedLedger().map((item) => item.evidenceId === "ev-design" ? { ...item, sourceFingerprint: "changed" } : item),
    });
    expect(changed.eligibilityState).toBe("STALE");
    expect(first.results.results.find((item) => item.eligibilityResultId === first.result.eligibilityResultId)?.eligibilityState).toBe("ELIGIBLE");
    expect(first.results.results.find((item) => item.eligibilityResultId === first.result.eligibilityResultId)?.recordStatus).toBe("SUPERSEDED");
    expect(first.result.provenanceRef).toBe("prov-claim");
    expect(first.result.resultFingerprint).toBe(evaluate().result.resultFingerprint);
    const pinned = evaluate();
    pinned.manifest.standardVersion = "latest";
    const standardBlocked = evaluateCertificationEligibility(pinned.claims, createD1lR2Store(() => "t"), actor(), {
      claimId: pinned.manifest.claimId,
      manifestId: pinned.manifest.manifestId,
      expectedManifestFingerprint: pinned.manifest.manifestFingerprint,
      ledger: satisfiedLedger(),
    });
    expect(standardBlocked.hardBlockers.some((item) => item.code === "MISSING_STANDARDS_PROFILE")).toBe(true);
    expect(standardBlocked.manifestFingerprint).toBe(pinned.manifest.manifestFingerprint);
    pinned.manifest.standardVersion = "2016-A1";
    pinned.manifest.jurisdictionVersion = "current";
    const jurisdictionBlocked = evaluateCertificationEligibility(pinned.claims, createD1lR2Store(() => "t"), actor(), {
      claimId: pinned.manifest.claimId,
      manifestId: pinned.manifest.manifestId,
      expectedManifestFingerprint: pinned.manifest.manifestFingerprint,
      ledger: satisfiedLedger(),
    });
    expect(jurisdictionBlocked.hardBlockers.some((item) => item.code === "MISSING_JURISDICTION_PROFILE")).toBe(true);
    const consequenceRows = catalog([evidence({ evidenceId: "ev-class", upstreamDiagnostic: "CONSEQUENCE_PROFILE_REQUIRED", sourceFingerprint: "fp-class" })]);
    const consequenceClaims = createD1lR1Store(consequenceRows, () => "t");
    const consequenceManifest = recordCertificationClaimManifest(consequenceClaims, actor(), claim({ designEvidenceId: "ev-class" }));
    const consequenceResult = evaluateCertificationEligibility(consequenceClaims, createD1lR2Store(() => "t"), actor(), {
      claimId: consequenceManifest.claimId,
      manifestId: consequenceManifest.manifestId,
      expectedManifestFingerprint: consequenceManifest.manifestFingerprint,
      ledger: satisfiedLedger().concat(row("ev-class", "fp-class")),
    });
    expect(consequenceResult.hardBlockers.some((item) => item.code === "MISSING_CONSEQUENCE_PROFILE")).toBe(true);
    expect(D1L_R2_HARD_BLOCKER_CAN_BE_OFFSET).toBe(false);
    expect(D1L_R2_WEIGHTED_SCORE_IMPLEMENTED).toBe(false);
    expect(D1L_R2_CONFIDENCE_SCORE_IMPLEMENTED).toBe(false);
    expect(D1L_R2_DETERMINISTIC_ENGINE_CAN_MARK_CLAIM_ELIGIBLE).toBe(true);
    expect(D1L_R2_AI_IS_GOVERNING_ELIGIBILITY_ENGINE).toBe(false);
    expect(D1L_R2_AI_CAN_WAIVE_HARD_BLOCKER).toBe(false);
    expect(D1L_R2_AI_CAN_MARK_CERTIFIED).toBe(false);
    expect(D1L_R2_ADMIN_CAN_OVERRIDE_HARD_BLOCKER).toBe(false);
    expect(D1L_R2_GENERIC_OVERRIDE_IMPLEMENTED).toBe(false);
    expect(D1L_R2_DECISION_RUNTIME_COUNT).toBe(0);
    expect(D1L_R2_ISSUANCE_RUNTIME_COUNT).toBe(0);
    expect(D1L_R2_REVOCATION_RUNTIME_COUNT).toBe(0);
    expect(D1L_R2_NEW_CONFORMANCE_RUNTIME_COUNT).toBe(0);
    expect(D1L_R2_NEW_ENGINEER_VALIDATION_RUNTIME_COUNT).toBe(0);
    expect(D1L_R2_NEW_SOLVER_CERTIFICATION_RUNTIME_COUNT).toBe(0);
    expect(D1L_R2_NEW_SOLVER_RUNTIME_COUNT).toBe(0);
    expect(D1L_R2_NEW_ENGINEERING_FORMULA_COUNT).toBe(0);
    expect(D1L_R2_D2_D8_RUNTIME_COUNT).toBe(0);
    expect(D1L_R2_D9_RUNTIME_COUNT).toBe(0);
    expect(D1L_R2_GLOBAL_CYCLE_DETECTION_RUNTIME_COUNT).toBe(0);
    expect(D1L_R2_GLOBAL_DEPENDENCY_REASONING_IMPLEMENTED).toBe(false);
    expect(D1L_R2_D1M_ABSORBED).toBe(false);
    expect(D1L_R2_D1N_ABSORBED).toBe(false);
    expect(D1L_R2_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(D1L_R2_ELIGIBILITY_MODEL_READY).toBe(true);
    expect(D1L_R2_CERTIFICATION_RUNTIME_READY).toBe(false);
    expect(D1L_R2_STATUS).toBe("ELIGIBILITY_BLOCKER_EVALUATION_IMPLEMENTED");
    expect(D1L_R3_CANONICAL_PHASE).toBe("EOS-D1L-R3-STANDARDS-JURISDICTION-PROFILE-GOVERNANCE");
    expect(D1L_R3_CANONICAL_SCOPE).toContain("Do not issue certification");
    const here = dirname(fileURLToPath(import.meta.url));
    const source = readFileSync(join(here, "certification-eligibility.ts"), "utf8");
    const doc = readFileSync(join(here, "../../../../docs/architecture/engineering-os/EOS_D1L_R2_ELIGIBILITY_BLOCKER_EVALUATION_CLOSEOUT.md"), "utf8");
    expect(scanAnalysisFormulaBypass(join(here, "certification-eligibility.ts"), source)).toEqual([]);
    expect(doc.includes("```")).toBe(false);
    expect(source.includes("certifyClaim")).toBe(false);
    const rowManifest = STRUCTURAL_CAPABILITY_MANIFEST.find((item) => item.capabilityId === "D1L.R2.ELIGIBILITY_BLOCKER_EVALUATION");
    expect(rowManifest?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(rowManifest?.validationState).toBe("NOT_VALIDATED");
  });
});
