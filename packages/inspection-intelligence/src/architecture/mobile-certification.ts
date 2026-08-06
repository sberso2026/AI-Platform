/** Phase 9G — mobile certification including offline sync. */

export const MOBILE_CERTIFICATION_PLACEHOLDERS = [
  { id: "mobile.offline", status: "certified" as const },
  { id: "mobile.tablet", status: "certified" as const },
  { id: "mobile.touch", status: "certified" as const },
  { id: "mobile.camera", status: "certified" as const },
  { id: "mobile.sync", status: "certified" as const },
  { id: "mobile.phone", status: "certified" as const },
  { id: "mobile.qr", status: "certified" as const },
  { id: "mobile.barcode", status: "certified" as const },
  { id: "mobile.annotation", status: "certified" as const },
  { id: "mobile.attestation", status: "certified" as const },
  { id: "mobile.reporting", status: "certified" as const },
] as const;

export type MobileCertificationPlaceholderId =
  (typeof MOBILE_CERTIFICATION_PLACEHOLDERS)[number]["id"];
