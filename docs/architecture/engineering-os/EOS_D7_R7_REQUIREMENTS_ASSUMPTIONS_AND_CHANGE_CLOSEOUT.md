# EOS-D7-R7 Requirements, Assumptions, and Change Closeout

## Purpose

D7-R7 implements exactly one new Electrical runtime: governed requirements, assumptions, engineering decisions, change, supersession, and reassessment on exact D7-R1 through D7-R6 revisions. The live Electrical runtime count is 7. The live requirements, assumptions, and change runtime count is 1. Requirements, assumptions, decisions, change, and reassessment are not separate runtimes. Earlier runtime counts stay on their own modules: identity 1, system source and distribution 2, load consumer and equipment 3, feeder cable and rating 4, calculation evidence 5, and protection grounding and hazardous-area context 6. Architecture runtime counts remain 0, including the architecture requirements runtime count of 0. D7 is not complete. D6 remains COMPLETE_BOUNDED_WITH_LIMITATIONS and is not reopened. D1 remains incomplete. D2 through D5 remain complete and are not reopened. D8 and D9 remain unstarted. R8 is not started.

## Exact R1-R6 reuse

Every R7 record binds to an exact R1 object identity and revision fingerprint. The R7 store is created only when the supplied R6 store, and the R1 through R5 stores held by that R6 store, were built on the same R1 store. A floating reference, including latest, current, newest, head, or active, is rejected. Historical references are not repointed. R7 does not mutate R1 identity, R2 system source or distribution, R3 load consumer or equipment supply, R4 feeder cable or rating, R5 calculation evidence, or R6 protection grounding or hazardous-area records. An upstream seal compares those revisions before and after every governance write.

## Requirement governance

R7 reuses canonical requirement governance. No parallel Electrical requirement engine is created. A source requirement, a candidate requirement, and an adopted Electrical requirement are different records. Adoption is a new record that cites a current source or candidate on the same object, with the same statement and the same source revision, and requires an explicit adoption rationale. The source record is not rewritten and is not marked adopted. A source requirement is not an Electrical design and is not a validated Electrical design. Source and basis are required and traceable. Allowlisted sources are a D6 process requirement, D4 mechanical context, a project requirement, an owner requirement, vendor or manufacturer information, a standard or jurisdiction reference, a design basis, and an explicitly supplied engineering source. Basis is not invented.

## Source and adopted distinction

Source requirement does not equal adopted Electrical requirement. A source requirement is not auto-adopted. Acceptance statuses are rejected. An adopted requirement remains unvalidated, unapproved, and not design-satisfied.

## D6 and D4 boundaries

R7 can cite an exact D6 process-requirement revision and an exact D4 mechanical revision through supplied external snapshots. A missing or mismatched revision is rejected. A D6 process requirement is not D7 Electrical design and is not auto-adopted as a D7 requirement. A D6 power-load requirement is not a validated D7 load. A D6 trip or shutdown intent is not D7 protection or control design. Mechanical equipment duty is not Electrical motor design and is not auto-adopted as a D7 requirement. Citing those sources does not transfer counterpart authority.

## Assumption governance

R7 reuses canonical assumption governance. No parallel assumption engine is created. Every assumption keeps identity, the exact subject revision, source and basis, applicability, limitations, author and authority, currentness, and provenance. The validation status remains unvalidated. An Electrical assumption is not a validated fact and is not engineering-validated. AI cannot invent an authoritative Electrical assumption.

## Decision governance

R7 reuses canonical engineering-decision governance. No parallel decision engine is created. A decision records exactly one selected alternative. An AI recommendation is not an Electrical engineering decision. An admin action is not an Electrical engineering decision. A decision is not approval. Decision authority is required and traceable as Electrical context authority. AI and admin are not decision authority.

## Change, supersession, and reassessment

R7 reuses canonical change governance. No parallel change engine is created. A change keeps the exact changed subject revision, change identity, source and basis, the affected dependency set, authority, applicability, provenance, currentness, and reassessment state. Supersession freezes the predecessor as superseded. The superseded record is not deleted and is not treated as invalid. Decision history is retained and is not replaced. Reassessment states are reassessment required and reassessment completed. Reassessment required is not validation failed and is not design invalid. Reassessment completed is not validated and is not approved. Closing a reassessment as validated is rejected.

## Explicit dependencies

A change requires at least one explicit dependency. Relationship kinds stay inside the canonical explicit set. Inferred dependencies are rejected, including matching names or tags, the same system, the same voltage, topology proximity, the same source document, and AI semantic similarity. A dependency must name an exact current revision in the same tenant, workspace, and project.

## Staleness semantics

Only an explicit dependency of a current change may be marked stale or reassessment required. The mark is an overlay. It does not rewrite the dependent record, does not expose a stale record as current, and does not expose a superseded record as current. Inferred staleness propagation is rejected. An assumption change does not recalculate engineering and does not invalidate every dependent. A requirement change does not update or recalculate engineering.

## No recalculation or redesign

A change does not repoint or rewrite R1 identity history. It does not reconfigure an electrical system, replace a power source, or rewrite a distribution hierarchy. It does not recalculate load, demand, or diversity, and it does not rewrite an adopted load. It does not reselect electrical equipment or resize a source. It does not size a feeder or cable, recalculate ampacity or voltage drop, or reselect a breaker. It does not recalculate, revalidate, or rewrite R5 external evidence. It does not recalculate a protection setting, perform protection coordination, or reselect a protection device. It does not recalculate or redesign grounding. It does not reclassify a hazardous area, reselect hazardous-area equipment, or approve equipment suitability. It does not revalidate, approve, determine conformance, or certify engineering.

## Currentness, thread, and fingerprint

R7 reuses canonical currentness, the canonical digital thread, and the canonical fingerprint. No parallel currentness engine, digital thread, or second fingerprint algorithm is created. The dedicated currentness runtime remains 0. A stale record is not exposed as current. A superseded record is not exposed as current. Lineage is explicit. Inferred lineage is rejected. Replay of the same record and fingerprint returns the existing record. Fingerprint mismatch does not write. Duplicate current requirement, assumption, decision, change, and reassessment records are rejected. Authority, provenance, source, scope, dependency, supersession, and fingerprint spoofing are rejected. Silent mutation is rejected. History is preserved.

## Authority boundaries

Electrical authority is not Structural, Civil, Geotechnical, Mechanical, Piping, Process, or Instrumentation and Control authority. AI and admin are not Electrical engineering authority. AI cannot auto-adopt a requirement, invent an authoritative assumption, create an authoritative engineering decision, or close reassessment as validated. Admin cannot promote a change to engineering approval. Tenant, workspace, and project scope is enforced. Cross-tenant access is rejected. Provenance, source basis, applicability, and limitations are required and preserved. Governance is not auto-propagated outside its applicability.

## Calculation and future-runtime zero matrix

Electrical calculation runtime count remains 0. Load, load flow, short circuit, motor starting, voltage drop, cable sizing, protection coordination, arc flash, grounding, power quality, harmonic, battery or UPS, and hazardous-area classification runtime counts remain 0. Automatic Electrical design and redesign remain 0. Review and validation, automatic engineering validation, conformance determination, approval, and certification remain 0. Discipline-interface runtime remains 0. Dedicated currentness runtime remains 0. D9 source-contract runtime and D7-D9 integration remain 0. D7-D8 integration remains 0. D8 and D9 remain unstarted. Cross-discipline reasoning, conflict detection, conflict resolution, and recommendation remain 0. No schema change. No new dependency.

## Security and release posture

Engineering OS typecheck passed. Types typecheck passed. Web app typecheck passed. Web pilot typecheck passed. Release-governance typecheck passed. Pilot scoped typecheck passed with the known isolated debt pattern: PILOT_SCOPED_TYPECHECK_PASS true, GLOBAL_TYPECHECK_DEBT_ISOLATED true, FULL_WEB_TYPECHECK_PASS false, IGNORE_BUILD_ERRORS_REQUIRED true, WEB_TSC_ERROR_COUNT 0, ISOLATED_DEBT_ERROR_COUNT 0. The Engineering OS suite passed 363 files and 1866 tests. Web lint passed with pre-existing warnings. The raw security suite failed only on packages/engineering-review/src/migration.test.ts and packages/engineering-review-persistence/src/boundary.test.ts, both the established EOS-A16D import in eos-a16d-generic-binary-retrieval.test.ts. Review results are 1 failed and 21 passed files, 1 failed, 123 passed, and 1 skipped test. Persistence results are 1 failed and 10 passed files, 1 failed and 33 passed tests. Integration tests passed, 2 tests. Hosted RLS passed with 2 tests and 1 skipped. Failure count is 2 and root cause count is 1. The baseline fingerprint is unchanged. Secret scan passed with 618 files and 0 findings. Dependency audit is critical 0, high 0, moderate 1, advisory GHSA-w5hq-g745-h8pq on uuid through exceljs. Release governance tests passed at 179, and the ledger returned ok. No schema change. No new dependency.

## Known limitations

R7 records how Electrical requirements, assumptions, decisions, and changes are governed on exact revisions. A changed requirement or assumption may mark an explicitly dependent Electrical record stale or reassessment-required. It does not calculate loads, size cables, alter protection settings, redesign grounding, reclassify hazardous areas, revalidate engineering, or approve the changed design. A source requirement is not an adopted requirement. An assumption is not a fact. An AI recommendation is not an engineering decision. Reassessment is not validation or approval.

## Next phase

The next phase is EOS-D7-R8-DISCIPLINE-INTERFACES-AND-HANDOFFS, type DISCIPLINE_INTERFACES_AND_HANDOFFS. Its scope is to implement canonical Electrical discipline-interface and handoff governance using exact D7 R1-R7 revisions. Support explicit, exact-revision handoffs with D4 Mechanical, D6 Process, future D8 I&C and justified D1-D3/D5 contexts, while preserving counterpart authority. Handoff content must not become counterpart engineering truth, acceptance must not equal counterpart validation/approval, and no counterpart object may be silently mutated, recalculated, revalidated or auto-repointed. D8 runtime remains zero and D9 reasoning remains zero. This closeout names that phase and does not start it.
