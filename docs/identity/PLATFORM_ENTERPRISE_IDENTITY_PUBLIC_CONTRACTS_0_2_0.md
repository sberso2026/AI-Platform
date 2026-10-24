# Platform Enterprise Identity Public Contracts — 0.2.0-enterprise-sso

Status: **ACTIVE** · Not frozen at 1.0.0

Advanced from `0.1.0-draft`.

## Contracts

- EnterpriseIdentityProviderReference
- EnterpriseIdentityProviderConfiguration
- TenantSsoPolicy
- VerifiedIdentityDomain
- ExternalIdentityReference
- ExternalIdentityBinding
- IdentityClaimMapping
- EnterpriseRoleMapping
- FederatedAuthenticationResult
- FederatedMfaAssurance
- EnterpriseIdentityHealth

TypeScript: `packages/platform-identity/src/contracts.ts`

Secrets appear only as `clientSecretRefId` / `secretReferenceIds`.
