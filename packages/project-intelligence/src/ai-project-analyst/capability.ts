export const AI_PROJECT_ANALYST_CAPABILITY = "project_intelligence.ai_project_analyst" as const;
export const AI_PROJECT_ANALYST_AGENT_SLUG = "project-intelligence-analyst" as const;

export const ANALYST_MAY = [
  "answer_project_questions",
  "summarize_deterministic_pi",
  "explain_health_states",
  "identify_attention_items",
  "compare_current_deterministic_states",
  "surface_evidence",
  "surface_missing_data",
  "navigate_to_pi_views",
  "generate_bounded_management_brief",
  "surface_external_connector_context",
  "draft_project_report_narrative",
] as const;

export const ANALYST_MUST_NEVER = [
  "calculate_unsupported_metrics",
  "invent_forecasts",
  "infer_unsupported_causality",
  "approve_decisions",
  "mutate_canonical_data",
  "send_external_communications",
  "technical_approval",
  "schedule_approval",
  "cost_approval",
  "change_approval",
  "risk_closure",
  "tq_rfi_response",
  "action_closure",
  "forecast_approval",
  "invoke_connector_writes",
] as const;

export const ANALYST_KNOWN_LIMITATIONS = [
  "forecast is qualitative only",
  "no completion date forecast published unless Project Controls published one",
  "no monetary cost forecast published unless Project Controls published one",
  "no probability forecast",
  "risk trend unavailable without history",
  "register completeness unknown at the 50-record page limit",
  "risk review date is not first-class",
  "RFI is represented through the technical query model",
] as const;
