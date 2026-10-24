# Engineering OS — Deployment Profiles (E12)

**Status:** E12 certification summary  
**Canonical contract:** [ENGINEERING_OS_PHASE_E0_DEPLOYMENT_PROFILES.md](./ENGINEERING_OS_PHASE_E0_DEPLOYMENT_PROFILES.md) · progressive UX [ENGINEERING_OS_PHASE_E10_DEPLOYMENT_PROFILES_PROGRESSIVE_UX.md](./ENGINEERING_OS_PHASE_E10_DEPLOYMENT_PROFILES_PROGRESSIVE_UX.md)

## Profiles

| Profile | Connector policy | Identity | Density | Certification posture |
|---------|------------------|----------|---------|------------------------|
| ESSENTIAL | DISABLED | NATIVE | MINIMAL | Independently useful zero-connector — **CERTIFIED** |
| PROFESSIONAL | OPTIONAL | NATIVE | RICH | Same architecture + optional packs — core **CERTIFIED**, connectors **CONTRACT_READY** |
| ENTERPRISE | ENTERPRISE_ENABLED | OIDC_SAML_READY | ENTERPRISE | Same core; federation/IdP/Copilot **CONTRACT_READY** (not live SoR cert) |

## Logical deployment modes

`RTB_SAAS` · `CLIENT_CLOUD` · `PRIVATE_CLOUD` · `ON_PREM_READY`

Configuration: `NEXT_PUBLIC_EOS_DEPLOYMENT_PROFILE` / access-snapshot `deploymentProfile`.

Machine-readable: `buildProfileCertificationMatrix()`, `createProfileSeedTenants()`.
