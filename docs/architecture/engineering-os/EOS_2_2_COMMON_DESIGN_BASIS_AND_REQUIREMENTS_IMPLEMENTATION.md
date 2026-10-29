# EOS 2.2 common design basis and requirements implementation

Phase: `EOS-2.2-COMMON-DESIGN-BASIS-AND-REQUIREMENTS`

Status: implemented foundation for the common engineering basis chain. EOS 2.3 structural design delivery is not implemented. No discipline calculation was added. The qualified D1 baseline and the EOS 2.1 lifecycle transition rules were not changed.

## Chain

The runtime in `packages/engineering-os/src/engineering-basis` keeps these records distinct:

`Source -> Requirement -> Design Basis Item -> Design Criterion -> Assumption -> Engineering Input -> Design Case -> Calculation reference -> Deliverable reference -> Verification Evidence`

A calculation reference stores identity and input links. It does not evaluate a formula.

## Hierarchy

Design basis levels are project, discipline, system, and asset. Inheritance is `inherit`, `specialize`, `override`, `add`, or `not_applicable`. An override must name the parent, rationale, lifecycle stage, and revision. A missing rationale is rejected. `accepted_for_stage` does not grant final approval. Owner, admin, pilot engineer, and AI cannot approve a basis even when an approval flag is set.

## Requirements and legacy records

EOS-A4 `engineering_requirements` remains the existing requirement table. This migration does not alter it and does not copy its rows. EOS 2.2 basis-chain requirements may store `legacy_requirement_id` when a human later points at an existing row. Status and type vocabularies differ, so there is no deterministic automatic mapping. AI-extracted requirements are stored as `proposed` and labeled `PROPOSED`. A calculation does not verify a requirement. Verification requires an evidence reference and a human actor.

## Inputs, staleness, and baselines

Revising an engineering input creates a new revision and marks linked calculation, deliverable, and verification references `potentially_stale`. It does not recalculate them. A captured baseline copies the revision and value set. Later revisions do not change that copy. A change record can flag affected objects and cannot approve itself.

## Lifecycle

`lifecycleBasisReadiness` reports concept, feasibility, FEED, and detailed-engineering signals. It does not move the EOS 2.1 stage. Stale references are visible and are not an automatic stage transition.

## Schema and RLS

`supabase/migrations/20261028140000_eos_2_2_engineering_basis.sql` adds the basis set, sources, items, basis-chain requirements, criteria, assumptions, inputs, standards, verifications, links, and audit tables. Row level security requires tenant membership and `engineering_core_workspace_member`. Inserts also require `engineering` `execute`. There is no delete policy.

## UI and AI

`/engineering/engineering-basis` shows the overview, requirements matrix, and the other basis sections, with discipline and status filters. Advisory text is labeled and states that it does not approve a basis or a requirement.

## Limitations

Production was not migrated. The page summary is the unclassified empty graph until a basis set is stored for the workspace. Bulk import commits only previewed valid rows as drafts. Jurisdiction profiles are configurable and none is universal. Full change-impact propagation and discipline criteria remain later phases.
