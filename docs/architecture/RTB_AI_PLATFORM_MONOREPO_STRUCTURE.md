# RTB AI Platform — Monorepo Structure Lock

**Root:** `C:\Users\sbers\OneDrive\Documents\RTB Eng\01_Apps\AI Platform`  
**Phase:** 9A (updated from 8I.1)

## Intended hierarchy

```
apps/web                          → Application host (routes, layouts, API adapters)
packages/platform-*               → Reusable Platform services
packages/platform-core            → Platform Core
packages/platform-kernel          → Platform Kernel
packages/platform-commerce        → Commerce / entitlement
packages/platform-intelligence    → Platform AI / intelligence services
packages/engineering-os           → Engineering OS shell, shared domain, module contracts
packages/project-intelligence     → Project Intelligence module + features (v1.0.0 frozen)
packages/project-intelligence-certification → PI certification only
packages/inspection-intelligence  → Inspection Intelligence module (0.1.0-discovery)
packages/inspection-intelligence-certification → II certification only
packages/reference-os             → Certification-only reference OS
packages/types | database | ui | plugin-sdk → Shared libraries
packages/*-certification          → Certification harnesses
```

## Layer rules

| Layer | May depend on |
|-------|----------------|
| apps/web | Engineering OS, modules, Platform packages, shared libs |
| Engineering OS modules | engineering-os, platform-*, database, types, ui, plugin-sdk |
| Engineering OS | platform-*, database, types |
| Platform packages | other platform/shared libs — **not** modules |
| Certification | production packages + reference-os as needed |

Inspection Intelligence is an Engineering OS module in this monorepo — not a separate repository or app host.
