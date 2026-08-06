/**
 * Risk integration — typed adapters to Engineering Core Risk Register only.
 * No direct ownership of the risk register.
 */
import type { EngineeringProjectRef, EngineeringAssetRef } from "@rtb/engineering-os";

export type EngineeringRiskRegisterRecord = {
  riskId: string;
  tenantId: string;
  workspaceId: string;
  title: string;
  severity?: string;
  status?: string;
};

export type InspectionRiskLinkRequest = {
  tenantId: string;
  workspaceId: string;
  sessionId: string;
  defectId?: string;
  projectRef?: EngineeringProjectRef;
  assetRef?: EngineeringAssetRef;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
};

export type EngineeringRiskRegisterAdapter = {
  /** Create or link a risk in Engineering Core — never a private risk store. */
  linkOrCreate(input: InspectionRiskLinkRequest): Promise<EngineeringRiskRegisterRecord>;
  get(riskId: string): Promise<EngineeringRiskRegisterRecord | null>;
};

export type InProcessRiskRecord = EngineeringRiskRegisterRecord & {
  sourceSessionId: string;
  sourceDefectId?: string;
};

/** Certification/test adapter — stands in for Engineering Core Risk Register. */
export function createInProcessRiskRegisterAdapter(): EngineeringRiskRegisterAdapter & {
  records: InProcessRiskRecord[];
} {
  const records: InProcessRiskRecord[] = [];
  return {
    records,
    async linkOrCreate(input) {
      const existing = records.find(
        (r) =>
          r.sourceSessionId === input.sessionId &&
          r.sourceDefectId === input.defectId &&
          r.tenantId === input.tenantId,
      );
      if (existing) return existing;
      const record: InProcessRiskRecord = {
        riskId: `risk_${records.length + 1}`,
        tenantId: input.tenantId,
        workspaceId: input.workspaceId,
        title: input.title,
        severity: input.severity,
        status: "open",
        sourceSessionId: input.sessionId,
        sourceDefectId: input.defectId,
      };
      records.push(record);
      return record;
    },
    async get(riskId) {
      return records.find((r) => r.riskId === riskId) ?? null;
    },
  };
}
