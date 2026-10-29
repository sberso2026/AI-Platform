# EOS-D8-R7 Requirements, Assumptions, and Change Closeout

## Purpose

D8-R7 implements exactly one new Instrumentation and Control runtime: governed requirement, assumption, engineering-decision, change, supersession, and reassessment records. The live D8 runtime count is 7. The live requirements, assumptions, and change runtime count is 1. Requirements, assumptions, decisions, changes, and reassessments are records inside this one runtime. They are not separate substantive runtimes. The R1 identity runtime remains ready. The R2 measurement runtime remains ready. The R3 device runtime remains ready. The R4 signal, I/O, and loop runtime remains ready. The R5 control-system architecture runtime remains ready. The R6 safety, interlock, and shutdown runtime remains ready. Architecture runtime counts remain 0. D8-R7 does not mark the Instrumentation and Control discipline complete. D6 and D7 remain COMPLETE_BOUNDED_WITH_LIMITATIONS and are not reopened. D1 remains incomplete. D2 through D5 remain complete and are not reopened. D9 remains unstarted.

## Exact R1 through R6 reuse

R7 reads exact current R1 context and object revisions. A requirement, assumption, decision, change, or reassessment stores that object revision fingerprint. Floating revisions are rejected. A wrong fingerprint is rejected. When a change names an R2 measurement, R3 device, R4 signal, I/O record, or loop, R5 system or node, or R6 safety context, the dependency must match an existing current revision and fingerprint. R7 does not rewrite R1 objects, R2 measurements, R3 devices, R4 signals, I/O records, or loops, R5 systems or nodes, R6 safety contexts, their fingerprints, or their history. Superseding an R1 identity does not repoint an existing requirement, assumption, decision, or change fingerprint.

## Requirement source and adoption

A source requirement is recorded as a source. It is not an adopted D8 requirement. Recording a source does not create an adopted record and does not flip the source to adopted. Adoption is a separate explicit record. It cites the current source requirement, restates the same statement and source revision, and stores an adoption rationale and the human actor identifier. The adopted record does not satisfy a design and does not become engineering truth by itself. A basisless authoritative requirement is rejected. Requirement category and open status reuse the canonical information-requirement vocabulary. Acceptance for purpose and approval statuses are rejected in this runtime.

## Requirement authority

Adoption authority is the human Instrumentation and Control context actor. The actor identifier is stored on the adopted record. AI is not adoption authority and cannot adopt a requirement. Admin is not adoption authority and cannot promote a requirement to engineering truth without that authority. The canonical information-requirement boundary still forbids engineering approval.

## Upstream requirement boundaries

R7 may preserve an exact D4 Mechanical, D5 Piping, D6 Process, or D7 Electrical source requirement when the caller supplies the source identifier and exact revision fingerprint and that pair is in the supplied revision registry for the same tenant. Those records stay unadopted. A D4 mechanical requirement is not an adopted D8 requirement. A D5 piping requirement is not an adopted D8 requirement. A D6 process requirement is not an adopted D8 requirement. A D7 electrical requirement is not an adopted D8 requirement. A D6 process measurement requirement is not a validated D8 instrument. A D6 control requirement is not a validated D8 control system. A D6 trip or shutdown intent is not D8 control-logic design. D6 process safety intent is not functional-safety validation. A D7 power requirement is not D8 control-system design. D7 trip context is not D8 control-logic design. D7 protection context is not D8 SIS implementation. Citing a source does not transfer discipline authority and does not mutate the upstream record.

## Assumption governance

R7 reuses canonical assumption validation status and materiality checks. The only accepted validation status is unvalidated. An assumption is not a validated fact and is not approved engineering. Assumption authority is the human context actor and is stored. AI cannot create an authoritative assumption. Admin cannot create an authoritative assumption without context authority. Applicability and limitations are required, and applicability names the cited object. An assumption is not propagated outside that applicability.

## Decision governance

R7 reuses the canonical single-selected-alternative check and the canonical supersession-pair check. A decision requires alternatives and exactly one selected alternative. An AI recommendation is not an engineering decision and is rejected. A decision is not approval, validation, or conformance. Decision authority is the human context actor and is stored. Decision basis and provenance are required. AI is not decision authority and cannot approve a decision. Admin is not decision authority and cannot promote a decision to approval.

## Change governance

A change records the changed subject, the exact prior revision, the exact current revision, the change reason, source basis, authority, provenance, applicability, limitations, explicit dependencies, and supersession through an explicit predecessor. A change is not automatic redesign, reconfiguration, recalculation, or revalidation. Those flags stay false on the record.

## No-automatic-engineering matrix

A change does not reselect or resize an instrument, change an instrument range, or change a setpoint. It does not rewrite a signal relationship, reallocate I/O, or reassign an I/O channel. It does not rebuild or retune a control loop. It does not reconfigure DCS, PLC, SIS, SCADA, or RTU, reassign a controller, or reconfigure a network. It does not rewrite control logic, interlock logic, trip logic, or shutdown logic. It does not rationalize an alarm or change an alarm priority. It does not recalculate or reverify SIL, calculate PFD or PFH, redesign a SIF, or revalidate functional safety. Requests that ask for those consequences are rejected before a record is written.

## Supersession

Supersession is an explicit predecessor relationship. Inferred supersession is rejected. The superseded record remains in history with its original subject revision fingerprint. Superseded is not invalid. A later revision does not silently redirect historical requirements, assumptions, decisions, changes, handoffs, reviews, or evidence.

## Explicit dependencies

A change requires at least one explicit dependency. The dependency names a target kind, target identifier, and exact current fingerprint. Allowed targets are current R1 objects, R2 measurements, R3 devices, R4 signals, I/O records, and loops, R5 systems and nodes, R6 safety contexts, and current R7 requirements, assumptions, and decisions. Dependency is not inferred from matching tags, similar descriptions, a common process variable, the same loop, the same system, document proximity, drawing proximity, or AI semantic similarity.

## Reassessment

Reassessment is recorded only against a current change whose explicit dependencies include the exact target. The states are reassessment required and reassessment completed. Reassessment required is not validation failed and is not design invalid. Reassessment completed is not validated, approved, or conformant. Closing a reassessment as validated is rejected. Reassessment does not perform an engineering calculation, redesign, reconfiguration, or revalidation. Similarity does not trigger reassessment.

## R6 safety-context reassessment

A change may name an exact current R6 alarm, interlock, trip, shutdown, or other safety context as an explicit dependency and may then record reassessment required for that same revision. That mark does not rewrite the R6 record. Reassessment required is not an invalid alarm, an invalid SIF, or a failed SIL. The R6 alarm remains unrationalized, the SIF remains unvalidated, and the SIL remains unverified.

## No SIL, PFD, PFH, logic, or sizing automation

SIL calculation, SIL verification, and functional-safety validation remain 0. R7 does not calculate SIL, verify SIL, calculate PFD or PFH, or validate functional safety. Control-logic design and automatic control-logic generation remain 0. R7 does not generate or modify control logic or safety logic. Control-loop tuning remains 0. Instrument sizing, instrument selection, control-valve sizing, and actuator sizing remain 0.

## No upstream or counterpart mutation

R7 does not mutate R1 identity, R2 measurement and tag context, R3 instrument and device context, R4 signal, I/O, and loop context, R5 control-system context, or R6 safety context. R7 does not mutate D1 Structural, D2 Civil, D3 Geotechnical, D4 Mechanical, D5 Piping, D6 Process, or D7 Electrical records. Instrumentation and Control is not the authority of those disciplines.

## Currentness, thread, fingerprint, lineage, and history

R7 reuses canonical currentness, the canonical digital thread, and the canonical fingerprint. No parallel currentness engine, digital thread, or second fingerprint algorithm is created. Current is not validated. Stale and superseded are not invalid. A change may mark currentness only for an explicit dependency, as stale or reassessment required. An unrelated record is not marked stale, and the mark does not rewrite the target record or expose it as validated current. Lineage is an explicit predecessor. Replay of the same fingerprint returns the existing record. A fingerprint mismatch is rejected and is not repaired. Historical subject fingerprints are preserved. Silent mutation and historical auto-repoint are rejected.

## Source, provenance, applicability, and scope

Requirements, assumptions, decisions, changes, and reassessments require traceable provenance and source basis. Applicability and limitations are required, and applicability names the cited object. Records are not propagated outside that applicability. Tenant, workspace, and project scope are enforced. Cross-tenant access is rejected.

## Authority matrix

Instrumentation and Control is not Structural, Civil, Geotechnical, Mechanical, Piping, Process, or Electrical authority. AI and admin are not I&C engineering authority. AI cannot adopt a requirement, create an authoritative assumption, make an authoritative engineering decision, approve a decision, or close reassessment as validated. Admin cannot promote a requirement to engineering truth without authority and cannot promote a decision to approval. Duplicate, replay, and spoofing protections cover requirement revisions, assumptions, decisions, changes, supersession, dependencies, reassessment, source basis, authority, provenance, scope, fingerprint, and historical repoint.

## R8 through R11 and other zero states

Discipline interface runtime remains 0. Review and validation remains 0. Dedicated currentness runtime remains 0. D9 source-contract runtime and D9 integration remain 0. Automatic engineering validation, conformance determination, approval, and certification remain 0. D9 remains unstarted. Cross-discipline reasoning, conflict detection, conflict resolution, and recommendation remain 0. Automatic I&C design and redesign remain 0. The canonical D8 milestone count remains 13.

## Security and release posture

Engineering OS typecheck passed. Types typecheck passed. Web app typecheck passed. Web pilot typecheck passed. Release-governance typecheck passed. Pilot scoped typecheck passed with the known isolated debt pattern: PILOT_SCOPED_TYPECHECK_PASS true, GLOBAL_TYPECHECK_DEBT_ISOLATED true, FULL_WEB_TYPECHECK_PASS false, IGNORE_BUILD_ERRORS_REQUIRED true, WEB_TSC_ERROR_COUNT 0, ISOLATED_DEBT_ERROR_COUNT 0. The Engineering OS suite passed 376 files and 1879 tests. Web lint passed with pre-existing warnings. The raw security suite failed only on packages/engineering-review/src/migration.test.ts and packages/engineering-review-persistence/src/boundary.test.ts, both the established EOS-A16D import in eos-a16d-generic-binary-retrieval.test.ts. Review results are 1 failed and 21 passed files, 1 failed, 123 passed, and 1 skipped test. Persistence results are 1 failed and 10 passed files, 1 failed and 33 passed tests. Integration tests passed, 2 tests. Hosted RLS passed with 2 tests and 1 skipped. Failure count is 2 and root cause count is 1. The baseline fingerprint is unchanged. Secret scan passed with 618 files and 0 findings. Dependency audit is critical 0, high 0, moderate 1, advisory GHSA-w5hq-g745-h8pq on uuid through exceljs@4.4.0. Release governance tests passed at 192, and the ledger returned ok. No schema change. No new dependency.

## Known limitations

R7 records source requirements, explicit adopted requirements, unvalidated assumptions, engineering decisions with one selected alternative, changes with explicit dependencies, explicit supersession, and reassessment required or completed. A change identifies what may need human engineering reassessment. It does not itself become redesign, reconfiguration, recalculation, SIL verification, logic modification, functional-safety revalidation, counterpart-discipline mutation, approval, or certification. Later phases remain named and unstarted.

## Next phase

The next phase is EOS-D8-R8-DISCIPLINE-INTERFACES-AND-HANDOFFS, type DISCIPLINE_INTERFACES_AND_HANDOFFS. Its scope is to implement governed D8 discipline interfaces and handoffs using exact D8 R1 through R7 revisions and exact counterpart discipline revisions. Support bounded handoffs with D6 Process and D7 Electrical, and justified bounded contexts with D4 Mechanical, D5 Piping, D1 Structural, D2 Civil, and D3 Geotechnical. Preserve handoff content distinct from counterpart engineering truth, handoff completion distinct from counterpart validation, handoff acceptance distinct from counterpart approval, a D8 requirement distinct from a counterpart adopted requirement, and D8 validation state distinct from counterpart validation state. Require explicit counterpart revisions and explicit interface dependencies. Do not infer counterpart relationships, transfer engineering authority, mutate counterpart records, validate counterpart engineering, start D9 reasoning, or auto-propagate changes into counterpart disciplines. This closeout names that phase and does not start it.
