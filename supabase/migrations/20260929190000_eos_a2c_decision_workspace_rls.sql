-- EOS-A2C — Decision workspace fail-closed RLS + selection delete safety
-- Additive. Does not rewrite EOS-A2 objects. Does not add systems/interfaces/requirements.
--
-- BEFORE (batch_205): engineering_decisions SELECT/INSERT/UPDATE/DELETE are tenant-only.
-- AFTER: tenant + engineering_core_workspace_member, matching Core projects/documents (ERA-6).
-- NULL workspace_id remains stored; user JWT cannot read it (fail-closed, not deletion).
--
-- Existing A2 child/assumption policies already use engineering_core_workspace_member.
-- object_links: governed endpoints must be workspace-visible; unknown legacy types stay tenant-only.
--
-- Does not weaken any existing policy.

DROP TRIGGER IF EXISTS engineering_decisions_workspace_tenant ON engineering_decisions;
CREATE TRIGGER engineering_decisions_workspace_tenant
  BEFORE INSERT OR UPDATE ON engineering_decisions
  FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant();

DROP TRIGGER IF EXISTS engineering_decisions_ownership_immutable ON engineering_decisions;
CREATE TRIGGER engineering_decisions_ownership_immutable
  BEFORE UPDATE ON engineering_decisions
  FOR EACH ROW EXECUTE FUNCTION engineering_core_prevent_ownership_mutation();

DROP POLICY IF EXISTS eng_decisions_select ON engineering_decisions;
DROP POLICY IF EXISTS eng_decisions_insert ON engineering_decisions;
DROP POLICY IF EXISTS eng_decisions_update ON engineering_decisions;
DROP POLICY IF EXISTS eng_decisions_delete ON engineering_decisions;

CREATE POLICY eng_decisions_select ON engineering_decisions FOR SELECT USING (
  tenant_id = ANY(get_user_tenant_ids())
  AND engineering_core_workspace_member(workspace_id)
);

CREATE POLICY eng_decisions_insert ON engineering_decisions FOR INSERT WITH CHECK (
  tenant_id = ANY(get_user_tenant_ids())
  AND has_permission('engineering', 'execute', tenant_id)
  AND engineering_core_workspace_member(workspace_id)
);

CREATE POLICY eng_decisions_update ON engineering_decisions FOR UPDATE
  USING (
    tenant_id = ANY(get_user_tenant_ids())
    AND has_permission('engineering', 'execute', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  )
  WITH CHECK (
    tenant_id = ANY(get_user_tenant_ids())
    AND has_permission('engineering', 'execute', tenant_id)
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE POLICY eng_decisions_delete ON engineering_decisions FOR DELETE USING (
  has_permission('engineering', 'admin', tenant_id)
  AND engineering_core_workspace_member(workspace_id)
);

-- Clearing selected_alternative_id when the selected child is deleted avoids an
-- impossible parent pointer (composite FK cannot ON DELETE SET NULL on (alt_id, decision.id)).
-- Nested parent UPDATE must not re-enter selection sync (that heap-updates the deleting row).
CREATE OR REPLACE FUNCTION engineering_decision_sync_selected_alternative()
RETURNS TRIGGER AS $$
BEGIN
  IF pg_trigger_depth() > 1 THEN
    RETURN NEW;
  END IF;
  IF TG_TABLE_NAME = 'engineering_decisions' THEN
    UPDATE engineering_decision_alternatives
       SET is_selected = (id = NEW.selected_alternative_id),
           status = CASE
             WHEN id = NEW.selected_alternative_id THEN 'selected'
             WHEN is_selected AND status = 'selected' THEN 'considered'
             ELSE status
           END
     WHERE decision_id = NEW.id
       AND (is_selected OR id = NEW.selected_alternative_id);
    RETURN NEW;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER
SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION engineering_decision_clear_selected_on_alt_delete()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE engineering_decisions
     SET selected_alternative_id = NULL
   WHERE id = OLD.decision_id
     AND selected_alternative_id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER
SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS engineering_decision_alternatives_clear_selected ON engineering_decision_alternatives;
CREATE TRIGGER engineering_decision_alternatives_clear_selected
  BEFORE DELETE ON engineering_decision_alternatives
  FOR EACH ROW EXECUTE FUNCTION engineering_decision_clear_selected_on_alt_delete();

-- Link visibility: resolvable Core/Review endpoints require workspace membership
-- on both sides. Types outside the A2 resolve set remain tenant-gated (legacy).
CREATE OR REPLACE FUNCTION engineering_core_link_endpoint_allowed(p_type TEXT, p_id UUID)
RETURNS BOOLEAN AS $$
  SELECT CASE
    WHEN p_type IN (
      'decision', 'assumption', 'document', 'risk', 'project', 'asset',
      'alternative', 'review_package', 'review_evidence'
    ) THEN EXISTS (
      SELECT 1
      FROM engineering_object_link_resolve(p_type, p_id) r
      WHERE engineering_core_workspace_member(r.workspace_id)
    )
    ELSE TRUE
  END;
$$ LANGUAGE sql STABLE SECURITY INVOKER
SET search_path = public, pg_temp;

DROP POLICY IF EXISTS eng_obj_links_select ON engineering_object_links;
DROP POLICY IF EXISTS eng_obj_links_manage ON engineering_object_links;

CREATE POLICY eng_obj_links_select ON engineering_object_links FOR SELECT USING (
  tenant_id = ANY(get_user_tenant_ids())
  AND engineering_core_link_endpoint_allowed(from_type, from_id)
  AND engineering_core_link_endpoint_allowed(to_type, to_id)
);

CREATE POLICY eng_obj_links_manage ON engineering_object_links FOR ALL
  USING (
    tenant_id = ANY(get_user_tenant_ids())
    AND has_permission('engineering', 'execute', tenant_id)
    AND engineering_core_link_endpoint_allowed(from_type, from_id)
    AND engineering_core_link_endpoint_allowed(to_type, to_id)
  )
  WITH CHECK (
    tenant_id = ANY(get_user_tenant_ids())
    AND has_permission('engineering', 'execute', tenant_id)
    AND engineering_core_link_endpoint_allowed(from_type, from_id)
    AND engineering_core_link_endpoint_allowed(to_type, to_id)
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE engineering_decision_alternatives TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE engineering_decision_approvals TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE engineering_assumptions TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION engineering_core_link_endpoint_allowed(TEXT, UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION engineering_object_link_resolve(TEXT, UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION engineering_decision_clear_selected_on_alt_delete() TO anon, authenticated, service_role;

COMMENT ON POLICY eng_decisions_select ON engineering_decisions IS
  'EOS-A2C: tenant + workspace membership. NULL workspace_id is fail-closed for user JWT.';
COMMENT ON FUNCTION engineering_core_link_endpoint_allowed(TEXT, UUID) IS
  'EOS-A2C: resolvable link endpoints require engineering_core_workspace_member. Unknown types stay tenant-only.';
