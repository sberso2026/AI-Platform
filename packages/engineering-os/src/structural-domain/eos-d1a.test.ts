import { describe, expect, it } from "vitest";
import {
  AUTOMATIC_DESIGN_APPROVAL_FROM_UTILIZATION,
  CONNECTION_DESIGN_ENGINE_IMPLEMENTED,
  EOS_AUTONOMOUS_ENGINEERING_APPROVAL,
  EOS_EU_ONLY_ARCHITECTURE,
  LLM_ORIGINATES_GOVERNED_NUMERIC_RESULT,
  STRUCTURAL_OBJECT_KINDS,
  type StructuralAnalysisResult,
  type StructuralCapacityResult,
  type StructuralConnection,
  type StructuralDesignCheck,
  type StructuralFoundationInterface,
  type StructuralFrame,
  type StructuralLoadCase,
  type StructuralLoadCombination,
  type StructuralMaterial,
  type StructuralMember,
  type StructuralNode,
  type StructuralSection,
  type StructuralSupport,
  type StructuralSystem,
  type StructuralUtilizationResult,
} from "@rtb/types";
import { disciplineMaturity, EOS_DISCIPLINE_REGISTRY } from "../discipline-capability";
import { isGlobalFirstArchitecture } from "../global-governance";
import {
  assertAnalysisResultNotApproval,
  assertCapacityHasProvenance,
  assertConnectionRepresentationOnly,
  assertD1bBindingReady,
  assertDesignCheckSeparatesDemandAndCapacity,
  assertFoundationDoesNotOwnGeotech,
  assertFrameStructure,
  assertIdentityThreadCompatible,
  assertMemberStructure,
  assertNoJurisdictionClauseFields,
  assertSectionNotGloballyAustralian,
  assertStructuralAiAuthorityDenied,
  assertStructuralObjectKindRegistered,
  assertUtilizationNotApproval,
  emptyStandardContext,
  governedProvenance,
  listStructuralObjectKinds,
  STRUCTURAL_DOMAIN_PACKAGE_DECISION,
} from "./index";

const provenance = governedProvenance();
const binding = emptyStandardContext("global-baseline");

const identity = {
  structuralSystemId: "sys-1",
  projectId: "proj-1",
  assetId: null as string | null,
  tenantId: "tenant-a",
  workspaceId: "ws-a",
  externalReference: null as string | null,
  sourceSystem: "eos",
  sourceObjectId: null as string | null,
  revision: "1",
  provenance,
};

const system: StructuralSystem = {
  structuralSystemId: "sys-1",
  tenantId: "tenant-a",
  workspaceId: "ws-a",
  projectId: "proj-1",
  assetId: null,
  name: "Pilot frame",
  description: "D1A domain fixture",
  systemType: "frame",
  discipline: "structural",
  status: "DEFINED",
  jurisdictionContextRef: "global-baseline",
  standardsContextRef: binding,
  provenanceRef: provenance,
  evidenceRefs: [{ evidenceId: "ev-1", sourceKind: "human_input", reference: "engineer" }],
  crossDisciplineInterfaceIds: ["piping-to-structural-loads"],
  digitalTwinExtensionId: null,
  createdAt: "2026-10-05T00:00:00.000Z",
  updatedAt: "2026-10-05T00:00:00.000Z",
};

const nodeA: StructuralNode = { ...identity, objectId: "n1", objectType: "NODE", nodeId: "n1", coordinatesRef: null, supportRef: "s1", solverMappingRef: null, status: "DEFINED" };
const nodeB: StructuralNode = { ...identity, objectId: "n2", objectType: "NODE", nodeId: "n2", coordinatesRef: null, supportRef: null, solverMappingRef: null, status: "DEFINED" };
const support: StructuralSupport = {
  ...identity,
  objectId: "s1",
  objectType: "SUPPORT",
  supportId: "s1",
  nodeRef: "n1",
  restraintDescription: "pinned",
  reactionResultRefs: [],
  foundationInterfaceRef: "fi-1",
  solverMappingRef: null,
  status: "DEFINED",
};
const section: StructuralSection = {
  ...identity,
  objectId: "sec-1",
  objectType: "SECTION",
  sectionId: "sec-1",
  designation: "360 UB 44.7",
  sectionFamily: "UB",
  geometryPropertiesRef: null,
  sourceCatalog: "LIBRARY_SECTION_Aust300.sls",
  catalogVersion: "14.2",
  jurisdictionApplicability: ["australia", "global-baseline"],
  standardRef: binding,
  status: "DEFINED",
};
const material: StructuralMaterial = {
  ...identity,
  objectId: "mat-1",
  objectType: "MATERIAL",
  materialId: "mat-1",
  materialFamily: "steel",
  grade: "300",
  nominalProperties: { E_GPa: 200 },
  sourceStandardRef: binding,
  jurisdictionApplicability: ["global-baseline", "australia"],
  propertySource: "human_entered",
  validationState: "unvalidated",
  status: "DEFINED",
};
const member: StructuralMember = {
  ...identity,
  objectId: "m1",
  objectType: "BEAM",
  memberId: "m1",
  memberKind: "BEAM",
  startNodeId: "n1",
  endNodeId: "n2",
  sectionRef: "sec-1",
  materialRef: "mat-1",
  orientation: null,
  length: null,
  systemRef: "sys-1",
  designContextRef: binding,
  analysisModelRefs: ["am-1"],
  evidenceRefs: [],
  status: "DEFINED",
};
const frame: StructuralFrame = {
  ...identity,
  objectId: "f1",
  objectType: "FRAME",
  frameId: "f1",
  memberRefs: ["m1"],
  nodeRefs: ["n1", "n2"],
  supportRefs: ["s1"],
  systemRef: "sys-1",
  geometryContextRef: null,
  analysisModelRefs: ["am-1"],
  interfaceRefs: ["piping-to-structural-loads"],
  status: "DEFINED",
};

describe("EOS-D1A structural domain object model", () => {
  it("registers all canonical structural object kinds without overstating maturity", () => {
    expect(listStructuralObjectKinds()).toEqual([...STRUCTURAL_OBJECT_KINDS]);
    expect(listStructuralObjectKinds()).toHaveLength(20);
    for (const kind of STRUCTURAL_OBJECT_KINDS) {
      expect(() => assertStructuralObjectKindRegistered(kind)).not.toThrow();
    }
    expect(() => assertStructuralObjectKindRegistered("decision")).toThrow(/not registered/);
    expect(disciplineMaturity("structural")).toBe("REFERENCE_PARTIALLY_IMPLEMENTED");
    const pack = EOS_DISCIPLINE_REGISTRY.find((row) => row.disciplineId === "structural");
    expect(pack?.engineeringObjectTypes.map((row) => row.objectTypeId)).toEqual([...STRUCTURAL_OBJECT_KINDS]);
    expect(STRUCTURAL_DOMAIN_PACKAGE_DECISION).toContain("@rtb/engineering-os");
  });

  it("validates member, frame, and identity structure", () => {
    expect(() => assertMemberStructure(member, new Set(["n1", "n2"]), new Set(["sec-1"]), new Set(["mat-1"]))).not.toThrow();
    expect(() => assertFrameStructure(frame, new Set(["m1"]), new Set(["n1", "n2"]), new Set(["s1"]))).not.toThrow();
    expect(() => assertIdentityThreadCompatible(member)).not.toThrow();
    expect(() => assertD1bBindingReady(binding)).not.toThrow();
    expect(() => assertSectionNotGloballyAustralian(section)).not.toThrow();
    expect(system.discipline).toBe("structural");
    expect(nodeA.nodeId).toBe("n1");
    expect(support.nodeRef).toBe("n1");
    expect(material.grade).toBe("300");
  });

  it("keeps connection representation, foundation geotech ownership, and demand/capacity separate", () => {
    const connection: StructuralConnection = {
      ...identity,
      objectId: "c1",
      objectType: "CONNECTION",
      connectionId: "c1",
      connectedObjectRefs: ["m1"],
      connectionType: "simple",
      geometryRef: null,
      materialRefs: ["mat-1"],
      fastenerRefs: [],
      designCheckRefs: [],
      evidenceRefs: [],
      designEngineImplemented: false,
      status: "DRAFT",
    };
    const foundation: StructuralFoundationInterface = {
      ...identity,
      objectId: "fi-1",
      objectType: "FOUNDATION_INTERFACE",
      interfaceId: "fi-1",
      structuralObjectRef: "s1",
      reactionResultRefs: [],
      loadCombinationRefs: [],
      interfaceGeometryRef: null,
      foundationTypeCandidate: "pad",
      groundContextRef: "geotechnical-context-ref",
      reviewRequired: true,
      evidenceRefs: [],
      geotechnicalPropertiesOwnedByStructural: false,
      status: "DRAFT",
    };
    const check: StructuralDesignCheck = {
      ...identity,
      objectId: "dc-1",
      objectType: "DESIGN_CHECK",
      designCheckId: "dc-1",
      objectRef: "m1",
      checkType: "member-bending",
      demandRef: "ar-1",
      capacityRef: "cap-1",
      standardContextRef: binding,
      calculationMethodRef: null,
      governingCaseRef: null,
      assumptionRefs: [],
      evidenceRefs: [],
      toolRef: null,
      validationState: "unvalidated",
      reviewState: "not_reviewed",
      approvalState: "not_approved",
      status: "DRAFT",
    };
    expect(CONNECTION_DESIGN_ENGINE_IMPLEMENTED).toBe(false);
    expect(() => assertConnectionRepresentationOnly(connection)).not.toThrow();
    expect(() => assertFoundationDoesNotOwnGeotech(foundation)).not.toThrow();
    expect(() => assertDesignCheckSeparatesDemandAndCapacity(check)).not.toThrow();
    expect(system.crossDisciplineInterfaceIds[0]).toBe("piping-to-structural-loads");
  });

  it("does not treat analysis results or utilization as approval and requires capacity provenance", () => {
    const result: StructuralAnalysisResult = {
      ...identity,
      objectId: "ar-1",
      objectType: "ANALYSIS_RESULT",
      resultId: "ar-1",
      analysisModelRef: "am-1",
      toolRef: "EOS_STRUCTURAL_DETERMINISTIC_V1",
      toolVersion: "1.0.0",
      executionRef: null,
      resultType: "member-actions",
      memberActions: [],
      reactions: [],
      deflections: [],
      validationState: "unvalidated",
      humanReviewState: "not_reviewed",
      outputClass: "DETERMINISTIC_RESULT",
      solverSuccessImpliesApproval: false,
      status: "UNDER_ANALYSIS",
    };
    const capacity: StructuralCapacityResult = {
      ...identity,
      objectId: "cap-1",
      objectType: "CAPACITY_RESULT",
      capacityResultId: "cap-1",
      objectRef: "m1",
      capacityType: "moment",
      value: 100,
      units: "kN.m",
      standardContextRef: binding,
      toolRef: null,
      methodRef: null,
      validationState: "unvalidated",
      llmOriginated: false,
      status: "DRAFT",
    };
    const utilization: StructuralUtilizationResult = {
      ...identity,
      objectId: "u-1",
      objectType: "UTILIZATION_RESULT",
      utilizationResultId: "u-1",
      demandRef: "ar-1",
      capacityRef: "cap-1",
      ratio: 0.8,
      governingCombinationRef: "lc-1",
      standardContextRef: binding,
      humanReviewState: "not_reviewed",
      utilizationAtOrBelowOneImpliesApproval: false,
      status: "UNDER_REVIEW",
    };
    expect(() => assertAnalysisResultNotApproval(result)).not.toThrow();
    expect(() => assertCapacityHasProvenance(capacity)).not.toThrow();
    expect(() => assertUtilizationNotApproval(utilization)).not.toThrow();
    expect(AUTOMATIC_DESIGN_APPROVAL_FROM_UTILIZATION).toBe(false);
    expect(() =>
      assertUtilizationNotApproval({ ...utilization, status: "APPROVED" }),
    ).toThrow(/must not auto-approve/);
  });

  it("keeps the Structural domain global-first with inherited AI and provenance governance", () => {
    const loadCase: StructuralLoadCase = {
      ...identity,
      objectId: "lc-dead",
      objectType: "LOAD_CASE",
      loadCaseId: "lc-dead",
      name: "Dead",
      actionType: "DEAD",
      source: "human_input",
      applicationContext: null,
      units: "kN/m",
      evidenceRef: null,
      jurisdictionContextRef: "global-baseline",
      status: "DEFINED",
    };
    const combination: StructuralLoadCombination = {
      ...identity,
      objectId: "comb-1",
      objectType: "LOAD_COMBINATION",
      combinationId: "comb-1",
      name: "1.2G + 1.5Q",
      components: [{ loadCaseId: "lc-dead", factor: null }],
      combinationCategory: "uls",
      sourceStandardRef: binding,
      jurisdictionContextRef: "global-baseline",
      editionAnnexBindingRef: binding,
      status: "DRAFT",
    };
    expect(() => assertNoJurisdictionClauseFields(member)).not.toThrow();
    expect(() => assertNoJurisdictionClauseFields(loadCase)).not.toThrow();
    expect(() => assertNoJurisdictionClauseFields(combination)).not.toThrow();
    expect(() => assertNoJurisdictionClauseFields({ as4100Clause: "5.1" })).toThrow(/must not embed/);
    expect(() => assertStructuralAiAuthorityDenied()).not.toThrow();
    expect(EOS_AUTONOMOUS_ENGINEERING_APPROVAL).toBe(false);
    expect(LLM_ORIGINATES_GOVERNED_NUMERIC_RESULT).toBe(false);
    expect(isGlobalFirstArchitecture()).toBe(true);
    expect(EOS_EU_ONLY_ARCHITECTURE).toBe(false);
    expect(member.provenance.approvalState).toBe("not_approved");
    expect(system.digitalTwinExtensionId).toBeNull();
  });
});
