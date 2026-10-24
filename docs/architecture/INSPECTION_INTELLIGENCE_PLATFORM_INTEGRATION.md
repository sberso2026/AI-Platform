# Inspection Intelligence — Platform Integration

**Phase:** 9A · Mandatory reuse · Private stacks forbidden

## Mandatory reuse

| Capability | Source |
|------------|--------|
| AI Runtime | `packages/platform-intelligence` |
| Workflow Engine | Platform workflow services |
| Knowledge Graph | Platform Knowledge Intelligence |
| Notifications | Platform notifications |
| Audit | Platform audit |
| Files | Platform files |
| Commerce / Entitlements | `packages/platform-commerce` |
| Shared domain | `packages/engineering-os` |
| Shared engineering services | Engineering OS shared services |
| Application host | `apps/web` |

## Forbidden

- Private AI Runtime
- Private Knowledge Graph / embedding store / search engine
- Private Identity
- Private Commerce / entitlement engine
- Private Workspace model
- Private Asset Registry
- Separate repository or standalone application / independent deployment

## Dependency direction

```
apps/web
  → engineering-os
  → inspection-intelligence
  → platform-* / types / database / ui / plugin-sdk
```

Disallowed reverse edges: `platform-core|kernel|intelligence → inspection-intelligence` as module business logic owners; `project-intelligence → inspection-intelligence` in 9A; production → certification packages.
