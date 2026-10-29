# EOS-D3-R7 Requirements, Assumptions and Change Closeout

## Purpose

R7 records why a Geotechnical requirement, assumption, or engineering decision exists, and it records what an authorized recorder explicitly says must be reassessed when that basis changes. It does not perform the reassessment. One bounded runtime stores requirements, assumptions, decisions, change, and reassessment markers together. The capability count is one. The live D3 runtime count is seven.

D1 structural pack complete remains no. D1N stays closed. The Civil track remains complete with classification COMPLETE_BOUNDED_WITH_LIMITATIONS and runtime count eleven. D2 is not reopened. Earlier D3 modules keep their historical runtime counts of one through six. The R6 requirements-assumptions-change readiness flag stays false, and its change runtime count stays zero. R8 is named and not started.

## Canonical governance

R7 calls the existing information-requirement status vocabulary and AI boundary, the existing assumption materiality and validation-status checks, the human-actor check, the single-selected-alternative check, and the decision supersession pair check. Fingerprints use the existing canonical fingerprint function. Currentness uses the existing D3 states. No parallel requirement, assumption, decision, change, currentness, or fingerprint engine was added.

## Exact R1-R6 binding

Every governance record names a governed object of the matching kind: a requirement object, an assumption object, a decision object, or a governance-record object for a change. Affected subjects and evidence must already exist in the same tenant, workspace, and project. A current citation fails when the subject or evidence is not current. Floating and broad references are rejected. A later evidence revision does not rewrite the evidence list stored on a historical governance record.

## Requirements, assumptions, and decisions

A requirement keeps its statement, source, source revision, applicability, limitations, open lifecycle status, evidence, provenance, and authority. Acceptance for purpose is not available in this phase, and presence of a requirement is not satisfaction. An assumption keeps its statement, rationale, materiality, and evidence, and its validation status stays unvalidated. An assumption is not a validated engineering fact. A decision keeps its statement, rationale, related requirement and assumption identifiers, and at most one selected alternative. Recording a decision does not approve or certify it. An AI recommendation is not a decision. An administrator action is not a decision. AI and administrator actors are not Geotechnical engineering authority, and AI cannot invent an authoritative requirement or assumption.

## Change, supersession, and reassessment

Change categories are an explicit allowlist: requirement changed, assumption changed, decision superseded, source evidence changed, parameter changed, recommendation changed, subject revision superseded, and reassessment required. Each change names the changed object and one or more explicit PARENT or OBJECT_REFERENCE links. Shared location, material, name, or proximity does not create a link. A reassessment-required marker is attached only to those explicit targets. The marker does not invalidate, recalculate, redesign, or validate the target. R3 interpretations, R4 test results, R5 parameters, and R6 recommendations keep their fingerprints and content. Supersession marks the predecessor superseded and keeps its fingerprint. The predecessor is not deleted and is not rewritten onto a newer evidence revision.

## Integrity and boundaries

Duplicate current signatures, replay of a different fingerprint, cross-scope references, stale subjects, fingerprint mismatch, and unauthorized supersession are rejected. Exact replay of the same identity and fingerprint returns the existing record. Tenant, workspace, and project scope is enforced. Calculation, redesign, discipline-interface, review, validation, approval, certification, cross-discipline reasoning, conflict resolution, and D9 counts remain zero. D4 through D9 remain unstarted. No schema change. No new dependency.

## Evidence

Engineering OS typecheck passed. The Engineering OS suite passed 311 files and 1814 tests. Web typecheck passed. Pilot scoped typecheck passed with the known isolated debt pattern and zero web tsc errors. Web lint passed with pre-existing warnings. The raw security suite failed only on packages/engineering-review/src/migration.test.ts and packages/engineering-review-persistence/src/boundary.test.ts, both the established EOS-A16D import. Failure count is 2 and root cause count is 1. Integration tests passed. RLS guard tests passed. Secret scan passed with 618 files and 0 findings. Dependency audit is critical 0, high 0, moderate 1. The single moderate advisory remains GHSA-w5hq-g745-h8pq on uuid 8.3.2 through exceljs, the same finding previously recorded as advisory 1119441. Release governance typecheck passed, tests passed at 127, artifact classification passed, and the ledger returned ok.

## Next phase

The next phase is EOS-D3-R8-DISCIPLINE-INTERFACES-AND-HANDOFFS, type DISCIPLINE_INTERFACES_AND_HANDOFFS. It implements governed D3 interfaces and handoffs to D1 Structural and D2 Civil using exact D3 revisions while establishing bounded placeholders and contracts for future D4 through D8. It preserves discipline authority and explicit currentness and limitations. It does not perform cross-discipline reasoning, conflict resolution, counterpart validation, automatic redesign, or start D4 through D9 runtime. This closeout does not start that phase.
