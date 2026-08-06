/**
 * Defect Framework — generic defect lifecycle and taxonomy (Phase 9D).
 */
import { randomUUID } from "node:crypto";
import type { EngineeringAssetRef, EngineeringDefectRef } from "@rtb/engineering-os";

export type DefectSeverity = "low" | "medium" | "high" | "critical";
export type DefectUrgency = "routine" | "priority" | "immediate";
export type DefectLifecycleState =
  | "identified"
  | "classified"
  | "open"
  | "mitigating"
  | "awaiting_verification"
  | "verified"
  | "closed"
  | "cancelled";

export type DefectTaxonomy = {
  failureMode?: string;
  failureMechanism?: string;
  severity: DefectSeverity;
  urgency: DefectUrgency;
  repairClass?: string;
  monitoringRequired: boolean;
  rootCause?: string;
  defectCategory: string;
};

export type InspectionDefect = {
  id: string;
  tenantId: string;
  workspaceId: string;
  sessionId: string;
  observationId?: string;
  assetRef?: EngineeringAssetRef;
  taxonomy: DefectTaxonomy;
  status: DefectLifecycleState;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

const DEFECT_TRANSITIONS: Record<DefectLifecycleState, DefectLifecycleState[]> = {
  identified: ["classified", "cancelled"],
  classified: ["open", "cancelled"],
  open: ["mitigating", "awaiting_verification", "cancelled"],
  mitigating: ["awaiting_verification", "open", "cancelled"],
  awaiting_verification: ["verified", "open"],
  verified: ["closed"],
  closed: [],
  cancelled: [],
};

export function assertDefectTransition(from: DefectLifecycleState, to: DefectLifecycleState): void {
  if (!(DEFECT_TRANSITIONS[from] ?? []).includes(to)) {
    throw new Error(`invalid_defect_transition:${from}->${to}`);
  }
}

export function createDefect(input: {
  tenantId: string;
  workspaceId: string;
  sessionId: string;
  observationId?: string;
  assetRef?: EngineeringAssetRef;
  title: string;
  description: string;
  taxonomy: DefectTaxonomy;
}): InspectionDefect {
  const now = new Date().toISOString();
  return {
    id: randomUUID(),
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    sessionId: input.sessionId,
    observationId: input.observationId,
    assetRef: input.assetRef,
    taxonomy: input.taxonomy,
    status: "identified",
    title: input.title,
    description: input.description,
    createdAt: now,
    updatedAt: now,
  };
}

export function transitionDefect(
  defect: InspectionDefect,
  to: DefectLifecycleState,
): InspectionDefect {
  assertDefectTransition(defect.status, to);
  return { ...defect, status: to, updatedAt: new Date().toISOString() };
}

export function toDefectRef(defect: InspectionDefect): EngineeringDefectRef {
  return { defectId: defect.id, taxonomyCode: defect.taxonomy.defectCategory };
}
