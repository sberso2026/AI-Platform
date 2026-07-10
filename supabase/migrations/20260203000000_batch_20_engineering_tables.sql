-- RTB AI Platform Batch 2.0 — Engineering OS Core Tables

-- ═══════════════════════════════════════════════════════════════════════════════
-- DISCIPLINES & COMPANIES
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE engineering_disciplines (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID REFERENCES tenants(id) ON DELETE CASCADE,
  discipline_key  TEXT NOT NULL,
  name            TEXT NOT NULL,
  description     TEXT,
  is_system       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_eng_disciplines_tenant_key ON engineering_disciplines(tenant_id, discipline_key) WHERE tenant_id IS NOT NULL;
CREATE UNIQUE INDEX idx_eng_disciplines_system_key ON engineering_disciplines(discipline_key) WHERE tenant_id IS NULL AND is_system = TRUE;
CREATE INDEX idx_eng_disciplines_tenant ON engineering_disciplines(tenant_id);

CREATE TABLE engineering_companies (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name                  TEXT NOT NULL,
  company_type          TEXT NOT NULL CHECK (company_type IN (
    'owner', 'consultant', 'contractor', 'vendor', 'fabricator', 'inspector', 'regulator', 'client'
  )),
  registration_number   TEXT,
  country               TEXT,
  status                TEXT NOT NULL DEFAULT 'active',
  metadata              JSONB NOT NULL DEFAULT '{}',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_eng_companies_tenant ON engineering_companies(tenant_id);
CREATE INDEX idx_eng_companies_type ON engineering_companies(tenant_id, company_type);

CREATE TRIGGER engineering_companies_updated_at
  BEFORE UPDATE ON engineering_companies FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE engineering_company_contacts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  company_id    UUID NOT NULL REFERENCES engineering_companies(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL,
  email         TEXT,
  phone         TEXT,
  role_title    TEXT,
  is_primary    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_eng_company_contacts_company ON engineering_company_contacts(company_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- ASSET TYPES
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE engineering_asset_types (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID REFERENCES tenants(id) ON DELETE CASCADE,
  type_key      TEXT NOT NULL,
  name          TEXT NOT NULL,
  description   TEXT,
  is_system     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_eng_asset_types_tenant_key ON engineering_asset_types(tenant_id, type_key) WHERE tenant_id IS NOT NULL;
CREATE INDEX idx_eng_asset_types_tenant ON engineering_asset_types(tenant_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- PROJECTS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE engineering_projects (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id    UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  project_code    TEXT NOT NULL,
  project_name    TEXT NOT NULL,
  client_name     TEXT,
  site_name       TEXT,
  location        TEXT,
  industry        TEXT,
  project_type    TEXT,
  project_phase   TEXT NOT NULL DEFAULT 'concept' CHECK (project_phase IN (
    'concept', 'feasibility', 'design', 'detailed_design', 'procurement',
    'construction', 'commissioning', 'operations', 'decommissioning'
  )),
  status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'active', 'on_hold', 'completed', 'cancelled', 'archived'
  )),
  start_date      DATE,
  end_date        DATE,
  metadata        JSONB NOT NULL DEFAULT '{}',
  knowledge_node_id UUID REFERENCES knowledge_nodes(id) ON DELETE SET NULL,
  created_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, project_code)
);

CREATE INDEX idx_eng_projects_tenant ON engineering_projects(tenant_id);
CREATE INDEX idx_eng_projects_workspace ON engineering_projects(workspace_id);
CREATE INDEX idx_eng_projects_status ON engineering_projects(tenant_id, status);
CREATE INDEX idx_eng_projects_code ON engineering_projects(tenant_id, project_code);

CREATE TRIGGER engineering_projects_updated_at
  BEFORE UPDATE ON engineering_projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE engineering_project_members (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id               UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  engineering_project_id  UUID NOT NULL REFERENCES engineering_projects(id) ON DELETE CASCADE,
  user_id                 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role_slug               TEXT NOT NULL DEFAULT 'engineer',
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (engineering_project_id, user_id)
);

CREATE INDEX idx_eng_project_members_project ON engineering_project_members(engineering_project_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- ASSETS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE engineering_assets (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id               UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id            UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  engineering_project_id  UUID REFERENCES engineering_projects(id) ON DELETE SET NULL,
  asset_tag               TEXT NOT NULL,
  asset_name              TEXT NOT NULL,
  asset_type_id           UUID REFERENCES engineering_asset_types(id) ON DELETE SET NULL,
  discipline_id           UUID REFERENCES engineering_disciplines(id) ON DELETE SET NULL,
  parent_asset_id         UUID REFERENCES engineering_assets(id) ON DELETE SET NULL,
  location                TEXT,
  system                  TEXT,
  subsystem               TEXT,
  criticality             TEXT NOT NULL DEFAULT 'medium' CHECK (criticality IN ('low', 'medium', 'high', 'critical')),
  status                  TEXT NOT NULL DEFAULT 'active',
  metadata                JSONB NOT NULL DEFAULT '{}',
  digital_twin_id         UUID REFERENCES digital_twins(id) ON DELETE SET NULL,
  knowledge_node_id        UUID REFERENCES knowledge_nodes(id) ON DELETE SET NULL,
  created_by              UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, asset_tag)
);

CREATE INDEX idx_eng_assets_tenant ON engineering_assets(tenant_id);
CREATE INDEX idx_eng_assets_workspace ON engineering_assets(workspace_id);
CREATE INDEX idx_eng_assets_project ON engineering_assets(engineering_project_id);
CREATE INDEX idx_eng_assets_tag ON engineering_assets(tenant_id, asset_tag);
CREATE INDEX idx_eng_assets_status ON engineering_assets(tenant_id, status);
CREATE INDEX idx_eng_assets_parent ON engineering_assets(parent_asset_id);

CREATE TRIGGER engineering_assets_updated_at
  BEFORE UPDATE ON engineering_assets FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════════
-- DOCUMENTS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE engineering_documents (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id               UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id            UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  engineering_project_id  UUID REFERENCES engineering_projects(id) ON DELETE SET NULL,
  asset_id                UUID REFERENCES engineering_assets(id) ON DELETE SET NULL,
  document_number         TEXT NOT NULL,
  title                   TEXT NOT NULL,
  document_type           TEXT,
  discipline_id           UUID REFERENCES engineering_disciplines(id) ON DELETE SET NULL,
  revision                TEXT NOT NULL DEFAULT 'A',
  status                  TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'issued', 'for_review', 'approved', 'superseded', 'obsolete'
  )),
  file_path               TEXT,
  file_name               TEXT,
  file_size               BIGINT,
  mime_type               TEXT,
  source                  TEXT,
  knowledge_node_id       UUID REFERENCES knowledge_nodes(id) ON DELETE SET NULL,
  uploaded_by             UUID REFERENCES profiles(id) ON DELETE SET NULL,
  uploaded_at             TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, document_number, revision)
);

CREATE INDEX idx_eng_documents_tenant ON engineering_documents(tenant_id);
CREATE INDEX idx_eng_documents_workspace ON engineering_documents(workspace_id);
CREATE INDEX idx_eng_documents_project ON engineering_documents(engineering_project_id);
CREATE INDEX idx_eng_documents_number ON engineering_documents(tenant_id, document_number);
CREATE INDEX idx_eng_documents_status ON engineering_documents(tenant_id, status);

CREATE TRIGGER engineering_documents_updated_at
  BEFORE UPDATE ON engineering_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE engineering_document_versions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id   UUID NOT NULL REFERENCES engineering_documents(id) ON DELETE CASCADE,
  revision      TEXT NOT NULL,
  file_path     TEXT,
  file_name     TEXT,
  file_size     BIGINT,
  mime_type     TEXT,
  status        TEXT NOT NULL DEFAULT 'draft',
  notes         TEXT,
  uploaded_by   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (document_id, revision)
);

CREATE INDEX idx_eng_document_versions_doc ON engineering_document_versions(document_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- TAGS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE engineering_tags (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  tag_key       TEXT NOT NULL,
  name          TEXT NOT NULL,
  color         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, tag_key)
);

CREATE INDEX idx_eng_tags_tenant ON engineering_tags(tenant_id);

CREATE TABLE engineering_entity_tags (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  tag_id        UUID NOT NULL REFERENCES engineering_tags(id) ON DELETE CASCADE,
  entity_type   TEXT NOT NULL CHECK (entity_type IN ('project', 'asset', 'document', 'company')),
  entity_id     UUID NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tag_id, entity_type, entity_id)
);

CREATE INDEX idx_eng_entity_tags_entity ON engineering_entity_tags(entity_type, entity_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- APPLICATION RUNTIME
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE engineering_application_registry (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_key                 TEXT NOT NULL UNIQUE,
  name                    TEXT NOT NULL,
  description             TEXT,
  status                  TEXT NOT NULL DEFAULT 'registered',
  version                 TEXT NOT NULL DEFAULT '0.0.0',
  required_capabilities   JSONB NOT NULL DEFAULT '[]',
  required_permissions    JSONB NOT NULL DEFAULT '[]',
  routes                  JSONB NOT NULL DEFAULT '[]',
  enabled                 BOOLEAN NOT NULL DEFAULT FALSE,
  installed_at            TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER engineering_application_registry_updated_at
  BEFORE UPDATE ON engineering_application_registry FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE engineering_application_installations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  app_id        UUID NOT NULL REFERENCES engineering_application_registry(id) ON DELETE CASCADE,
  enabled       BOOLEAN NOT NULL DEFAULT FALSE,
  config        JSONB NOT NULL DEFAULT '{}',
  installed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, app_id)
);

CREATE INDEX idx_eng_app_installations_tenant ON engineering_application_installations(tenant_id);

CREATE TRIGGER engineering_application_installations_updated_at
  BEFORE UPDATE ON engineering_application_installations FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════════
-- SETTINGS & AUDIT LINKS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE engineering_settings (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                 UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE UNIQUE,
  document_numbering_format TEXT NOT NULL DEFAULT '{PROJECT}-{DISC}-{SEQ}',
  asset_tag_format          TEXT NOT NULL DEFAULT '{PROJECT}-{SYS}-{SEQ}',
  ai_review_threshold       NUMERIC(5,4) NOT NULL DEFAULT 0.7000,
  enabled_applications      JSONB NOT NULL DEFAULT '[]',
  metadata                  JSONB NOT NULL DEFAULT '{}',
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_eng_settings_tenant ON engineering_settings(tenant_id);

CREATE TRIGGER engineering_settings_updated_at
  BEFORE UPDATE ON engineering_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE engineering_audit_links (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  entity_type   TEXT NOT NULL,
  entity_id     UUID NOT NULL,
  audit_event_id UUID,
  action        TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_eng_audit_links_tenant ON engineering_audit_links(tenant_id);
CREATE INDEX idx_eng_audit_links_entity ON engineering_audit_links(entity_type, entity_id);
