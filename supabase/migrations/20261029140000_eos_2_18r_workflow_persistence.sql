-- EOS 2.18R bounded workflow persistence and rollout-mode repair.
-- Additive. Does not alter engineering formulas, historical migrations, or EOS 1 project rows.
-- Writes are limited by the application and eos2_18r_persist to the labelled pilot-validation project.

CREATE OR REPLACE FUNCTION eos2_18r_guard_revision_row()
RETURNS trigger
LANGUAGE plpgsql
AS $guard$
BEGIN
  IF NEW.tenant_id IS DISTINCT FROM OLD.tenant_id
     OR NEW.workspace_id IS DISTINCT FROM OLD.workspace_id
     OR NEW.project_id IS DISTINCT FROM OLD.project_id THEN
    RAISE EXCEPTION 'object_identity_immutable';
  END IF;
  IF NEW.revision IS DISTINCT FROM OLD.revision AND NEW.revision <> OLD.revision + 1 THEN
    RAISE EXCEPTION 'revision_step';
  END IF;
  RETURN NEW;
END;
$guard$;

CREATE OR REPLACE FUNCTION eos2_18r_guard_handoff()
RETURNS trigger
LANGUAGE plpgsql
AS $guard$
BEGIN
  IF NEW.recalculated THEN
    RAISE EXCEPTION 'recalculation_forbidden';
  END IF;
  IF TG_OP = 'UPDATE' THEN
    IF NEW.tenant_id IS DISTINCT FROM OLD.tenant_id
       OR NEW.workspace_id IS DISTINCT FROM OLD.workspace_id
       OR NEW.project_id IS DISTINCT FROM OLD.project_id
       OR NEW.handoff_key IS DISTINCT FROM OLD.handoff_key THEN
      RAISE EXCEPTION 'object_identity_immutable';
    END IF;
    IF OLD.current_revision = FALSE AND NEW.current_revision = TRUE THEN
      RAISE EXCEPTION 'historical_revision_immutable';
    END IF;
  END IF;
  IF NEW.status IN ('accepted', 'accepted_with_conditions') THEN
    RAISE EXCEPTION 'receiver_acceptance_required';
  END IF;
  RETURN NEW;
END;
$guard$;

CREATE OR REPLACE FUNCTION eos2_18r_guard_receiver()
RETURNS trigger
LANGUAGE plpgsql
AS $guard$
DECLARE
  v_role text;
BEGIN
  IF NEW.acceptance_status IN ('accepted', 'accepted_with_conditions') THEN
    SELECT r.slug INTO v_role
    FROM tenant_memberships tm
    JOIN roles r ON r.id = tm.role_id
    WHERE tm.user_id = auth.uid()
      AND tm.tenant_id = NEW.tenant_id
      AND tm.status = 'active'
    LIMIT 1;
    IF v_role IS NULL OR v_role NOT IN ('owner', 'admin') THEN
      RAISE EXCEPTION 'receiver_authority';
    END IF;
  END IF;
  RETURN NEW;
END;
$guard$;

CREATE OR REPLACE FUNCTION eos2_18r_guard_change_case()
RETURNS trigger
LANGUAGE plpgsql
AS $guard$
BEGIN
  IF NEW.recalculated OR NEW.deliverable_revised OR NEW.baseline_rewritten THEN
    RAISE EXCEPTION 'change_authority';
  END IF;
  RETURN NEW;
END;
$guard$;

CREATE OR REPLACE FUNCTION eos2_18r_guard_materiality()
RETURNS trigger
LANGUAGE plpgsql
AS $guard$
DECLARE
  v_role text;
BEGIN
  IF NEW.recalculated THEN
    RAISE EXCEPTION 'recalculation_forbidden';
  END IF;
  IF TG_OP = 'UPDATE' AND NEW.materiality IS DISTINCT FROM OLD.materiality THEN
    SELECT r.slug INTO v_role
    FROM tenant_memberships tm
    JOIN roles r ON r.id = tm.role_id
    WHERE tm.user_id = auth.uid()
      AND tm.tenant_id = NEW.tenant_id
      AND tm.status = 'active'
    LIMIT 1;
    IF v_role IS NULL OR v_role IN ('ai', 'viewer') THEN
      RAISE EXCEPTION 'materiality_authority';
    END IF;
    IF NEW.materiality NOT IN ('UNASSESSED', 'MATERIAL_IMPACT', 'NO_MATERIAL_IMPACT') THEN
      RAISE EXCEPTION 'invalid_materiality';
    END IF;
  END IF;
  RETURN NEW;
END;
$guard$;

CREATE OR REPLACE FUNCTION eos2_18r_guard_deliverable()
RETURNS trigger
LANGUAGE plpgsql
AS $guard$
BEGIN
  IF NEW.released_by_ai OR NEW.revision = 'latest' THEN
    RAISE EXCEPTION 'deliverable_authority';
  END IF;
  IF TG_OP = 'UPDATE' THEN
    IF NEW.revision IS DISTINCT FROM OLD.revision
       OR NEW.approval_status IS DISTINCT FROM OLD.approval_status
       OR NEW.release_status IS DISTINCT FROM OLD.release_status
       OR NEW.released_by_ai IS DISTINCT FROM OLD.released_by_ai
       OR NEW.project_id IS DISTINCT FROM OLD.project_id
       OR NEW.tenant_id IS DISTINCT FROM OLD.tenant_id
       OR NEW.workspace_id IS DISTINCT FROM OLD.workspace_id
       OR NEW.deliverable_key IS DISTINCT FROM OLD.deliverable_key THEN
      RAISE EXCEPTION 'deliverable_governed_field';
    END IF;
  END IF;
  IF NEW.approval_status <> 'pending' OR NEW.release_status <> 'not_released' THEN
    RAISE EXCEPTION 'deliverable_authority';
  END IF;
  RETURN NEW;
END;
$guard$;

CREATE OR REPLACE FUNCTION eos2_18r_guard_freeze()
RETURNS trigger
LANGUAGE plpgsql
AS $guard$
DECLARE
  v_role text;
BEGIN
  IF NEW.approved_by_ai THEN
    RAISE EXCEPTION 'ai_approval_forbidden';
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.frozen THEN
    RAISE EXCEPTION 'baseline_immutable';
  END IF;
  IF NEW.approval_status = 'approved' THEN
    SELECT r.slug INTO v_role
    FROM tenant_memberships tm
    JOIN roles r ON r.id = tm.role_id
    WHERE tm.user_id = auth.uid()
      AND tm.tenant_id = NEW.tenant_id
      AND tm.status = 'active'
    LIMIT 1;
    IF v_role IS NULL OR v_role NOT IN ('owner', 'admin') THEN
      RAISE EXCEPTION 'freeze_authority';
    END IF;
  END IF;
  RETURN NEW;
END;
$guard$;

DROP TRIGGER IF EXISTS eos2_18r_basis_revision ON engineering_basis_sets;
CREATE TRIGGER eos2_18r_basis_revision
  BEFORE UPDATE ON engineering_basis_sets
  FOR EACH ROW EXECUTE FUNCTION eos2_18r_guard_revision_row();

DROP TRIGGER IF EXISTS eos2_18r_structural_revision ON engineering_structural_deliveries;
CREATE TRIGGER eos2_18r_structural_revision
  BEFORE UPDATE ON engineering_structural_deliveries
  FOR EACH ROW EXECUTE FUNCTION eos2_18r_guard_revision_row();

DROP TRIGGER IF EXISTS eos2_18r_handoff_guard ON engineering_interface_handoffs;
CREATE TRIGGER eos2_18r_handoff_guard
  BEFORE INSERT OR UPDATE ON engineering_interface_handoffs
  FOR EACH ROW EXECUTE FUNCTION eos2_18r_guard_handoff();

DROP TRIGGER IF EXISTS eos2_18r_receiver_guard ON engineering_interface_receivers;
CREATE TRIGGER eos2_18r_receiver_guard
  BEFORE INSERT OR UPDATE ON engineering_interface_receivers
  FOR EACH ROW EXECUTE FUNCTION eos2_18r_guard_receiver();

DROP TRIGGER IF EXISTS eos2_18r_change_guard ON engineering_change_impact_cases;
CREATE TRIGGER eos2_18r_change_guard
  BEFORE INSERT OR UPDATE ON engineering_change_impact_cases
  FOR EACH ROW EXECUTE FUNCTION eos2_18r_guard_change_case();

DROP TRIGGER IF EXISTS eos2_18r_materiality_guard ON engineering_change_candidate_impacts;
CREATE TRIGGER eos2_18r_materiality_guard
  BEFORE INSERT OR UPDATE ON engineering_change_candidate_impacts
  FOR EACH ROW EXECUTE FUNCTION eos2_18r_guard_materiality();

DROP TRIGGER IF EXISTS eos2_18r_deliverable_guard ON engineering_governed_deliverables;
CREATE TRIGGER eos2_18r_deliverable_guard
  BEFORE INSERT OR UPDATE ON engineering_governed_deliverables
  FOR EACH ROW EXECUTE FUNCTION eos2_18r_guard_deliverable();

DROP TRIGGER IF EXISTS eos2_18r_freeze_guard ON engineering_design_freezes;
CREATE TRIGGER eos2_18r_freeze_guard
  BEFORE INSERT OR UPDATE ON engineering_design_freezes
  FOR EACH ROW EXECUTE FUNCTION eos2_18r_guard_freeze();

DO $policy$
DECLARE
  target text;
BEGIN
  FOREACH target IN ARRAY ARRAY[
    'engineering_basis_sets',
    'engineering_structural_deliveries',
    'engineering_interface_handoffs',
    'engineering_change_candidate_impacts',
    'engineering_governed_deliverables'
  ]
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', target || '_update', target);
    EXECUTE format('GRANT UPDATE ON %I TO authenticated', target);
    EXECUTE format($sql$
      CREATE POLICY %I ON %I FOR UPDATE
      USING (
        tenant_id = ANY (get_user_tenant_ids())
        AND engineering_core_workspace_member(workspace_id)
        AND has_permission('engineering', 'execute', tenant_id)
      )
      WITH CHECK (
        tenant_id = ANY (get_user_tenant_ids())
        AND engineering_core_workspace_member(workspace_id)
        AND has_permission('engineering', 'execute', tenant_id)
      )
    $sql$, target || '_update', target);
  END LOOP;
END
$policy$;

DROP POLICY IF EXISTS engineering_design_freezes_update ON engineering_design_freezes;
GRANT UPDATE ON engineering_design_freezes TO authenticated;
CREATE POLICY engineering_design_freezes_update ON engineering_design_freezes
  FOR UPDATE
  USING (
    frozen = FALSE
    AND tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
    AND has_permission('engineering', 'execute', tenant_id)
  )
  WITH CHECK (
    frozen = FALSE
    AND approved_by_ai = FALSE
    AND tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
    AND has_permission('engineering', 'execute', tenant_id)
  );

CREATE UNIQUE INDEX IF NOT EXISTS eos2_18r_interface_current_key
  ON engineering_interface_handoffs (tenant_id, workspace_id, project_id, handoff_key)
  WHERE current_revision;

CREATE UNIQUE INDEX IF NOT EXISTS eos2_18r_deliverable_current_key
  ON engineering_governed_deliverables (tenant_id, workspace_id, project_id, deliverable_key)
  WHERE current_revision;

CREATE UNIQUE INDEX IF NOT EXISTS eos2_18r_change_case_key
  ON engineering_change_impact_cases (tenant_id, workspace_id, project_id, case_key);

CREATE UNIQUE INDEX IF NOT EXISTS eos2_18r_audit_request_key
  ON engineering_delivery_audit (workspace_id, action, (detail->>'requestKey'))
  WHERE coalesce(detail->>'requestKey', '') <> '';

CREATE OR REPLACE FUNCTION eos2_18r_set_rollout_mode(
  p_tenant uuid,
  p_workspace uuid,
  p_mode text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $fn$
DECLARE
  v_role text;
  v_previous text;
  v_persisted text;
  v_actor uuid;
BEGIN
  IF p_mode IS NULL OR p_mode NOT IN ('off', 'controlled_pilot') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_mode', 'auditedSuccess', false);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM workspaces WHERE id = p_workspace AND tenant_id = p_tenant) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_scope', 'auditedSuccess', false);
  END IF;

  v_actor := auth.uid();
  IF v_actor IS NOT NULL THEN
    SELECT r.slug INTO v_role
    FROM tenant_memberships tm
    JOIN roles r ON r.id = tm.role_id
    WHERE tm.user_id = v_actor
      AND tm.tenant_id = p_tenant
      AND tm.status = 'active'
    LIMIT 1;
    IF v_role IS NULL OR v_role NOT IN ('owner', 'admin') THEN
      INSERT INTO engineering_delivery_audit (tenant_id, workspace_id, action, actor_id, detail)
      VALUES (
        p_tenant, p_workspace, 'eos2_rollout_mode_rejected', v_actor,
        jsonb_build_object('error', 'authority_denied', 'requestedMode', p_mode, 'persisted', false, 'approvalGranted', false)
      );
      RETURN jsonb_build_object('ok', false, 'error', 'authority_denied', 'auditedSuccess', false);
    END IF;
  END IF;

  SELECT CASE
    WHEN jsonb_typeof(settings->'eos2') = 'object' THEN settings->'eos2'->>'mode'
    ELSE NULL
  END
  INTO v_previous
  FROM tenants
  WHERE id = p_tenant
  FOR UPDATE;

  UPDATE tenants
  SET settings = jsonb_set(
    coalesce(settings, '{}'::jsonb),
    '{eos2}',
    CASE
      WHEN jsonb_typeof(settings->'eos2') = 'object' THEN settings->'eos2'
      ELSE '{}'::jsonb
    END || jsonb_build_object('mode', p_mode),
    true
  )
  WHERE id = p_tenant
  RETURNING settings->'eos2'->>'mode' INTO v_persisted;

  IF v_persisted IS DISTINCT FROM p_mode THEN
    INSERT INTO engineering_delivery_audit (tenant_id, workspace_id, action, actor_id, detail)
    VALUES (
      p_tenant, p_workspace, 'eos2_rollout_mode_rejected', v_actor,
      jsonb_build_object('error', 'not_persisted', 'requestedMode', p_mode, 'persistedMode', v_persisted, 'persisted', false, 'approvalGranted', false)
    );
    RETURN jsonb_build_object('ok', false, 'error', 'not_persisted', 'persistedMode', v_persisted, 'auditedSuccess', false);
  END IF;

  INSERT INTO engineering_delivery_audit (tenant_id, workspace_id, action, actor_id, detail)
  VALUES (
    p_tenant, p_workspace, 'eos2_rollout_mode_set', v_actor,
    jsonb_build_object(
      'previousMode', v_previous,
      'persistedMode', v_persisted,
      'changed', v_previous IS DISTINCT FROM v_persisted,
      'persisted', true,
      'approvalGranted', false
    )
  );
  RETURN jsonb_build_object('ok', true, 'mode', v_persisted, 'previousMode', v_previous, 'auditedSuccess', true, 'approvalGranted', false);
END;
$fn$;

CREATE OR REPLACE FUNCTION eos2_18r_persist(p_action text, p_payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $fn$
DECLARE
  v_project constant text := 'CONTROLLED_PRODUCTION_PILOT_VALIDATION';
  v_tenant uuid;
  v_workspace uuid;
  v_role text;
  v_acting text;
  v_request text;
  v_audit text;
  v_prior jsonb;
  v_id uuid;
  v_revision integer;
  v_title text;
  v_statement text;
  v_state jsonb;
  v_history jsonb;
  v_object text;
  v_expected integer;
  v_handoff uuid;
  v_prev uuid;
  v_case uuid;
  v_disc text;
  v_materiality text;
  v_freshness text;
  v_basis_rev integer;
  v_disc_rev integer;
  v_iface_rev integer;
  v_del_rev text;
  v_fingerprint text;
  v_freeze uuid;
  v_result jsonb;
  v_constraint text;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'authenticated_user_required', 'approvalGranted', false);
  END IF;
  IF coalesce(p_payload->>'projectId', v_project) <> v_project THEN
    RETURN jsonb_build_object('ok', false, 'error', 'project_not_in_remediation_scope', 'approvalGranted', false);
  END IF;
  IF p_action IN ('accept_interface', 'approve_freeze', 'approve_deliverable', 'release_deliverable', 'ifc_release') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'authority_denied', 'approvalGranted', false);
  END IF;

  BEGIN
    v_tenant := (p_payload->>'tenantId')::uuid;
    v_workspace := (p_payload->>'workspaceId')::uuid;
  EXCEPTION WHEN invalid_text_representation THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_scope', 'approvalGranted', false);
  END;

  IF NOT EXISTS (SELECT 1 FROM workspaces WHERE id = v_workspace AND tenant_id = v_tenant) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_scope', 'approvalGranted', false);
  END IF;
  IF NOT engineering_core_workspace_member(v_workspace) OR NOT has_permission('engineering', 'execute', v_tenant) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'authority_denied', 'approvalGranted', false);
  END IF;

  SELECT r.slug INTO v_role
  FROM tenant_memberships tm
  JOIN roles r ON r.id = tm.role_id
  WHERE tm.user_id = auth.uid() AND tm.tenant_id = v_tenant AND tm.status = 'active'
  LIMIT 1;
  v_acting := lower(coalesce(p_payload->>'actingRole', ''));
  IF v_role IS NULL OR v_role IN ('ai', 'viewer') OR v_acting = 'ai' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'authority_denied', 'approvalGranted', false);
  END IF;

  v_request := coalesce(nullif(p_payload->>'requestKey', ''), p_action || ':' || v_project);
  v_audit := 'eos2_' || p_action;
  SELECT detail->'result' INTO v_prior
  FROM engineering_delivery_audit
  WHERE workspace_id = v_workspace AND action = v_audit AND detail->>'requestKey' = v_request
  LIMIT 1;
  IF v_prior IS NOT NULL THEN
    RETURN jsonb_build_object('ok', true, 'idempotent', true, 'approvalGranted', false, 'result', v_prior);
  END IF;

  v_title := left(coalesce(nullif(p_payload->>'title', ''), 'Controlled production pilot validation'), 160);
  v_statement := left(coalesce(nullif(p_payload->>'statement', ''), 'Pilot validation basis. Not a customer approval.'), 500);
  v_object := 'structural:' || v_project;

  IF p_action = 'create_basis' THEN
    SELECT id, revision INTO v_id, v_revision
    FROM engineering_basis_sets
    WHERE tenant_id = v_tenant AND workspace_id = v_workspace AND project_id = v_project;
    IF v_id IS NULL THEN
      INSERT INTO engineering_basis_sets (tenant_id, workspace_id, project_id, stage, revision, state)
      VALUES (v_tenant, v_workspace, v_project, 'not_classified', 1, jsonb_build_object('label', v_project, 'history', '[]'::jsonb))
      RETURNING id, revision INTO v_id, v_revision;
      INSERT INTO engineering_basis_items (
        tenant_id, workspace_id, basis_set_id, item_key, hierarchy_level, category, title, statement,
        status, revision, inheritance, lifecycle_stage
      ) VALUES (
        v_tenant, v_workspace, v_id, 'pilot-basis', 'project', 'design_basis', v_title, v_statement,
        'draft', 1, 'add', 'concept'
      );
      INSERT INTO engineering_delivery_lifecycles (tenant_id, workspace_id, project_id, stage, revision, state)
      VALUES (v_tenant, v_workspace, v_project, 'not_classified', 1, jsonb_build_object('label', v_project))
      ON CONFLICT (tenant_id, workspace_id, project_id) DO NOTHING;
    END IF;
    v_result := jsonb_build_object('id', v_id, 'revision', v_revision, 'projectId', v_project);

  ELSIF p_action = 'revise_basis' THEN
    SELECT id, revision, state INTO v_id, v_revision, v_state
    FROM engineering_basis_sets
    WHERE tenant_id = v_tenant AND workspace_id = v_workspace AND project_id = v_project
    FOR UPDATE;
    IF v_id IS NULL THEN
      RETURN jsonb_build_object('ok', false, 'error', 'not_found', 'approvalGranted', false);
    END IF;
    v_expected := coalesce((p_payload->>'expectedRevision')::integer, v_revision);
    IF v_expected <> v_revision THEN
      RETURN jsonb_build_object('ok', false, 'error', 'revision_conflict', 'revision', v_revision, 'approvalGranted', false);
    END IF;
    v_history := coalesce(v_state->'history', '[]'::jsonb) || jsonb_build_array(jsonb_build_object('revision', v_revision, 'statement', v_statement));
    UPDATE engineering_basis_sets
    SET revision = v_revision + 1,
        state = jsonb_set(coalesce(state, '{}'::jsonb), '{history}', v_history, true)
    WHERE id = v_id
    RETURNING revision INTO v_revision;
    INSERT INTO engineering_basis_items (
      tenant_id, workspace_id, basis_set_id, item_key, hierarchy_level, category, title, statement,
      status, revision, inheritance, lifecycle_stage
    ) VALUES (
      v_tenant, v_workspace, v_id, 'pilot-basis', 'project', 'design_basis', v_title, v_statement,
      'draft', v_revision, 'add', 'concept'
    );
    v_result := jsonb_build_object('id', v_id, 'revision', v_revision, 'projectId', v_project);

  ELSIF p_action = 'create_discipline' THEN
    IF NOT EXISTS (SELECT 1 FROM engineering_basis_sets WHERE tenant_id = v_tenant AND workspace_id = v_workspace AND project_id = v_project) THEN
      RETURN jsonb_build_object('ok', false, 'error', 'basis_required', 'approvalGranted', false);
    END IF;
    SELECT id, revision INTO v_id, v_revision
    FROM engineering_structural_deliveries
    WHERE tenant_id = v_tenant AND workspace_id = v_workspace AND project_id = v_project;
    IF v_id IS NULL THEN
      INSERT INTO engineering_structural_deliveries (tenant_id, workspace_id, project_id, title, stage, revision, state)
      VALUES (v_tenant, v_workspace, v_project, v_title, 'not_classified', 1, jsonb_build_object('discipline', 'structural', 'history', '[]'::jsonb, 'label', v_project))
      RETURNING id, revision INTO v_id, v_revision;
    END IF;
    v_result := jsonb_build_object('id', v_id, 'revision', v_revision, 'discipline', 'structural', 'projectId', v_project);

  ELSIF p_action = 'revise_discipline' THEN
    SELECT id, revision, state, title INTO v_id, v_revision, v_state, v_title
    FROM engineering_structural_deliveries
    WHERE tenant_id = v_tenant AND workspace_id = v_workspace AND project_id = v_project
    FOR UPDATE;
    IF v_id IS NULL THEN
      RETURN jsonb_build_object('ok', false, 'error', 'not_found', 'approvalGranted', false);
    END IF;
    v_expected := coalesce((p_payload->>'expectedRevision')::integer, v_revision);
    IF v_expected <> v_revision THEN
      RETURN jsonb_build_object('ok', false, 'error', 'revision_conflict', 'revision', v_revision, 'approvalGranted', false);
    END IF;
    v_history := coalesce(v_state->'history', '[]'::jsonb) || jsonb_build_array(jsonb_build_object('revision', v_revision, 'title', v_title));
    UPDATE engineering_structural_deliveries
    SET revision = v_revision + 1,
        state = jsonb_set(coalesce(state, '{}'::jsonb), '{history}', v_history, true)
    WHERE id = v_id
    RETURNING revision INTO v_revision;
    UPDATE engineering_governed_deliverables
    SET freshness = 'potentially_stale'
    WHERE tenant_id = v_tenant AND workspace_id = v_workspace AND project_id = v_project AND current_revision = TRUE;
    v_result := jsonb_build_object('id', v_id, 'revision', v_revision, 'discipline', 'structural', 'projectId', v_project);

  ELSIF p_action = 'create_interface' THEN
    SELECT revision INTO v_disc_rev
    FROM engineering_structural_deliveries
    WHERE tenant_id = v_tenant AND workspace_id = v_workspace AND project_id = v_project;
    IF v_disc_rev IS NULL THEN
      RETURN jsonb_build_object('ok', false, 'error', 'discipline_required', 'approvalGranted', false);
    END IF;
    SELECT id, revision INTO v_id, v_revision
    FROM engineering_interface_handoffs
    WHERE tenant_id = v_tenant AND workspace_id = v_workspace AND project_id = v_project
      AND handoff_key = 'pilot-structural-interface' AND current_revision = TRUE;
    IF v_id IS NULL THEN
      INSERT INTO engineering_interface_handoffs (
        tenant_id, workspace_id, project_id, handoff_key, source_discipline, parameter_name,
        revision, source_object_type, source_object_id, source_revision, status, current_revision, provenance
      ) VALUES (
        v_tenant, v_workspace, v_project, 'pilot-structural-interface', 'structural', 'pilot validation interface',
        1, 'structural_delivery', v_object, v_disc_rev::text, 'draft', TRUE, 'controlled'
      ) RETURNING id INTO v_id;
      INSERT INTO engineering_interface_receivers (
        tenant_id, workspace_id, handoff_id, receiving_discipline, acceptance_status
      ) VALUES (
        v_tenant, v_workspace, v_id, 'mechanical', 'pending'
      );
      v_revision := 1;
    END IF;
    v_result := jsonb_build_object('id', v_id, 'revision', v_revision, 'receiverStatus', 'pending', 'projectId', v_project);

  ELSIF p_action = 'revise_interface' THEN
    SELECT id, revision INTO v_prev, v_revision
    FROM engineering_interface_handoffs
    WHERE tenant_id = v_tenant AND workspace_id = v_workspace AND project_id = v_project
      AND handoff_key = 'pilot-structural-interface' AND current_revision = TRUE
    FOR UPDATE;
    IF v_prev IS NULL THEN
      RETURN jsonb_build_object('ok', false, 'error', 'not_found', 'approvalGranted', false);
    END IF;
    v_expected := coalesce((p_payload->>'expectedRevision')::integer, v_revision);
    IF v_expected <> v_revision THEN
      RETURN jsonb_build_object('ok', false, 'error', 'revision_conflict', 'revision', v_revision, 'approvalGranted', false);
    END IF;
    SELECT revision INTO v_disc_rev
    FROM engineering_structural_deliveries
    WHERE tenant_id = v_tenant AND workspace_id = v_workspace AND project_id = v_project;
    UPDATE engineering_interface_handoffs
    SET current_revision = FALSE, status = 'superseded'
    WHERE id = v_prev;
    INSERT INTO engineering_interface_handoffs (
      tenant_id, workspace_id, project_id, handoff_key, source_discipline, parameter_name,
      revision, previous_handoff_id, source_object_type, source_object_id, source_revision,
      status, current_revision, provenance
    ) VALUES (
      v_tenant, v_workspace, v_project, 'pilot-structural-interface', 'structural', 'pilot validation interface',
      v_revision + 1, v_prev, 'structural_delivery', v_object, coalesce(v_disc_rev::text, v_revision::text),
      'draft', TRUE, 'controlled'
    ) RETURNING id, revision INTO v_id, v_revision;
    INSERT INTO engineering_interface_receivers (
      tenant_id, workspace_id, handoff_id, receiving_discipline, acceptance_status
    ) VALUES (
      v_tenant, v_workspace, v_id, 'mechanical', 'pending'
    );
    UPDATE engineering_governed_deliverables
    SET freshness = 'potentially_stale'
    WHERE tenant_id = v_tenant AND workspace_id = v_workspace AND project_id = v_project AND current_revision = TRUE;
    v_result := jsonb_build_object('id', v_id, 'revision', v_revision, 'previousId', v_prev, 'receiverStatus', 'pending', 'projectId', v_project);

  ELSIF p_action = 'create_change' THEN
    SELECT id INTO v_handoff
    FROM engineering_interface_handoffs
    WHERE tenant_id = v_tenant AND workspace_id = v_workspace AND project_id = v_project
      AND handoff_key = 'pilot-structural-interface' AND current_revision = TRUE;
    IF v_handoff IS NULL THEN
      RETURN jsonb_build_object('ok', false, 'error', 'interface_required', 'approvalGranted', false);
    END IF;
    SELECT id INTO v_case
    FROM engineering_change_impact_cases
    WHERE tenant_id = v_tenant AND workspace_id = v_workspace AND project_id = v_project AND case_key = 'pilot-validation-change';
    IF v_case IS NULL THEN
      SELECT revision INTO v_disc_rev
      FROM engineering_structural_deliveries
      WHERE tenant_id = v_tenant AND workspace_id = v_workspace AND project_id = v_project;
      INSERT INTO engineering_change_impact_cases (
        tenant_id, workspace_id, project_id, case_key, title, initiating_discipline, changed_field,
        previous_value, new_value, status, provenance
      ) VALUES (
        v_tenant, v_workspace, v_project, 'pilot-validation-change', v_title, 'structural', 'revision',
        greatest(coalesce(v_disc_rev, 1) - 1, 1)::text, coalesce(v_disc_rev, 1)::text, 'draft', 'controlled'
      ) RETURNING id INTO v_case;
      INSERT INTO engineering_change_candidate_impacts (
        tenant_id, workspace_id, case_id, object_key, object_type, discipline, direct_impact, path_text,
        materiality, required_action
      )
      SELECT v_tenant, v_workspace, v_case, v_object, 'structural_delivery', 'structural', TRUE,
             'structural object revised', 'UNASSESSED', 'human_materiality_assessment'
      UNION ALL
      SELECT v_tenant, v_workspace, v_case, h.handoff_key, 'interface_handoff', r.receiving_discipline, TRUE,
             'current interface receives the revised source', 'UNASSESSED', 'human_materiality_assessment'
      FROM engineering_interface_handoffs h
      JOIN engineering_interface_receivers r ON r.handoff_id = h.id
      WHERE h.id = v_handoff
      UNION ALL
      SELECT v_tenant, v_workspace, v_case, d.deliverable_key, 'governed_deliverable', d.discipline, FALSE,
             'deliverable depends on the structural revision', 'UNASSESSED', 'human_materiality_assessment'
      FROM engineering_governed_deliverables d
      WHERE d.tenant_id = v_tenant AND d.workspace_id = v_workspace AND d.project_id = v_project AND d.current_revision = TRUE;
    END IF;
    v_result := jsonb_build_object('id', v_case, 'materiality', 'UNASSESSED', 'projectId', v_project);

  ELSIF p_action = 'record_materiality' THEN
    v_materiality := p_payload->>'materiality';
    v_disc := coalesce(nullif(p_payload->>'discipline', ''), 'mechanical');
    IF v_materiality NOT IN ('MATERIAL_IMPACT', 'NO_MATERIAL_IMPACT') THEN
      RETURN jsonb_build_object('ok', false, 'error', 'invalid_materiality', 'approvalGranted', false);
    END IF;
    SELECT id INTO v_case
    FROM engineering_change_impact_cases
    WHERE tenant_id = v_tenant AND workspace_id = v_workspace AND project_id = v_project AND case_key = 'pilot-validation-change';
    IF v_case IS NULL THEN
      RETURN jsonb_build_object('ok', false, 'error', 'not_found', 'approvalGranted', false);
    END IF;
    UPDATE engineering_change_candidate_impacts
    SET materiality = v_materiality, action_confirmed = TRUE, required_action = 'review_downstream'
    WHERE case_id = v_case AND workspace_id = v_workspace AND discipline = v_disc AND materiality = 'UNASSESSED';
    GET DIAGNOSTICS v_expected = ROW_COUNT;
    IF v_expected > 0 THEN
      SELECT id INTO v_id
      FROM engineering_change_candidate_impacts
      WHERE case_id = v_case AND discipline = v_disc AND materiality = v_materiality
      LIMIT 1;
    ELSIF v_expected = 0 THEN
      SELECT id INTO v_id
      FROM engineering_change_candidate_impacts
      WHERE case_id = v_case AND discipline = v_disc AND materiality = v_materiality
      LIMIT 1;
      IF v_id IS NULL THEN
        RETURN jsonb_build_object('ok', false, 'error', 'materiality_conflict', 'approvalGranted', false);
      END IF;
    END IF;
    v_result := jsonb_build_object('id', v_id, 'materiality', v_materiality, 'discipline', v_disc, 'projectId', v_project);

  ELSIF p_action = 'create_deliverable' THEN
    IF NOT EXISTS (
      SELECT 1 FROM engineering_structural_deliveries
      WHERE tenant_id = v_tenant AND workspace_id = v_workspace AND project_id = v_project
    ) THEN
      RETURN jsonb_build_object('ok', false, 'error', 'discipline_required', 'approvalGranted', false);
    END IF;
    SELECT id, revision, freshness INTO v_id, v_del_rev, v_freshness
    FROM engineering_governed_deliverables
    WHERE tenant_id = v_tenant AND workspace_id = v_workspace AND project_id = v_project
      AND deliverable_key = 'pilot-validation-deliverable' AND current_revision = TRUE;
    IF v_id IS NULL THEN
      SELECT revision::text INTO v_disc
      FROM engineering_structural_deliveries
      WHERE tenant_id = v_tenant AND workspace_id = v_workspace AND project_id = v_project;
      INSERT INTO engineering_governed_deliverables (
        tenant_id, workspace_id, project_id, deliverable_key, discipline, deliverable_type,
        deliverable_number, title, revision, issue_purpose, approval_status, release_status, freshness, provenance
      ) VALUES (
        v_tenant, v_workspace, v_project, 'pilot-validation-deliverable', 'structural', 'drawing',
        'PV-001', v_title, '1', 'pilot-validation', 'pending', 'not_released', 'current', 'controlled'
      ) RETURNING id, revision, freshness INTO v_id, v_del_rev, v_freshness;
      INSERT INTO engineering_governed_deliverable_packages (
        tenant_id, workspace_id, project_id, package_key, package_type, deliverable_keys, required_keys
      ) VALUES (
        v_tenant, v_workspace, v_project, 'pilot-validation-package', 'pilot-validation',
        ARRAY['pilot-validation-deliverable'], ARRAY[v_object, coalesce(v_disc, '1')]
      );
    END IF;
    v_result := jsonb_build_object('id', v_id, 'revision', v_del_rev, 'freshness', v_freshness, 'approvalStatus', 'pending', 'releaseStatus', 'not_released', 'projectId', v_project);

  ELSIF p_action = 'record_freeze' THEN
    SELECT id, freshness INTO v_id, v_freshness
    FROM engineering_governed_deliverables
    WHERE tenant_id = v_tenant AND workspace_id = v_workspace AND project_id = v_project
      AND deliverable_key = 'pilot-validation-deliverable' AND current_revision = TRUE;
    IF v_id IS NULL THEN
      RETURN jsonb_build_object('ok', false, 'error', 'deliverable_required', 'approvalGranted', false);
    END IF;
    SELECT id INTO v_freeze
    FROM engineering_design_freezes
    WHERE tenant_id = v_tenant AND workspace_id = v_workspace AND project_id = v_project
      AND freeze_key = 'pilot-validation-readiness' AND frozen = TRUE;
    IF v_freeze IS NULL THEN
      SELECT revision INTO v_basis_rev FROM engineering_basis_sets
      WHERE tenant_id = v_tenant AND workspace_id = v_workspace AND project_id = v_project;
      SELECT revision INTO v_disc_rev FROM engineering_structural_deliveries
      WHERE tenant_id = v_tenant AND workspace_id = v_workspace AND project_id = v_project;
      SELECT revision INTO v_iface_rev FROM engineering_interface_handoffs
      WHERE tenant_id = v_tenant AND workspace_id = v_workspace AND project_id = v_project
        AND handoff_key = 'pilot-structural-interface' AND current_revision = TRUE;
      v_del_rev := (SELECT revision FROM engineering_governed_deliverables WHERE id = v_id);
      v_fingerprint := md5(concat_ws('|', v_project, v_basis_rev, v_disc_rev, v_iface_rev, v_del_rev, v_freshness));
      INSERT INTO engineering_design_freezes (
        tenant_id, workspace_id, project_id, freeze_key, freeze_type, stage, title, scope,
        frozen, fingerprint, approval_status, approved_by_ai, provenance
      ) VALUES (
        v_tenant, v_workspace, v_project, 'pilot-validation-readiness', 'readiness', 'not_classified',
        'Controlled production pilot validation readiness',
        CASE WHEN v_freshness = 'potentially_stale'
          THEN 'Readiness only. Deliverable is potentially stale. Not a customer FEED or IFC approval.'
          ELSE 'Readiness only. Not a customer FEED or IFC approval.' END,
        FALSE, v_fingerprint, 'pending', FALSE, 'controlled'
      ) RETURNING id INTO v_freeze;
      INSERT INTO engineering_design_freeze_members (
        tenant_id, workspace_id, freeze_id, object_key, revision, member_status, discipline
      ) VALUES
        (v_tenant, v_workspace, v_freeze, v_object, coalesce(v_disc_rev::text, '1'), 'included', 'structural'),
        (v_tenant, v_workspace, v_freeze, 'pilot-validation-deliverable', v_del_rev, 'included', 'structural');
      IF v_freshness = 'potentially_stale' THEN
        INSERT INTO engineering_design_freeze_exceptions (
          tenant_id, workspace_id, freeze_id, exception_key, discipline, object_key, rationale, condition_text, status
        ) VALUES (
          v_tenant, v_workspace, v_freeze, 'stale-deliverable', 'structural', 'pilot-validation-deliverable',
          'Upstream revision occurred after the deliverable snapshot.',
          'A human must disposition the deliverable before any release.',
          'open'
        );
      END IF;
      INSERT INTO engineering_design_freezes (
        tenant_id, workspace_id, project_id, freeze_key, freeze_type, stage, title, scope,
        frozen, fingerprint, approval_status, approved_by_ai, provenance
      ) VALUES (
        v_tenant, v_workspace, v_project, 'pilot-validation-readiness', 'readiness_snapshot', 'not_classified',
        'Controlled production pilot validation snapshot',
        'Immutable readiness snapshot. Approval remains pending. Not a customer FEED or IFC approval.',
        TRUE, v_fingerprint, 'pending', FALSE, 'controlled'
      ) RETURNING id INTO v_freeze;
      INSERT INTO engineering_design_freeze_members (
        tenant_id, workspace_id, freeze_id, object_key, revision, member_status, discipline
      ) VALUES
        (v_tenant, v_workspace, v_freeze, v_object, coalesce(v_disc_rev::text, '1'), 'snapshotted', 'structural'),
        (v_tenant, v_workspace, v_freeze, 'pilot-validation-deliverable', v_del_rev, 'snapshotted', 'structural');
    END IF;
    v_result := jsonb_build_object('id', v_freeze, 'frozen', true, 'approvalStatus', 'pending', 'projectId', v_project);

  ELSE
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_action', 'approvalGranted', false);
  END IF;

  INSERT INTO engineering_delivery_audit (tenant_id, workspace_id, action, actor_id, detail)
  VALUES (
    v_tenant, v_workspace, v_audit, auth.uid(),
    jsonb_build_object('requestKey', v_request, 'persisted', true, 'approvalGranted', false, 'result', v_result, 'actorRole', v_role)
  );
  RETURN jsonb_build_object('ok', true, 'idempotent', false, 'approvalGranted', false, 'result', v_result);
EXCEPTION
  WHEN unique_violation THEN
    GET STACKED DIAGNOSTICS v_constraint = CONSTRAINT_NAME;
    IF v_constraint = 'eos2_18r_audit_request_key' THEN
      SELECT detail->'result' INTO v_prior
      FROM engineering_delivery_audit
      WHERE workspace_id = v_workspace AND action = v_audit AND detail->>'requestKey' = v_request
      LIMIT 1;
      RETURN jsonb_build_object('ok', true, 'idempotent', true, 'approvalGranted', false, 'result', v_prior);
    END IF;
    RETURN jsonb_build_object('ok', false, 'error', 'duplicate_prevented', 'approvalGranted', false);
END;
$fn$;

REVOKE ALL ON FUNCTION eos2_18r_set_rollout_mode(uuid, uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION eos2_18r_persist(text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION eos2_18r_set_rollout_mode(uuid, uuid, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION eos2_18r_persist(text, jsonb) TO authenticated;
