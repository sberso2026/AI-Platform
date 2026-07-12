# Project Intelligence Integration Runbook (Phase 6B)

---

## Preconditions

1. Phase 5 certified: `customer-admin-rc-1` = `f781fa0…`  
2. Standalone freeze tag: `project-intelligence-integration-baseline-1` = `ab1f442…`  
3. Hosted staging secrets available; production certification disabled  

---

## Deploy mapping schema

Apply migration `20260712000000_batch_34_project_intelligence_mappings.sql` to hosted staging only through approved migration process.

Verify:

- Table + audit exist  
- RLS enabled  
- Unique active mapping indexes  
- Immutable `migration_source` after approval  

---

## Enable application access

1. Ensure Engineering OS product install active  
2. Ensure `project_intelligence` commercial application installation active  
3. Assign workspace + seat + role  
4. Open `/engineering/apps/project-intelligence`  

Ready marker: `data-testid="project-intelligence-ready"`

---

## Mapping review

1. Open Migration tab  
2. Review candidates (confidence, method, conflicts)  
3. Approve only high-confidence mappings after human review  
4. Confirm **no** register data migrated  

---

## Health

Open Health tab; statuses: `healthy` | `warning` | `degraded` | `failed` | `suspended`.

Do not expose secrets, SQL, or stack traces.

---

## Certification

```bash
pnpm project-intelligence:certify
```

Or dispatch workflow `Project Intelligence Phase 6B Certification`.

---

## Incidents

| Symptom | Action |
|---------|--------|
| Entitlement denied | Check install, licence, seat, workspace |
| Mapping conflict | Mark conflict; do not auto-merge |
| Legacy source unavailable | Expected if export offline; health = warning/degraded |
| Unexpected 5xx | Fail certification; inspect correlation ID |

---

## Explicit non-actions (Phase 6B)

- Do not retire standalone PI  
- Do not delete legacy tables  
- Do not dual-write production registers  
- Do not retag `customer-admin-rc-1`  
