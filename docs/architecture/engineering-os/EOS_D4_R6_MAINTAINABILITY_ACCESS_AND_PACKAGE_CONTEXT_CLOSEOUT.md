# EOS-D4-R6 Maintainability, Access, and Package Context Closeout

## Purpose

R6 governs what access, clearance, removal, lifting, and package constraints Mechanical requires. It does not claim that those constraints have been spatially verified, optimized, structurally checked, or proven feasible.

R1 remains the identity runtime at count one. R2 remains the equipment and system context runtime at count two. R3 remains the design-condition and performance context runtime at count three. R4 remains the vendor-data and evidence runtime at count four. R5 remains the technical-requirements runtime at count five. R6 is the sixth Mechanical runtime and the one maintainability, access, and package runtime. Maintenance, access, removal, lifting, and package records are not separate runtimes. D4-0 architecture runtime flags stay at their historical zero. D1 structural pack complete remains no. D1N stays closed. Civil and Geotechnical remain complete and are not reopened.

## Exact R1-R5 reuse

Every R6 record names an R1 context, an R1 object, that object's exact revision fingerprint, an R2 subject and revision fingerprint, an R3 record and revision fingerprint, an R4 record and revision fingerprint, and an R5 record and revision fingerprint. Each upstream record must already be bound to the same object revision. Floating references such as latest or current are rejected. A fingerprint mismatch is rejected. Recording a constraint does not rewrite R1 through R5 and does not repoint a historical constraint onto a newer source.

## Maintainability

A maintainability record stores a maintenance envelope, inspection or service access requirement, replacement or removal requirement, maintenance orientation, maintenance-side constraint, service or removal clearance, a supplied maintenance interval, an access restriction, or a maintenance limitation. The record is a governed requirement or context. It is not spatial validation and it is not confirmation that maintenance is feasible.

## Access and clearance

Access and clearance records require a traceable source and basis. They may state a maintenance clearance, inspection clearance, operator or service access, opening or removal clearance, an access side, a service zone, a restricted zone, or an equipment-access limitation. A numeric clearance keeps its supplied unit and is not converted. Automatic geometric verification and spatial clash detection remain at count zero.

## Removal and replacement

A removal or replacement record may name a removable component, a removal direction, a required removal envelope, a replacement-space requirement, a temporary access requirement, or a maintenance extraction context. The record does not validate a route and does not validate installability. Access-path solving and removal-route solving remain at count zero.

## Lifting context

A lifting record may store a lifting-point reference, a lifting mass supplied by a governed source, a center-of-gravity reference, a lifting orientation, a lifting or removal constraint, or a temporary handling requirement. The record is not a lifting analysis, not a rigging design, and not a Structural lifting design. Rigging analysis, Structural lifting design, and lifting-load structural verification remain at count zero. A lifting requirement is not D1 Structural verification.

## Package and arrangement

Package context and package-boundary context require an explicit R2 package membership. Inferred membership from tags, proximity, or similarity is rejected. Arrangement constraints may record orientation, maintenance side, access side, service zone, removal direction, a minimum clearance, an adjacency restriction, or a package-boundary restriction. An arrangement record is not a layout optimization and is not a clash-free claim. Layout optimization remains at count zero.

## Source, vendor, and R5 boundaries

An authoritative or adopted record requires a traceable basis: an R5 Mechanical technical requirement, R4 vendor evidence, a project specification, a Mechanical design basis, a maintenance strategy, a manufacturer instruction, authorized Mechanical engineering input, or a governed project requirement. A basisless authoritative record is rejected. A vendor maintenance or lifting statement stays vendor-supplied until an explicit adoption rationale is recorded. Vendor lifting data is not a validated lifting design. R6 may cite an exact R5 requirement and does not mutate that requirement or rewrite R5 technical context.

## Applicability, authority, and discipline boundaries

Every record states the equipment or package, the maintenance case, the relevant component, the orientation or context, the source revision, and the limitations. A constraint is not propagated to another equipment, package, or case. AI and admin are not Mechanical engineering authority and cannot invent an authoritative maintainability, access, or lifting requirement. Mechanical constraints do not become Structural, Civil, Geotechnical, Piping, Process, Electrical, or Instrumentation and Control decisions. A clearance is not piping routing approval. A lifting requirement is not structural adequacy. An access requirement is not Civil access design. A package boundary is not an Electrical or I&C design boundary.

## R7, R8, and R9 boundaries

Requirements, assumptions, and change runtime remain at count zero. Change propagation remains at count zero. A changed source does not rewrite the context, rewrite history, or revalidate engineering. Discipline interface runtime remains at count zero. Cross-discipline reasoning, conflict detection, conflict resolution, and recommendation remain at count zero. Review, validation, conformance, approval, and certification remain at count zero. A recorded envelope, access requirement, or lifting requirement is not validation. Equipment sizing and the other Mechanical calculation runtimes remain at count zero. A hidden calculation is rejected.

## Currentness, provenance, fingerprint, and history

Currentness and fingerprints reuse the canonical mechanisms. No parallel currentness engine and no second fingerprint algorithm are created. Provenance is required and preserved. Replay of the same record and fingerprint returns the existing record. A conflicting replay is rejected. A duplicate current subject, statement, source revision, and applicability is rejected. Supersession marks the predecessor superseded and leaves its statement, source revision, and fingerprint unchanged. Tenant, workspace, and project must match the recorder. A stale upstream revision cannot be cited as current. Silent mutation and automatic repointing are rejected.

## Integrity

Duplicate context, replay, wrong equipment or package revision, stale source revision, fabricated source, authority spoofing, provenance spoofing, unit or value spoofing, cross-project and cross-tenant reference, fingerprint mismatch, and historical auto-repointing are rejected. D5 through D9 remain unstarted. No schema change. No new dependency. Requirements and change, interfaces, review, the currentness thread, and the D9 source contract remain not ready.

## Evidence

Engineering OS typecheck passed. The Engineering OS suite passed 323 files and 1826 tests. Web typecheck passed. Types typecheck passed. Pilot scoped typecheck passed with the known isolated debt pattern and zero web tsc errors. Web lint passed with pre-existing warnings. Integration tests in the engineering-review suite passed, 2 tests. The raw security suite failed only on packages/engineering-review/src/migration.test.ts and packages/engineering-review-persistence/src/boundary.test.ts, both the established EOS-A16D import. Failure count is 2 and root cause count is 1. RLS guard tests passed. Secret scan passed with 618 files and 0 findings. Dependency audit is critical 0, high 0, moderate 1, advisory GHSA-w5hq-g745-h8pq on uuid through exceljs. Release governance typecheck passed, tests passed at 139, and the ledger returned ok.

## Next phase

The next phase is EOS-D4-R7-REQUIREMENTS-ASSUMPTIONS-AND-CHANGE, type REQUIREMENTS_ASSUMPTIONS_AND_CHANGE. It implements canonical requirement, assumption, engineering-decision, and change or reassessment governance for D4 using exact R1 through R6 Mechanical revisions. It reuses canonical EOS governance, preserves explicit dependencies, supersession, and reassessment semantics, and prevents automatic recalculation or redesign and AI or admin engineering authority. It does not implement discipline interfaces, review or validation, a currentness or digital-thread dedicated runtime, a D9 source-contract runtime, or D5 through D9 runtime. This closeout does not start that phase.
