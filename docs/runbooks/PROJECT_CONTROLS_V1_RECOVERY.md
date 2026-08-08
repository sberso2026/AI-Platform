# Project Controls V1.0 — Recovery

## Recovery objectives

- RPO: follow platform Supabase backup schedule
- RTO: restore read path first, then assess/write path

## Restore procedure

1. Restore Supabase backup to an isolated instance
2. Verify migration lineage batches **61–73** present
3. Verify RLS policies on representative tables (`project_controls_progress_assessments`, `project_controls_organizational_learning_states`)
4. Run certification `certify:phase11n` **non-destructively** against restored instance
5. Confirm `projectControlsBackupRestoreCertified === true` in artifact

## Verification checklist

- [ ] All 13 migration batches readable
- [ ] No batch_74 created
- [ ] Version **1.0.0** / status **ga** in health endpoint
- [ ] Twelve contributors active in profile API
