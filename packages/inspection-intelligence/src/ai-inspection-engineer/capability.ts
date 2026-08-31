export const AI_INSPECTION_ENGINEER_CAPABILITY = "inspection_intelligence.ai_inspection_engineer" as const;
export const AI_INSPECTION_ENGINEER_AGENT_SLUG = "inspection-intelligence-engineer" as const;

export const ENGINEER_MAY = [
  "summarize_inspection",
  "summarize_defects",
  "explain_recorded_condition",
  "summarize_measurements_evidence",
  "identify_missing_information",
  "summarize_recommendations_corrective_actions",
  "compare_inspection_history",
  "explain_deterministic_indicators",
  "draft_report_narrative",
  "answer_questions_about_available_records",
] as const;

export const ENGINEER_MUST_NEVER = [
  "approve_inspections",
  "certify_condition_ratings",
  "approve_evidence",
  "close_defects_autonomously",
  "approve_corrective_actions",
  "publish_reports",
  "mutate_canonical_inspection_truth",
  "create_core_actions",
  "send_external_instructions",
  "invent_remaining_life",
  "invent_deterioration_rate",
  "declare_asset_safe",
  "call_provider_directly",
] as const;

export const ENGINEER_KNOWN_LIMITATIONS = [
  "advisory only; no professional certification or approval authority",
  "UNKNOWN remains UNKNOWN",
  "no remaining-life or failure-probability model in II-5",
  "no deterioration rate unless a like-for-like deterministic measurement delta already exists",
  "AI narrative is draft assistance and never canonical",
  "tools are read-only and scoped to the authenticated user's inspection records",
] as const;
