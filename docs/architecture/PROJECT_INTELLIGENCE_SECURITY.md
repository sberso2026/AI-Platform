# Project Intelligence Security (Phase 6B)

---

## Enforcement chain

Tenant → Workspace → User → Subscription → Licence → Engineering OS installation → Project Intelligence installation → Seat → Role → Permission → Feature

Server helpers:

- `requireProjectIntelligenceAccess()`
- `requireProjectIntelligenceAdmin()`
- `requireProjectIntelligenceMigrationAccess()`

UI hiding never replaces API enforcement.

---

## Mapping RLS

Table `project_intelligence_project_mappings` and audit table enable RLS.

Required JWT proofs:

- unauthenticated denied  
- viewer read restrictions  
- engineer assigned-workspace access  
- manager / tenant admin / owner policies  
- cross-tenant denied  
- cross-workspace denied  
- inactive PI installation denied  
- suspended licence denied  
- removed seat denied  
- removed workspace assignment denied  
- direct ID injection denied  
- migration-source access restricted  
- service-role actions audited  

SECURITY DEFINER functions use fixed `search_path` (`public, pg_temp`).

---

## Error contract

```json
{
  "error": {
    "code": "machine_readable_code",
    "message": "Safe user-facing message",
    "requestId": "correlation-id",
    "details": {}
  }
}
```

Statuses: 200/201, 400, 401, 403, 404, 409, 422, 500 (any unexpected 5xx fails certification).

---

## Secrets

- No secrets in client bundles  
- Legacy migration credentials server-only  
- No service-role exposure to browser  
