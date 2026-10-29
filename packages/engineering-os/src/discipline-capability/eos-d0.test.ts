import { describe, expect, it } from "vitest";
import {
  EOS_AUTONOMOUS_ENGINEERING_APPROVAL,
  EOS_CORE_OWNED_REGISTERS,
  EOS_DISCIPLINE_CLASSIFIABLE_DATA,
  EOS_DISCIPLINE_IDS,
  EOS_EU_ONLY_ARCHITECTURE,
  EOS_GLOBAL_POLICY_INHERITANCE,
  GOVERNED_NUMERICAL_OUTPUT_ALLOWED_FOR_LLM_DEFAULT,
  LLM_ORIGINATES_GOVERNED_NUMERIC_RESULT,
  UNCERTIFIED_TOOL_SILENT_FALLBACK_ALLOWED,
} from "@rtb/types";
import { EOS_ORGANIZATIONAL_INTELLIGENCE_BOUNDARY, isGlobalFirstArchitecture } from "../global-governance";
import {
  DISCIPLINE_FRAMEWORK_PACKAGE_DECISION,
  EOS_DISCIPLINE_REGISTRY,
  STRUCTURAL_D1_GAPS,
  STRUCTURAL_DISCIPLINE_PACK,
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
  disciplineMaturity,
  listRegisteredDisciplineIds,
} from "./index";

describe("EOS-D0 discipline capability framework", () => {
  it("registers all eight disciplines with Structural as reference and others planned", () => {
    expect(listRegisteredDisciplineIds()).toEqual([...EOS_DISCIPLINE_IDS]);
    expect(EOS_DISCIPLINE_REGISTRY).toHaveLength(8);
    expect(disciplineMaturity("structural")).toBe("REFERENCE_PARTIALLY_IMPLEMENTED");
    for (const id of EOS_DISCIPLINE_IDS.filter((row) => row !== "structural")) {
      expect(disciplineMaturity(id)).toBe("PLANNED");
    }
    expect(STRUCTURAL_DISCIPLINE_PACK.calculationDefinitions[0]?.toolId).toBe("EOS_STRUCTURAL_DETERMINISTIC_V1");
    expect(STRUCTURAL_D1_GAPS.length).toBeGreaterThan(0);
  });

  it("inherits jurisdiction, AI governance, provenance, privacy, and security on every pack", () => {
    for (const pack of EOS_DISCIPLINE_REGISTRY) {
      expect(() => assertDisciplineInheritsGlobalGovernance(pack)).not.toThrow();
      expect(() => assertDisciplineAiGovernance(pack)).not.toThrow();
      expect(() => assertDisciplinePrivacyAndSecurity(pack)).not.toThrow();
      expect(() => assertNationalAnnexInheritance(pack)).not.toThrow();
      expect(pack.euOnlyAssumption).toBe(false);
      expect(pack.inheritedPolicies).toEqual([...EOS_GLOBAL_POLICY_INHERITANCE]);
      expect(pack.dataClassifications).toEqual([...EOS_DISCIPLINE_CLASSIFIABLE_DATA]);
      expect(pack.approvalRules.every((rule) => rule.humanAuthorityRequired && !rule.aiRecommendationIsApproval)).toBe(true);
      expect(pack.jurisdictionApplicability).toEqual(
        expect.arrayContaining(["australia", "eu-eea", "united-states", "global-baseline"]),
      );
    }
    expect(EOS_ORGANIZATIONAL_INTELLIGENCE_BOUNDARY.employeeSurveillanceDefault).toBe("PROHIBITED");
    expect(EOS_ORGANIZATIONAL_INTELLIGENCE_BOUNDARY.personalBehaviorProfilingDefault).toBe("PROHIBITED");
  });

  it("defaults autonomous approval and LLM governed numerics to false", () => {
    expect(EOS_AUTONOMOUS_ENGINEERING_APPROVAL).toBe(false);
    expect(LLM_ORIGINATES_GOVERNED_NUMERIC_RESULT).toBe(false);
    expect(GOVERNED_NUMERICAL_OUTPUT_ALLOWED_FOR_LLM_DEFAULT).toBe(false);
    expect(
      EOS_DISCIPLINE_REGISTRY.every((pack) =>
        pack.aiCapabilities.every((cap) => cap.autonomousActionAllowed === false && cap.governedNumericalOutputAllowed === false),
      ),
    ).toBe(true);
  });

  it("denies core register duplication, platform framework duplication, and uncertified silent fallback", () => {
    for (const register of EOS_CORE_OWNED_REGISTERS) {
      expect(() => assertCoreRegisterOwnership(register)).toThrow(/must not be recreated/);
    }
    expect(() => assertNoDuplicatePlatformFramework("ai_stack")).toThrow(/must not implement/);
    expect(UNCERTIFIED_TOOL_SILENT_FALLBACK_ALLOWED).toBe(false);
    expect(() => assertNoUncertifiedSilentFallback({ certified: false, silentFallbackUsed: true })).toThrow(
      /must not silently fall back/,
    );
    expect(() => assertNoUncertifiedSilentFallback({ certified: false, silentFallbackUsed: false })).not.toThrow();
  });

  it("validates cross-discipline interfaces and keeps AI impact advisory", () => {
    const iface = EOS_DISCIPLINE_REGISTRY.flatMap((row) => row.crossDisciplineInterfaces)[0];
    expect(iface).toBeTruthy();
    expect(() => assertCrossDisciplineInterface(iface)).not.toThrow();
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

  it("keeps the discipline framework global-first with no EU-only product assumption", () => {
    expect(isGlobalFirstArchitecture()).toBe(true);
    expect(EOS_EU_ONLY_ARCHITECTURE).toBe(false);
    expect(() => assertGlobalFirstDisciplineFramework()).not.toThrow();
    expect(DISCIPLINE_FRAMEWORK_PACKAGE_DECISION).toContain("@rtb/engineering-os");
  });
});
