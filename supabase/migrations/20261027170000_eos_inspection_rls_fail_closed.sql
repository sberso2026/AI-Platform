-- Fail closed the inspection policies that treated a missing JWT tenant claim as a match
-- for every row. Historical files 20260806230000, 20260806240000, and 20260807010000
-- stay unchanged because they are already applied on production and staging.
-- Membership is taken from tenant_memberships and workspace_memberships. The policy
-- does not trust request.jwt.claims tenant_id. Anonymous roles receive no policy.

CREATE OR REPLACE FUNCTION public.inspection_workspace_visible(
  p_tenant_id uuid,
  p_workspace_id uuid
) RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
  SELECT p_tenant_id IS NOT NULL
    AND p_workspace_id IS NOT NULL
    AND p_tenant_id = ANY (public.get_user_tenant_ids())
    AND EXISTS (
      SELECT 1
      FROM public.workspace_memberships wm
      WHERE wm.user_id = auth.uid()
        AND wm.workspace_id = p_workspace_id
    );
$$;

REVOKE ALL ON FUNCTION public.inspection_workspace_visible(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.inspection_workspace_visible(uuid, uuid) TO authenticated;

DO $$
DECLARE
  target text;
BEGIN
  FOREACH target IN ARRAY ARRAY[
    'inspection_assignments',
    'inspection_workflow_instances',
    'inspection_workflow_audit',
    'inspection_workflow_sla_timers',
    'inspection_reporting_outputs',
    'inspection_media_stages',
    'inspection_evidence_annotations',
    'inspection_attestations',
    'inspection_offline_packages',
    'inspection_offline_commands',
    'inspection_offline_evidence_queue',
    'inspection_offline_entitlement_snapshots'
  ]
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', target || '_tenant_isolation', target);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (public.inspection_workspace_visible(tenant_id, workspace_id)) WITH CHECK (public.inspection_workspace_visible(tenant_id, workspace_id))',
      target || '_tenant_isolation',
      target
    );
  END LOOP;
END $$;
