-- EOS-A8A — Engineering Digital Thread link resolver
-- Additive. Does not create a Digital Thread object table or a third graph store.
-- Registers analysis_request / analysis_result so A7B governed links resolve
-- under the existing engineering_object_links scope guard and RLS helper.

CREATE OR REPLACE FUNCTION engineering_object_link_resolve(p_type TEXT, p_id UUID)
RETURNS TABLE (tenant_id UUID, workspace_id UUID) AS $$
BEGIN
  CASE p_type
    WHEN 'decision' THEN
      RETURN QUERY SELECT d.tenant_id, d.workspace_id FROM engineering_decisions d WHERE d.id = p_id;
    WHEN 'assumption' THEN
      RETURN QUERY SELECT a.tenant_id, a.workspace_id FROM engineering_assumptions a WHERE a.id = p_id;
    WHEN 'document' THEN
      RETURN QUERY SELECT x.tenant_id, x.workspace_id FROM engineering_documents x WHERE x.id = p_id;
    WHEN 'risk' THEN
      RETURN QUERY SELECT x.tenant_id, x.workspace_id FROM engineering_risks x WHERE x.id = p_id;
    WHEN 'project' THEN
      RETURN QUERY SELECT x.tenant_id, x.workspace_id FROM engineering_projects x WHERE x.id = p_id;
    WHEN 'asset' THEN
      RETURN QUERY SELECT x.tenant_id, x.workspace_id FROM engineering_assets x WHERE x.id = p_id;
    WHEN 'alternative' THEN
      RETURN QUERY SELECT x.tenant_id, x.workspace_id FROM engineering_decision_alternatives x WHERE x.id = p_id;
    WHEN 'review_package' THEN
      RETURN QUERY SELECT x.tenant_id, x.workspace_id FROM engineering_review_packages x WHERE x.id = p_id;
    WHEN 'review_evidence' THEN
      RETURN QUERY SELECT x.tenant_id, x.workspace_id FROM engineering_review_evidence x WHERE x.id = p_id;
    WHEN 'system' THEN
      RETURN QUERY SELECT x.tenant_id, x.workspace_id FROM engineering_systems x WHERE x.id = p_id;
    WHEN 'interface' THEN
      RETURN QUERY SELECT x.tenant_id, x.workspace_id FROM engineering_interfaces x WHERE x.id = p_id;
    WHEN 'requirement' THEN
      RETURN QUERY SELECT x.tenant_id, x.workspace_id FROM engineering_requirements x WHERE x.id = p_id;
    WHEN 'change' THEN
      RETURN QUERY SELECT x.tenant_id, x.workspace_id FROM engineering_changes x WHERE x.id = p_id;
    WHEN 'impact' THEN
      RETURN QUERY SELECT x.tenant_id, x.workspace_id FROM engineering_impacts x WHERE x.id = p_id;
    WHEN 'configuration_baseline' THEN
      RETURN QUERY SELECT x.tenant_id, x.workspace_id FROM engineering_configuration_baselines x WHERE x.id = p_id;
    WHEN 'optimization_study' THEN
      RETURN QUERY SELECT x.tenant_id, x.workspace_id FROM engineering_optimization_studies x WHERE x.id = p_id;
    WHEN 'optimization_run' THEN
      RETURN QUERY SELECT x.tenant_id, x.workspace_id FROM engineering_optimization_runs x WHERE x.id = p_id;
    WHEN 'optimization_alternative' THEN
      RETURN QUERY SELECT x.tenant_id, x.workspace_id FROM engineering_optimization_alternatives x WHERE x.id = p_id;
    WHEN 'optimization_constraint' THEN
      RETURN QUERY SELECT x.tenant_id, x.workspace_id FROM engineering_optimization_constraints x WHERE x.id = p_id;
    WHEN 'analysis_request' THEN
      RETURN QUERY SELECT x.tenant_id, x.workspace_id FROM engineering_analysis_requests x WHERE x.id = p_id;
    WHEN 'analysis_result' THEN
      RETURN QUERY SELECT x.tenant_id, x.workspace_id FROM engineering_analysis_results x WHERE x.id = p_id;
    ELSE
      RETURN;
  END CASE;
END;
$$ LANGUAGE plpgsql STABLE SECURITY INVOKER
SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION engineering_core_link_endpoint_allowed(p_type TEXT, p_id UUID)
RETURNS BOOLEAN AS $$
  SELECT CASE
    WHEN p_type IN (
      'decision', 'assumption', 'document', 'risk', 'project', 'asset',
      'alternative', 'review_package', 'review_evidence', 'system', 'interface',
      'requirement', 'change', 'impact', 'configuration_baseline',
      'optimization_study', 'optimization_run', 'optimization_alternative', 'optimization_constraint',
      'analysis_request', 'analysis_result'
    ) THEN EXISTS (
      SELECT 1
      FROM engineering_object_link_resolve(p_type, p_id) r
      WHERE engineering_core_workspace_member(r.workspace_id)
    )
    ELSE TRUE
  END;
$$ LANGUAGE sql STABLE SECURITY INVOKER
SET search_path = public, pg_temp;

GRANT EXECUTE ON FUNCTION engineering_object_link_resolve(TEXT, UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION engineering_core_link_endpoint_allowed(TEXT, UUID) TO anon, authenticated, service_role;

COMMENT ON FUNCTION engineering_object_link_resolve(TEXT, UUID) IS
  'EOS-A8A: resolves governed link endpoints including analysis_request and analysis_result. No Digital Thread object table.';
