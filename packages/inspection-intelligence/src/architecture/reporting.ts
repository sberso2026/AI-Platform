/** Pack-aware reporting extensions — no report duplication / private report engine. */

export type PackReportDefinition = {
  packId: string;
  reportKey: string;
  title: string;
  supportsExecutiveSummary: boolean;
  supportsEvidenceCitations: boolean;
  supportsAttachments: boolean;
  kpis: string[];
  complianceKeys: string[];
};

export const GENERIC_PACK_REPORTS: PackReportDefinition[] = [
  {
    packId: "generic",
    reportKey: "executive_summary",
    title: "Inspection Executive Summary",
    supportsExecutiveSummary: true,
    supportsEvidenceCitations: true,
    supportsAttachments: true,
    kpis: ["sessions_completed", "defects_open", "overdue"],
    complianceKeys: ["review_complete"],
  },
];
