# Customer Administration — Fixture Isolation Roadmap

This document describes the current Playwright certification fixture coupling and the plan to enable safe parallel execution without rewriting all fixtures in Phase 5.

## Current state

- **Playwright workers:** `1` (required today)
- **Reason:** Flows A–P and Flow N share tenant, subscription, installation, and seat fixtures provisioned serially via `scripts/provision-fixtures.ts`.
- **Certification order:** Flow N (uninstall) runs before flows A–P to avoid cross-flow state pollution on shared installations.

## Shared fixture surfaces

| Fixture area | Shared by | Risk |
|--------------|-----------|------|
| Primary tenant (`CERT_TENANT_*`) | HTTP live cert, Flow N, flows A–P | Uninstall mutates installation graph |
| Growth-credit tenant | Gate C only | Isolated by dedicated provision block |
| Seat assignment pool | HTTP seat tests, Flow I | Concurrent assign/remove races |
| Installation upgrade target | Flows J–L | Version state depends on prior upgrade |
| Dependent-app installation | Flow N 422 scenario | Must remain active while primary is tested |

## Target design

1. **Per-flow fixture namespaces** — Each Playwright flow receives a dedicated seed prefix, e.g. `cert-flow-a`, `cert-flow-n`, instead of reusing `cert-primary`.
2. **Immutable baseline installations** — Flows that only read UI state get a read-only installation created once per namespace; mutating flows clone from a template row.
3. **HTTP certification isolation** — Live HTTP gates use fixture IDs from `artifacts/fixtures-manifest.json` scoped by gate ID, not global primary IDs.
4. **Provision/teardown API** — Extend provision script with `--flow=<id>` and `--teardown` for targeted cleanup without wiping unrelated flows.

## Proposed seed naming scheme

```
cert-{gate}-{scenario}-{shortUuid}
```

Examples:

- `cert-flow-n-happy-a1b2c3d4`
- `cert-flow-n-deps-e5f6g7h8`
- `cert-http-seats-i9j0k1l2`
- `cert-growth-credit-m3n4o5p6`

Manifest entries:

```json
{
  "flowId": "flow-n-happy",
  "tenantSlug": "cert-flow-n-happy-a1b2c3d4",
  "installationId": "...",
  "createdAt": "ISO-8601",
  "mutable": true
}
```

## Migration-safe cleanup pattern

1. Provision creates rows tagged with `metadata.cert_fixture = true` and `metadata.cert_flow_id`.
2. Teardown deletes only rows matching the active flow prefix.
3. Never delete tenants referenced by another flow's manifest entry.
4. Scheduled janitor (future): remove fixtures older than 24h with `cert_fixture = true`.

## Risks of parallel execution

- **Cross-flow uninstall** — One worker uninstalling a shared installation breaks downstream UI flows.
- **Seat pool exhaustion** — Parallel assign tests may hit unique constraints on the same licence row.
- **Hosted rate limits** — Supabase auth and REST throughput under N workers.
- **Cert server singleton** — Single Next.js cert server port; parallel HTTP + Playwright is OK, parallel cert servers are not.
- **False greens** — Tests passing due to leaked state from another worker mask regressions.

## Plan to enable parallel workers

| Phase | Action | Outcome |
|-------|--------|---------|
| 1 | Document manifest schema (this doc) | Shared understanding |
| 2 | Add per-flow provision flags | Flows can seed independently |
| 3 | Refactor Flow N to own tenant | Remove uninstall coupling |
| 4 | Refactor seat/upgrade flows | Dedicated installations per flow |
| 5 | Split Playwright projects by flow group | `workers: 2` for read-only groups |
| 6 | Full parallel with flow-scoped teardown | `workers: 4+` on hosted staging |

## Exit criteria for `workers > 1`

- No two concurrent tests reference the same `installationId` unless explicitly testing concurrency.
- Manifest validates unique `flowId` before cert run.
- Teardown is idempotent and flow-scoped.
- Phase 5 regression suite passes with `workers: 2` on hosted staging for seven consecutive runs.

## References

- Provision script: `packages/customer-administration-certification/scripts/provision-fixtures.ts`
- Playwright config: `packages/customer-administration-certification/playwright.config.ts`
- Phase 4 artifact: `packages/customer-administration-certification/artifacts/phase-4-certification.json`
