-- RTB AI Platform Batch 2.0 — Engineering OS RLS Policies

ALTER TABLE engineering_disciplines ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_company_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_asset_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_entity_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_application_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_application_installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_audit_links ENABLE ROW LEVEL SECURITY;

-- Disciplines (system + tenant)
CREATE POLICY eng_disciplines_select ON engineering_disciplines FOR SELECT USING (
  tenant_id IS NULL OR tenant_id = ANY(get_user_tenant_ids())
);
CREATE POLICY eng_disciplines_manage ON engineering_disciplines FOR ALL USING (
  tenant_id IS NOT NULL AND has_permission('engineering', 'admin', tenant_id)
);

-- Companies
CREATE POLICY eng_companies_select ON engineering_companies FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));
CREATE POLICY eng_companies_manage ON engineering_companies FOR ALL USING (
  has_permission('engineering', 'admin', tenant_id) OR has_permission('engineering', 'execute', tenant_id)
);

CREATE POLICY eng_company_contacts_select ON engineering_company_contacts FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));
CREATE POLICY eng_company_contacts_manage ON engineering_company_contacts FOR ALL USING (tenant_id = ANY(get_user_tenant_ids()));

-- Asset types
CREATE POLICY eng_asset_types_select ON engineering_asset_types FOR SELECT USING (
  tenant_id IS NULL OR tenant_id = ANY(get_user_tenant_ids())
);
CREATE POLICY eng_asset_types_manage ON engineering_asset_types FOR ALL USING (
  tenant_id IS NOT NULL AND has_permission('engineering', 'admin', tenant_id)
);

-- Projects
CREATE POLICY eng_projects_select ON engineering_projects FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));
CREATE POLICY eng_projects_insert ON engineering_projects FOR INSERT WITH CHECK (
  tenant_id = ANY(get_user_tenant_ids()) AND has_permission('engineering', 'execute', tenant_id)
);
CREATE POLICY eng_projects_update ON engineering_projects FOR UPDATE USING (
  tenant_id = ANY(get_user_tenant_ids()) AND has_permission('engineering', 'execute', tenant_id)
);
CREATE POLICY eng_projects_delete ON engineering_projects FOR DELETE USING (
  has_permission('engineering', 'admin', tenant_id)
);

CREATE POLICY eng_project_members_select ON engineering_project_members FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));
CREATE POLICY eng_project_members_manage ON engineering_project_members FOR ALL USING (
  has_permission('engineering', 'admin', tenant_id)
);

-- Assets
CREATE POLICY eng_assets_select ON engineering_assets FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));
CREATE POLICY eng_assets_insert ON engineering_assets FOR INSERT WITH CHECK (
  tenant_id = ANY(get_user_tenant_ids()) AND has_permission('engineering', 'execute', tenant_id)
);
CREATE POLICY eng_assets_update ON engineering_assets FOR UPDATE USING (
  tenant_id = ANY(get_user_tenant_ids()) AND has_permission('engineering', 'execute', tenant_id)
);
CREATE POLICY eng_assets_delete ON engineering_assets FOR DELETE USING (
  has_permission('engineering', 'admin', tenant_id)
);

-- Documents
CREATE POLICY eng_documents_select ON engineering_documents FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));
CREATE POLICY eng_documents_insert ON engineering_documents FOR INSERT WITH CHECK (
  tenant_id = ANY(get_user_tenant_ids()) AND has_permission('engineering', 'execute', tenant_id)
);
CREATE POLICY eng_documents_update ON engineering_documents FOR UPDATE USING (
  tenant_id = ANY(get_user_tenant_ids()) AND has_permission('engineering', 'execute', tenant_id)
);
CREATE POLICY eng_documents_delete ON engineering_documents FOR DELETE USING (
  has_permission('engineering', 'admin', tenant_id)
);

CREATE POLICY eng_document_versions_select ON engineering_document_versions FOR SELECT USING (
  EXISTS (SELECT 1 FROM engineering_documents d WHERE d.id = document_id AND d.tenant_id = ANY(get_user_tenant_ids()))
);
CREATE POLICY eng_document_versions_manage ON engineering_document_versions FOR ALL USING (
  EXISTS (SELECT 1 FROM engineering_documents d WHERE d.id = document_id AND d.tenant_id = ANY(get_user_tenant_ids()))
);

-- Tags
CREATE POLICY eng_tags_select ON engineering_tags FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));
CREATE POLICY eng_tags_manage ON engineering_tags FOR ALL USING (has_permission('engineering', 'admin', tenant_id));
CREATE POLICY eng_entity_tags_select ON engineering_entity_tags FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));
CREATE POLICY eng_entity_tags_manage ON engineering_entity_tags FOR ALL USING (tenant_id = ANY(get_user_tenant_ids()));

-- Application registry (global readable)
CREATE POLICY eng_app_registry_select ON engineering_application_registry FOR SELECT USING (TRUE);

CREATE POLICY eng_app_installations_select ON engineering_application_installations FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));
CREATE POLICY eng_app_installations_manage ON engineering_application_installations FOR ALL USING (
  has_permission('engineering', 'admin', tenant_id)
);

-- Settings
CREATE POLICY eng_settings_select ON engineering_settings FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));
CREATE POLICY eng_settings_manage ON engineering_settings FOR ALL USING (
  has_permission('engineering', 'admin', tenant_id)
);

-- Audit links
CREATE POLICY eng_audit_links_select ON engineering_audit_links FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));
CREATE POLICY eng_audit_links_insert ON engineering_audit_links FOR INSERT WITH CHECK (tenant_id = ANY(get_user_tenant_ids()));
