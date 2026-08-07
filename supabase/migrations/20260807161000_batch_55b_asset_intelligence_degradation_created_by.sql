-- Phase 10F.1 — additive fix: degradation states created_by (matches postgres repository)

ALTER TABLE asset_intelligence_degradation_states
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES profiles(id) ON DELETE SET NULL;

COMMENT ON COLUMN asset_intelligence_degradation_states.created_by IS
  'Optional assessor profile; additive fix after batch_55.';
