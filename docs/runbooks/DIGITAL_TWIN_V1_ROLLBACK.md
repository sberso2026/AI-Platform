# Digital Twin V1.0 — Rollback

## Principles

Release tag `digital-twin-v1.0.0` is immutable, never move it. Prefer module pin rollback over schema rollback.

## Schema rollback

Do not rewrite batches 75–85. No batch_86 exists to reverse.

## Module pin rollback

Pin consumers back to previous version `0.11.0-digital-thread` only if GA pin must be withdrawn before tag creation; after tag creation, ship a new certified patch line instead of moving the tag.
