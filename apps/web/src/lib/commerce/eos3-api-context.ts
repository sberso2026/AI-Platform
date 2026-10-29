/** Minimum API/version compatibility context for EOS 3 consumers. */

import { EOS3_PRODUCT_KEY, EOS3_RELEASE_STATUS, EOS3_VERSION, EOS3_GENERATION } from "./eos3-identity";

export type EosApiVersionContext = {
  generation: 2 | 3;
  productKey: "eos-2" | "eos-3";
  version: string;
  releaseStatus: string;
  tenantId: string | null;
  workspaceId: string | null;
};

export function eos2ApiContext(tenantId: string | null, workspaceId: string | null): EosApiVersionContext {
  return {
    generation: 2,
    productKey: "eos-2",
    version: "2.0.0",
    releaseStatus: "GENERAL_AVAILABILITY",
    tenantId,
    workspaceId,
  };
}

export function eos3ApiContext(tenantId: string | null, workspaceId: string | null): EosApiVersionContext {
  return {
    generation: EOS3_GENERATION,
    productKey: EOS3_PRODUCT_KEY,
    version: EOS3_VERSION,
    releaseStatus: EOS3_RELEASE_STATUS,
    tenantId,
    workspaceId,
  };
}

/** EOS 2 contracts remain the default when generation is unspecified. */
export function resolveApiContext(
  requested: { generation?: unknown } | null | undefined,
  tenantId: string | null,
  workspaceId: string | null,
): EosApiVersionContext {
  if (requested?.generation === 3 || requested?.generation === "3" || requested?.generation === "eos-3") {
    return eos3ApiContext(tenantId, workspaceId);
  }
  return eos2ApiContext(tenantId, workspaceId);
}
