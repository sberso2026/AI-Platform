import type {
  StructuralAnalysisResult,
  StructuralCapacityResult,
  StructuralConnection,
  StructuralDesignCheck,
  StructuralFoundationInterface,
  StructuralFrame,
  StructuralMember,
  StructuralObjectIdentity,
  StructuralSection,
  StructuralStandardContextRef,
  StructuralUtilizationResult,
} from "@rtb/types";
import {
  AU_SECTION_CATALOG_HARDCODED_AS_GLOBAL,
  AUTOMATIC_DESIGN_APPROVAL_FROM_UTILIZATION,
  CONNECTION_DESIGN_ENGINE_IMPLEMENTED,
  EOS_AUTONOMOUS_ENGINEERING_APPROVAL,
  EOS_CORE_OWNED_REGISTERS,
  GEOTECHNICAL_DATA_OWNED_BY_STRUCTURAL,
  LLM_ORIGINATED_CAPACITY_ALLOWED,
  LLM_ORIGINATES_GOVERNED_NUMERIC_RESULT,
  SOLVER_SUCCESS_EQUALS_APPROVAL,
  STRUCTURAL_FORBIDDEN_CORE_CLAUSE_FIELDS,
  STRUCTURAL_MEMBER_KINDS,
  STRUCTURAL_OBJECT_KINDS,
} from "@rtb/types";

export function assertStructuralObjectKindRegistered(kind: string): void {
  if (!(STRUCTURAL_OBJECT_KINDS as readonly string[]).includes(kind)) {
    throw new Error(`structural object kind ${kind} is not registered`);
  }
  if ((EOS_CORE_OWNED_REGISTERS as readonly string[]).includes(kind.toLowerCase())) {
    throw new Error(`structural objects must not recreate core register ${kind}`);
  }
}

export function assertMemberStructure(member: StructuralMember, nodes: Set<string>, sections: Set<string>, materials: Set<string>): void {
  if (!(STRUCTURAL_MEMBER_KINDS as readonly string[]).includes(member.memberKind)) {
    throw new Error("memberKind is invalid");
  }
  if (member.objectType !== member.memberKind && member.objectType !== "MEMBER") {
    throw new Error("member objectType must match memberKind");
  }
  if (!nodes.has(member.startNodeId) || !nodes.has(member.endNodeId)) {
    throw new Error("member must reference valid nodes");
  }
  if (!sections.has(member.sectionRef)) throw new Error("member must reference a valid section");
  if (!materials.has(member.materialRef)) throw new Error("member must reference a valid material");
  if (member.systemRef !== member.structuralSystemId) throw new Error("member systemRef must match structuralSystemId");
}

export function assertFrameStructure(frame: StructuralFrame, members: Set<string>, nodes: Set<string>, supports: Set<string>): void {
  if (frame.memberRefs.length === 0) throw new Error("frame must reference members");
  if (frame.memberRefs.some((id) => !members.has(id))) throw new Error("frame memberRefs must be valid");
  if (frame.nodeRefs.some((id) => !nodes.has(id))) throw new Error("frame nodeRefs must be valid");
  if (frame.supportRefs.some((id) => !supports.has(id))) throw new Error("frame supportRefs must be valid");
}

export function assertConnectionRepresentationOnly(connection: StructuralConnection): void {
  if (connection.designEngineImplemented !== CONNECTION_DESIGN_ENGINE_IMPLEMENTED) {
    throw new Error("connection design engines are not implemented in D1A");
  }
}

export function assertFoundationDoesNotOwnGeotech(row: StructuralFoundationInterface): void {
  if (row.geotechnicalPropertiesOwnedByStructural !== GEOTECHNICAL_DATA_OWNED_BY_STRUCTURAL) {
    throw new Error("foundation interface must not own geotechnical properties");
  }
  if ("soilProfile" in row || "bearingCapacity" in row || "groundProperties" in row) {
    throw new Error("geotechnical properties must not live on the Structural foundation interface");
  }
}

export function assertAnalysisResultNotApproval(result: StructuralAnalysisResult): void {
  if (result.solverSuccessImpliesApproval !== SOLVER_SUCCESS_EQUALS_APPROVAL) {
    throw new Error("solver success must not imply approval");
  }
  if (result.outputClass !== "DETERMINISTIC_RESULT") {
    throw new Error("analysis results remain deterministic results until human review");
  }
}

export function assertUtilizationNotApproval(row: StructuralUtilizationResult): void {
  if (row.utilizationAtOrBelowOneImpliesApproval !== AUTOMATIC_DESIGN_APPROVAL_FROM_UTILIZATION) {
    throw new Error("utilization must not imply design approval");
  }
  if (row.ratio != null && row.ratio <= 1 && row.status === "APPROVED") {
    throw new Error("utilization <= 1 must not auto-approve the object");
  }
}

export function assertCapacityHasProvenance(row: StructuralCapacityResult): void {
  if (!row.provenance?.timestamp || !row.provenance.validationState) {
    throw new Error("capacity result requires governed provenance metadata");
  }
  if (row.llmOriginated !== LLM_ORIGINATED_CAPACITY_ALLOWED) {
    throw new Error("LLM originated capacity is not allowed");
  }
}

export function assertD1bBindingReady(ref: StructuralStandardContextRef): void {
  if (!ref.jurisdictionProfile?.trim() || !ref.standardProfile?.trim()) {
    throw new Error("D1B binding requires jurisdictionProfile and standardProfile");
  }
}

export function assertNoJurisdictionClauseFields(record: object): void {
  for (const key of STRUCTURAL_FORBIDDEN_CORE_CLAUSE_FIELDS) {
    if (key in record) throw new Error(`generic structural domain must not embed ${key}`);
  }
}

export function assertSectionNotGloballyAustralian(section: StructuralSection): void {
  if (AU_SECTION_CATALOG_HARDCODED_AS_GLOBAL) throw new Error("AU catalogs must not be global");
  if (section.sourceCatalog.toLowerCase().includes("aust300") && section.jurisdictionApplicability.length < 2) {
    throw new Error("Australian section catalogs must declare limited jurisdiction applicability");
  }
}

export function assertStructuralAiAuthorityDenied(): void {
  if (EOS_AUTONOMOUS_ENGINEERING_APPROVAL) throw new Error("autonomous engineering approval remains forbidden");
  if (LLM_ORIGINATES_GOVERNED_NUMERIC_RESULT) throw new Error("LLM numeric authority remains forbidden");
}

export function assertIdentityThreadCompatible(identity: StructuralObjectIdentity): void {
  if (!identity.objectId || !identity.objectType || !identity.structuralSystemId || !identity.tenantId || !identity.workspaceId) {
    throw new Error("structural identity is incomplete for Digital Thread linkage");
  }
}

export function assertDesignCheckSeparatesDemandAndCapacity(check: StructuralDesignCheck): void {
  if (check.demandRef != null && check.capacityRef != null && check.demandRef === check.capacityRef) {
    throw new Error("demand and capacity must remain separate references");
  }
}
