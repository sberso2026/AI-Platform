import type { WorkReference } from "../work-generator/types";

export type OperationsReferenceContext = {
  assetCode: string;
  designRequirement: WorkReference | null;
  datasheet: WorkReference | null;
  vendorInformation: WorkReference | null;
  designDecision: WorkReference | null;
  drawing: WorkReference | null;
  commissioningEvidence: WorkReference | null;
  operatingLimit: WorkReference | null;
  modificationHistory: WorkReference[];
  assetManagementOs: false;
};

export function composeOperationsReference(input: {
  assetCode: string;
  designRequirement?: WorkReference | null;
  datasheet?: WorkReference | null;
  vendorInformation?: WorkReference | null;
  designDecision?: WorkReference | null;
  drawing?: WorkReference | null;
  commissioningEvidence?: WorkReference | null;
  operatingLimit?: WorkReference | null;
  modificationHistory?: WorkReference[];
}): OperationsReferenceContext {
  return {
    assetCode: input.assetCode,
    designRequirement: input.designRequirement ?? null,
    datasheet: input.datasheet ?? null,
    vendorInformation: input.vendorInformation ?? null,
    designDecision: input.designDecision ?? null,
    drawing: input.drawing ?? null,
    commissioningEvidence: input.commissioningEvidence ?? null,
    operatingLimit: input.operatingLimit ?? null,
    modificationHistory: input.modificationHistory ?? [],
    assetManagementOs: false,
  };
}
