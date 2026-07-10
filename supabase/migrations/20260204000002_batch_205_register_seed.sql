-- RTB AI Platform Batch 2.05 — Seed data for Engineering Intelligence Registers

-- Knowledge node types for registers
INSERT INTO knowledge_node_types (type_key, label, description, is_system)
SELECT 'engineering_decision', 'Engineering Decision', 'Decision register node', TRUE
WHERE NOT EXISTS (SELECT 1 FROM knowledge_node_types WHERE type_key = 'engineering_decision' AND tenant_id IS NULL);

INSERT INTO knowledge_node_types (type_key, label, description, is_system)
SELECT 'engineering_action', 'Engineering Action', 'Action register node', TRUE
WHERE NOT EXISTS (SELECT 1 FROM knowledge_node_types WHERE type_key = 'engineering_action' AND tenant_id IS NULL);

INSERT INTO knowledge_node_types (type_key, label, description, is_system)
SELECT 'engineering_risk', 'Engineering Risk', 'Risk register node', TRUE
WHERE NOT EXISTS (SELECT 1 FROM knowledge_node_types WHERE type_key = 'engineering_risk' AND tenant_id IS NULL);

INSERT INTO knowledge_node_types (type_key, label, description, is_system)
SELECT 'engineering_issue', 'Engineering Issue', 'Issue register node', TRUE
WHERE NOT EXISTS (SELECT 1 FROM knowledge_node_types WHERE type_key = 'engineering_issue' AND tenant_id IS NULL);

INSERT INTO knowledge_node_types (type_key, label, description, is_system)
SELECT 'engineering_technical_query', 'Engineering Technical Query', 'TQ/RFI register node', TRUE
WHERE NOT EXISTS (SELECT 1 FROM knowledge_node_types WHERE type_key = 'engineering_technical_query' AND tenant_id IS NULL);

INSERT INTO knowledge_node_types (type_key, label, description, is_system)
SELECT 'engineering_lesson', 'Engineering Lesson', 'Lessons learned register node', TRUE
WHERE NOT EXISTS (SELECT 1 FROM knowledge_node_types WHERE type_key = 'engineering_lesson' AND tenant_id IS NULL);

-- Edge types for register relationships
INSERT INTO knowledge_edge_types (type_key, label, description, is_system)
SELECT v.type_key, v.label, v.description, TRUE
FROM (VALUES
  ('mitigates', 'Mitigates', 'Decision mitigates risk'),
  ('creates', 'Creates', 'Object creates another object'),
  ('becomes', 'Becomes', 'Issue becomes decision'),
  ('supports', 'Supports', 'Document supports decision'),
  ('affected_by', 'Affected By', 'Asset affected by risk'),
  ('derived_from', 'Derived From', 'Lesson derived from decision'),
  ('answers', 'Answers', 'TQ response relationship')
) AS v(type_key, label, description)
WHERE NOT EXISTS (
  SELECT 1 FROM knowledge_edge_types e WHERE e.type_key = v.type_key AND e.tenant_id IS NULL
);

-- Default workflows are created per-tenant in seed_tenant_engineering_registers()

-- Capabilities for registers
INSERT INTO capabilities (tenant_id, capability_key, name, description, category, operating_system, status, is_platform)
SELECT NULL, v.key, v.name, v.descr, 'operating_system', 'engineering', 'enabled', TRUE
FROM (VALUES
  ('engineering_decision_register', 'Decision Register', 'Engineering decision register'),
  ('engineering_action_register', 'Action Register', 'Engineering action register'),
  ('engineering_risk_register', 'Risk Register', 'Engineering risk register'),
  ('engineering_issue_register', 'Issue Register', 'Engineering issue register'),
  ('engineering_technical_query_register', 'Technical Query Register', 'Engineering TQ/RFI register'),
  ('engineering_lessons_register', 'Lessons Learned Register', 'Engineering lessons learned'),
  ('engineering_timeline', 'Engineering Timeline', 'Cross-object engineering timeline'),
  ('engineering_activity_feed', 'Engineering Activity Feed', 'Engineering activity feed')
) AS v(key, name, descr)
WHERE NOT EXISTS (
  SELECT 1 FROM capabilities c WHERE c.capability_key = v.key AND c.tenant_id IS NULL
);

CREATE OR REPLACE FUNCTION seed_tenant_engineering_registers(p_tenant_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO capabilities (tenant_id, capability_key, name, description, category, operating_system, status, is_platform)
  SELECT p_tenant_id, capability_key, name, description, category, operating_system, status, FALSE
  FROM capabilities
  WHERE tenant_id IS NULL
    AND is_platform = TRUE
    AND (
      capability_key LIKE 'engineering_%register'
      OR capability_key IN ('engineering_timeline', 'engineering_activity_feed')
    )
  ON CONFLICT DO NOTHING;

  INSERT INTO workflow_definitions (tenant_id, name, slug, description, category, is_active)
  VALUES
    (p_tenant_id, 'Decision Approval', 'engineering-decision-approval', 'Human approval for engineering decisions', 'engineering', TRUE),
    (p_tenant_id, 'Risk Review', 'engineering-risk-review', 'Risk review workflow', 'engineering', TRUE),
    (p_tenant_id, 'Technical Query', 'engineering-tq-workflow', 'TQ response workflow', 'engineering', TRUE),
    (p_tenant_id, 'Action Close-out', 'engineering-action-closeout', 'Action close-out workflow', 'engineering', TRUE),
    (p_tenant_id, 'Issue Investigation', 'engineering-issue-investigation', 'Issue investigation workflow', 'engineering', TRUE)
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
