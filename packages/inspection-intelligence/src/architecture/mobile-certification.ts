/** Phase 9F — mobile certification statuses (product-executed, not reserved-only). */

export const MOBILE_CERTIFICATION_PLACEHOLDERS = [
  { id: "mobile.offline", status: "reserved" as const },
  { id: "mobile.tablet", status: "certified" as const },
  { id: "mobile.touch", status: "certified" as const },
  { id: "mobile.camera", status: "certified" as const },
  { id: "mobile.sync", status: "reserved" as const },
  { id: "mobile.phone", status: "certified" as const },
  { id: "mobile.qr", status: "certified" as const },
  { id: "mobile.barcode", status: "certified" as const },
  { id: "mobile.annotation", status: "certified" as const },
  { id: "mobile.attestation", status: "certified" as const },
] as const;

export type MobileCertificationPlaceholderId =
  (typeof MOBILE_CERTIFICATION_PLACEHOLDERS)[number]["id"];
