# Security evidence

| Control | Evidence |
|---|---|
| Tenant isolation | Index RPCs and chunk queries filter `tenant_id`. Unit tests return zero hits for another tenant. |
| Workspace isolation | Same for `workspace_id`. Storage paths must be `{tenant}/{workspace}/…`. File GET rejects unscoped keys. |
| Project isolation | Project scope passes `engineering_project_id` into the index filter. |
| Document isolation | Document scope sets `engineeringDocumentIds` to the selected id after a core-row check. Live AS/NZS question on the conveyor id did not cite 4291.2. |
| RBAC | Documents commerce policy on upload/get/ingest; Ask `ai.execute`; re-index owner/admin/operator. |
| Signed-file access | Signed PUT upload; signed GET download. Live conveyor signed URL HTTP 200, `application/pdf`, 617088 bytes. |
| No service-role in browser | Service client stays on server routes / worker. |
| No cross-tenant embeddings | Embedding/chunk rows include tenant/workspace; vector RPC scoped. Embeddings not configured on this Preview. |
| No direct provider access | Ask and embeddings go through Kernel / AI Director / Model Registry. |
