# EOS 2.13 design freeze and deliverable governance implementation

Phase: `EOS-2.13-DESIGN-FREEZE-AND-DELIVERABLE-GOVERNANCE`

Status: multidisciplinary freeze, baseline, deliverable revision, and release governance is implemented for Process, Mechanical, Piping, Structural, Civil, Geotechnical, Electrical, and Instrumentation and Control. EOS 2.14 is not started. No engineering formula or qualified D1 result was changed.

## Freeze and baseline

A freeze is a configuration statement. It stores the object id, exact revision, status, source, and discipline. A revision value of `latest` is rejected. The fingerprint is a SHA-256 of those references sorted by object and revision, so input order does not change it.

`engineering_configuration_baselines` remains the EOS-A4 baseline. `engineering_documents` remains the document master. This module does not replace either. `a4Replaced` and `documentsReplaced` stay false. Approving a freeze also calls the EOS 2.1 baseline function and then marks the snapshot frozen. A later attempt to change its members is refused. Comparison reports added, removed, and revised object ids and does not decide an engineering consequence.

Open exceptions make readiness `READY_WITH_CONDITIONS`. A stale or unaccepted member makes it `NOT_READY`. Readiness is not design approval. Each discipline keeps its own blocker list. The project list is the union of those blockers, not a single score.

## Deliverable, review, and release

A deliverable keeps engineering status, review status, approval status, release status, and issue purpose separate. Canonical purpose `CONSTRUCTION` can display as `IFC` through a project map. The stored purpose stays `CONSTRUCTION`.

Review cannot skip to complete. Approval requires a completed review. Release for construction also requires approval, current dependencies, and an acting role of `release_authority`. Owner, admin, pilot engineer, and AI cannot approve a freeze, approve a deliverable, release it, or withdraw it. The same person may act under more than one role. The audit stores the role used.

A released revision stores a checksum of its dependency snapshot. A later upstream revision marks the deliverable `potentially_stale` and leaves the released revision and the IFC baseline unchanged. Disposition such as `REVISION_REQUIRED` or `REVISED_IFC_REQUIRED` is recorded by a person. The module does not issue a new revision, withdraw the drawing, or rewrite the baseline by itself.

Supersession keeps the prior revision, marks it superseded, and leaves the original IFC baseline pointing at that revision. Withdrawal keeps the record, reason, authority, date, and replacement id.

## Packages, transmittals, and external documents

A package is not ready while a required deliverable is missing. A transmittal stores sender, recipients, purpose, and status. The external document adapter contract lists metadata operations only. It does not synchronize a document system and does not replace one.

## AI

The readiness note separates fact, configuration, deliverable state, blockers, exceptions, change impact, and the human decision. It does not authorize release.

## Migration and UI

`supabase/migrations/20261029100000_eos_2_13_design_freeze_deliverable_governance.sql` uses hour `10` and sorts after `20261029080000`. Row level security uses tenant and workspace membership. Inserts also require engineering execute.

`/engineering/design-freeze` shows freeze target, discipline blockers, deliverable rows, package and transmittal counts, and the advisory. Change impact links to it. Discipline pages are not replaced.

## Demonstration

Domain tests use `EOS Design Freeze and Deliverable Governance Demo` and `Synthetic Feed Pump Facility P-101`. They cover a FEED baseline for eight disciplines, comparison, a detailed freeze that moves from not ready to ready with conditions and then ready, release blocking, an authorized construction release, an immutable IFC baseline after a mass revision, supersession, withdrawal, package readiness, and a cross-discipline interface blocker. Production migration and deployment stay deferred.
