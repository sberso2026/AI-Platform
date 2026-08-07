# Inspection Intelligence V1 — Commercial Packaging

## Products
| Offering | Entitlements | Notes |
|----------|--------------|-------|
| Inspection Intelligence Core | read/write/review/approve/report/admin | Module seat + workspace required |
| Optional Inspection Packs | pack entitlement + core | e.g. `structural_condition@1.0.0` |
| Optional premium capabilities | future-gated | AI Vision advisory remains entitlement-bound |

## Surfaces covered
All `/engineering/apps/inspection-intelligence/*` routes including field, sync, condition, predictive, vision, release, and ops/GA status.

## Rules
- Reuse Platform Commerce only — no new commerce lifecycle or billing provider in this phase.
- Seat, workspace, licence, pack, and AI Vision entitlements are server-authoritative at commit time.
- Stale offline entitlement snapshots cannot override revocation.
