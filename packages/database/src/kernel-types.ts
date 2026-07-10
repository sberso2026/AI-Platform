/**
 * Phase 1.5 kernel table types — extend via `pnpm db:types` when Supabase is running.
 */
type GenericTable = {
  Row: Record<string, unknown>;
  Insert: Record<string, unknown>;
  Update: Record<string, unknown>;
  Relationships: [];
};

const kernelTable = {} as GenericTable;

export type KernelTables = {
  ai_model_providers: GenericTable;
  ai_model_routes: GenericTable;
  agents: GenericTable;
  agent_tools: GenericTable;
  agent_runs: GenericTable;
  agent_messages: GenericTable;
  agent_tool_calls: GenericTable;
  events: GenericTable;
  event_subscriptions: GenericTable;
  event_dispatch_attempts: GenericTable;
  background_jobs: GenericTable;
  scheduled_jobs: GenericTable;
  job_attempts: GenericTable;
  workflow_definitions: GenericTable;
  workflow_versions: GenericTable;
  workflow_steps: GenericTable;
  workflow_transitions: GenericTable;
  workflow_instances: GenericTable;
  workflow_step_runs: GenericTable;
  knowledge_node_types: GenericTable;
  knowledge_edge_types: GenericTable;
  knowledge_nodes: GenericTable;
  knowledge_edges: GenericTable;
  evidence_items: GenericTable;
  memory_scopes: GenericTable;
  ai_memories: GenericTable;
  memory_links: GenericTable;
  digital_twin_types: GenericTable;
  digital_twins: GenericTable;
  digital_twin_relationships: GenericTable;
  digital_twin_attributes: GenericTable;
  digital_twin_status_history: GenericTable;
  api_keys: GenericTable;
  api_key_permissions: GenericTable;
  api_usage_logs: GenericTable;
  external_integrations: GenericTable;
  webhooks: GenericTable;
  notifications: GenericTable;
  notification_preferences: GenericTable;
  notification_deliveries: GenericTable;
  sensors: GenericTable;
  telemetry_streams: GenericTable;
  telemetry_events: GenericTable;
  telemetry_alert_rules: GenericTable;
  plugins: GenericTable;
  plugin_versions: GenericTable;
  plugin_installations: GenericTable;
  plugin_permissions: GenericTable;
  plugin_dependencies: GenericTable;
  // Batch 1.75 — Platform Intelligence
  ai_tools: GenericTable;
  ai_tool_versions: GenericTable;
  ai_tool_permissions: GenericTable;
  ai_tool_assignments: GenericTable;
  ai_tool_usage_logs: GenericTable;
  ai_tool_health_checks: GenericTable;
  capabilities: GenericTable;
  capability_versions: GenericTable;
  capability_assignments: GenericTable;
  capability_dependencies: GenericTable;
  policies: GenericTable;
  policy_versions: GenericTable;
  policy_conditions: GenericTable;
  policy_actions: GenericTable;
  policy_evaluations: GenericTable;
  policy_violations: GenericTable;
  prompts: GenericTable;
  prompt_versions: GenericTable;
  prompt_variables: GenericTable;
  prompt_usage_logs: GenericTable;
  prompt_approvals: GenericTable;
  model_providers: GenericTable;
  model_registry: GenericTable;
  model_capabilities: GenericTable;
  model_routes: GenericTable;
  model_usage_logs: GenericTable;
  tenant_model_policies: GenericTable;
  cost_events: GenericTable;
  cost_allocations: GenericTable;
  cost_rates: GenericTable;
  cost_budgets: GenericTable;
  cost_alerts: GenericTable;
  traces: GenericTable;
  trace_spans: GenericTable;
  metric_events: GenericTable;
  error_events: GenericTable;
  health_checks: GenericTable;
  service_status: GenericTable;
  features: GenericTable;
  feature_flags: GenericTable;
  feature_assignments: GenericTable;
  feature_evaluations: GenericTable;
  secrets: GenericTable;
  secret_versions: GenericTable;
  secret_access_logs: GenericTable;
  secret_permissions: GenericTable;
  eval_datasets: GenericTable;
  eval_cases: GenericTable;
  eval_runs: GenericTable;
  eval_results: GenericTable;
  eval_rubrics: GenericTable;
  eval_regression_reports: GenericTable;
  // Batch 2.0 — Engineering OS
  engineering_disciplines: GenericTable;
  engineering_companies: GenericTable;
  engineering_company_contacts: GenericTable;
  engineering_asset_types: GenericTable;
  engineering_projects: GenericTable;
  engineering_project_members: GenericTable;
  engineering_assets: GenericTable;
  engineering_documents: GenericTable;
  engineering_document_versions: GenericTable;
  engineering_tags: GenericTable;
  engineering_entity_tags: GenericTable;
  engineering_application_registry: GenericTable;
  engineering_application_installations: GenericTable;
  engineering_settings: GenericTable;
  engineering_audit_links: GenericTable;
  // Batch 2.05 — Engineering Intelligence Registers
  engineering_object_links: GenericTable;
  engineering_object_comments: GenericTable;
  engineering_object_attachments: GenericTable;
  engineering_timeline_events: GenericTable;
  engineering_activity_events: GenericTable;
  engineering_decisions: GenericTable;
  engineering_actions: GenericTable;
  engineering_risks: GenericTable;
  engineering_issues: GenericTable;
  engineering_technical_queries: GenericTable;
  engineering_lessons: GenericTable;
};

export type KernelDatabase = {
  public: {
    Tables: KernelTables;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

// Prevent unused variable warning
void kernelTable;
