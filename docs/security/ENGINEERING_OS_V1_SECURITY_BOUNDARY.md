# Engineering OS V1 Security Boundary

Status: Phase 14A · `EngineeringOSSecurityBoundaryDefined = true`

## System-level controls

| Control | Requirement |
| --- | --- |
| JWT | Real user JWT at API boundaries |
| RLS | Tenant/workspace enforced in Postgres |
| Tenant isolation | Mandatory |
| Workspace isolation | Mandatory |
| IDOR | Denied across tenants/workspaces |
| Module entitlements | Server-side commerce/policy checks |
| Tool permissions | ETF permission + risk class |
| Execution-host authorization | Host/admin/execute separated |
| File authorization | Platform Files ACLs |
| Cross-module contract authorization | Public contracts only |
| AI permission propagation | Least privilege from EngineeringContext |

## License / solver security

- No commercial license keys in code
- No license bypass / license-server emulation
- No silent solver fallback
- Federation ≠ execution claim
