# Security

- Initiator and privileged roles can `save_draft` / `submit` while `status=draft`.
- Viewer / read-only cannot open the edit form (`canMutate`).
- Unauthorized PATCH of another user's Draft returns 403.
- Cross-tenant / cross-workspace TQ GET returns 404 via existing commerce guards.
- Asset suggestions are workspace-scoped (`asset.list` / `asset.search`).
- Query image upload requires Draft edit rights.
- Query image GET requires TQ read access **and** a `query_image` link or HTML reference.
- Unauthenticated mutation remains 401/403.
- No public bucket, no service-role in the client.
