/**
 * CSIInteropCore — internal session / error / metadata helper ONLY.
 *
 * Not a business domain. Product adapters (ETABS, SAP2000, SAFE, CSiBridge)
 * remain separate. SAP2000 / SAFE / CSiBridge stay reserved / unimplemented.
 */

export const CSI_INTEROP_CORE_ROLE = "internal_helper" as const;
export const CSI_PRODUCT_ADAPTERS_SEPARATE = true as const;

export type CsiProductKey = "etabs" | "sap2000" | "safe" | "csibridge";

export type CsiSessionMetadata = {
  productKey: CsiProductKey;
  sessionId: string;
  startedAt: string;
  comAvailable: false | true;
  transport:
    | "export_fixture"
    | "csi_com_oapi"
    | "unavailable";
  notes: string;
};

export type CsiInteropErrorCode =
  | "com_unavailable"
  | "product_reserved"
  | "session_closed"
  | "metadata_invalid"
  | "solver_unavailable";

export type CsiInteropError = {
  code: CsiInteropErrorCode;
  detail: string;
  productKey?: CsiProductKey;
  silentFallbackUsed: false;
};

/** Open an internal metadata session — never claims live COM without evidence. */
export function openCsiInteropSession(input: {
  productKey: CsiProductKey;
  comAvailable?: boolean;
}): CsiSessionMetadata {
  const comAvailable = Boolean(input.comAvailable);
  return {
    productKey: input.productKey,
    sessionId: `csi_sess_${input.productKey}_${Date.now().toString(36)}`,
    startedAt: new Date().toISOString(),
    comAvailable: comAvailable ? true : false,
    transport: comAvailable ? "csi_com_oapi" : "export_fixture",
    notes: comAvailable
      ? "CSI COM/OAPI session metadata (product adapter owns business ops)."
      : "Export/fixture federation path — not live native COM.",
  };
}

export function csiInteropError(
  code: CsiInteropErrorCode,
  detail: string,
  productKey?: CsiProductKey,
): CsiInteropError {
  return { code, detail, productKey, silentFallbackUsed: false };
}

/** Reserved products must not be treated as implemented adapters. */
export function assertCsiProductAdapterAllowed(productKey: CsiProductKey): void {
  if (productKey !== "etabs") {
    throw new Error(`csi_product_reserved:${productKey}`);
  }
}

export function isCsiInteropCoreBusinessDomain(): false {
  return false;
}
