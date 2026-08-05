# Cortex AI — Multi-OS Runtime

**Phase:** 7A

## Shared once per tenant

| Concern | Rule |
|---------|------|
| Identity | Single identity domain |
| Tenant | Single tenant boundary |
| Workspaces | Single workspace model |
| Audit | Single audit system |
| Notifications | Single notification system |
| AI governance | Single AI Director / policy / cost layer |
| Workflow / events / jobs | Shared Platform Kernel |
| Billing / licensing | Shared Platform Commerce |
| Knowledge / memory infrastructure | Shared Platform facilities; OS content namespaced |

## Independent per OS

| Concern | Rule |
|---------|------|
| Licence / seat pools | Per OS product |
| Installation lifecycle | Per OS installation row |
| Navigation / routes | Registered only when OS installation is `active` |
| Domain events | Namespaced by OS / application |
| Domain knowledge content | Owned by OS; referenced by ID |

## Lifecycle (commerce-aligned)

Reuse certified commerce installation states. Catalog-facing view:

`available` → `installing` → `active` → `suspended` | `upgrade_pending` | `rollback_pending` | `uninstall_pending` → `uninstalled` | `failed`

Do **not** invent a competing lifecycle machine.

## Isolation proofs (certification)

- Two OS installations may coexist (`engineering` + cert-only `reference-os`).
- Suspend / uninstall one OS must not affect the other or Platform Core.
- No cross-OS access without entitlement.
- No duplicated Platform Core services per OS.
