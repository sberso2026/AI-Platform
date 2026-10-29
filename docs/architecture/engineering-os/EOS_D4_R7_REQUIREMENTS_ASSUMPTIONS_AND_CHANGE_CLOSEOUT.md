# EOS-D4-R7 Requirements, Assumptions, and Change Closeout

## Purpose

R7 governs why Mechanical requirements, assumptions, and decisions exist, how they change, and which exact records require reassessment. A change may alter governance state. It does not silently perform the Mechanical engineering work implied by that change.

R1 remains the identity runtime at count one. R2 remains the equipment and system context runtime at count two. R3 remains the design-condition and performance context runtime at count three. R4 remains the vendor-data and evidence runtime at count four. R5 remains the technical-requirements runtime at count five. R6 remains the maintainability, access, and package runtime at count six. R7 is the seventh Mechanical runtime and the one requirements, assumptions, decisions, and change runtime. Those categories are not separate runtimes. D4-0 architecture runtime flags stay at their historical zero. D1 structural pack complete remains no. D1N stays closed. Civil and Geotechnical remain complete and are not reopened.

## Canonical governance reuse

Requirement status uses the canonical information-requirement vocabulary, and acceptance statuses stay outside R7. Assumptions use the canonical validation-status and materiality checks, and an assumption remains unvalidated. Decisions use the canonical single-selected-alternative check and the canonical supersession pair check. Human recording uses the canonical human-actor check. Fingerprints use the canonical fingerprint. Currentness uses the canonical currentness states. No parallel requirement, assumption, decision, change, currentness, or fingerprint engine is created.

## Exact R1-R6 binding

Every governance record names an R1 context, an R1 object, that object's exact revision fingerprint, an R2 subject and revision fingerprint, and the exact R3, R4, R5, and R6 record fingerprints. Floating references such as latest or current are rejected. A fingerprint mismatch is rejected. Historical governance records stay bound to the revision they cited.

## Requirements, assumptions, and decisions

A source requirement is not an adopted Mechanical requirement. An adopted requirement needs an explicit rationale and remains unvalidated and nonconformant. An assumption keeps its statement, subject, basis, authority, applicability, limitations, currentness, provenance, and history. It is not a validated fact. AI cannot invent an authoritative assumption or requirement. A decision keeps the affected subject, the statement, the basis, the deciding authority, the alternatives, applicability, limitations, provenance, and history. An AI recommendation is not a decision. An administrative action is not a decision.

## Change, dependencies, supersession, and reassessment

A change stores its origin, the exact affected revision, the reason, the authority, explicit dependencies, provenance, currentness, and history. A dependency must name an explicit relationship kind and an exact target revision. Matching tags, a shared vendor, a shared package, system membership alone, proximity, document co-occurrence, similar values, and semantic similarity do not create a dependency. Supersession marks the predecessor superseded and leaves its statement, revision, and fingerprint in history. A superseded record is not deleted and is not marked invalid. Reassessment required and reassessment completed are governance states. Neither state invalidates, recalculates, redesigns, validates, or approves the engineering.

## R3, R4, R5, and R6 preservation

R7 may govern a change against an R3 design or performance record, an R4 vendor record, an R5 technical requirement, or an R6 maintainability record. It does not rewrite those records. A new vendor revision is not adopted as engineering. Vendor information does not override engineering, and engineering context does not override vendor evidence. R5 requirements and technical context are not rewritten. R6 clearance is not recalculated. Access paths and removal routes are not solved. Package arrangement is not redesigned. Lifting analysis is not performed.

## Authority and later-phase boundaries

AI and admin are not Mechanical engineering authority. AI cannot close a reassessment as engineering complete. Discipline interfaces remain at count zero. Review, validation, conformance, approval, and certification remain at count zero. A recorded change, decision, or completed reassessment is not validation. The dedicated currentness and digital-thread runtime remains at count zero. The D9 source contract and cross-discipline reasoning, conflict detection, conflict resolution, and recommendation remain at count zero. Equipment sizing, the other Mechanical calculations, spatial clash detection, and layout optimization remain at count zero. A hidden calculation is rejected. Mechanical change records do not become Structural, Civil, Geotechnical, Piping, Process, Electrical, or Instrumentation and Control engineering. D5 through D9 remain unstarted. No schema change. No new dependency. Interfaces, review, the currentness thread, and the D9 source contract remain not ready.

## Integrity

Duplicate records, replay, a wrong or stale subject revision, a fabricated or inferred dependency, authority spoofing, provenance spoofing, cross-project and cross-tenant reference, fingerprint mismatch, invalid supersession, and historical auto-repointing are rejected. Replay of the same record and fingerprint returns the existing record. A changed source does not rewrite history.

## Evidence

Engineering OS typecheck passed. The Engineering OS suite passed 324 files and 1827 tests. Web typecheck passed. Types typecheck passed. Pilot scoped typecheck passed with the known isolated debt pattern and zero web tsc errors. Web lint passed with pre-existing warnings. Integration tests in the engineering-review suite passed, 2 tests. The raw security suite failed only on packages/engineering-review/src/migration.test.ts and packages/engineering-review-persistence/src/boundary.test.ts, both the established EOS-A16D import. Failure count is 2 and root cause count is 1. RLS guard tests passed. Secret scan passed with 618 files and 0 findings. Dependency audit is critical 0, high 0, moderate 1, advisory GHSA-w5hq-g745-h8pq on uuid through exceljs. Release governance typecheck passed, tests passed at 140, and the ledger returned ok.

## Next phase

The next phase is EOS-D4-R8-DISCIPLINE-INTERFACES-AND-HANDOFFS, type DISCIPLINE_INTERFACES_AND_HANDOFFS. It implements governed Mechanical discipline interfaces and handoffs using exact D4 R1 through R7 revisions and canonical EOS interface governance. It supports exact D4-to-D1, D2, and D3 handoffs and future D5 through D8 counterpart contracts while preserving discipline authority, explicit counterpart references, currentness, limitations, and history. It does not fabricate missing counterpart information, transfer authority, perform cross-discipline reasoning, automatically recalculate or redesign, implement review or validation, or start D5 through D9 runtime. This closeout does not start that phase.
