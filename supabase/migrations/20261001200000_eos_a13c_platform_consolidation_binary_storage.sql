-- EOS-A13C: additive generated-artifact storage metadata and connector consolidation comments.
-- Does not drop content_base64. Does not rewrite certified connector tables.
-- OBJECT_STORAGE_BACKEND = CONTRACT_ONLY. PUBLIC_BUCKET_REQUIRED = NO.
-- A13C_BINARY_DUPLICATION = NO. NEW_CONTENT_BASE64_USAGE = NO.

ALTER TABLE engineering_generated_artifacts
  ADD COLUMN IF NOT EXISTS storage_kind TEXT NOT NULL DEFAULT 'LEGACY_RELATIONAL';

ALTER TABLE engineering_generated_artifacts
  ADD COLUMN IF NOT EXISTS object_key TEXT;

ALTER TABLE engineering_generated_artifacts
  ADD COLUMN IF NOT EXISTS content_size_bytes INTEGER;

ALTER TABLE engineering_generated_artifacts
  ADD COLUMN IF NOT EXISTS content_sha256 TEXT;

ALTER TABLE engineering_generated_artifacts
  ADD COLUMN IF NOT EXISTS content_type TEXT;

ALTER TABLE engineering_generated_artifacts
  ADD COLUMN IF NOT EXISTS storage_version INTEGER NOT NULL DEFAULT 1;

ALTER TABLE engineering_generated_artifacts
  ADD COLUMN IF NOT EXISTS migration_state TEXT NOT NULL DEFAULT 'NOT_STARTED';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'engineering_generated_artifacts_storage_kind_check'
  ) THEN
    ALTER TABLE engineering_generated_artifacts
      ADD CONSTRAINT engineering_generated_artifacts_storage_kind_check
      CHECK (storage_kind IN ('LEGACY_RELATIONAL', 'OBJECT_STORAGE', 'EXTERNAL_MANAGED'));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'engineering_generated_artifacts_migration_state_check'
  ) THEN
    ALTER TABLE engineering_generated_artifacts
      ADD CONSTRAINT engineering_generated_artifacts_migration_state_check
      CHECK (migration_state IN ('NOT_STARTED', 'IN_PROGRESS', 'VERIFIED', 'FAILED', 'ROLLED_BACK'));
  END IF;
END $$;

COMMENT ON COLUMN engineering_generated_artifacts.content_base64 IS
  'EOS-A13C LEGACY_RELATIONAL compatibility. Do not drop. Generated-artifact OBJECT_STORAGE_BACKEND remains CONTRACT_ONLY.';

COMMENT ON COLUMN engineering_generated_artifacts.storage_kind IS
  'Explicit storage kind. Never infer from a null content_base64 value.';

COMMENT ON COLUMN engineering_generated_artifacts.object_key IS
  'Server-authoritative object key. Not a user-controlled filename.';

COMMENT ON COLUMN engineering_generated_artifacts.migration_state IS
  'Controlled binary migration checkpoint. Failed migration must not switch the storage pointer.';

COMMENT ON TABLE engineering_external_connections IS
  'EOS-A13B/A13C generic external engineering connection. Stores Secrets service reference only. Default write policy READ_ONLY. Certification is not operational health.';

-- No public storage bucket. No content_base64 drop. No connector v2 tables.
