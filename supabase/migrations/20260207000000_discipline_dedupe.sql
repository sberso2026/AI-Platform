-- Batch 2.12 — Engineering disciplines deduplication
-- Root cause: list API returned both system (tenant_id NULL) and tenant
-- copies with the same discipline_key / name. Seed ON CONFLICT was also
-- non-inferring against the partial unique index.

-- 1) Tighten unique indexes (idempotent)
DROP INDEX IF EXISTS idx_eng_disciplines_tenant_key;
CREATE UNIQUE INDEX idx_eng_disciplines_tenant_key
  ON engineering_disciplines (tenant_id, discipline_key)
  WHERE tenant_id IS NOT NULL;

DROP INDEX IF EXISTS idx_eng_disciplines_system_key;
CREATE UNIQUE INDEX idx_eng_disciplines_system_key
  ON engineering_disciplines (discipline_key)
  WHERE tenant_id IS NULL AND is_system = TRUE;

-- 2) Helper: re-point discipline FKs from duplicate → keeper
CREATE OR REPLACE FUNCTION public._merge_engineering_discipline_refs(
  p_from UUID,
  p_to UUID
) RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  IF p_from IS NULL OR p_to IS NULL OR p_from = p_to THEN
    RETURN;
  END IF;

  -- Core tables
  UPDATE engineering_assets SET discipline_id = p_to WHERE discipline_id = p_from;
  UPDATE engineering_documents SET discipline_id = p_to WHERE discipline_id = p_from;

  -- Registers (Batch 2.05) — columns may exist depending on migrations
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'engineering_decisions' AND column_name = 'discipline_id'
  ) THEN
    EXECUTE 'UPDATE engineering_decisions SET discipline_id = $1 WHERE discipline_id = $2' USING p_to, p_from;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'engineering_decisions' AND column_name = 'engineering_discipline'
  ) THEN
    EXECUTE 'UPDATE engineering_decisions SET engineering_discipline = $1 WHERE engineering_discipline = $2' USING p_to, p_from;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'engineering_actions' AND column_name = 'discipline_id'
  ) THEN
    EXECUTE 'UPDATE engineering_actions SET discipline_id = $1 WHERE discipline_id = $2' USING p_to, p_from;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'engineering_risks' AND column_name = 'discipline_id'
  ) THEN
    EXECUTE 'UPDATE engineering_risks SET discipline_id = $1 WHERE discipline_id = $2' USING p_to, p_from;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'engineering_issues' AND column_name = 'discipline_id'
  ) THEN
    EXECUTE 'UPDATE engineering_issues SET discipline_id = $1 WHERE discipline_id = $2' USING p_to, p_from;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'engineering_technical_queries' AND column_name = 'discipline_id'
  ) THEN
    EXECUTE 'UPDATE engineering_technical_queries SET discipline_id = $1 WHERE discipline_id = $2' USING p_to, p_from;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'engineering_lessons' AND column_name = 'discipline_id'
  ) THEN
    EXECUTE 'UPDATE engineering_lessons SET discipline_id = $1 WHERE discipline_id = $2' USING p_to, p_from;
  END IF;
END;
$$;

-- 3) Collapse duplicate tenant rows (same tenant_id + discipline_key)
DO $$
DECLARE
  r RECORD;
  keeper UUID;
  dup UUID;
BEGIN
  FOR r IN
    SELECT tenant_id, lower(discipline_key) AS k
    FROM engineering_disciplines
    WHERE tenant_id IS NOT NULL
    GROUP BY tenant_id, lower(discipline_key)
    HAVING COUNT(*) > 1
  LOOP
    SELECT id INTO keeper
    FROM engineering_disciplines
    WHERE tenant_id = r.tenant_id AND lower(discipline_key) = r.k
    ORDER BY created_at ASC NULLS LAST, id ASC
    LIMIT 1;

    FOR dup IN
      SELECT id
      FROM engineering_disciplines
      WHERE tenant_id = r.tenant_id
        AND lower(discipline_key) = r.k
        AND id <> keeper
    LOOP
      PERFORM public._merge_engineering_discipline_refs(dup, keeper);
      DELETE FROM engineering_disciplines WHERE id = dup;
    END LOOP;
  END LOOP;
END;
$$;

-- 4) Make tenant seed insert explicitly conflict-safe against partial unique index
CREATE OR REPLACE FUNCTION seed_tenant_engineering_os(p_tenant_id UUID)
RETURNS VOID AS $$
DECLARE
  v_prompt_id UUID;
  v_policy_id UUID;
BEGIN
  INSERT INTO feature_flags (feature_id, tenant_id, environment, enabled, rollout_pct)
  SELECT f.id, p_tenant_id, 'production', TRUE, 100
  FROM features f WHERE f.feature_key = 'engineering_os_enabled'
  ON CONFLICT DO NOTHING;

  INSERT INTO engineering_settings (tenant_id)
  VALUES (p_tenant_id)
  ON CONFLICT (tenant_id) DO NOTHING;

  -- Copy system disciplines once per tenant (idempotent; works without PG15 inference)
  INSERT INTO engineering_disciplines (tenant_id, discipline_key, name, description, is_system)
  SELECT p_tenant_id, d.discipline_key, d.name, d.description, FALSE
  FROM engineering_disciplines d
  WHERE d.is_system = TRUE
    AND d.tenant_id IS NULL
    AND NOT EXISTS (
      SELECT 1
      FROM engineering_disciplines e
      WHERE e.tenant_id = p_tenant_id
        AND lower(e.discipline_key) = lower(d.discipline_key)
    );

  INSERT INTO capabilities (tenant_id, capability_key, name, description, category, operating_system, status, is_platform)
  VALUES
    (p_tenant_id, 'engineering_os', 'Engineering OS', 'Core Engineering Operating System', 'operating_system', 'engineering', 'enabled', FALSE),
    (p_tenant_id, 'engineering_project_management', 'Engineering Project Management', 'Manage engineering projects', 'operating_system', 'engineering', 'enabled', FALSE),
    (p_tenant_id, 'engineering_asset_register', 'Engineering Asset Register', 'Asset register and hierarchy', 'operating_system', 'engineering', 'enabled', FALSE),
    (p_tenant_id, 'engineering_document_register', 'Engineering Document Register', 'Document register and versions', 'operating_system', 'engineering', 'enabled', FALSE),
    (p_tenant_id, 'engineering_ai_workspace', 'Engineering AI Workspace', 'Engineering-specific AI workspace', 'operating_system', 'engineering', 'enabled', FALSE),
    (p_tenant_id, 'engineering_search', 'Engineering Search', 'Cross-entity engineering search', 'operating_system', 'engineering', 'enabled', FALSE),
    (p_tenant_id, 'engineering_reporting', 'Engineering Reporting', 'Engineering report shell', 'operating_system', 'engineering', 'enabled', FALSE)
  ON CONFLICT DO NOTHING;

  INSERT INTO ai_tools (tenant_id, tool_key, name, description, category, provider, risk_level, status)
  VALUES
    (p_tenant_id, 'engineering_project_lookup', 'Engineering Project Lookup', 'Lookup engineering projects', 'engineering_check', 'engineering-os', 'low', 'active'),
    (p_tenant_id, 'engineering_asset_lookup', 'Engineering Asset Lookup', 'Lookup engineering assets', 'engineering_check', 'engineering-os', 'low', 'active'),
    (p_tenant_id, 'engineering_document_lookup', 'Engineering Document Lookup', 'Lookup engineering documents', 'document_search', 'engineering-os', 'low', 'active'),
    (p_tenant_id, 'engineering_knowledge_lookup', 'Engineering Knowledge Lookup', 'Lookup engineering knowledge nodes', 'document_search', 'engineering-os', 'low', 'active'),
    (p_tenant_id, 'engineering_report_draft_placeholder', 'Engineering Report Draft Placeholder', 'Placeholder report draft tool', 'report_generation', 'engineering-os', 'medium', 'active')
  ON CONFLICT DO NOTHING;

  INSERT INTO policies (tenant_id, policy_key, name, description, category, status, priority, is_platform)
  VALUES (p_tenant_id, 'engineering_decision_requires_review', 'Engineering Decision Requires Review',
          'Engineering decisions require human review — no autonomous approval', 'safety', 'active', 5, FALSE)
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_policy_id;

  IF v_policy_id IS NOT NULL THEN
    INSERT INTO policy_conditions (policy_id, condition_type, operator, value)
    VALUES (v_policy_id, 'operating_system_scope', 'eq', '{"scope": "engineering"}'::jsonb);
    INSERT INTO policy_actions (policy_id, action_type, parameters)
    VALUES (v_policy_id, 'require_review', '{"block_autonomous_approval": true}'::jsonb);
  END IF;

  INSERT INTO policies (tenant_id, policy_key, name, description, category, status, priority, is_platform)
  VALUES (p_tenant_id, 'engineering_low_confidence_requires_review', 'Engineering Low Confidence Review',
          'Low confidence engineering outputs require review', 'safety', 'active', 10, FALSE)
  ON CONFLICT DO NOTHING;

  INSERT INTO policies (tenant_id, policy_key, name, description, category, status, priority, is_platform)
  VALUES (p_tenant_id, 'engineering_high_risk_asset_requires_approval', 'High Risk Asset Requires Approval',
          'High-criticality asset actions require approval', 'safety', 'active', 15, FALSE)
  ON CONFLICT DO NOTHING;

  INSERT INTO policies (tenant_id, policy_key, name, description, category, status, priority, is_platform)
  VALUES (p_tenant_id, 'engineering_document_review_requires_traceability', 'Document Review Traceability',
          'Document reviews require knowledge graph / evidence traceability', 'safety', 'active', 20, FALSE)
  ON CONFLICT DO NOTHING;

  INSERT INTO prompts (tenant_id, prompt_key, name, description, agent_type, status, is_safety_critical)
  VALUES (p_tenant_id, 'engineering_ai_director_system_prompt', 'Engineering AI Director',
          'System prompt for Engineering AI Workspace', 'engineering', 'active', TRUE)
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_prompt_id;

  IF v_prompt_id IS NOT NULL THEN
    INSERT INTO prompt_versions (prompt_id, version, content, status)
    VALUES (v_prompt_id, '1.0.0',
      'You are the RTB Engineering OS AI Director. Assist with engineering projects, assets, and documents. Never approve engineering decisions autonomously. Flag design, structural, and safety decisions for human review. Cite evidence where available.',
      'active');
  END IF;

  INSERT INTO prompts (tenant_id, prompt_key, name, description, agent_type, status, is_safety_critical)
  VALUES
    (p_tenant_id, 'engineering_reviewer_prompt', 'Engineering Reviewer', 'Reviewer agent prompt', 'engineering', 'active', TRUE),
    (p_tenant_id, 'engineering_document_reviewer_prompt', 'Document Reviewer', 'Document reviewer prompt', 'engineering', 'active', FALSE),
    (p_tenant_id, 'engineering_asset_engineer_prompt', 'Asset Engineer', 'Asset engineer prompt', 'engineering', 'active', FALSE),
    (p_tenant_id, 'engineering_risk_reviewer_prompt', 'Risk Reviewer', 'Risk reviewer prompt', 'engineering', 'active', TRUE)
  ON CONFLICT DO NOTHING;

  INSERT INTO agents (tenant_id, name, slug, description, agent_type, system_prompt, capabilities, requires_review, is_active)
  VALUES (
    p_tenant_id,
    'AI Engineering Director',
    'engineering-director',
    'Primary Engineering OS AI agent',
    'engineering',
    'You are the RTB Engineering OS AI Director. Never approve engineering decisions autonomously.',
    '["engineering_os","engineering_ai_workspace"]'::jsonb,
    TRUE,
    TRUE
  ) ON CONFLICT DO NOTHING;

  INSERT INTO knowledge_node_types (type_key, label, description, is_system)
  SELECT 'engineering_project', 'Engineering Project', 'Engineering OS project node', TRUE
  WHERE NOT EXISTS (SELECT 1 FROM knowledge_node_types WHERE type_key = 'engineering_project' AND tenant_id IS NULL);

  INSERT INTO knowledge_node_types (type_key, label, description, is_system)
  SELECT 'engineering_asset', 'Engineering Asset', 'Engineering OS asset node', TRUE
  WHERE NOT EXISTS (SELECT 1 FROM knowledge_node_types WHERE type_key = 'engineering_asset' AND tenant_id IS NULL);

  INSERT INTO knowledge_node_types (type_key, label, description, is_system)
  SELECT 'engineering_document', 'Engineering Document', 'Engineering OS document node', TRUE
  WHERE NOT EXISTS (SELECT 1 FROM knowledge_node_types WHERE type_key = 'engineering_document' AND tenant_id IS NULL);

  INSERT INTO knowledge_edge_types (type_key, label, description, is_system)
  SELECT 'contains', 'Contains', 'Parent contains child', TRUE
  WHERE NOT EXISTS (SELECT 1 FROM knowledge_edge_types WHERE type_key = 'contains' AND tenant_id IS NULL);

  INSERT INTO knowledge_edge_types (type_key, label, description, is_system)
  SELECT 'belongs_to', 'Belongs To', 'Child belongs to parent', TRUE
  WHERE NOT EXISTS (SELECT 1 FROM knowledge_edge_types WHERE type_key = 'belongs_to' AND tenant_id IS NULL);

  INSERT INTO knowledge_edge_types (type_key, label, description, is_system)
  SELECT 'has_digital_twin', 'Has Digital Twin', 'Asset linked to digital twin', TRUE
  WHERE NOT EXISTS (SELECT 1 FROM knowledge_edge_types WHERE type_key = 'has_digital_twin' AND tenant_id IS NULL);

  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'seed_tenant_engineering_registers') THEN
    PERFORM seed_tenant_engineering_registers(p_tenant_id);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

COMMENT ON FUNCTION seed_tenant_engineering_os(UUID) IS
  'Idempotent Engineering OS tenant bootstrap. System disciplines remain global; tenant copies are unique on (tenant_id, discipline_key).';
