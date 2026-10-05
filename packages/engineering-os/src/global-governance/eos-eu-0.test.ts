import { describe, expect, it } from "vitest";
import {
  EOS_ARCHITECTURE_LAYERS,
  EOS_AUTONOMOUS_ENGINEERING_APPROVAL,
  EOS_EU_MARKET_READY,
  EOS_GLOBAL_POLICY_INHERITANCE,
} from "@rtb/types";
import {
  EOS_DISCIPLINE_GAP_REGISTER,
  EOS_GLOBAL_ARCHITECTURE_PRINCIPLE,
  EOS_GLOBAL_COMPLIANCE_MATRIX,
  EOS_HORIZONTAL_MODULE_INVENTORY,
  EOS_JURISDICTION_PROFILES,
  EOS_ORGANIZATIONAL_INTELLIGENCE_BOUNDARY,
  EOS_SAMPLE_AI_CAPABILITY,
  EOS_SECURITY_BASELINE,
  EOS_STANDARD_FAMILY_EXAMPLES,
  assertAiCapabilityRecord,
  assertHumanAuthoritySeparate,
  assertOutputTransition,
  assertStandardJurisdictionConfigurable,
  createProvenanceRecord,
  createRegionalDeploymentPolicy,
  extendJurisdictionCatalog,
  inheritDisciplineGlobalPolicies,
  isEuOnlyArchitecture,
  isGlobalFirstArchitecture,
} from "./index";

describe("EOS-EU-0 global jurisdiction foundation", () => {
  it("keeps a global core with no mandatory EU-only assumption", () => {
    expect(isGlobalFirstArchitecture()).toBe(true);
    expect(isEuOnlyArchitecture()).toBe(false);
    expect(EOS_GLOBAL_ARCHITECTURE_PRINCIPLE.euOnlyProduct).toBe(false);
    expect(EOS_EU_MARKET_READY).toBe(false);
    expect(EOS_ARCHITECTURE_LAYERS[0]).toBe("GLOBAL_CORE");
    expect(createRegionalDeploymentPolicy().requiredRegion).toBeNull();
    expect(createRegionalDeploymentPolicy().allowedRegions).toContain("australia");
    expect(() => createRegionalDeploymentPolicy({ requiredRegion: "eu-eea" })).toThrow(/EU hosting is optional/);
  });

  it("keeps jurisdiction profiles extensible and region-specific policy externalized", () => {
    expect(EOS_JURISDICTION_PROFILES.map((row) => row.jurisdictionId)).toEqual(
      expect.arrayContaining(["global-baseline", "australia", "eu-eea", "united-kingdom", "united-states", "canada", "middle-east", "apac-other"]),
    );
    const extended = extendJurisdictionCatalog({
      ...EOS_JURISDICTION_PROFILES[0],
      jurisdictionId: "singapore",
      country: "SG",
      region: "APAC",
    });
    expect(extended.some((row) => row.jurisdictionId === "singapore")).toBe(true);
  });

  it("requires intended-purpose and human-oversight metadata on AI capabilities", () => {
    expect(() => assertAiCapabilityRecord(EOS_SAMPLE_AI_CAPABILITY)).not.toThrow();
    expect(() =>
      assertAiCapabilityRecord({ ...EOS_SAMPLE_AI_CAPABILITY, intendedPurpose: "" }),
    ).toThrow(/intendedPurpose/);
    expect(() =>
      assertAiCapabilityRecord({ ...EOS_SAMPLE_AI_CAPABILITY, humanOversightRequired: false }),
    ).toThrow(/human oversight/);
  });

  it("keeps human authority separate and autonomous engineering approval false", () => {
    expect(assertHumanAuthoritySeparate("engineer")).toBe("human");
    expect(assertHumanAuthoritySeparate("AI")).toBe("machine");
    expect(EOS_AUTONOMOUS_ENGINEERING_APPROVAL).toBe(false);
    expect(() =>
      assertAiCapabilityRecord({ ...EOS_SAMPLE_AI_CAPABILITY, autonomousActionAllowed: true, humanOversightRequired: true }),
    ).toThrow(/autonomous engineering approval/);
  });

  it("makes regional deployment and engineering standards jurisdiction-configurable", () => {
    const policy = createRegionalDeploymentPolicy({
      preferredRegion: "australia",
      allowedRegions: ["australia", "apac-other"],
    });
    expect(policy.preferredRegion).toBe("australia");
    for (const standard of EOS_STANDARD_FAMILY_EXAMPLES) {
      expect(() => assertStandardJurisdictionConfigurable(standard)).not.toThrow();
    }
    expect(EOS_STANDARD_FAMILY_EXAMPLES.some((row) => row.nationalAnnex === "member-state-annex")).toBe(true);
  });

  it("lets discipline packs inherit global policies without claiming dedicated modules", () => {
    const inherited = inheritDisciplineGlobalPolicies({
      disciplineId: "CIVIL",
      engineeringObjects: ["PROJECT"],
      standards: [],
      jurisdictionApplicability: ["global-baseline"],
      calculations: [],
      deterministicTools: [],
      externalTools: [],
      AIcapabilities: [],
      evidenceRules: ["provenance"],
      reviewRules: ["human-review"],
      approvalRules: ["human-approver"],
      deliverables: [],
      inspectionModels: [],
      digitalTwinModels: [],
      riskModels: [],
      provenanceRequirements: ["global-provenance"],
    });
    expect(inherited.inheritedPolicies).toEqual(EOS_GLOBAL_POLICY_INHERITANCE);
    expect(EOS_DISCIPLINE_GAP_REGISTER.find((row) => row.disciplineId === "STRUCTURAL")?.maturity).toBe(
      "REFERENCE_PARTIALLY_IMPLEMENTED",
    );
    expect(EOS_DISCIPLINE_GAP_REGISTER.filter((row) => row.maturity === "NOT_YET_DEDICATED")).toHaveLength(7);
  });

  it("prohibits employee surveillance and personal behavior profiling by default", () => {
    expect(EOS_ORGANIZATIONAL_INTELLIGENCE_BOUNDARY.employeeSurveillanceDefault).toBe("PROHIBITED");
    expect(EOS_ORGANIZATIONAL_INTELLIGENCE_BOUNDARY.personalBehaviorProfilingDefault).toBe("PROHIBITED");
    expect(EOS_ORGANIZATIONAL_INTELLIGENCE_BOUNDARY.surveillanceFlags.employeeRanking).toBe(false);
    expect(EOS_ORGANIZATIONAL_INTELLIGENCE_BOUNDARY.surveillanceFlags.productivityScoring).toBe(false);
  });

  it("blocks AI suggestion from becoming approved output and records provenance", () => {
    expect(() => assertOutputTransition("AI_SUGGESTION", "APPROVED_ENGINEERING_OUTPUT")).toThrow(/cannot become/);
    expect(() => assertOutputTransition("REVIEW_FINDING", "APPROVED_ENGINEERING_OUTPUT")).not.toThrow();
    const provenance = createProvenanceRecord({
      timestamp: "2026-10-05T00:00:00.000Z",
      validationState: "unvalidated",
      approvalState: "not_approved",
      model: "platform-ai-director",
      jurisdiction: "global-baseline",
    });
    expect(provenance.humanReviewer).toBeNull();
    expect(provenance.approvalState).toBe("not_approved");
  });

  it("inventories modules without a jurisdiction assumption and does not claim security certification", () => {
    expect(EOS_HORIZONTAL_MODULE_INVENTORY).toHaveLength(15);
    expect(EOS_HORIZONTAL_MODULE_INVENTORY.every((row) => row.CURRENT_JURISDICTION_ASSUMPTION === "NONE_GLOBAL_NEUTRAL")).toBe(
      true,
    );
    expect(EOS_SECURITY_BASELINE.certified).toBe(false);
    expect(EOS_SECURITY_BASELINE.nis2Alignment).toBe("EXTENSIBLE_NOT_CERTIFIED");
    expect(EOS_GLOBAL_COMPLIANCE_MATRIX.length).toBeGreaterThan(0);
  });
});
