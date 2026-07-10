-- RTB AI Platform Batch 2.05 — Engineering Intelligence Registers

-- Shared relationship / social / timeline tables
CREATE TABLE engineering_object_links (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  from_type       TEXT NOT NULL,
  from_id         UUID NOT NULL,
  to_type         TEXT NOT NULL,
  to_id           UUID NOT NULL,
  relationship    TEXT NOT NULL,
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (from_type, from_id, to_type, to_id, relationship)
);
CREATE INDEX idx_eng_obj_links_tenant ON engineering_object_links(tenant_id);
CREATE INDEX idx_eng_obj_links_from ON engineering_object_links(from_type, from_id);
CREATE INDEX idx_eng_obj_links_to ON engineering_object_links(to_type, to_id);

CREATE TABLE engineering_object_comments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  object_type     TEXT NOT NULL,
  object_id       UUID NOT NULL,
  body            TEXT NOT NULL,
  created_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_eng_obj_comments_object ON engineering_object_comments(object_type, object_id);

CREATE TABLE engineering_object_attachments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  object_type     TEXT NOT NULL,
  object_id       UUID NOT NULL,
  file_name       TEXT NOT NULL,
  file_path       TEXT,
  mime_type       TEXT,
  file_size       BIGINT,
  document_id     UUID REFERENCES engineering_documents(id) ON DELETE SET NULL,
  created_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_eng_obj_attachments_object ON engineering_object_attachments(object_type, object_id);

CREATE TABLE engineering_timeline_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id    UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  event_type      TEXT NOT NULL,
  object_type     TEXT NOT NULL,
  object_id       UUID,
  project_id      UUID REFERENCES engineering_projects(id) ON DELETE SET NULL,
  asset_id        UUID REFERENCES engineering_assets(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  summary         TEXT,
  actor_id        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  metadata        JSONB NOT NULL DEFAULT '{}',
  occurred_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_eng_timeline_tenant ON engineering_timeline_events(tenant_id);
CREATE INDEX idx_eng_timeline_occurred ON engineering_timeline_events(tenant_id, occurred_at DESC);
CREATE INDEX idx_eng_timeline_project ON engineering_timeline_events(project_id);

CREATE TABLE engineering_activity_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id    UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  activity_type   TEXT NOT NULL,
  object_type     TEXT,
  object_id       UUID,
  project_id      UUID REFERENCES engineering_projects(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  body            TEXT,
  actor_id        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  severity        TEXT NOT NULL DEFAULT 'info',
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_eng_activity_tenant ON engineering_activity_events(tenant_id);
CREATE INDEX idx_eng_activity_created ON engineering_activity_events(tenant_id, created_at DESC);

-- Decision Register
CREATE TABLE engineering_decisions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id        UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  decision_number     TEXT NOT NULL,
  title               TEXT NOT NULL,
  description         TEXT,
  decision_type       TEXT,
  category            TEXT,
  status              TEXT NOT NULL DEFAULT 'draft',
  priority            TEXT NOT NULL DEFAULT 'medium',
  engineering_discipline UUID REFERENCES engineering_disciplines(id) ON DELETE SET NULL,
  discipline_id       UUID REFERENCES engineering_disciplines(id) ON DELETE SET NULL,
  project_id          UUID REFERENCES engineering_projects(id) ON DELETE SET NULL,
  asset_id            UUID REFERENCES engineering_assets(id) ON DELETE SET NULL,
  company_id          UUID REFERENCES engineering_companies(id) ON DELETE SET NULL,
  owner_id            UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_by          UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_to         UUID REFERENCES profiles(id) ON DELETE SET NULL,
  recommendation      TEXT,
  rationale           TEXT,
  alternatives        JSONB NOT NULL DEFAULT '[]',
  consequences        TEXT,
  confidence          NUMERIC(5,4),
  review_status       TEXT NOT NULL DEFAULT 'pending',
  approval_status     TEXT NOT NULL DEFAULT 'pending',
  approved_by         UUID REFERENCES profiles(id) ON DELETE SET NULL,
  decision_date       DATE,
  due_date            DATE,
  closed_date         DATE,
  workflow_instance_id UUID REFERENCES workflow_instances(id) ON DELETE SET NULL,
  knowledge_node_id   UUID REFERENCES knowledge_nodes(id) ON DELETE SET NULL,
  digital_twin_id     UUID REFERENCES digital_twins(id) ON DELETE SET NULL,
  ai_context          JSONB NOT NULL DEFAULT '{}',
  metadata            JSONB NOT NULL DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, decision_number)
);
CREATE INDEX idx_eng_decisions_tenant ON engineering_decisions(tenant_id);
CREATE INDEX idx_eng_decisions_project ON engineering_decisions(project_id);
CREATE INDEX idx_eng_decisions_status ON engineering_decisions(tenant_id, status);
CREATE TRIGGER engineering_decisions_updated_at
  BEFORE UPDATE ON engineering_decisions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Action Register
CREATE TABLE engineering_actions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id        UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  action_number       TEXT NOT NULL,
  title               TEXT NOT NULL,
  description         TEXT,
  status              TEXT NOT NULL DEFAULT 'open',
  priority            TEXT NOT NULL DEFAULT 'medium',
  discipline_id       UUID REFERENCES engineering_disciplines(id) ON DELETE SET NULL,
  project_id          UUID REFERENCES engineering_projects(id) ON DELETE SET NULL,
  asset_id            UUID REFERENCES engineering_assets(id) ON DELETE SET NULL,
  company_id          UUID REFERENCES engineering_companies(id) ON DELETE SET NULL,
  owner_id            UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_by          UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_to         UUID REFERENCES profiles(id) ON DELETE SET NULL,
  originating_object_type TEXT,
  originating_object_id UUID,
  due_date            DATE,
  completion_date     DATE,
  closed_date         DATE,
  workflow_instance_id UUID REFERENCES workflow_instances(id) ON DELETE SET NULL,
  knowledge_node_id   UUID REFERENCES knowledge_nodes(id) ON DELETE SET NULL,
  digital_twin_id     UUID REFERENCES digital_twins(id) ON DELETE SET NULL,
  ai_context          JSONB NOT NULL DEFAULT '{}',
  metadata            JSONB NOT NULL DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, action_number)
);
CREATE INDEX idx_eng_actions_tenant ON engineering_actions(tenant_id);
CREATE INDEX idx_eng_actions_project ON engineering_actions(project_id);
CREATE INDEX idx_eng_actions_status ON engineering_actions(tenant_id, status);
CREATE INDEX idx_eng_actions_due ON engineering_actions(due_date);
CREATE TRIGGER engineering_actions_updated_at
  BEFORE UPDATE ON engineering_actions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Risk Register
CREATE TABLE engineering_risks (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id        UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  risk_number         TEXT NOT NULL,
  title               TEXT NOT NULL,
  description         TEXT,
  category            TEXT,
  status              TEXT NOT NULL DEFAULT 'open',
  priority            TEXT NOT NULL DEFAULT 'medium',
  probability         INTEGER NOT NULL DEFAULT 1 CHECK (probability BETWEEN 1 AND 5),
  consequence         INTEGER NOT NULL DEFAULT 1 CHECK (consequence BETWEEN 1 AND 5),
  score               INTEGER GENERATED ALWAYS AS (probability * consequence) STORED,
  residual_probability INTEGER CHECK (residual_probability BETWEEN 1 AND 5),
  residual_consequence INTEGER CHECK (residual_consequence BETWEEN 1 AND 5),
  residual_score      INTEGER,
  mitigation          TEXT,
  controls            JSONB NOT NULL DEFAULT '[]',
  discipline_id       UUID REFERENCES engineering_disciplines(id) ON DELETE SET NULL,
  project_id          UUID REFERENCES engineering_projects(id) ON DELETE SET NULL,
  asset_id            UUID REFERENCES engineering_assets(id) ON DELETE SET NULL,
  company_id          UUID REFERENCES engineering_companies(id) ON DELETE SET NULL,
  owner_id            UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_by          UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_to         UUID REFERENCES profiles(id) ON DELETE SET NULL,
  due_date            DATE,
  closed_date         DATE,
  workflow_instance_id UUID REFERENCES workflow_instances(id) ON DELETE SET NULL,
  knowledge_node_id   UUID REFERENCES knowledge_nodes(id) ON DELETE SET NULL,
  digital_twin_id     UUID REFERENCES digital_twins(id) ON DELETE SET NULL,
  ai_context          JSONB NOT NULL DEFAULT '{}',
  metadata            JSONB NOT NULL DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, risk_number)
);
CREATE INDEX idx_eng_risks_tenant ON engineering_risks(tenant_id);
CREATE INDEX idx_eng_risks_project ON engineering_risks(project_id);
CREATE INDEX idx_eng_risks_score ON engineering_risks(tenant_id, score DESC);
CREATE TRIGGER engineering_risks_updated_at
  BEFORE UPDATE ON engineering_risks FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Issue Register
CREATE TABLE engineering_issues (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id        UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  issue_number        TEXT NOT NULL,
  title               TEXT NOT NULL,
  description         TEXT,
  issue_type          TEXT,
  category            TEXT,
  status              TEXT NOT NULL DEFAULT 'open',
  priority            TEXT NOT NULL DEFAULT 'medium',
  impact              TEXT,
  investigation       TEXT,
  resolution          TEXT,
  discovered_by       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  discipline_id       UUID REFERENCES engineering_disciplines(id) ON DELETE SET NULL,
  project_id          UUID REFERENCES engineering_projects(id) ON DELETE SET NULL,
  asset_id            UUID REFERENCES engineering_assets(id) ON DELETE SET NULL,
  company_id          UUID REFERENCES engineering_companies(id) ON DELETE SET NULL,
  owner_id            UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_by          UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_to         UUID REFERENCES profiles(id) ON DELETE SET NULL,
  due_date            DATE,
  closed_date         DATE,
  workflow_instance_id UUID REFERENCES workflow_instances(id) ON DELETE SET NULL,
  knowledge_node_id   UUID REFERENCES knowledge_nodes(id) ON DELETE SET NULL,
  digital_twin_id     UUID REFERENCES digital_twins(id) ON DELETE SET NULL,
  ai_context          JSONB NOT NULL DEFAULT '{}',
  metadata            JSONB NOT NULL DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, issue_number)
);
CREATE INDEX idx_eng_issues_tenant ON engineering_issues(tenant_id);
CREATE INDEX idx_eng_issues_project ON engineering_issues(project_id);
CREATE INDEX idx_eng_issues_status ON engineering_issues(tenant_id, status);
CREATE TRIGGER engineering_issues_updated_at
  BEFORE UPDATE ON engineering_issues FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Technical Query Register
CREATE TABLE engineering_technical_queries (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id        UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  tq_number           TEXT NOT NULL,
  title               TEXT NOT NULL,
  question            TEXT NOT NULL,
  description         TEXT,
  status              TEXT NOT NULL DEFAULT 'open',
  priority            TEXT NOT NULL DEFAULT 'medium',
  requester_id        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  responder_id        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  response            TEXT,
  response_due        DATE,
  document_id         UUID REFERENCES engineering_documents(id) ON DELETE SET NULL,
  discipline_id       UUID REFERENCES engineering_disciplines(id) ON DELETE SET NULL,
  project_id          UUID REFERENCES engineering_projects(id) ON DELETE SET NULL,
  asset_id            UUID REFERENCES engineering_assets(id) ON DELETE SET NULL,
  company_id          UUID REFERENCES engineering_companies(id) ON DELETE SET NULL,
  owner_id            UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_by          UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_to         UUID REFERENCES profiles(id) ON DELETE SET NULL,
  due_date            DATE,
  closed_date         DATE,
  workflow_instance_id UUID REFERENCES workflow_instances(id) ON DELETE SET NULL,
  knowledge_node_id   UUID REFERENCES knowledge_nodes(id) ON DELETE SET NULL,
  digital_twin_id     UUID REFERENCES digital_twins(id) ON DELETE SET NULL,
  ai_context          JSONB NOT NULL DEFAULT '{}',
  metadata            JSONB NOT NULL DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, tq_number)
);
CREATE INDEX idx_eng_tq_tenant ON engineering_technical_queries(tenant_id);
CREATE INDEX idx_eng_tq_project ON engineering_technical_queries(project_id);
CREATE INDEX idx_eng_tq_status ON engineering_technical_queries(tenant_id, status);
CREATE TRIGGER engineering_technical_queries_updated_at
  BEFORE UPDATE ON engineering_technical_queries FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Lessons Learned Register
CREATE TABLE engineering_lessons (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id        UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  lesson_number       TEXT NOT NULL,
  title               TEXT NOT NULL,
  description         TEXT,
  lesson              TEXT NOT NULL,
  recommendation      TEXT,
  root_cause          TEXT,
  category            TEXT,
  status              TEXT NOT NULL DEFAULT 'draft',
  priority            TEXT NOT NULL DEFAULT 'medium',
  lesson_references   JSONB NOT NULL DEFAULT '[]',
  discipline_id       UUID REFERENCES engineering_disciplines(id) ON DELETE SET NULL,
  project_id          UUID REFERENCES engineering_projects(id) ON DELETE SET NULL,
  asset_id            UUID REFERENCES engineering_assets(id) ON DELETE SET NULL,
  company_id          UUID REFERENCES engineering_companies(id) ON DELETE SET NULL,
  owner_id            UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_by          UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_to         UUID REFERENCES profiles(id) ON DELETE SET NULL,
  due_date            DATE,
  closed_date         DATE,
  workflow_instance_id UUID REFERENCES workflow_instances(id) ON DELETE SET NULL,
  knowledge_node_id   UUID REFERENCES knowledge_nodes(id) ON DELETE SET NULL,
  digital_twin_id     UUID REFERENCES digital_twins(id) ON DELETE SET NULL,
  ai_context          JSONB NOT NULL DEFAULT '{}',
  metadata            JSONB NOT NULL DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, lesson_number)
);
CREATE INDEX idx_eng_lessons_tenant ON engineering_lessons(tenant_id);
CREATE INDEX idx_eng_lessons_project ON engineering_lessons(project_id);
CREATE INDEX idx_eng_lessons_category ON engineering_lessons(tenant_id, category);
CREATE TRIGGER engineering_lessons_updated_at
  BEFORE UPDATE ON engineering_lessons FOR EACH ROW EXECUTE FUNCTION update_updated_at();
