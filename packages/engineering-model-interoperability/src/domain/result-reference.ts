/**
 * Phase 13B — Analysis result references + trust classification.
 *
 * IFC imported ≠ rtb_execution_certified.
 */

export type EngineeringResultTrustClassification =
  | "source_declared"
  | "source_reviewed"
  | "externally_approved"
  | "rtb_execution_certified"
  | "unknown";

export type EngineeringAnalysisResultReference = {
  kind: "engineering_analysis_result_reference";
  owner: "source_client_engineering_application" | "digital_twin";
  federationOwner: "engineering_model_interoperability";
  resultRefId: string;
  modelRefId: string;
  tenantId: string;
  workspaceId: string;
  externalResultId: string;
  resultKind?: string;
  provenance: "external_existing" | "rtb_generated";
  rtbGenerated: boolean;
  trustClassification: EngineeringResultTrustClassification;
  solverProviderId?: string;
  platformFileRef?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

/** IFC federation imports never auto-claim RTB execution certification. */
export function trustForIfcImportedResult(): EngineeringResultTrustClassification {
  return "source_declared";
}

export function assertIfcImportNotRtbCertified(
  trust: EngineeringResultTrustClassification,
): void {
  if (trust === "rtb_execution_certified") {
    throw new Error("ifc_imported_result_cannot_be_rtb_execution_certified");
  }
}
