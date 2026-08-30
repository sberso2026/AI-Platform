# Project Intelligence — Release Identity

Policy: `docs/architecture/adr/ADR_APPLICATION_RELEASE_IDENTITY.md`

## Historical V1 certification contract (immutable)

| Field | Value |
|---|---|
| Classification | Actual prior Product GA (Phase 8I) |
| Version | `1.0.0` |
| Tag | `project-intelligence-v1.0.0` |
| Certified commit | `34975b1cf660580d46287f24e746b8915903f768` |
| Public contracts | V1 feature contracts remain `1.0.0` |

Do not move, delete, or redefine this tag. Phase 8I / 8I.1 continue to prove
this contract. Downstream OS/product certifications that consume PI V1 continue
to pin this tag and commit.

V1 certified capabilities: document, meeting, findings, reporting, knowledge,
engineering reasoning assistant (see
`docs/release/PROJECT_INTELLIGENCE_V1_CAPABILITY_INVENTORY.md`).

## Current application release (declared; git tag not created here)

| Field | Value |
|---|---|
| Version | `1.1.0` |
| Declared tag | `project-intelligence-v1.1.0` |
| Semver level | **MINOR** |
| Product line | Same application (`project_intelligence` / `project-intelligence`) |

### Classification evidence (HEAD vs V1)

Modern PI (certified SHA `0787cb620c52b265d031b0dabd43432adbc32fbc` and later
identity-policy commits on the same line) adds Command Centre, project health,
schedule / cost / progress / risk / query / forecast intelligence, AI Project
Analyst, reporting snapshots, and connector context. Catalog/commerce remains
Engineering OS application entitlement (no standalone PI licensing).

| Alternative | Why it does not apply |
|---|---|
| PATCH `1.0.1` | Not defect-only repair. Additive product capabilities. PI V1 rollback reserved `1.0.x` for repairs. |
| MAJOR `2.0.0` | No breaking public-contract change. Schema unchanged. V1 capabilities remain. Same application key. |
| Second-generation product line | Same slug and `applicationKey`. Not a new product. |

**MINOR** matches ADR §4: backward-compatible additive capabilities; prior GA
public contracts remain compatible.

## Dual identity in code

```
historicalCertification:
  version: 1.0.0
  tag: project-intelligence-v1.0.0
  certifiedCommit: 34975b1cf660580d46287f24e746b8915903f768
currentRelease:
  version: 1.1.0
  tag: project-intelligence-v1.1.0
```

Engineering OS `publicContractVersion` for `project_intelligence` remains
`1.0.0`. Module / package / `PROJECT_INTELLIGENCE_VERSION` are `1.1.0`.

## GA limitations (not promotion blockers)

| Class | Items |
|---|---|
| POST_GA_CAPABILITY | Durable historical report snapshots; PDF export |
| PREVIEW_SEPARATE_CERTIFICATION | Live connector execution (`PI_8_LIVE_CONNECTOR_EXECUTION=false`) |
| GA_LIMITATION | Shared authenticated route/client wall latency (Command Centre) |
| CLOSED | Catalog/plan mismatch (`catalogCommerceReconciled=true`, `planMismatchResolved=true`) |

## Promotion

GA tag `project-intelligence-v1.1.0` is an annotated Production GA tag created in a
separate promotion operation on a commit that already declares version `1.1.0`.
Do not move `project-intelligence-v1.0.0`.
