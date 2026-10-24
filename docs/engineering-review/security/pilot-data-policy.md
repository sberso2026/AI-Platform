# Engineering Review AI — controlled-pilot data policy (ERA-7)

This policy is **narrow**. It applies to the designated Review pilot tenant/workspace/project only. It is not a general privacy statement and is not a DPIA.

## Allowed data classification

- Synthetic gold-set / cert fixtures
- Non-sensitive engineering documents that a named pilot engineer is authorized to store in the designated workspace
- Review metadata: package/run/finding/disposition IDs, codes, and counts

## Prohibited data

- Production customer portfolios outside the designated pilot tenant
- Secrets, passwords, service-role keys, live credentials
- Personal data not required to operate Review (keep operator emails to fixture/named accounts)
- Malware samples (EICAR only)
- Content that would require an external LLM to process

## Pilot tenant / workspace

- Tenant: `cert-er-a` (Review Tenant A) with `settings.engineeringReview.requireMfa = true`
- Tenant B (`cert-er-b`) is isolation evidence only; it is not a pilot-data workspace
- Workspaces: `cert-er-a1` (in-scope) vs `cert-er-a2` (same-tenant isolation)
- Project: fixture project A1 unless an authorized operator names a replacement **in that workspace**

## Document retention

- Pilot Review rows follow the staging database lifetime
- No Review-specific TTL is implemented
- Operator should delete disposable packages after a drill (`ERA-7 restore %` names are cleaned by tests)

## Test fixture handling

- Internal fixtures may be marked `controlledFixture` / `internal_fixture` / `cert_fixture`
- Fixtures may be treated CLEAN only when they are administrator-controlled and not EICAR
- EICAR is the only infected-test signature permitted

## Deletion process

1. Admin DELETE on Review aggregates (dispositions remain append-only)
2. Core document delete follows Engineering OS / PI rules
3. Tenant delete cascades Review rows (ON DELETE CASCADE) — do not use this as a routine cleanup on shared staging

## Who can access pilot data

- Provisioned members of the designated workspace with `engineering` execute/admin
- Service role for trusted audit and fixture provision only
- GitHub hosted-RLS job using dedicated staging secrets
- AI / Review engine operators reading findings in `/review` after MFA

## External AI provider status

ERA-7 has **no live LLM**. Pilot engineering document content is **not intentionally sent to an external LLM by Review**.

This is an architecture statement for the current deterministic pipeline. It is not a guarantee covering:

- future live-model work
- unrelated PI features that may call external services
- operator paste into third-party tools
- provider-side backups of the staging database
