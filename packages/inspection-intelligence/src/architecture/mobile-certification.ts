/** Mobile certification placeholders — reserved gates, not product-executed in 9B. */

export const MOBILE_CERTIFICATION_PLACEHOLDERS = [
  { id: "mobile.offline", status: "reserved" as const },
  { id: "mobile.tablet", status: "reserved" as const },
  { id: "mobile.touch", status: "reserved" as const },
  { id: "mobile.camera", status: "reserved" as const },
  { id: "mobile.sync", status: "reserved" as const },
] as const;

export type MobileCertificationPlaceholderId =
  (typeof MOBILE_CERTIFICATION_PLACEHOLDERS)[number]["id"];
