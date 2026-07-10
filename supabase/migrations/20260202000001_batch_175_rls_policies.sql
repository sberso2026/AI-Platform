-- RTB AI Platform Batch 1.75 — RLS Policies for Intelligence Layer

-- Enable RLS
ALTER TABLE ai_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tool_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tool_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tool_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tool_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tool_health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE capability_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE capability_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE capability_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_variables ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_model_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE traces ENABLE ROW LEVEL SECURITY;
ALTER TABLE trace_spans ENABLE ROW LEVEL SECURITY;
ALTER TABLE metric_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE features ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE secret_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE secret_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE secret_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE eval_datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE eval_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE eval_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE eval_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE eval_rubrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE eval_regression_reports ENABLE ROW LEVEL SECURITY;

-- Helper macro pattern: tenant read + ai_agent admin manage

-- Tool Registry
CREATE POLICY ai_tools_select ON ai_tools FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));
CREATE POLICY ai_tools_manage ON ai_tools FOR ALL USING (has_permission('ai_agent', 'admin', tenant_id));
CREATE POLICY ai_tool_versions_select ON ai_tool_versions FOR SELECT USING (
  EXISTS (SELECT 1 FROM ai_tools t WHERE t.id = tool_id AND t.tenant_id = ANY(get_user_tenant_ids()))
);
CREATE POLICY ai_tool_versions_manage ON ai_tool_versions FOR ALL USING (
  EXISTS (SELECT 1 FROM ai_tools t WHERE t.id = tool_id AND has_permission('ai_agent', 'admin', t.tenant_id))
);
CREATE POLICY ai_tool_permissions_select ON ai_tool_permissions FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));
CREATE POLICY ai_tool_permissions_manage ON ai_tool_permissions FOR ALL USING (has_permission('ai_agent', 'admin', tenant_id));
CREATE POLICY ai_tool_assignments_select ON ai_tool_assignments FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));
CREATE POLICY ai_tool_assignments_manage ON ai_tool_assignments FOR ALL USING (has_permission('ai_agent', 'admin', tenant_id));
CREATE POLICY ai_tool_usage_logs_select ON ai_tool_usage_logs FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));
CREATE POLICY ai_tool_usage_logs_insert ON ai_tool_usage_logs FOR INSERT WITH CHECK (tenant_id = ANY(get_user_tenant_ids()));
CREATE POLICY ai_tool_health_checks_select ON ai_tool_health_checks FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));
CREATE POLICY ai_tool_health_checks_manage ON ai_tool_health_checks FOR ALL USING (has_permission('ai_agent', 'admin', tenant_id));

-- Capability Registry
CREATE POLICY capabilities_select ON capabilities FOR SELECT USING (
  tenant_id IS NULL OR tenant_id = ANY(get_user_tenant_ids())
);
CREATE POLICY capabilities_manage ON capabilities FOR ALL USING (
  tenant_id IS NOT NULL AND has_permission('ai_agent', 'admin', tenant_id)
);
CREATE POLICY capability_versions_select ON capability_versions FOR SELECT USING (
  EXISTS (SELECT 1 FROM capabilities c WHERE c.id = capability_id AND (c.tenant_id IS NULL OR c.tenant_id = ANY(get_user_tenant_ids())))
);
CREATE POLICY capability_assignments_select ON capability_assignments FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));
CREATE POLICY capability_assignments_manage ON capability_assignments FOR ALL USING (has_permission('ai_agent', 'admin', tenant_id));
CREATE POLICY capability_dependencies_select ON capability_dependencies FOR SELECT USING (TRUE);

-- Policy Engine
CREATE POLICY policies_select ON policies FOR SELECT USING (
  tenant_id IS NULL OR tenant_id = ANY(get_user_tenant_ids())
);
CREATE POLICY policies_manage ON policies FOR ALL USING (
  tenant_id IS NOT NULL AND has_permission('ai_agent', 'admin', tenant_id)
);
CREATE POLICY policy_versions_select ON policy_versions FOR SELECT USING (TRUE);
CREATE POLICY policy_conditions_select ON policy_conditions FOR SELECT USING (TRUE);
CREATE POLICY policy_actions_select ON policy_actions FOR SELECT USING (TRUE);
CREATE POLICY policy_evaluations_select ON policy_evaluations FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));
CREATE POLICY policy_evaluations_insert ON policy_evaluations FOR INSERT WITH CHECK (tenant_id = ANY(get_user_tenant_ids()));
CREATE POLICY policy_violations_select ON policy_violations FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));
CREATE POLICY policy_violations_insert ON policy_violations FOR INSERT WITH CHECK (tenant_id = ANY(get_user_tenant_ids()));

-- Prompt Registry
CREATE POLICY prompts_select ON prompts FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));
CREATE POLICY prompts_manage ON prompts FOR ALL USING (has_permission('ai_agent', 'admin', tenant_id));
CREATE POLICY prompt_versions_select ON prompt_versions FOR SELECT USING (
  EXISTS (SELECT 1 FROM prompts p WHERE p.id = prompt_id AND p.tenant_id = ANY(get_user_tenant_ids()))
);
CREATE POLICY prompt_versions_manage ON prompt_versions FOR ALL USING (
  EXISTS (SELECT 1 FROM prompts p WHERE p.id = prompt_id AND has_permission('ai_agent', 'admin', p.tenant_id))
);
CREATE POLICY prompt_variables_select ON prompt_variables FOR SELECT USING (TRUE);
CREATE POLICY prompt_usage_logs_select ON prompt_usage_logs FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));
CREATE POLICY prompt_usage_logs_insert ON prompt_usage_logs FOR INSERT WITH CHECK (tenant_id = ANY(get_user_tenant_ids()));
CREATE POLICY prompt_approvals_select ON prompt_approvals FOR SELECT USING (TRUE);

-- Model Registry
CREATE POLICY model_providers_select ON model_providers FOR SELECT USING (
  tenant_id IS NULL OR tenant_id = ANY(get_user_tenant_ids())
);
CREATE POLICY model_providers_manage ON model_providers FOR ALL USING (
  tenant_id IS NOT NULL AND has_permission('ai_agent', 'admin', tenant_id)
);
CREATE POLICY model_registry_select ON model_registry FOR SELECT USING (
  tenant_id IS NULL OR tenant_id = ANY(get_user_tenant_ids())
);
CREATE POLICY model_registry_manage ON model_registry FOR ALL USING (
  tenant_id IS NOT NULL AND has_permission('ai_agent', 'admin', tenant_id)
);
CREATE POLICY model_capabilities_select ON model_capabilities FOR SELECT USING (TRUE);
CREATE POLICY model_routes_select ON model_routes FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));
CREATE POLICY model_routes_manage ON model_routes FOR ALL USING (has_permission('ai_agent', 'admin', tenant_id));
CREATE POLICY model_usage_logs_select ON model_usage_logs FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));
CREATE POLICY model_usage_logs_insert ON model_usage_logs FOR INSERT WITH CHECK (tenant_id = ANY(get_user_tenant_ids()));
CREATE POLICY tenant_model_policies_select ON tenant_model_policies FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));
CREATE POLICY tenant_model_policies_manage ON tenant_model_policies FOR ALL USING (has_permission('ai_agent', 'admin', tenant_id));

-- Cost Engine
CREATE POLICY cost_events_select ON cost_events FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));
CREATE POLICY cost_events_insert ON cost_events FOR INSERT WITH CHECK (tenant_id = ANY(get_user_tenant_ids()));
CREATE POLICY cost_allocations_select ON cost_allocations FOR SELECT USING (
  EXISTS (SELECT 1 FROM cost_events ce WHERE ce.id = cost_event_id AND ce.tenant_id = ANY(get_user_tenant_ids()))
);
CREATE POLICY cost_allocations_insert ON cost_allocations FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM cost_events ce WHERE ce.id = cost_event_id AND ce.tenant_id = ANY(get_user_tenant_ids()))
);
CREATE POLICY cost_rates_select ON cost_rates FOR SELECT USING (
  tenant_id IS NULL OR tenant_id = ANY(get_user_tenant_ids())
);
CREATE POLICY cost_budgets_select ON cost_budgets FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));
CREATE POLICY cost_budgets_manage ON cost_budgets FOR ALL USING (has_permission('ai_agent', 'admin', tenant_id));
CREATE POLICY cost_alerts_select ON cost_alerts FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));

-- Observability
CREATE POLICY traces_select ON traces FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));
CREATE POLICY traces_insert ON traces FOR INSERT WITH CHECK (tenant_id = ANY(get_user_tenant_ids()));
CREATE POLICY traces_update ON traces FOR UPDATE USING (tenant_id = ANY(get_user_tenant_ids()));
CREATE POLICY trace_spans_select ON trace_spans FOR SELECT USING (
  EXISTS (SELECT 1 FROM traces t WHERE t.id = trace_id AND t.tenant_id = ANY(get_user_tenant_ids()))
);
CREATE POLICY trace_spans_insert ON trace_spans FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM traces t WHERE t.id = trace_id AND t.tenant_id = ANY(get_user_tenant_ids()))
);
CREATE POLICY metric_events_select ON metric_events FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));
CREATE POLICY metric_events_insert ON metric_events FOR INSERT WITH CHECK (tenant_id = ANY(get_user_tenant_ids()));
CREATE POLICY error_events_select ON error_events FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));
CREATE POLICY error_events_insert ON error_events FOR INSERT WITH CHECK (tenant_id = ANY(get_user_tenant_ids()));
CREATE POLICY health_checks_select ON health_checks FOR SELECT USING (
  tenant_id IS NULL OR tenant_id = ANY(get_user_tenant_ids())
);
CREATE POLICY service_status_select ON service_status FOR SELECT USING (
  tenant_id IS NULL OR tenant_id = ANY(get_user_tenant_ids())
);

-- Feature Flags
CREATE POLICY features_select ON features FOR SELECT USING (TRUE);
CREATE POLICY feature_flags_select ON feature_flags FOR SELECT USING (
  tenant_id IS NULL OR tenant_id = ANY(get_user_tenant_ids())
);
CREATE POLICY feature_flags_manage ON feature_flags FOR ALL USING (
  tenant_id IS NOT NULL AND has_permission('ai_agent', 'admin', tenant_id)
);
CREATE POLICY feature_assignments_select ON feature_assignments FOR SELECT USING (TRUE);
CREATE POLICY feature_evaluations_select ON feature_evaluations FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));
CREATE POLICY feature_evaluations_insert ON feature_evaluations FOR INSERT WITH CHECK (tenant_id = ANY(get_user_tenant_ids()));

-- Secret Management
CREATE POLICY secrets_select ON secrets FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));
CREATE POLICY secrets_manage ON secrets FOR ALL USING (has_permission('ai_agent', 'admin', tenant_id));
CREATE POLICY secret_versions_select ON secret_versions FOR SELECT USING (
  EXISTS (SELECT 1 FROM secrets s WHERE s.id = secret_id AND s.tenant_id = ANY(get_user_tenant_ids()))
);
CREATE POLICY secret_access_logs_select ON secret_access_logs FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));
CREATE POLICY secret_access_logs_insert ON secret_access_logs FOR INSERT WITH CHECK (tenant_id = ANY(get_user_tenant_ids()));
CREATE POLICY secret_permissions_select ON secret_permissions FOR SELECT USING (
  EXISTS (SELECT 1 FROM secrets s WHERE s.id = secret_id AND s.tenant_id = ANY(get_user_tenant_ids()))
);

-- AI Evaluation
CREATE POLICY eval_datasets_select ON eval_datasets FOR SELECT USING (
  tenant_id IS NULL OR tenant_id = ANY(get_user_tenant_ids())
);
CREATE POLICY eval_datasets_manage ON eval_datasets FOR ALL USING (
  tenant_id IS NOT NULL AND has_permission('ai_agent', 'admin', tenant_id)
);
CREATE POLICY eval_cases_select ON eval_cases FOR SELECT USING (TRUE);
CREATE POLICY eval_runs_select ON eval_runs FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));
CREATE POLICY eval_runs_manage ON eval_runs FOR ALL USING (has_permission('ai_agent', 'admin', tenant_id));
CREATE POLICY eval_results_select ON eval_results FOR SELECT USING (
  EXISTS (SELECT 1 FROM eval_runs r WHERE r.id = run_id AND r.tenant_id = ANY(get_user_tenant_ids()))
);
CREATE POLICY eval_rubrics_select ON eval_rubrics FOR SELECT USING (
  tenant_id IS NULL OR tenant_id = ANY(get_user_tenant_ids())
);
CREATE POLICY eval_regression_reports_select ON eval_regression_reports FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));
