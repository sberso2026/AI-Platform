# Inspection Intelligence Public Module Contracts V1 (Frozen)

**contractVersion:** `1.0.0`  
**Owner:** `inspection_intelligence`  
**Compatibility:** `>=1.0.0 <2.0.0`

## Logical APIs
| contractId | Kind |
|------------|------|
| ii.api.slice | Query/API |
| ii.command.session.write | Command |
| ii.query.session.read | Query |
| ii.event.inspection | Event |
| ii.reporting.preparation | Reporting |
| ii.ai.vision.advisory | AI |
| ii.ai.predictive.advisory | AI |
| ii.search.sessions | Search |
| ii.observation.feed | Observation Feed |
| ii.asset.reference | Asset Reference |

## Common requirements
- Tenant/workspace context required
- Permissions declared per contract
- Idempotency keys for write/vision/report commands
- Audit for mutating and advisory validation paths
- No private persistence schemas exposed
- No evidence bytes / secrets in events
- Deprecation: notice for ≥1 minor cycle before major removal

Machine-checkable source: `packages/inspection-intelligence/src/domain/public-module-contracts.ts`
