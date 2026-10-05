import { describe, expect, it } from "vitest";
import {
  DISCIPLINE_ACTIVATION_BYPASSES_PRODUCT_ENTITLEMENT,
  DISCIPLINE_SECURITY_OVERRIDE_ALLOWED,
  EOS_DISCIPLINE_CLASSIFIABLE_DATA,
  EOS_DISCIPLINE_ROADMAP_ORDER,
  EOS_ENGINEERING_OUTPUT_CLASSES,
  EOS_EU_AI_CLASSIFICATIONS,
  EOS_EU_ONLY_ARCHITECTURE,
  EOS_INSPECTION_FINDING_CLASSES,
  EOS_JURISDICTION_PROFILE_IDS,
  EOS_OUTPUT_TRANSPARENCY_LABELS,
  HUMAN_PERSON_TWIN_ALLOWED_DEFAULT,
  INSPECTION_AI_FINDING_EQUALS_ENGINEERING_APPROVAL,
  LLM_ORIGINATES_GOVERNED_NUMERIC_RESULT,
  UNCERTIFIED_TOOL_SILENT_FALLBACK_ALLOWED,
} from "@rtb/types";
import { EXTERNAL_TOOL_CAPABILITY_STATUSES, EXTERNAL_TOOL_READINESS } from "../external-tools/catalog";
import {
  EOS_JURISDICTION_PROFILES,
  assertOutputTransition,
  isEuOnlyArchitecture,
  isGlobalFirstArchitecture,
} from "../global-governance";
import {
  EOS_D0_GOVERNANCE_RISK_REGISTER,
  EOS_DISCIPLINE_REGISTRY,
  STRUCTURAL_D1_GAPS,
  assertCoreRegisterOwnership,
  assertCrossDisciplineImpact,
  assertCrossDisciplineInterface,
  assertDisciplineAiGovernance,
  assertDisciplineInheritsGlobalGovernance,
  assertDisciplinePrivacyAndSecurity,
  assertGlobalFirstDisciplineFramework,
  assertNationalAnnexInheritance,
  assertNoDuplicatePlatformFramework,
  assertNoUncertifiedSilentFallback,
} from "./index";

describe("EOS-EU-D0 discipline framework high-water-mark review", () => {
  it("keeps a global-first discipline framework with no single-jurisdiction hard-coding", () => {
    expect(isGlobalFirstArchitecture()).toBe(true);
    expect(isEuOnlyArchitecture()).toBe(false);
    expect(EOS_EU_ONLY_ARCHITECTURE).toBe(false);
    expect(() => assertGlobalFirstDisciplineFramework()).not.toThrow();
    for (const pack of EOS_DISCIPLINE_REGISTRY) {
      expect(pack.euOnlyAssumption).toBe(false);
      expect(pack.jurisdictionApplicability).toEqual(expect.arrayContaining([...EOS_JURISDICTION_PROFILE_IDS]));
      expect(pack.inheritedProfiles.engineeringStandardsProfile).toBe("jurisdiction-selected");
    }
    expect(EOS_JURISDICTION_PROFILES.map((row) => row.jurisdictionId)).toEqual(expect.arrayContaining([...EOS_JURISDICTION_PROFILE_IDS]));
  });

  it("inherits jurisdiction, AI, privacy, security, provenance, and human authority on every pack", () => {
    for (const pack of EOS_DISCIPLINE_REGISTRY) {
      expect(() => assertDisciplineInheritsGlobalGovernance(pack)).not.toThrow();
      expect(() => assertDisciplineAiGovernance(pack)).not.toThrow();
      expect(() => assertDisciplinePrivacyAndSecurity(pack)).not.toThrow();
      expect(() => assertNationalAnnexInheritance(pack)).not.toThrow();
      expect(pack.dataClassifications).toEqual([...EOS_DISCIPLINE_CLASSIFIABLE_DATA]);
      expect(pack.dataClassifications).toEqual(expect.arrayContaining(["personalData", "AIInput", "AIOutput", "engineeringData"]));
      expect(pack.approvalRules.every((rule) => rule.humanAuthorityRequired && !rule.aiRecommendationIsApproval)).toBe(true);
      expect(pack.reviewRules.every((rule) => rule.aiRecommendationIsReview === false)).toBe(true);
    }
  });

  it("keeps AI output authority separate and forbids self-approval and LLM numeric origination", () => {
    expect(() => assertOutputTransition("AI_SUGGESTION", "APPROVED_ENGINEERING_OUTPUT")).toThrow(/cannot become/);
    expect(EOS_ENGINEERING_OUTPUT_CLASSES).toEqual(
      expect.arrayContaining(["AI_SUGGESTION", "DETERMINISTIC_RESULT", "APPROVED_ENGINEERING_OUTPUT", "ISSUED_DELIVERABLE"]),
    );
    expect(EOS_EU_AI_CLASSIFICATIONS).toEqual(
      expect.arrayContaining(["prohibited", "high-risk", "limited-transparency", "minimal-other", "requires-assessment", "not-applicable"]),
    );
    expect(EOS_OUTPUT_TRANSPARENCY_LABELS).toEqual(
      expect.arrayContaining(["AI-generated", "deterministic-tool-generated", "human-approved"]),
    );
    expect(LLM_ORIGINATES_GOVERNED_NUMERIC_RESULT).toBe(false);
    expect(
      EOS_DISCIPLINE_REGISTRY.every((pack) =>
        pack.aiCapabilities.every(
          (cap) =>
            cap.autonomousActionAllowed === false &&
            cap.governedNumericalOutputAllowed === false &&
            cap.evidenceRequired &&
            cap.provenanceRequired,
        ),
      ),
    ).toBe(true);
  });

  it("locks ownership, security override, uncertified fallback, and inspection/twin boundaries", () => {
    expect(DISCIPLINE_SECURITY_OVERRIDE_ALLOWED).toBe(false);
    expect(DISCIPLINE_ACTIVATION_BYPASSES_PRODUCT_ENTITLEMENT).toBe(false);
    expect(INSPECTION_AI_FINDING_EQUALS_ENGINEERING_APPROVAL).toBe(false);
    expect(HUMAN_PERSON_TWIN_ALLOWED_DEFAULT).toBe(false);
    expect(UNCERTIFIED_TOOL_SILENT_FALLBACK_ALLOWED).toBe(false);
    expect(() => assertNoDuplicatePlatformFramework("authorization")).toThrow(/must not implement/);
    expect(() => assertCoreRegisterOwnership("decision")).toThrow(/must not be recreated/);
    expect(() => assertNoUncertifiedSilentFallback({ certified: false, silentFallbackUsed: true })).toThrow(
      /must not silently fall back/,
    );
    expect(EXTERNAL_TOOL_READINESS).toEqual(expect.arrayContaining(["NOT_CONFIGURED", "CONFIGURED", "DEGRADED", "UNAVAILABLE"]));
    expect(EXTERNAL_TOOL_CAPABILITY_STATUSES).toEqual(expect.arrayContaining(["AVAILABLE", "CERTIFIED", "NOT_CERTIFIED"]));
    expect(EOS_INSPECTION_FINDING_CLASSES).toEqual(
      expect.arrayContaining(["observed_defect", "ai_detection", "human_validation", "condition_rating"]),
    );
  });

  it("keeps cross-discipline interfaces complete and AI impact advisory", () => {
    const interfaces = EOS_DISCIPLINE_REGISTRY.flatMap((row) => row.crossDisciplineInterfaces);
    expect(interfaces.length).toBeGreaterThan(0);
    for (const iface of interfaces) {
      expect(() => assertCrossDisciplineInterface(iface)).not.toThrow();
      expect(iface.humanReviewRequired).toBe(true);
      expect(iface.provenance).toBe("eos-eu-0-global-provenance");
    }
    expect(() =>
      assertCrossDisciplineImpact({
        sourceDiscipline: "process",
        sourceObject: "stream",
        changeType: "duty-change",
        affectedDiscipline: "mechanical",
        affectedObject: "pump",
        impactType: "DESIGN_CHANGE_IMPACT",
        evidence: null,
        confidence: "unknown",
        reviewRequired: true,
        aiSuggestionAdvisory: true,
      }),
    ).not.toThrow();
  });

  it("records the D0 governance risk register and validates the D1-D9 roadmap", () => {
    expect(EOS_D0_GOVERNANCE_RISK_REGISTER).toHaveLength(12);
    expect(EOS_D0_GOVERNANCE_RISK_REGISTER.every((row) => row.id && row.mitigation && row.phaseToClose)).toBe(true);
    expect(EOS_DISCIPLINE_ROADMAP_ORDER).toEqual([
      "D1_STRUCTURAL",
      "D2_CIVIL",
      "D3_GEOTECHNICAL",
      "D4_MECHANICAL",
      "D5_PIPING",
      "D6_PROCESS",
      "D7_ELECTRICAL",
      "D8_INSTRUMENTATION_CONTROL",
      "D9_CROSS_DISCIPLINE_INTELLIGENCE",
    ]);
    expect(STRUCTURAL_D1_GAPS).toEqual(
      expect.arrayContaining([
        "SPACE_GASS_LIVE_EXECUTION_NOT_CERTIFIED",
        "NO_AS4100_CAPACITY_ENGINE",
        "NO_STANDARD_EDITION_ANNEX_BINDING_ON_CALCULATIONS",
        "OPTIMIZATION_NOT_CERTIFIED",
        "DETERMINISTIC_TOOL_JURISDICTION_UNBOUND",
      ]),
    );
  });
});
