-- RTB AI Platform Batch 2.05 — RLS for Engineering Intelligence Registers

ALTER TABLE engineering_object_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_object_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_object_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_activity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_technical_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_lessons ENABLE ROW LEVEL SECURITY;

-- Helper pattern for register tables
CREATE POLICY eng_obj_links_select ON engineering_object_links FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));
CREATE POLICY eng_obj_links_manage ON engineering_object_links FOR ALL USING (
  tenant_id = ANY(get_user_tenant_ids()) AND has_permission('engineering', 'execute', tenant_id)
);

CREATE POLICY eng_obj_comments_select ON engineering_object_comments FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));
CREATE POLICY eng_obj_comments_manage ON engineering_object_comments FOR ALL USING (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY eng_obj_attachments_select ON engineering_object_attachments FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));
CREATE POLICY eng_obj_attachments_manage ON engineering_object_attachments FOR ALL USING (
  tenant_id = ANY(get_user_tenant_ids()) AND has_permission('engineering', 'execute', tenant_id)
);

CREATE POLICY eng_timeline_select ON engineering_timeline_events FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));
CREATE POLICY eng_timeline_insert ON engineering_timeline_events FOR INSERT WITH CHECK (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY eng_activity_select ON engineering_activity_events FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));
CREATE POLICY eng_activity_insert ON engineering_activity_events FOR INSERT WITH CHECK (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY eng_decisions_select ON engineering_decisions FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));
CREATE POLICY eng_decisions_insert ON engineering_decisions FOR INSERT WITH CHECK (
  tenant_id = ANY(get_user_tenant_ids()) AND has_permission('engineering', 'execute', tenant_id)
);
CREATE POLICY eng_decisions_update ON engineering_decisions FOR UPDATE USING (
  tenant_id = ANY(get_user_tenant_ids()) AND has_permission('engineering', 'execute', tenant_id)
);
CREATE POLICY eng_decisions_delete ON engineering_decisions FOR DELETE USING (has_permission('engineering', 'admin', tenant_id));

CREATE POLICY eng_actions_select ON engineering_actions FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));
CREATE POLICY eng_actions_insert ON engineering_actions FOR INSERT WITH CHECK (
  tenant_id = ANY(get_user_tenant_ids()) AND has_permission('engineering', 'execute', tenant_id)
);
CREATE POLICY eng_actions_update ON engineering_actions FOR UPDATE USING (
  tenant_id = ANY(get_user_tenant_ids()) AND has_permission('engineering', 'execute', tenant_id)
);
CREATE POLICY eng_actions_delete ON engineering_actions FOR DELETE USING (has_permission('engineering', 'admin', tenant_id));

CREATE POLICY eng_risks_select ON engineering_risks FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));
CREATE POLICY eng_risks_insert ON engineering_risks FOR INSERT WITH CHECK (
  tenant_id = ANY(get_user_tenant_ids()) AND has_permission('engineering', 'execute', tenant_id)
);
CREATE POLICY eng_risks_update ON engineering_risks FOR UPDATE USING (
  tenant_id = ANY(get_user_tenant_ids()) AND has_permission('engineering', 'execute', tenant_id)
);
CREATE POLICY eng_risks_delete ON engineering_risks FOR DELETE USING (has_permission('engineering', 'admin', tenant_id));

CREATE POLICY eng_issues_select ON engineering_issues FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));
CREATE POLICY eng_issues_insert ON engineering_issues FOR INSERT WITH CHECK (
  tenant_id = ANY(get_user_tenant_ids()) AND has_permission('engineering', 'execute', tenant_id)
);
CREATE POLICY eng_issues_update ON engineering_issues FOR UPDATE USING (
  tenant_id = ANY(get_user_tenant_ids()) AND has_permission('engineering', 'execute', tenant_id)
);
CREATE POLICY eng_issues_delete ON engineering_issues FOR DELETE USING (has_permission('engineering', 'admin', tenant_id));

CREATE POLICY eng_tq_select ON engineering_technical_queries FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));
CREATE POLICY eng_tq_insert ON engineering_technical_queries FOR INSERT WITH CHECK (
  tenant_id = ANY(get_user_tenant_ids()) AND has_permission('engineering', 'execute', tenant_id)
);
CREATE POLICY eng_tq_update ON engineering_technical_queries FOR UPDATE USING (
  tenant_id = ANY(get_user_tenant_ids()) AND has_permission('engineering', 'execute', tenant_id)
);
CREATE POLICY eng_tq_delete ON engineering_technical_queries FOR DELETE USING (has_permission('engineering', 'admin', tenant_id));

CREATE POLICY eng_lessons_select ON engineering_lessons FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));
CREATE POLICY eng_lessons_insert ON engineering_lessons FOR INSERT WITH CHECK (
  tenant_id = ANY(get_user_tenant_ids()) AND has_permission('engineering', 'execute', tenant_id)
);
CREATE POLICY eng_lessons_update ON engineering_lessons FOR UPDATE USING (
  tenant_id = ANY(get_user_tenant_ids()) AND has_permission('engineering', 'execute', tenant_id)
);
CREATE POLICY eng_lessons_delete ON engineering_lessons FOR DELETE USING (has_permission('engineering', 'admin', tenant_id));
