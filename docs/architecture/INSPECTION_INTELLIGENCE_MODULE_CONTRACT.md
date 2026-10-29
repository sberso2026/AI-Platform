# Inspection Intelligence — Module Contract

**Phase:** 9A · Version: `0.1.0-discovery`

| Field | Value |
|-------|-------|
| moduleKey | `inspection_intelligence` |
| commerceApplicationKey | `inspection_intelligence` |
| Package | `packages/inspection-intelligence` (`@rtb/inspection-intelligence`) |
| Certification package | `packages/inspection-intelligence-certification` |
| Route prefix | `/engineering/apps/inspection-intelligence` |
| Operating System | Engineering OS |
| Host | `apps/web` |
| Discovery marker | `data-testid="inspection-intelligence-discovery-ready"` |
| Product features implemented | **false** |

## Planned entitlements (seat + workspace + tenant aware)

- `inspection.read`
- `inspection.write`
- `inspection.review`
- `inspection.approve`
- `inspection.report`
- `inspection.admin`
- Page access action: `access` on `/engineering/apps/inspection-intelligence`

## Feature IDs (planned for later phases — not implemented in 9A)

- `inspection_planning`
- `inspection_sessions`
- `inspection_observations`
- `inspection_measurements`
- `inspection_evidence`
- `inspection_review_approval`
- `inspection_reporting`

## Hierarchy enforcement

Must remain: Platform → Engineering OS → Inspection Intelligence → Features.  
Must not become a separate OS, platform, repo, app host, AI runtime, commerce system, identity model, or asset registry.
