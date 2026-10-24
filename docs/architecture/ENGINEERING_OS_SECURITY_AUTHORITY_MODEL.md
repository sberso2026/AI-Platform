# Engineering OS — Security & Authority Model (E12)

**Status:** E12 certification summary  
**Canonical:** [../security/ENGINEERING_OS_V1_SECURITY_BOUNDARY.md](../security/ENGINEERING_OS_V1_SECURITY_BOUNDARY.md) · ownership [ENGINEERING_OS_V1_OWNERSHIP_MATRIX.md](./ENGINEERING_OS_V1_OWNERSHIP_MATRIX.md)

## Authority (non-negotiable)

| Claim type | Authority |
|------------|-----------|
| AI answer / reasoning | Advisory |
| Scenario / prediction / risk signal | Not forecast / fact / accepted risk |
| Tool result | Provenance-bound; availability ≠ certification |
| Memory | Context never automatic source authority |
| Action proposal | Requires human review/execute |
| External connector evidence | Not local SoR ownership |
| Assurance finding | Not human sign-off |

## Security fail-closed (E11/E12)

- Tenant / workspace isolation  
- Entitlement + RBAC (profile is not authorization)  
- Restricted memory exclusion  
- Tool privilege escalation blocked  
- Action payload tamper rejected  
- Cross-tenant retrieval blocked  
- Hidden/restricted source non-disclosure  

Machine-readable: `certifyEngineeringAuthorityBoundaries()`, `certifySecurityAdversarial()`.
