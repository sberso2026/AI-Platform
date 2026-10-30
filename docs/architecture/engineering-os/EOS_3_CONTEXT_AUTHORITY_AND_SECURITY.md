# Context Authority and Security

Context Resolution **reports** authority; it does **not** grant authority.

Approval is never inferred from job titles (`Lead`, `Senior`, `Manager`).

Authorization is applied before disclosure. Cross-workspace context is denied.
Session overrides do not mutate canonical ownership, discipline, or authority.
Cache keys include user, workspace, Project, Work Package, object, and authorization fingerprint; auth changes invalidate unsafe cache.
