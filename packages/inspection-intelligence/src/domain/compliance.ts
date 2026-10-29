/**
 * Compliance Framework — standards-agnostic compliance references (Phase 9D).
 */
import { randomUUID } from "node:crypto";

export type ComplianceStandardFamily =
  | "ISO"
  | "AS"
  | "ASTM"
  | "API"
  | "NACE"
  | "client"
  | "other";

export type ComplianceReference = {
  id: string;
  family: ComplianceStandardFamily;
  code: string;
  title: string;
  clause?: string;
  clientStandardId?: string;
};

export type InspectionComplianceLink = {
  id: string;
  tenantId: string;
  workspaceId: string;
  sessionId: string;
  defectId?: string;
  reference: ComplianceReference;
  conformity: "conforms" | "nonconforms" | "not_applicable" | "not_assessed";
  notes?: string;
  createdAt: string;
};

export function createComplianceLink(input: {
  tenantId: string;
  workspaceId: string;
  sessionId: string;
  defectId?: string;
  family: ComplianceStandardFamily;
  code: string;
  title: string;
  clause?: string;
  conformity?: InspectionComplianceLink["conformity"];
  notes?: string;
}): InspectionComplianceLink {
  return {
    id: randomUUID(),
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    sessionId: input.sessionId,
    defectId: input.defectId,
    reference: {
      id: randomUUID(),
      family: input.family,
      code: input.code,
      title: input.title,
      clause: input.clause,
    },
    conformity: input.conformity ?? "not_assessed",
    notes: input.notes,
    createdAt: new Date().toISOString(),
  };
}
