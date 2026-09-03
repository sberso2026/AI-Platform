# Security evidence

| Control | Evidence |
|---|---|
| Tenant isolation | Worker fetch and SQL RPCs filter `tenant_id`. Cross-tenant document IDs return zero hits. |
| Workspace isolation | Same for `workspace_id`. Storage paths must start `{tenant}/{workspace}/{document}/`. |
| Project isolation | Project scope passes `engineering_project_id` into the index filter. |
| Document isolation | Document scope sets `engineeringDocumentIds` to the selected document after a core-row existence check. Live TEST 4 with an unknown document id returned zero body hits. |
| RBAC | Documents commerce policy on upload, get, ingest, Ask `ai.execute`. Re-index limited to owner/admin/operator. |
| Signed-file access | Browser uploads via signed URL; download via existing signed file route. No service-role in the browser. |
| No service-role leakage | Service client stays in server routes / worker. |
| No cross-tenant embeddings | Embedding rows include tenant/workspace; vector RPC is scoped. |
| No unrestricted model access | Embeddings go through `GovernedEmbeddingAdapter` / Model Registry. Ask generation uses AI Director. |
