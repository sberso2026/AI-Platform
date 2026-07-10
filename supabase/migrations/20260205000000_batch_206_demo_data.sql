-- RTB AI Platform Batch 2.06 — Demo data seed/reset + document metadata

ALTER TABLE engineering_documents
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_eng_documents_demo
  ON engineering_documents(tenant_id)
  WHERE (metadata @> '{"demo": true}');

CREATE INDEX IF NOT EXISTS idx_eng_projects_demo
  ON engineering_projects(tenant_id)
  WHERE (metadata @> '{"demo": true}');

-- Demo record helper
CREATE OR REPLACE FUNCTION engineering_is_demo_metadata(p_metadata JSONB)
RETURNS BOOLEAN AS $$
  SELECT COALESCE((p_metadata->>'demo')::boolean, FALSE);
$$ LANGUAGE sql IMMUTABLE;

-- Safe reset: ONLY rows with metadata.demo = true
CREATE OR REPLACE FUNCTION reset_engineering_os_demo_data(p_tenant_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_counts JSONB := '{}'::jsonb;
  v_n INTEGER;
BEGIN
  -- Timeline / activity (demo-flagged only)
  DELETE FROM engineering_activity_events
  WHERE tenant_id = p_tenant_id AND metadata @> '{"demo": true}';
  GET DIAGNOSTICS v_n = ROW_COUNT;
  v_counts := v_counts || jsonb_build_object('activity_events', v_n);

  DELETE FROM engineering_timeline_events
  WHERE tenant_id = p_tenant_id AND metadata @> '{"demo": true}';
  GET DIAGNOSTICS v_n = ROW_COUNT;
  v_counts := v_counts || jsonb_build_object('timeline_events', v_n);

  -- Links touching demo register objects
  DELETE FROM engineering_object_links ol
  WHERE ol.tenant_id = p_tenant_id
    AND (
      EXISTS (SELECT 1 FROM engineering_decisions d WHERE d.id = ol.from_id AND d.tenant_id = p_tenant_id AND d.metadata @> '{"demo": true}')
      OR EXISTS (SELECT 1 FROM engineering_decisions d WHERE d.id = ol.to_id AND d.tenant_id = p_tenant_id AND d.metadata @> '{"demo": true}')
      OR EXISTS (SELECT 1 FROM engineering_actions a WHERE a.id = ol.from_id AND a.tenant_id = p_tenant_id AND a.metadata @> '{"demo": true}')
      OR EXISTS (SELECT 1 FROM engineering_actions a WHERE a.id = ol.to_id AND a.tenant_id = p_tenant_id AND a.metadata @> '{"demo": true}')
      OR EXISTS (SELECT 1 FROM engineering_risks r WHERE r.id = ol.from_id AND r.tenant_id = p_tenant_id AND r.metadata @> '{"demo": true}')
      OR EXISTS (SELECT 1 FROM engineering_risks r WHERE r.id = ol.to_id AND r.tenant_id = p_tenant_id AND r.metadata @> '{"demo": true}')
      OR EXISTS (SELECT 1 FROM engineering_issues i WHERE i.id = ol.from_id AND i.tenant_id = p_tenant_id AND i.metadata @> '{"demo": true}')
      OR EXISTS (SELECT 1 FROM engineering_issues i WHERE i.id = ol.to_id AND i.tenant_id = p_tenant_id AND i.metadata @> '{"demo": true}')
      OR EXISTS (SELECT 1 FROM engineering_technical_queries t WHERE t.id = ol.from_id AND t.tenant_id = p_tenant_id AND t.metadata @> '{"demo": true}')
      OR EXISTS (SELECT 1 FROM engineering_technical_queries t WHERE t.id = ol.to_id AND t.tenant_id = p_tenant_id AND t.metadata @> '{"demo": true}')
      OR EXISTS (SELECT 1 FROM engineering_lessons l WHERE l.id = ol.from_id AND l.tenant_id = p_tenant_id AND l.metadata @> '{"demo": true}')
      OR EXISTS (SELECT 1 FROM engineering_lessons l WHERE l.id = ol.to_id AND l.tenant_id = p_tenant_id AND l.metadata @> '{"demo": true}')
      OR ol.metadata @> '{"demo": true}'
    );
  GET DIAGNOSTICS v_n = ROW_COUNT;
  v_counts := v_counts || jsonb_build_object('object_links', v_n);

  DELETE FROM engineering_object_comments c
  WHERE c.tenant_id = p_tenant_id
    AND (
      EXISTS (SELECT 1 FROM engineering_decisions d WHERE d.id = c.object_id AND d.metadata @> '{"demo": true}')
      OR EXISTS (SELECT 1 FROM engineering_actions a WHERE a.id = c.object_id AND a.metadata @> '{"demo": true}')
      OR EXISTS (SELECT 1 FROM engineering_risks r WHERE r.id = c.object_id AND r.metadata @> '{"demo": true}')
      OR EXISTS (SELECT 1 FROM engineering_issues i WHERE i.id = c.object_id AND i.metadata @> '{"demo": true}')
      OR EXISTS (SELECT 1 FROM engineering_technical_queries t WHERE t.id = c.object_id AND t.metadata @> '{"demo": true}')
      OR EXISTS (SELECT 1 FROM engineering_lessons l WHERE l.id = c.object_id AND l.metadata @> '{"demo": true}')
    );
  GET DIAGNOSTICS v_n = ROW_COUNT;
  v_counts := v_counts || jsonb_build_object('comments', v_n);

  -- Registers (demo only)
  DELETE FROM engineering_lessons WHERE tenant_id = p_tenant_id AND metadata @> '{"demo": true}';
  GET DIAGNOSTICS v_n = ROW_COUNT;
  v_counts := v_counts || jsonb_build_object('lessons', v_n);

  DELETE FROM engineering_technical_queries WHERE tenant_id = p_tenant_id AND metadata @> '{"demo": true}';
  GET DIAGNOSTICS v_n = ROW_COUNT;
  v_counts := v_counts || jsonb_build_object('technical_queries', v_n);

  DELETE FROM engineering_issues WHERE tenant_id = p_tenant_id AND metadata @> '{"demo": true}';
  GET DIAGNOSTICS v_n = ROW_COUNT;
  v_counts := v_counts || jsonb_build_object('issues', v_n);

  DELETE FROM engineering_risks WHERE tenant_id = p_tenant_id AND metadata @> '{"demo": true}';
  GET DIAGNOSTICS v_n = ROW_COUNT;
  v_counts := v_counts || jsonb_build_object('risks', v_n);

  DELETE FROM engineering_actions WHERE tenant_id = p_tenant_id AND metadata @> '{"demo": true}';
  GET DIAGNOSTICS v_n = ROW_COUNT;
  v_counts := v_counts || jsonb_build_object('actions', v_n);

  DELETE FROM engineering_decisions WHERE tenant_id = p_tenant_id AND metadata @> '{"demo": true}';
  GET DIAGNOSTICS v_n = ROW_COUNT;
  v_counts := v_counts || jsonb_build_object('decisions', v_n);

  DELETE FROM engineering_documents WHERE tenant_id = p_tenant_id AND metadata @> '{"demo": true}';
  GET DIAGNOSTICS v_n = ROW_COUNT;
  v_counts := v_counts || jsonb_build_object('documents', v_n);

  DELETE FROM engineering_assets WHERE tenant_id = p_tenant_id AND metadata @> '{"demo": true}';
  GET DIAGNOSTICS v_n = ROW_COUNT;
  v_counts := v_counts || jsonb_build_object('assets', v_n);

  DELETE FROM engineering_projects WHERE tenant_id = p_tenant_id AND metadata @> '{"demo": true}';
  GET DIAGNOSTICS v_n = ROW_COUNT;
  v_counts := v_counts || jsonb_build_object('projects', v_n);

  RETURN jsonb_build_object('deleted', v_counts, 'tenant_id', p_tenant_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Demo seed (idempotent: skips if demo projects already exist)
CREATE OR REPLACE FUNCTION seed_engineering_os_demo_data(p_tenant_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_demo JSONB := '{"demo": true, "seed_batch": "2.06"}'::jsonb;
  v_ws UUID;
  v_p1 UUID;
  v_p2 UUID;
  v_a1 UUID; v_a2 UUID; v_a3 UUID; v_a4 UUID; v_a5 UUID;
  v_d1 UUID; v_d2 UUID; v_d3 UUID; v_d4 UUID;
  v_existing INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_existing
  FROM engineering_projects
  WHERE tenant_id = p_tenant_id AND metadata @> '{"demo": true}';

  IF v_existing > 0 THEN
    RETURN jsonb_build_object(
      'status', 'already_seeded',
      'message', 'Demo data already present. Call reset_engineering_os_demo_data first to re-seed.',
      'demo_projects', v_existing
    );
  END IF;

  SELECT id INTO v_ws FROM workspaces WHERE tenant_id = p_tenant_id AND status = 'active' LIMIT 1;

  -- 2 projects
  INSERT INTO engineering_projects (tenant_id, workspace_id, project_code, project_name, status, project_phase, metadata)
  VALUES
    (p_tenant_id, v_ws, 'DEMO-PRJ-001', 'Demo Offshore Platform Upgrade', 'active', 'design', v_demo)
  RETURNING id INTO v_p1;

  INSERT INTO engineering_projects (tenant_id, workspace_id, project_code, project_name, status, project_phase, metadata)
  VALUES
    (p_tenant_id, v_ws, 'DEMO-PRJ-002', 'Demo Structural Refurbishment', 'active', 'detailed_design', v_demo)
  RETURNING id INTO v_p2;

  -- 5 assets
  INSERT INTO engineering_assets (tenant_id, workspace_id, engineering_project_id, asset_tag, asset_name, criticality, metadata)
  VALUES (p_tenant_id, v_ws, v_p1, 'DEMO-EQ-101', 'Demo Pump P101', 'high', v_demo) RETURNING id INTO v_a1;
  INSERT INTO engineering_assets (tenant_id, workspace_id, engineering_project_id, asset_tag, asset_name, criticality, metadata)
  VALUES (p_tenant_id, v_ws, v_p1, 'DEMO-EQ-102', 'Demo Heat Exchanger HX-12', 'medium', v_demo) RETURNING id INTO v_a2;
  INSERT INTO engineering_assets (tenant_id, workspace_id, engineering_project_id, asset_tag, asset_name, criticality, metadata)
  VALUES (p_tenant_id, v_ws, v_p1, 'DEMO-ST-201', 'Demo Jacket Structure J-1', 'critical', v_demo) RETURNING id INTO v_a3;
  INSERT INTO engineering_assets (tenant_id, workspace_id, engineering_project_id, asset_tag, asset_name, criticality, metadata)
  VALUES (p_tenant_id, v_ws, v_p2, 'DEMO-ST-301', 'Demo Crane Pedestal CP-3', 'high', v_demo) RETURNING id INTO v_a4;
  INSERT INTO engineering_assets (tenant_id, workspace_id, engineering_project_id, asset_tag, asset_name, criticality, metadata)
  VALUES (p_tenant_id, v_ws, v_p2, 'DEMO-EQ-401', 'Demo Anchor Bolt Array AB-4', 'medium', v_demo) RETURNING id INTO v_a5;

  -- 4 documents
  INSERT INTO engineering_documents (tenant_id, workspace_id, engineering_project_id, asset_id, document_number, title, revision, status, metadata)
  VALUES
    (p_tenant_id, v_ws, v_p1, v_a1, 'DEMO-DWG-001', 'Demo Pump P101 GA Drawing', 'A', 'issued', v_demo) RETURNING id INTO v_d1;
  INSERT INTO engineering_documents (tenant_id, workspace_id, engineering_project_id, document_number, title, revision, status, metadata)
  VALUES (p_tenant_id, v_ws, v_p1, 'DEMO-SPC-002', 'Demo Structural Design Basis', 'B', 'approved', v_demo) RETURNING id INTO v_d2;
  INSERT INTO engineering_documents (tenant_id, workspace_id, engineering_project_id, asset_id, document_number, title, revision, status, metadata)
  VALUES (p_tenant_id, v_ws, v_p2, v_a4, 'DEMO-CALC-003', 'Demo Crane Pedestal Calculation', 'A', 'for_review', v_demo) RETURNING id INTO v_d3;
  INSERT INTO engineering_documents (tenant_id, workspace_id, engineering_project_id, document_number, title, revision, status, metadata)
  VALUES (p_tenant_id, v_ws, v_p2, 'DEMO-RPT-004', 'Demo Refurbishment Inspection Report', 'A', 'draft', v_demo) RETURNING id INTO v_d4;

  -- 3 decisions (pending approval — human approval required)
  INSERT INTO engineering_decisions (tenant_id, workspace_id, decision_number, title, project_id, asset_id, recommendation, rationale, approval_status, review_status, metadata)
  VALUES
    (p_tenant_id, v_ws, 'DEMO-DEC-0001', 'Demo: Approve pump material upgrade', v_p1, v_a1, 'Upgrade to duplex SS', 'Corrosion risk in service fluid', 'pending', 'pending', v_demo),
    (p_tenant_id, v_ws, 'DEMO-DEC-0002', 'Demo: Jacket strengthening approach', v_p1, v_a3, 'External stiffening plates', 'Fatigue assessment exceeded limit', 'pending', 'pending', v_demo),
    (p_tenant_id, v_ws, 'DEMO-DEC-0003', 'Demo: Crane pedestal grout specification', v_p2, v_a4, 'High-strength non-shrink grout', 'Settlement tolerance requirement', 'pending', 'pending', v_demo);

  -- 5 actions
  INSERT INTO engineering_actions (tenant_id, workspace_id, action_number, title, project_id, asset_id, status, priority, due_date, metadata)
  VALUES
    (p_tenant_id, v_ws, 'DEMO-ACT-0001', 'Demo: Complete pump NDE inspection', v_p1, v_a1, 'open', 'high', CURRENT_DATE + 14, v_demo),
    (p_tenant_id, v_ws, 'DEMO-ACT-0002', 'Demo: Issue structural calculation package', v_p1, v_a3, 'in_progress', 'high', CURRENT_DATE + 7, v_demo),
    (p_tenant_id, v_ws, 'DEMO-ACT-0003', 'Demo: Review heat exchanger datasheet', v_p1, v_a2, 'open', 'medium', CURRENT_DATE + 21, v_demo),
    (p_tenant_id, v_ws, 'DEMO-ACT-0004', 'Demo: Site survey crane pedestal', v_p2, v_a4, 'open', 'high', CURRENT_DATE + 10, v_demo),
    (p_tenant_id, v_ws, 'DEMO-ACT-0005', 'Demo: Anchor bolt pull-out test plan', v_p2, v_a5, 'completed', 'medium', CURRENT_DATE - 3, v_demo);

  -- 3 risks
  INSERT INTO engineering_risks (tenant_id, workspace_id, risk_number, title, project_id, asset_id, probability, consequence, mitigation, metadata)
  VALUES
    (p_tenant_id, v_ws, 'DEMO-RSK-0001', 'Demo: Pump cavitation under low flow', v_p1, v_a1, 3, 4, 'Install minimum flow bypass', v_demo),
    (p_tenant_id, v_ws, 'DEMO-RSK-0002', 'Demo: Jacket fatigue at brace joint', v_p1, v_a3, 4, 5, 'FEA verification and inspection regime', v_demo),
    (p_tenant_id, v_ws, 'DEMO-RSK-0003', 'Demo: Crane pedestal grout failure', v_p2, v_a4, 2, 5, 'Qualified installer and QC hold points', v_demo);

  -- 2 issues
  INSERT INTO engineering_issues (tenant_id, workspace_id, issue_number, title, issue_type, project_id, asset_id, impact, status, metadata)
  VALUES
    (p_tenant_id, v_ws, 'DEMO-ISS-0001', 'Demo: Discrepancy in pump nozzle loads', 'technical', v_p1, v_a1, 'May affect piping design', 'open', v_demo),
    (p_tenant_id, v_ws, 'DEMO-ISS-0002', 'Demo: Anchor bolt torque variance', 'quality', v_p2, v_a5, 'Installation compliance', 'investigating', v_demo);

  -- 2 technical queries
  INSERT INTO engineering_technical_queries (tenant_id, workspace_id, tq_number, title, question, project_id, document_id, response_due, status, metadata)
  VALUES
    (p_tenant_id, v_ws, 'DEMO-TQ-0001', 'Demo TQ: Pump seal flush plan', 'Please confirm seal flush plan per API 682 for P101.', v_p1, v_d1, CURRENT_DATE + 5, 'open', v_demo),
    (p_tenant_id, v_ws, 'DEMO-TQ-0002', 'Demo TQ: Crane pedestal rebar spacing', 'Clarify rebar spacing at pedestal base per DEMO-CALC-003.', v_p2, v_d3, CURRENT_DATE + 7, 'open', v_demo);

  -- 2 lessons learned
  INSERT INTO engineering_lessons (tenant_id, workspace_id, lesson_number, title, lesson, recommendation, category, project_id, metadata)
  VALUES
    (p_tenant_id, v_ws, 'DEMO-LL-0001', 'Demo: Anchor bolt installation', 'Torque verification must include calibrated wrench certification.', 'Add hold point before grout pour.', 'construction', v_p2, v_demo),
    (p_tenant_id, v_ws, 'DEMO-LL-0002', 'Demo: Offshore pump selection', 'Duplex SS required when chlorides exceed 50 ppm in service.', 'Update material selection matrix.', 'design', v_p1, v_demo);

  -- Timeline + activity samples
  INSERT INTO engineering_timeline_events (tenant_id, workspace_id, event_type, object_type, project_id, title, metadata)
  VALUES
    (p_tenant_id, v_ws, 'engineering.project.created', 'project', v_p1, 'Demo project created: DEMO-PRJ-001', v_demo),
    (p_tenant_id, v_ws, 'engineering.decision.created', 'decision', v_p1, 'Demo decision raised: pump material upgrade', v_demo),
    (p_tenant_id, v_ws, 'engineering.risk.created', 'risk', v_p1, 'Demo risk registered: pump cavitation', v_demo);

  INSERT INTO engineering_activity_events (tenant_id, workspace_id, activity_type, object_type, project_id, title, severity, metadata)
  VALUES
    (p_tenant_id, v_ws, 'engineering.demo.seeded', 'system', v_p1, 'Engineering OS demo data seeded', 'info', v_demo),
    (p_tenant_id, v_ws, 'engineering.action.created', 'action', v_p1, 'Demo action: pump NDE inspection', 'info', v_demo);

  RETURN jsonb_build_object(
    'status', 'seeded',
    'tenant_id', p_tenant_id,
    'counts', jsonb_build_object(
      'projects', 2, 'assets', 5, 'documents', 4, 'decisions', 3,
      'actions', 5, 'risks', 3, 'issues', 2, 'technical_queries', 2, 'lessons', 2
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
