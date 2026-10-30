# EOS-3-INTELLIGENCE-1 — Staleness and Impact Propagation

`EOS_STALENESS_IMPACT_PROPAGATION_CORE=PASS`  
`EOS_OWNER_AUTHORIZED_INTELLIGENCE_CONTINUATION=YES`  
`EOS_BROAD_UX_REDESIGN_IN_THIS_PHASE=NO`

## Purpose

Governed propagation of engineering meaning when upstream information changes:

`WHAT_CHANGED?` → `WHAT_DEPENDS_ON IT?` → `WHAT MAY REQUIRE REVIEW?` → `WHY?` → `WHAT ENGINEERING MAY BE AFFECTED?`

Without automatically declaring engineering invalid or making engineering decisions.

## Architecture

- **Traversal**: Domain-3 `boundedTraversal` (revision-aware, cycle-safe).
- **Decisions/Assumptions**: Domain-4 `reviseAssumption`, `markDecisionReassessmentRequired` (no auto reversal).
- **Readiness/blockers**: Domain-1 `deriveReadiness` / `deriveBlockers`.
- **Impact records**: derived consequence state in `eos3-impact-propagation.ts` — not a duplicate Calculation/Decision/Deliverable store.
- **Processing**: synchronous deterministic service + existing project API; not on Home render path.

## UI freeze

Sidebar / Home / My Work / WP cockpit / Engineering Design major layouts unchanged.  
Only contextual banners (`ImpactAttentionBanner`) and WP Needs Attention labels.

## Module

`apps/web/src/lib/engineering/eos3-impact-propagation.ts`  
API: `/api/engineering/projects/[projectId]/impact-propagation`
