# Project Intelligence — Meeting Stub Dependency Analysis

**Phase:** 6C-3A Discovery Lock  
**Rule:** Do **not** delete or disable the `meeting_intelligence` stub until dependencies are proven and product signs off.

## Executive verdict

| Question | Answer |
|----------|--------|
| Is `meeting_intelligence` enabled anywhere? | **No** (`enabled: false` / seed `FALSE`) |
| Customer installation rows on `meeting_intelligence`? | **None found** |
| Safe to leave stub registered? | **Yes** |
| Safe to delete stub casually? | **No** — update tests/docs/catalog; commerce `meetings` must remain untouched |
| Safe to delete commerce `meetings`? | **No** — plan entitlements, guards, cert fixtures, usage metric |
| Does live PI Meetings require the stub? | **No** — PI uses `project_intelligence` + feature `meetings` |

## Three namespaces (do not conflate)

| Namespace | Key / route | Role |
|-----------|-------------|------|
| Engineering OS registry stub | `meeting_intelligence` | Disabled catalog stub; route `/engineering/apps/meeting-intelligence` (**no page**) |
| Commerce application entitlement | `meetings` | Plan entitlement + path guard for `/engineering/meetings` (**no page**) |
| PI feature (approved 6C-3A) | `meetings` under application `project_intelligence` | Live product path under `/engineering/apps/project-intelligence/meetings…` (implemented in later 6C-3 batches; still must not use the stub) |

Runtime sync matches `application_key` → `app_key` exactly. Commerce `meetings` does **not** enable registry `meeting_intelligence`. PI access helpers **reject** `meeting_intelligence` and `project-intelligence-meetings` as entitlement application keys.

## Dependency inventory

### Registry / manifest

| Location | Finding |
|----------|---------|
| `packages/engineering-os/src/manifest.ts` | Stub `enabled: false`, version `0.0.0` |
| `supabase/migrations/20260203000002_batch_20_engineering_seed.sql` | Registry insert `FALSE` |
| `packages/platform-core/src/commerce/commerce-adapter.ts` | Listed in `AVAILABLE_ENGINEERING_APP_KEYS` (catalog “Available”) |
| `packages/engineering-os/src/engineering-os.test.ts` | Expects 8 registered apps (includes stub) |
| Docs | `ENGINEERING_OS_APPLICATION_RUNTIME.md`, ownership/current-state matrices |

### Commerce `meetings` (separate)

| Location | Finding |
|----------|---------|
| `packages/platform-commerce/.../commerce-access-policy.ts` | `/engineering/meetings` → `applicationKey: "meetings"` |
| `apps/web/src/lib/commerce/guards.ts` | Path prefix map |
| `supabase/migrations/20260209000002_batch_31_commerce_backfill.sql` | Product application + plan entitlement + legacy licenses |
| `supabase/migrations/20260208000002_batch_30_commerce_seed.sql` | Usage metric_key `meetings` |
| `packages/commerce-certification/scripts/provision-fixtures.ts` | Negative fixtures use `application_key: "meetings"` |

### Absent (stub-specific)

- No Next.js pages for `/engineering/apps/meeting-intelligence` or `/engineering/meetings`
- No `engineering_application_installations` / commercial installs keyed `meeting_intelligence`
- No feature flag enabling the stub
- No nav entry for the stub route

### Present elsewhere (not the stub)

- Project Intelligence Meetings UI/APIs under `/engineering/apps/project-intelligence/meetings…`
- Entitlement/actions keyed `project_intelligence` / `project-intelligence-meetings.*`
- Cert regressions that **forbid** treating `meeting_intelligence` as the Meetings entitlement app

## Collision risks

1. **Catalog shows Meeting Intelligence** while entitlements use **`meetings`** — confusing for operators.
2. **PI feature key `meetings`** may collide with commerce application_key `meetings` if both mean different things without an alias map.
3. Deleting the stub does **not** remove commerce `meetings`; deleting commerce `meetings` **does** break cert fixtures and possibly tenant licenses from batch 31.

## Recommendation (binding for 6C-3A)

1. **Leave** `meeting_intelligence` stub registered and disabled.
2. Implement Meetings as PI feature under `project_intelligence` (routes under `/engineering/apps/project-intelligence/meetings/...`).
3. Before enabling UX, publish an entitlement reconciliation note (Integration Decisions D2).
4. Retire stub only after: PI meetings GA, catalog copy updated, engineering-os test count updated, and product approval.

## What would break if stub deleted today

| Impact | Severity |
|--------|----------|
| Engineering OS “8 apps” unit expectation | Low (update test) |
| Product detail “Available” Meeting Intelligence card | Low (intentional) |
| Docs referencing stub | Docs only |
| Commerce entitlements / usage / cert fixtures | **Unaffected** if `meetings` kept |
| Live PI Meetings product | None (product does not use stub; keep stub until GA retirement checklist) |
