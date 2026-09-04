# EOS-COMMERCE-APP-1R live certification

Target tenant: RTB Engineering Pilot LAUNCH-1 (`eos-pilot-launch1-admin-1788193387962`).
Founder reconcile: `licence.issued` with `source: "pilot_reconcile"` at 2026-09-04T14:46Z for `asset_intelligence`, `digital_twin`, and `engineering_model_interoperability`.

## Canonical Commerce state

| applicationKey | Catalog | Enterprise plan entitlement | Application licence | Application installation | Route guard |
|---|---|---|---|---|---|
| `asset_intelligence` | yes | no (unchanged) | 1 active | none | allow via application licence + Engineering OS product installation |
| `digital_twin` | yes | no (unchanged) | 1 active | none | allow via application licence + Engineering OS product installation |
| `engineering_model_interoperability` | yes | no (unchanged) | 1 active | none | allow via application licence + Engineering OS product installation |

Enterprise plan application keys remain: documents, inspection_intelligence, knowledge, meetings, project_controls, project_intelligence.

## Live defect (proven, then patched)

`ApplicationInstallationRepository.create` inserted `requested_at`. Hosted `commercial_application_installations` has no such column, so every application install during reconcile failed and left zero installation rows. Licences and audit events were written.

Patch: stop writing `requested_at` on application-installation create. Founder must run **Reconcile pilot applications** once more on the new Preview so installations can persist. Licences will skip (already active).

## Idempotency

Each target key has exactly one active application licence on the pilot tenant. Reconcile skips existing active licences. Application install unique key is `(tenant_id, product_id, application_key)`.

## Audit

`COMMERCE_RECONCILE_AUDIT_EVENT_COUNT=3` for this founder run’s three target application licences.
