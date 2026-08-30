-- II-1C hosted-wiring defect: batch 49 condition-rating RLS used
-- auth.jwt()->>'tenant_id', which is not present on real user JWTs.
-- Align with existing inspection_* membership predicates. No new tables/columns.

DROP POLICY IF EXISTS tenant_isolation_condition_ratings ON public.inspection_condition_ratings;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'inspection_condition_ratings' AND policyname = 'inspection_condition_ratings_select'
  ) THEN
    CREATE POLICY inspection_condition_ratings_select ON public.inspection_condition_ratings
      FOR SELECT USING (
        tenant_id = ANY(get_user_tenant_ids())
        AND workspace_id IN (
          SELECT workspace_id FROM workspace_memberships WHERE user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'inspection_condition_ratings' AND policyname = 'inspection_condition_ratings_insert'
  ) THEN
    CREATE POLICY inspection_condition_ratings_insert ON public.inspection_condition_ratings
      FOR INSERT WITH CHECK (
        tenant_id = ANY(get_user_tenant_ids())
        AND workspace_id IN (
          SELECT workspace_id FROM workspace_memberships WHERE user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'inspection_condition_ratings' AND policyname = 'inspection_condition_ratings_update'
  ) THEN
    CREATE POLICY inspection_condition_ratings_update ON public.inspection_condition_ratings
      FOR UPDATE USING (
        tenant_id = ANY(get_user_tenant_ids())
        AND workspace_id IN (
          SELECT workspace_id FROM workspace_memberships WHERE user_id = auth.uid()
        )
      ) WITH CHECK (
        tenant_id = ANY(get_user_tenant_ids())
        AND workspace_id IN (
          SELECT workspace_id FROM workspace_memberships WHERE user_id = auth.uid()
        )
      );
  END IF;
END $$;
