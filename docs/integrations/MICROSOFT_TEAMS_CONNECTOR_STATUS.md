# Microsoft Teams Connector Status

**Phase:** 7A → **updated Phase 8D**  
**Status:** `conditionally_deferred`

## Reason

Tenant or provider capability dependency (Entra / Teams admin Graph transcript access and live certification evidence).

## Requirements (locked)

| Requirement | Value |
|-------------|-------|
| Teams fixture certification | Preserved (**certified** in fixture / test mode) |
| Manual provider | Remains certified |
| Uploaded transcript path | Certified via manual / RTB-owned events |
| Project Intelligence Meetings without Teams | Required usable |
| `productionTeamsProviderReady` | Remains **false** until live gates PASS |
| `productionMeetingIntelligenceReady` | Independent of Teams live |
| Phase 8D PASS depends on Teams live? | **No** |
| Platform / Engineering OS release gate depends on Teams live? | **No** |
| Present Teams live as production-ready? | **No** |
| Silent live → fixture fallback | **Forbidden** |
| Automatic fixture mode in production | **Forbidden** |

## Related

- [MEETING_PROVIDER_STRATEGY.md](./MEETING_PROVIDER_STRATEGY.md)
- [PROJECT_INTELLIGENCE_MEETING_PHASE_8D_RECONCILIATION.md](../migration/PROJECT_INTELLIGENCE_MEETING_PHASE_8D_RECONCILIATION.md)
- Project Intelligence Teams readiness: `packages/project-intelligence/src/meetings/teams/teams-provider-readiness.ts`
