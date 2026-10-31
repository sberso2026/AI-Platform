# Just-In-Time Object Generation

Pattern may expect an object; EOS does not create it until needed.
Material creation is opt-in `Create Draft` (DRAFT/PROPOSED shell only).
Provenance: trigger, Pattern, stage, actor, time, status, Work Package.
Idempotent; duplicate prevention against equivalent existing objects.
No future-stage pregeneration. Placeholders are removable without affecting history.
