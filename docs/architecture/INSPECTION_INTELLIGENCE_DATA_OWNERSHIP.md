# Inspection Intelligence — Data Ownership

**Phase:** 9A · **assetOwnership:** `engineering_os_shared_domain`

## Engineering OS Shared Domain owns

Projects, Assets, Asset hierarchy, Companies, Disciplines, Documents & revisions, Locations, People, Tags, Equipment, Packages, shared timeline identities.

## Inspection Intelligence owns

Inspection plans, templates & revisions, sessions, assignments, observations, measurements, evidence metadata/links, defects (inspection-process), recommendations, reviews, approvals, inspection report derivatives, inspection workflow state.

## Inspection Intelligence must never own

Projects, Assets, Identity, Commerce, Workspace model, Platform AI runtime, Knowledge Graph store, Notifications stack, Audit store, File blob store (uses Platform Files).

## Project Intelligence boundary

| Concern | Owner |
|---------|-------|
| Document / Meeting / Findings / Reporting / Knowledge / Reasoning | Project Intelligence |
| Inspection plans / sessions / observations / measurements / inspection defects | Inspection Intelligence |
| Canonical registers | Engineering Core / shared domain |

No production dependency `project-intelligence → inspection-intelligence` in Phase 9A.  
No reverse dependency that puts inspection business logic into Platform Core.

## Asset Intelligence

**Not implemented.** Framework may reference shared assets only. Must not assume Asset Intelligence exists. Future Asset Intelligence may consume inspection history as inputs to health/risk/condition — without II owning assets.

## Digital Twin

Inspection observations may emit timeline/condition/risk **inputs** and twin **references**. II does not own Digital Twin models or layers.
