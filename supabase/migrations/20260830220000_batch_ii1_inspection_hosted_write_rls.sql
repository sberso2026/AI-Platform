-- II-1 hosted persistence: user-JWT write policies for existing inspection_* tables.
-- No new tables or columns. Batches 43–45 shipped SELECT-only RLS because the
-- V1 engine was in-memory; hosted user writes were an implementation defect, not
-- a missing truth model.
-- Predicate matches existing SELECT policies (tenant membership + workspace membership).

DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'inspection_templates',
    'inspection_plans',
    'inspection_sessions',
    'inspection_observations',
    'inspection_measurements',
    'inspection_evidence',
    'inspection_reviews',
    'inspection_template_versions',
    'inspection_targets',
    'inspection_approvals',
    'inspection_events',
    'inspection_defects',
    'inspection_recommendations',
    'inspection_corrective_actions',
    'inspection_assessments',
    'inspection_verifications',
    'inspection_compliance_links',
    'inspection_risk_links'
  ]
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE tablename = tbl AND policyname = tbl || '_insert'
    ) THEN
      EXECUTE format(
        'CREATE POLICY %I ON %I FOR INSERT WITH CHECK (
           tenant_id = ANY(get_user_tenant_ids())
           AND workspace_id IN (
             SELECT workspace_id FROM workspace_memberships WHERE user_id = auth.uid()
           )
         )',
        tbl || '_insert',
        tbl
      );
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE tablename = tbl AND policyname = tbl || '_update'
    ) THEN
      EXECUTE format(
        'CREATE POLICY %I ON %I FOR UPDATE USING (
           tenant_id = ANY(get_user_tenant_ids())
           AND workspace_id IN (
             SELECT workspace_id FROM workspace_memberships WHERE user_id = auth.uid()
           )
         ) WITH CHECK (
           tenant_id = ANY(get_user_tenant_ids())
           AND workspace_id IN (
             SELECT workspace_id FROM workspace_memberships WHERE user_id = auth.uid()
           )
         )',
        tbl || '_update',
        tbl
      );
    END IF;
  END LOOP;
END $$;
