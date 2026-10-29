-- EOS-A16D: engineering-admin may enqueue SharePoint library index jobs.
-- Additive INSERT only. Does not weaken the existing background_jobs_manage policy.
-- Does not disable RLS. Does not grant service-role bypass. Does not allow other job types.

ALTER TABLE background_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS background_jobs_engineering_m365_sync_insert ON background_jobs;

CREATE POLICY background_jobs_engineering_m365_sync_insert ON background_jobs
  FOR INSERT
  WITH CHECK (
    job_type = 'engineering.m365.sharepoint.sync'
    AND tenant_id = ANY (get_user_tenant_ids())
    AND workspace_id IS NOT NULL
    AND engineering_core_workspace_member(workspace_id)
    AND has_permission('engineering', 'admin', tenant_id)
  );
