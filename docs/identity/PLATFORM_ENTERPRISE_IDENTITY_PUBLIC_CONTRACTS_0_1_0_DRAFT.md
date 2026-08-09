# Platform Enterprise Identity Public Contracts — 0.1.0-draft

Status: **DRAFT** · Not frozen · Do **not** claim 1.0.0

## Concepts

- `EnterpriseIdentityProviderReference`
- `EnterpriseIdentityProviderConfiguration`
- `TenantSsoPolicy`
- `VerifiedIdentityDomain`
- `ExternalIdentityReference`
- `IdentityClaimMapping`
- `EnterpriseRoleMapping`
- `FederatedAuthenticationResult`
- `EnterpriseIdentityHealth`

TypeScript draft definitions live in:
`packages/platform-identity/src/draft-contracts.ts`

## Notes

- Configuration may reference secret IDs; never embed plaintext client secrets or private keys
- Security & Assurance V1 public contracts remain frozen and unmodified
- Future SSO evidence should use Sec&A generic evidence/reference contracts where possible
