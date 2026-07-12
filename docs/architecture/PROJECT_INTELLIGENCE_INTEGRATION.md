# Project Intelligence Integration Architecture

**Phase:** 6B — Integration Foundation  
**Route:** `/engineering/apps/project-intelligence`  
**Package:** `@rtb/project-intelligence`  
**Certification:** `@rtb/project-intelligence-certification`

---

## Integration model

Project Intelligence is modernized and integrated into the AI Platform monorepo — **not rebuilt**.

```
Platform shell (Engineering OS)
  → Commerce entitlement (install, licence, seat, workspace)
    → Project Intelligence package (domain + adapters)
      → Engineering Core read adapters (authoritative registers)
      → Legacy PI source adapter (read-only migration source)
      → AI Director compatibility adapter (governed)
```

---

## Packages and surfaces

| Surface | Location |
|---------|----------|
| Domain / adapters | `packages/project-intelligence` |
| Certification | `packages/project-intelligence-certification` |
| UI shell | `apps/web/.../engineering/apps/project-intelligence` |
| APIs | `apps/web/.../api/engineering/project-intelligence` |
| Mapping schema | `supabase/migrations/20260712000000_batch_34_project_intelligence_mappings.sql` |

---

## Navigation (Phase 6B)

- Overview  
- Migration  
- Health  
- Settings  

Additional capability routes appear only when capabilities are deliberately ported.

---

## Related docs

- `PROJECT_INTELLIGENCE_INTEGRATION_DECISIONS.md`
- `PROJECT_INTELLIGENCE_DATA_OWNERSHIP.md`
- `PROJECT_INTELLIGENCE_SECURITY.md`
- `PROJECT_INTELLIGENCE_AI_ADAPTER.md`
- `../migration/PROJECT_INTELLIGENCE_SOURCE_FREEZE.md`
- `../migration/PROJECT_INTELLIGENCE_MAPPING.md`
- `../testing/PROJECT_INTELLIGENCE_PHASE_6B_CERTIFICATION.md`
