# ERA-5 — Minimum usable Engineering Review AI

Trusted server boundary plus `/review` engineer workflow.

- Routes: `/review`, `/review/projects/[projectId]`, `/review/projects/[projectId]/packages/[packageId]`
- Writes go through authenticated `/api/review/*` handlers. Browser never receives service-role credentials.
- Default execution remains the ERA-4 grounded deterministic pipeline (no live LLM required).
- Core `engineering_documents` / `engineering_projects` RLS was not modified.

See `docs/engineering-review/security/control-matrix.md` and `soc2-evidence-register.md`.
