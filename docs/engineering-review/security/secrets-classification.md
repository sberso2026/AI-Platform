# Engineering Review — secrets classification (ERA-6)

**Not a certification claim.** No secret values are recorded here.

| Finding | Location | Classification | Treatment |
| --- | --- | --- | --- |
| `SecretManagementService.encryptPlaceholder` SHA-256 salt+value | `packages/platform-intelligence/src/secret-management/secret-management-service.ts` | REPLACE | Not encryption. Production `createSecret` without `externalRef` now **fails closed**. Review production path does not call this service. |
| `COMMERCE_AUTH_SECRET` development default | `packages/platform-commerce/src/domain/commerce-execution-context.ts` | DEVELOPMENT_ONLY / REMOVE in production | Production (`NODE_ENV` or `VERCEL_ENV`) fails closed if unset or equal to the development default. Review does not use commerce auth. |
| `certUserPassword` default `CertInstall!Phase3` | `packages/engineering-review-persistence/src/env.ts` | DEVELOPMENT_ONLY | Allowed for local cert fixtures. Required via env when `CI=true` and `ENGINEERING_REVIEW_RLS=1`. |
| Service-role key | Hosted env / GitHub `REVIEW_STAGING_SUPABASE_SERVICE_ROLE_KEY` | NOT_APPLICABLE to browser | Used only in server `createServiceClient` after JWT-authorized Review ops. Client Review pages must not import runtime. |
| `encryptPlaceholder` on Review path | Review runtime / UI | REMOVE (already absent) | Unit-proven. |
| Secrets in telemetry / audit / exceptions | Review telemetry + audit sanitizer | REMOVE | Forbidden keys stripped; long strings dropped from audit metadata. |

Requirements in force:

- No production default secret for commerce auth.
- Mandatory secret absence fails closed in production.
- No service-role in Review client bundle.
- No secret in telemetry, audit payload, or exception response.
- No secret committed (Review secret-scan).
