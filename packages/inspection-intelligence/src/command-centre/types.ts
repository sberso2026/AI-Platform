/**
 * II-6 Inspection Command Centre projections. Compact, reference-only, not canonical copies.
 * Metrics are deterministic counts from existing inspection_* rows.
 */

export const COMMAND_CENTRE_CARD_IDS = [
  "inspections_planned",
  "inspections_in_progress",
  "inspections_recently_completed",
  "open_defects",
  "unverified_defects",
  "outstanding_corrective_actions",
  "inspections_awaiting_verification",
  "condition_rating_distribution",
  "evidence_completeness",
  "recent_inspection_activity",
  "recent_reports",
  "targets_requiring_attention",
] as const;

export type CommandCentreCardId = (typeof COMMAND_CENTRE_CARD_IDS)[number];

export type CommandCentreProvenance = {
  table: string;
  indicatorId?: string;
  field?: string;
  provenanceIds: readonly string[];
  storesCanonicalCopy: false;
  aiDerived: false;
};

export type CommandCentreListItem = {
  id: string;
  title: string;
  status?: string;
  href: string;
  at?: string;
  summary?: string;
};

export type CommandCentreMetricCard = {
  id: CommandCentreCardId;
  label: string;
  value: string;
  hint?: string;
  href: string;
  provenance: CommandCentreProvenance;
  items: readonly CommandCentreListItem[];
};

export type CommandCentreAttentionItem = {
  id: string;
  reasonCode: string;
  explanation: string;
  href: string;
  provenance: CommandCentreProvenance;
};

export type CommandCentreProfile = {
  totalMs: number;
  parallelReadsMs?: number;
  compositionMs?: number;
  readCount?: number;
  stages?: Record<string, number>;
};

export type InspectionCommandCentreView = {
  generatedAt: string;
  storesCanonicalCopy: false;
  aiMetricsIncluded: false;
  healthScore: null;
  riskProbability: null;
  remainingLife: null;
  canWrite: boolean;
  cards: readonly CommandCentreMetricCard[];
  attentionItems: readonly CommandCentreAttentionItem[];
  limitations: readonly string[];
  profile?: CommandCentreProfile;
};
