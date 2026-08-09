# Engineering OS Phase 14A — Existing System Inventory

Status: Phase 14A discovery · Version `0.9.0-ga-readiness`

## Package inventory (evidence)

| Package | Version | Certification package | Notes |
| --- | --- | --- | --- |
| `@rtb/engineering-os` | `0.9.0-ga-readiness` | `@rtb/engineering-os-certification` | Shell, SDKs, registry, shared services |
| `@rtb/project-intelligence` | `1.0.0` | yes | Tag `project-intelligence-v1.0.0` → `34975b1…` |
| `@rtb/inspection-intelligence` | `1.0.0` | yes | Tag `inspection-intelligence-v1.0.0` → `d47c4ff…` |
| `@rtb/asset-intelligence` | `1.0.0` | yes | Tag `asset-intelligence-v1.0.0` → `925e2ed…` |
| `@rtb/project-controls` | `1.0.0` | yes | Tag `project-controls-v1.0.0` → `b17fe4c…` |
| `@rtb/digital-twin` | `1.0.0` | yes | Tag `digital-twin-v1.0.0` → `a94425ed…` |
| `@rtb/engineering-model-interoperability` | `1.0.0` | yes | Tag `engineering-model-interoperability-v1.0.0` → `4e55f32…` |
| `@rtb/engineering-execution-host` | `0.1.0-execution-host` | yes | Controlled execution host (13D.1) |
| `@rtb/engineering-shared-project-domain` | `0.1.0-shared-project-domain` | — | Prerelease shared project refs |
| `@rtb/engineering-shared-spatial-domain` | `0.2.0-spatial-core` | yes | Spatial core; not domain GA |
| `@rtb/platform-intelligence` | `0.1.75` | — | Tool framework / AI / search host |

Shared Asset Domain runtime remains historically under Engineering Core /
`engineering_os_shared_domain` tables (see ownership normalization).

## Engineering OS package surface

- Module registry: `packages/engineering-os/src/module-registry.ts`
- Manifest: `packages/engineering-os/src/manifest.ts`
- Module / Domain / Workflow / Mobile SDKs under `packages/engineering-os/src/*-sdk`
- AI framework bridge: `packages/engineering-os/src/ai-framework.ts`
- Health: `packages/engineering-os/src/services/health-service.ts`
- Commerce guard: `packages/engineering-os/src/commerce/service-guard.ts`

## Module registry vs certified modules (mismatch)

Registry currently seeds: PI (registered), II (registered), PC (`coming_soon`), DT (`coming_soon`).

**Missing from OS registry seed:** Asset Intelligence, Engineering Model Interoperability,
Controlled Execution Host (infra).

## Web routes (`apps/web/.../engineering`)

OS shell: `/engineering`, `/modules`, `/projects`, `/assets`, `/documents`, `/search`,
`/ai`, `/reports`, `/settings`, `/health`, registers (risks/issues/actions/…).

Module apps present: `project-intelligence`, `inspection-intelligence`,
`asset-intelligence`, `project-controls`, `digital-twin`, `model-interoperability`,
`execution-hosts`, `shared-spatial-domain`.

## Commerce / entitlements

Reuse Platform Commerce. Module commerce keys include `project_intelligence`,
`inspection_intelligence`, `project_controls`, `digital_twin`, plus module-specific
capability families (e.g. interoperability entitlements). Engineering OS base key:
`engineering_os` / product install via Platform installation lifecycle.

## Search / AI / events / health

- Search: Engineering Search shell + module searchProviders in registry
- AI: Engineering AI Workspace + PI Reasoning Assistant → Platform AI Runtime
- Events: `engineering.*` plus module-owned namespaces
- Health: EngineeringHealthService + module release/health pages

## Migrations (lineage excerpt)

batch_49–50 II; batch_51–59 AI; batch_61 shared project; batch_62–73 PC;
batch_75–84 DT; batch_85 spatial; batch_86–89 interoperability / execution host.
No Phase 14A migration.

## Post-GA governance artifacts (tracked)

- `docs/architecture/CLIENT_OWNED_COMMERCIAL_SOLVER_EXECUTION_ARCHITECTURE.md`
- `docs/architecture/adr/ADR_CLIENT_OWNED_COMMERCIAL_SOLVER_EXECUTION.md`
- `packages/engineering-model-interoperability/tests/client-owned-commercial-solver-architecture.test.ts`

## Draft EngineeringOSManifest (not frozen)

Fields (draft only — **not** `1.0.0`):

`engineeringOsVersion`, `installedModules`, `moduleVersions`, `moduleContractVersions`,
`moduleHealth`, `moduleEntitlements`, `sharedDomainVersions`, `sdkVersions`,
`capabilities`, `unavailableCapabilities`.
