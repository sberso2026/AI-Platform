# Engineering OS — Capability Matrix (E12)

**Status:** E12 certification summary  
**Canonical detail:** [ENGINEERING_OS_V1_CAPABILITY_MATRIX.md](./ENGINEERING_OS_V1_CAPABILITY_MATRIX.md) · E10 packaging [ENGINEERING_OS_PHASE_E10_DEPLOYMENT_PROFILES_PROGRESSIVE_UX.md](./ENGINEERING_OS_PHASE_E10_DEPLOYMENT_PROFILES_PROGRESSIVE_UX.md)

## Profile packaging (E10/E12)

| Capability | ESSENTIAL | PROFESSIONAL | ENTERPRISE |
|------------|-----------|--------------|------------|
| Native Ask / search / reasoning | CERTIFIED | CERTIFIED | CERTIFIED |
| Projects / documents / registers | CERTIFIED | CERTIFIED | CERTIFIED |
| Governed tools / passive memory / action proposals | CERTIFIED* | CERTIFIED* | CERTIFIED* |
| Cross-project intelligence / richer workflows | NOT_APPLICABLE | CERTIFIED* | CERTIFIED* |
| Optional connectors / intelligence packs | NOT_APPLICABLE | CONTRACT_READY | CONTRACT_READY |
| SSO / enterprise connectors / federation | NOT_APPLICABLE | NOT_APPLICABLE | CONTRACT_READY |
| Corporate Copilot federation | NOT_APPLICABLE | NOT_APPLICABLE | CONTRACT_READY |

\* When installed + entitled + authorised. Profile ≠ authorization.

Visibility rule: `profile ∩ installed ∩ entitled ∩ RBAC`.

Machine-readable: `buildProfileCertificationMatrix()` / `certifyProductAssertions()`.
