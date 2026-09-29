-- EOS-A3 — Systems Intelligence & Interface Intelligence
-- Additive. Does not create engineering_subsystems.
-- Does not drop or rewrite engineering_assets.system / .subsystem TEXT.
-- Does not add requirements, change, impact, configuration, optimization, or value tables.
-- Does not add a graph store. Reuses engineering_object_links CONTAINS / USES / CONNECTS.

-- ─── Systems (canonical Engineering Core identity) ───────────────────────────
-- Subsystem = another engineering_systems row with parent_system_id set.
-- SYSTEM != ASSET. Membership is n–n via governed CONTAINS / USES links.

CREATE TABLE engineering_systems (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id        UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id          UUID REFERENCES engineering_projects(id) ON DELETE SET NULL,
  parent_system_id    UUID REFERENCES engineering_systems(id) ON DELETE RESTRICT,
  system_code         TEXT NOT NULL,
  name                TEXT NOT NULL,
  description         TEXT,
  status              TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'active', 'inactive', 'superseded', 'archived'
  )),
  criticality         TEXT NOT NULL DEFAULT 'medium' CHECK (criticality IN (
    'low', 'medium', 'high', 'critical'
  )),
  owner_id            UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_by          UUID REFERENCES profiles(id) ON DELETE SET NULL,
  metadata            JSONB NOT NULL DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, workspace_id, system_code)
);

CREATE INDEX idx_eng_systems_tenant ON engineering_systems(tenant_id, workspace_id);
CREATE INDEX idx_eng_systems_project ON engineering_systems(project_id);
CREATE INDEX idx_eng_systems_parent ON engineering_systems(parent_system_id);
CREATE INDEX idx_eng_systems_code ON engineering_systems(tenant_id, workspace_id, system_code);
CREATE INDEX idx_eng_systems_status ON engineering_systems(tenant_id, status);

CREATE TRIGGER engineering_systems_updated_at
  BEFORE UPDATE ON engineering_systems
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE engineering_systems IS
  'EOS-A3 canonical multidisciplinary System. Subsystems are child rows via parent_system_id. Not an Asset. Not a Digital Twin.';
COMMENT ON COLUMN engineering_systems.parent_system_id IS
  'Self-reference. A subsystem is a System with a parent. ON DELETE RESTRICT preserves hierarchy provenance.';
COMMENT ON COLUMN engineering_systems.system_code IS
  'Stable identity code unique per tenant+workspace (e.g. SYS-CRUSH-001). Names are not unique.';

-- ─── Interfaces (horizontal Engineering Core object) ─────────────────────────

CREATE TABLE engineering_interfaces (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id        UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id          UUID REFERENCES engineering_projects(id) ON DELETE SET NULL,
  interface_code      TEXT NOT NULL,
  name                TEXT NOT NULL,
  description         TEXT,
  purpose             TEXT,
  interface_type      TEXT NOT NULL CHECK (interface_type IN (
    'PHYSICAL', 'FUNCTIONAL', 'PROCESS', 'MECHANICAL', 'PIPING', 'STRUCTURAL',
    'ELECTRICAL', 'CONTROL', 'DATA', 'INFORMATION', 'RESPONSIBILITY',
    'CONTRACT', 'SCHEDULE'
  )),
  directionality      TEXT NOT NULL DEFAULT 'undirected' CHECK (directionality IN (
    'undirected', 'directed', 'bidirectional'
  )),
  status              TEXT NOT NULL DEFAULT 'identified' CHECK (status IN (
    'identified', 'defined', 'agreed', 'verified', 'closed', 'superseded'
  )),
  criticality         TEXT NOT NULL DEFAULT 'medium' CHECK (criticality IN (
    'low', 'medium', 'high', 'critical'
  )),
  owner_id            UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_by          UUID REFERENCES profiles(id) ON DELETE SET NULL,
  metadata            JSONB NOT NULL DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, workspace_id, interface_code)
);

CREATE INDEX idx_eng_interfaces_tenant ON engineering_interfaces(tenant_id, workspace_id);
CREATE INDEX idx_eng_interfaces_project ON engineering_interfaces(project_id);
CREATE INDEX idx_eng_interfaces_code ON engineering_interfaces(tenant_id, workspace_id, interface_code);
CREATE INDEX idx_eng_interfaces_status ON engineering_interfaces(tenant_id, status);
CREATE INDEX idx_eng_interfaces_type ON engineering_interfaces(tenant_id, interface_type);

CREATE TRIGGER engineering_interfaces_updated_at
  BEFORE UPDATE ON engineering_interfaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE engineering_interfaces IS
  'EOS-A3 canonical Interface. Endpoints are engineering_object_links CONNECTS rows. Not a model mapping. Not a review finding.';
COMMENT ON COLUMN engineering_interfaces.status IS
  'identified = known to exist; verified = technically confirmed with >= 2 endpoints (enforced in application).';

-- ─── Hierarchy integrity ─────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION engineering_system_hierarchy_guard()
RETURNS TRIGGER AS $$
DECLARE
  walk UUID;
  hops INT := 0;
  parent RECORD;
BEGIN
  IF NEW.parent_system_id IS NULL THEN
    RETURN NEW;
  END IF;
  IF NEW.id IS NOT NULL AND NEW.parent_system_id = NEW.id THEN
    RAISE EXCEPTION 'system cannot parent itself';
  END IF;
  SELECT tenant_id, workspace_id, project_id INTO parent
    FROM engineering_systems
   WHERE id = NEW.parent_system_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'parent system not found';
  END IF;
  IF parent.tenant_id IS DISTINCT FROM NEW.tenant_id THEN
    RAISE EXCEPTION 'parent system must share tenant';
  END IF;
  IF parent.workspace_id IS DISTINCT FROM NEW.workspace_id THEN
    RAISE EXCEPTION 'parent system must share workspace';
  END IF;
  IF parent.project_id IS DISTINCT FROM NEW.project_id THEN
    RAISE EXCEPTION 'parent system must share project';
  END IF;
  walk := NEW.parent_system_id;
  WHILE walk IS NOT NULL AND hops < 64 LOOP
    IF NEW.id IS NOT NULL AND walk = NEW.id THEN
      RAISE EXCEPTION 'system hierarchy cycle detected';
    END IF;
    SELECT parent_system_id INTO walk FROM engineering_systems WHERE id = walk;
    hops := hops + 1;
  END LOOP;
  IF hops >= 64 THEN
    RAISE EXCEPTION 'system hierarchy chain too deep';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER
SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS engineering_systems_hierarchy_guard ON engineering_systems;
CREATE TRIGGER engineering_systems_hierarchy_guard
  BEFORE INSERT OR UPDATE OF parent_system_id, tenant_id, workspace_id, project_id ON engineering_systems
  FOR EACH ROW EXECUTE FUNCTION engineering_system_hierarchy_guard();

DROP TRIGGER IF EXISTS engineering_systems_workspace_tenant ON engineering_systems;
CREATE TRIGGER engineering_systems_workspace_tenant
  BEFORE INSERT OR UPDATE ON engineering_systems
  FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant();

DROP TRIGGER IF EXISTS engineering_systems_ownership_immutable ON engineering_systems;
CREATE TRIGGER engineering_systems_ownership_immutable
  BEFORE UPDATE ON engineering_systems
  FOR EACH ROW EXECUTE FUNCTION engineering_core_prevent_ownership_mutation();

DROP TRIGGER IF EXISTS engineering_interfaces_workspace_tenant ON engineering_interfaces;
CREATE TRIGGER engineering_interfaces_workspace_tenant
  BEFORE INSERT OR UPDATE ON engineering_interfaces
  FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant();

DROP TRIGGER IF EXISTS engineering_interfaces_ownership_immutable ON engineering_interfaces;
CREATE TRIGGER engineering_interfaces_ownership_immutable
  BEFORE UPDATE ON engineering_interfaces
  FOR EACH ROW EXECUTE FUNCTION engineering_core_prevent_ownership_mutation();

-- Deleting a System/Interface while governed links remain would orphan Digital Thread edges.
CREATE OR REPLACE FUNCTION engineering_core_prevent_delete_while_linked()
RETURNS TRIGGER AS $$
DECLARE
  object_type TEXT := TG_ARGV[0];
BEGIN
  IF EXISTS (
    SELECT 1 FROM engineering_object_links
     WHERE (from_type = object_type AND from_id = OLD.id)
        OR (to_type = object_type AND to_id = OLD.id)
  ) THEN
    RAISE EXCEPTION 'cannot delete % while object links exist; unlink first', object_type;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER
SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS engineering_systems_prevent_linked_delete ON engineering_systems;
CREATE TRIGGER engineering_systems_prevent_linked_delete
  BEFORE DELETE ON engineering_systems
  FOR EACH ROW EXECUTE FUNCTION engineering_core_prevent_delete_while_linked('system');

DROP TRIGGER IF EXISTS engineering_interfaces_prevent_linked_delete ON engineering_interfaces;
CREATE TRIGGER engineering_interfaces_prevent_linked_delete
  BEFORE DELETE ON engineering_interfaces
  FOR EACH ROW EXECUTE FUNCTION engineering_core_prevent_delete_while_linked('interface');

-- ─── Extend governed link resolve + endpoint visibility ──────────────────────

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
      'alternative', 'review_package', 'review_evidence', 'system', 'interface'
    ) THEN EXISTS (
      SELECT 1
      FROM engineering_object_link_resolve(p_type, p_id) r
      WHERE engineering_core_workspace_member(r.workspace_id)
    )
    ELSE TRUE
  END;
$$ LANGUAGE sql STABLE SECURITY INVOKER
SET search_path = public, pg_temp;

-- ─── RLS (A2C workspace fail-closed pattern) ─────────────────────────────────

ALTER TABLE engineering_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_interfaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY eng_systems_select ON engineering_systems FOR SELECT USING (
  tenant_id = ANY(get_user_tenant_ids())
  AND engineering_core_workspace_member(workspace_id)
);
CREATE POLICY eng_systems_insert ON engineering_systems FOR INSERT WITH CHECK (
  tenant_id = ANY(get_user_tenant_ids())
  AND has_permission('engineering', 'execute', tenant_id)
  AND engineering_core_workspace_member(workspace_id)
);
CREATE POLICY eng_systems_update ON engineering_systems FOR UPDATE
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
CREATE POLICY eng_systems_delete ON engineering_systems FOR DELETE USING (
  has_permission('engineering', 'admin', tenant_id)
  AND engineering_core_workspace_member(workspace_id)
);

CREATE POLICY eng_interfaces_select ON engineering_interfaces FOR SELECT USING (
  tenant_id = ANY(get_user_tenant_ids())
  AND engineering_core_workspace_member(workspace_id)
);
CREATE POLICY eng_interfaces_insert ON engineering_interfaces FOR INSERT WITH CHECK (
  tenant_id = ANY(get_user_tenant_ids())
  AND has_permission('engineering', 'execute', tenant_id)
  AND engineering_core_workspace_member(workspace_id)
);
CREATE POLICY eng_interfaces_update ON engineering_interfaces FOR UPDATE
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
CREATE POLICY eng_interfaces_delete ON engineering_interfaces FOR DELETE USING (
  has_permission('engineering', 'admin', tenant_id)
  AND engineering_core_workspace_member(workspace_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE engineering_systems TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE engineering_interfaces TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION engineering_system_hierarchy_guard() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION engineering_core_prevent_delete_while_linked() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION engineering_object_link_resolve(TEXT, UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION engineering_core_link_endpoint_allowed(TEXT, UUID) TO anon, authenticated, service_role;
