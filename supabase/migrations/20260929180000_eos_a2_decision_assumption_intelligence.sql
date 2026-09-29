-- EOS-A2 — Decision Intelligence & Assumption Management
-- Additive. Does not rewrite engineering_decisions.
-- Does not merge Project Controls decision_unit, PI Findings, or ERA Findings.
-- Does not add Optimization / System / Requirement / Configuration / Change / Value tables.
-- Does not add a graph store.
-- Historical engineering_object_links.relationship strings are preserved.

-- ─── Parent decision extensions ──────────────────────────────────────────────
-- Existing equivalent fields kept: rationale, confidence, status, owner_id,
-- approval_status, approved_by, decision_date, alternatives JSONB (legacy snapshot).
-- Selection integrity: parent selected_alternative_id (composite FK) — see below.

ALTER TABLE engineering_decisions
  ADD COLUMN IF NOT EXISTS decision_question TEXT,
  ADD COLUMN IF NOT EXISTS authority_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS effective_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS selected_alternative_id UUID,
  ADD COLUMN IF NOT EXISTS supersedes_decision_id UUID REFERENCES engineering_decisions(id) ON DELETE SET NULL;

COMMENT ON COLUMN engineering_decisions.decision_question IS
  'EOS-A2: the question this decision answers. Distinct from title.';
COMMENT ON COLUMN engineering_decisions.authority_id IS
  'EOS-A2: platform identity entitled to decide. Distinct from owner_id and approved_by.';
COMMENT ON COLUMN engineering_decisions.effective_at IS
  'EOS-A2: when the decision takes effect. Nullable rollout; decision_date remains.';
COMMENT ON COLUMN engineering_decisions.selected_alternative_id IS
  'EOS-A2: at most one selected alternative. Composite FK enforces same-decision membership.';
COMMENT ON COLUMN engineering_decisions.supersedes_decision_id IS
  'EOS-A2: prior decision this record supersedes. Same tenant/workspace; no self/cycle.';

CREATE INDEX IF NOT EXISTS idx_eng_decisions_authority
  ON engineering_decisions(tenant_id, authority_id)
  WHERE authority_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_eng_decisions_supersedes
  ON engineering_decisions(supersedes_decision_id)
  WHERE supersedes_decision_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_eng_decisions_selected_alt
  ON engineering_decisions(selected_alternative_id)
  WHERE selected_alternative_id IS NOT NULL;

-- ─── Alternatives (identifiable children) ────────────────────────────────────

CREATE TABLE engineering_decision_alternatives (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id               UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id            UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  project_id              UUID REFERENCES engineering_projects(id) ON DELETE SET NULL,
  decision_id             UUID NOT NULL REFERENCES engineering_decisions(id) ON DELETE CASCADE,
  alternative_code        TEXT NOT NULL,
  name                    TEXT NOT NULL,
  description             TEXT,
  status                  TEXT NOT NULL DEFAULT 'considered' CHECK (status IN (
    'draft', 'considered', 'selected', 'rejected', 'withdrawn'
  )),
  is_selected             BOOLEAN NOT NULL DEFAULT FALSE,
  rationale               TEXT,
  source                  TEXT,
  provenance              JSONB NOT NULL DEFAULT '{}',
  created_by              UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (decision_id, alternative_code),
  UNIQUE (id, decision_id)
);

CREATE INDEX idx_eng_decision_alts_decision ON engineering_decision_alternatives(decision_id);
CREATE INDEX idx_eng_decision_alts_tenant ON engineering_decision_alternatives(tenant_id, workspace_id);
CREATE INDEX idx_eng_decision_alts_project ON engineering_decision_alternatives(project_id);

CREATE TRIGGER engineering_decision_alternatives_updated_at
  BEFORE UPDATE ON engineering_decision_alternatives
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE engineering_decision_alternatives IS
  'EOS-A2 identifiable decision alternatives. Selection is stored on the parent (selected_alternative_id) for uniqueness; is_selected is maintained by trigger.';

-- Composite FK: selected alternative must belong to this decision.
-- MATCH SIMPLE: NULL selected_alternative_id is allowed.
ALTER TABLE engineering_decisions
  ADD CONSTRAINT engineering_decisions_selected_alternative_fk
  FOREIGN KEY (selected_alternative_id, id)
  REFERENCES engineering_decision_alternatives (id, decision_id)
  DEFERRABLE INITIALLY DEFERRED;

-- ─── Approval provenance (engineering business events, not platform audit) ───

CREATE TABLE engineering_decision_approvals (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id               UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id            UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  project_id              UUID REFERENCES engineering_projects(id) ON DELETE SET NULL,
  decision_id             UUID NOT NULL REFERENCES engineering_decisions(id) ON DELETE CASCADE,
  action                  TEXT NOT NULL CHECK (action IN (
    'submitted', 'endorsed', 'approved', 'rejected', 'withdrawn', 'superseded'
  )),
  actor_id                UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  actor_kind              TEXT NOT NULL DEFAULT 'human' CHECK (actor_kind = 'human'),
  authority_role          TEXT,
  comments                TEXT,
  evidence_ref            TEXT,
  provenance              JSONB NOT NULL DEFAULT '{}',
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_eng_decision_approvals_decision ON engineering_decision_approvals(decision_id, created_at);
CREATE INDEX idx_eng_decision_approvals_tenant ON engineering_decision_approvals(tenant_id, workspace_id);

COMMENT ON TABLE engineering_decision_approvals IS
  'EOS-A2 engineering approval history. Human actors only. Does not replace engineering_audit_links or platform audit.';
COMMENT ON COLUMN engineering_decision_approvals.actor_kind IS
  'Design/safety approvals require authorized humans. Autonomous AI approval is forbidden.';

-- ─── Assumptions (Engineering Core horizontal object) ────────────────────────

CREATE TABLE engineering_assumptions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id               UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id            UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id              UUID REFERENCES engineering_projects(id) ON DELETE SET NULL,
  asset_id                UUID REFERENCES engineering_assets(id) ON DELETE SET NULL,
  assumption_number       TEXT NOT NULL,
  title                   TEXT NOT NULL,
  statement               TEXT NOT NULL,
  source                  TEXT,
  rationale               TEXT,
  status                  TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'active', 'retired'
  )),
  confidence              NUMERIC(5,4) CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1)),
  validation_status       TEXT NOT NULL DEFAULT 'unvalidated' CHECK (validation_status IN (
    'unvalidated', 'partially_validated', 'validated', 'invalidated', 'accepted_risk'
  )),
  materiality             TEXT NOT NULL DEFAULT 'medium' CHECK (materiality IN (
    'low', 'medium', 'high', 'critical'
  )),
  owner_id                UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_by              UUID REFERENCES profiles(id) ON DELETE SET NULL,
  validation_due_at       TIMESTAMPTZ,
  review_condition        TEXT,
  expires_at              TIMESTAMPTZ,
  knowledge_node_id       UUID REFERENCES knowledge_nodes(id) ON DELETE SET NULL,
  metadata                JSONB NOT NULL DEFAULT '{}',
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, assumption_number)
);

CREATE INDEX idx_eng_assumptions_tenant ON engineering_assumptions(tenant_id, workspace_id);
CREATE INDEX idx_eng_assumptions_project ON engineering_assumptions(project_id);
CREATE INDEX idx_eng_assumptions_validation ON engineering_assumptions(tenant_id, validation_status);
CREATE INDEX idx_eng_assumptions_owner ON engineering_assumptions(owner_id);

CREATE TRIGGER engineering_assumptions_updated_at
  BEFORE UPDATE ON engineering_assumptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE engineering_assumptions IS
  'EOS-A2 first-class Engineering Core assumption. Horizontal reusable object — not a product.';

-- ─── Governed relation taxonomy on NEW writes only ───────────────────────────

ALTER TABLE engineering_object_links
  ADD COLUMN IF NOT EXISTS relationship_governed BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN engineering_object_links.relationship_governed IS
  'EOS-A2: true for new governed taxonomy writes. Historical rows remain false with unconstrained relationship strings.';

ALTER TABLE engineering_object_links
  DROP CONSTRAINT IF EXISTS eng_obj_links_governed_taxonomy;

ALTER TABLE engineering_object_links
  ADD CONSTRAINT eng_obj_links_governed_taxonomy CHECK (
    relationship_governed = FALSE
    OR relationship IN (
      'CONTAINS', 'USES', 'DEPENDS_ON', 'ALLOCATED_TO', 'VERIFIED_BY',
      'USED_BY', 'CONNECTS', 'AFFECTS', 'CAUSED_BY', 'SELECTS',
      'SUPPORTED_BY', 'BASED_ON', 'REVIEWS', 'FOUND_IN', 'RESOLVES',
      'BASELINES', 'SUPERSEDES', 'MAPPED_TO', 'REPRESENTED_BY'
    )
  );

-- ─── Triggers: child scope, selection sync, supersession, ownership ──────────

CREATE OR REPLACE FUNCTION engineering_decision_copy_parent_scope()
RETURNS TRIGGER AS $$
DECLARE
  parent RECORD;
BEGIN
  SELECT tenant_id, workspace_id, project_id
    INTO parent
    FROM engineering_decisions
   WHERE id = NEW.decision_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'decision parent not found';
  END IF;
  NEW.tenant_id := parent.tenant_id;
  NEW.workspace_id := parent.workspace_id;
  NEW.project_id := parent.project_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER
SET search_path = public, pg_temp;

CREATE TRIGGER engineering_decision_alternatives_scope
  BEFORE INSERT OR UPDATE ON engineering_decision_alternatives
  FOR EACH ROW EXECUTE FUNCTION engineering_decision_copy_parent_scope();

CREATE TRIGGER engineering_decision_approvals_scope
  BEFORE INSERT OR UPDATE ON engineering_decision_approvals
  FOR EACH ROW EXECUTE FUNCTION engineering_decision_copy_parent_scope();

CREATE OR REPLACE FUNCTION engineering_decision_child_ownership_immutable()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tenant_id IS DISTINCT FROM OLD.tenant_id THEN
    RAISE EXCEPTION 'decision child tenant_id is immutable';
  END IF;
  IF NEW.workspace_id IS DISTINCT FROM OLD.workspace_id THEN
    RAISE EXCEPTION 'decision child workspace_id is immutable';
  END IF;
  IF NEW.decision_id IS DISTINCT FROM OLD.decision_id THEN
    RAISE EXCEPTION 'decision child decision_id is immutable';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER
SET search_path = public, pg_temp;

CREATE TRIGGER engineering_decision_alternatives_ownership_immutable
  BEFORE UPDATE ON engineering_decision_alternatives
  FOR EACH ROW EXECUTE FUNCTION engineering_decision_child_ownership_immutable();

CREATE TRIGGER engineering_decision_approvals_ownership_immutable
  BEFORE UPDATE ON engineering_decision_approvals
  FOR EACH ROW EXECUTE FUNCTION engineering_decision_child_ownership_immutable();

-- Keep is_selected aligned with parent selected_alternative_id (single selection).
CREATE OR REPLACE FUNCTION engineering_decision_sync_selected_alternative()
RETURNS TRIGGER AS $$
BEGIN
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

CREATE TRIGGER engineering_decisions_sync_selected_alternative
  AFTER INSERT OR UPDATE OF selected_alternative_id ON engineering_decisions
  FOR EACH ROW EXECUTE FUNCTION engineering_decision_sync_selected_alternative();

CREATE OR REPLACE FUNCTION engineering_decision_supersession_guard()
RETURNS TRIGGER AS $$
DECLARE
  walk UUID;
  hops INT := 0;
  parent_tenant UUID;
  parent_ws UUID;
BEGIN
  IF NEW.supersedes_decision_id IS NULL THEN
    RETURN NEW;
  END IF;
  IF NEW.id IS NOT NULL AND NEW.supersedes_decision_id = NEW.id THEN
    RAISE EXCEPTION 'decision cannot supersede itself';
  END IF;
  SELECT tenant_id, workspace_id INTO parent_tenant, parent_ws
    FROM engineering_decisions
   WHERE id = NEW.supersedes_decision_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'superseded decision not found';
  END IF;
  IF parent_tenant IS DISTINCT FROM NEW.tenant_id THEN
    RAISE EXCEPTION 'superseded decision must share tenant';
  END IF;
  IF parent_ws IS DISTINCT FROM NEW.workspace_id THEN
    RAISE EXCEPTION 'superseded decision must share workspace';
  END IF;
  walk := NEW.supersedes_decision_id;
  WHILE walk IS NOT NULL AND hops < 64 LOOP
    IF NEW.id IS NOT NULL AND walk = NEW.id THEN
      RAISE EXCEPTION 'decision supersession cycle detected';
    END IF;
    SELECT supersedes_decision_id INTO walk FROM engineering_decisions WHERE id = walk;
    hops := hops + 1;
  END LOOP;
  IF hops >= 64 THEN
    RAISE EXCEPTION 'decision supersession chain too deep';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER
SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS engineering_decisions_supersession_guard ON engineering_decisions;
CREATE TRIGGER engineering_decisions_supersession_guard
  BEFORE INSERT OR UPDATE OF supersedes_decision_id, tenant_id, workspace_id ON engineering_decisions
  FOR EACH ROW EXECUTE FUNCTION engineering_decision_supersession_guard();

CREATE OR REPLACE FUNCTION engineering_assumptions_workspace_tenant()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.workspace_id IS NULL THEN
    RAISE EXCEPTION 'engineering assumption workspace_id is required';
  END IF;
  IF NEW.workspace_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM workspaces w
    WHERE w.id = NEW.workspace_id AND w.tenant_id = NEW.tenant_id
  ) THEN
    RAISE EXCEPTION 'engineering assumption workspace does not belong to tenant';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER
SET search_path = public, pg_temp;

CREATE TRIGGER engineering_assumptions_workspace_tenant
  BEFORE INSERT OR UPDATE ON engineering_assumptions
  FOR EACH ROW EXECUTE FUNCTION engineering_assumptions_workspace_tenant();

CREATE TRIGGER engineering_assumptions_ownership_immutable
  BEFORE UPDATE ON engineering_assumptions
  FOR EACH ROW EXECUTE FUNCTION engineering_core_prevent_ownership_mutation();

-- Governed links: same-tenant objects; workspace match when both have workspace_id.
CREATE OR REPLACE FUNCTION engineering_object_link_scope_guard()
RETURNS TRIGGER AS $$
DECLARE
  from_tenant UUID;
  from_ws UUID;
  to_tenant UUID;
  to_ws UUID;
BEGIN
  IF NEW.relationship_governed IS NOT TRUE THEN
    RETURN NEW;
  END IF;

  SELECT tenant_id, workspace_id INTO from_tenant, from_ws
    FROM engineering_object_link_resolve(NEW.from_type, NEW.from_id);
  SELECT tenant_id, workspace_id INTO to_tenant, to_ws
    FROM engineering_object_link_resolve(NEW.to_type, NEW.to_id);

  IF from_tenant IS NULL OR to_tenant IS NULL THEN
    RAISE EXCEPTION 'governed object link target not found or type not allowed';
  END IF;
  IF from_tenant IS DISTINCT FROM NEW.tenant_id OR to_tenant IS DISTINCT FROM NEW.tenant_id THEN
    RAISE EXCEPTION 'cross-tenant object links are rejected';
  END IF;
  IF from_ws IS NOT NULL AND to_ws IS NOT NULL AND from_ws IS DISTINCT FROM to_ws THEN
    RAISE EXCEPTION 'cross-workspace object links are rejected';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER
SET search_path = public, pg_temp;

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
    ELSE
      RETURN;
  END CASE;
END;
$$ LANGUAGE plpgsql STABLE SECURITY INVOKER
SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS engineering_object_links_scope_guard ON engineering_object_links;
CREATE TRIGGER engineering_object_links_scope_guard
  BEFORE INSERT OR UPDATE ON engineering_object_links
  FOR EACH ROW EXECUTE FUNCTION engineering_object_link_scope_guard();

-- Approvals are append-only (business provenance).
CREATE OR REPLACE FUNCTION engineering_decision_approvals_append_only()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'decision approvals are append-only';
END;
$$ LANGUAGE plpgsql SECURITY INVOKER
SET search_path = public, pg_temp;

CREATE TRIGGER engineering_decision_approvals_no_update
  BEFORE UPDATE ON engineering_decision_approvals
  FOR EACH ROW EXECUTE FUNCTION engineering_decision_approvals_append_only();

CREATE TRIGGER engineering_decision_approvals_no_delete
  BEFORE DELETE ON engineering_decision_approvals
  FOR EACH ROW EXECUTE FUNCTION engineering_decision_approvals_append_only();

-- ─── RLS ─────────────────────────────────────────────────────────────────────

ALTER TABLE engineering_decision_alternatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_decision_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_assumptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY eng_decision_alts_select ON engineering_decision_alternatives FOR SELECT USING (
  tenant_id = ANY(get_user_tenant_ids())
  AND engineering_core_workspace_member(workspace_id)
);
CREATE POLICY eng_decision_alts_insert ON engineering_decision_alternatives FOR INSERT WITH CHECK (
  tenant_id = ANY(get_user_tenant_ids())
  AND has_permission('engineering', 'execute', tenant_id)
  AND engineering_core_workspace_member(workspace_id)
);
CREATE POLICY eng_decision_alts_update ON engineering_decision_alternatives FOR UPDATE
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
CREATE POLICY eng_decision_alts_delete ON engineering_decision_alternatives FOR DELETE USING (
  has_permission('engineering', 'admin', tenant_id)
  AND engineering_core_workspace_member(workspace_id)
);

CREATE POLICY eng_decision_approvals_select ON engineering_decision_approvals FOR SELECT USING (
  tenant_id = ANY(get_user_tenant_ids())
  AND engineering_core_workspace_member(workspace_id)
);
CREATE POLICY eng_decision_approvals_insert ON engineering_decision_approvals FOR INSERT WITH CHECK (
  tenant_id = ANY(get_user_tenant_ids())
  AND has_permission('engineering', 'execute', tenant_id)
  AND engineering_core_workspace_member(workspace_id)
  AND actor_kind = 'human'
);
CREATE POLICY eng_decision_approvals_update ON engineering_decision_approvals FOR UPDATE USING (false);
CREATE POLICY eng_decision_approvals_delete ON engineering_decision_approvals FOR DELETE USING (false);

CREATE POLICY eng_assumptions_select ON engineering_assumptions FOR SELECT USING (
  tenant_id = ANY(get_user_tenant_ids())
  AND engineering_core_workspace_member(workspace_id)
);
CREATE POLICY eng_assumptions_insert ON engineering_assumptions FOR INSERT WITH CHECK (
  tenant_id = ANY(get_user_tenant_ids())
  AND has_permission('engineering', 'execute', tenant_id)
  AND engineering_core_workspace_member(workspace_id)
);
CREATE POLICY eng_assumptions_update ON engineering_assumptions FOR UPDATE
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
CREATE POLICY eng_assumptions_delete ON engineering_assumptions FOR DELETE USING (
  has_permission('engineering', 'admin', tenant_id)
  AND engineering_core_workspace_member(workspace_id)
);
