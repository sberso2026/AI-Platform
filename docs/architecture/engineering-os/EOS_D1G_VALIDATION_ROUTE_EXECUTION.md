# EOS-D1G validation route execution

## Scope

This record executes the machine-readable D1G route named by EOS-D1G-VALIDATION-ROUTE-CANONICALIZATION, under the development-first sequence. The purpose remains ingestion fidelity: a declared provider payload becomes D1F inputs with governed units, signs, identities, and fingerprints. It does not solve a structure, certify a solver, or establish code conformance.

The historical canonicalization snapshot stays NOT_EXECUTED. This execution record is the live technical status. Qualified structural review stays deferred until D1G, D1H, D1I, D1J, and D1K are complete and the review baseline is frozen.

## Subject revisions

Adapter blob 8c0b567e5b2e58423ce62b30f38bd82c85d78b63. Result-package blob 3e6a57d294f6d2c69718d30db124715a816e7113. SPACE GASS connector blob 89db7e6482cb2e2f0a4cfb620efeb552d0c358d8. Example package blob 0e2a12adc29a1332f4f94a8d057025d4aecd66d5. These blobs are the subjects that were executed. A later change to any of them does not inherit this record.

## Executed cases

Eight matrix rows were classified.

D1G.R1 adapter foundation: PASS. Frozen fixture axial 12.5 kN with declared sign -1 compares with canonical axial -12500 N. Support FZ_SUP stays 8.25 kN.

D1G.R2 package ingestion: PASS. The version 1 example package ingests as INGESTED and schema-valid. Its canonical axial matches the same independent statement. Package-declared authority is not applied.

D1G.R4 station force import: PASS. Frozen snapshot station Fx 12.5 kN at station 0, node A equal to 1, declared sign +1, compares with canonical station axial 12500 N.

D1G.R4 reaction force import: PASS. Frozen reactions RFX 1.5 kN, RFY 8.25 kN, and RFZ 0 kN match exactly. Reaction moments are absent.

D1G.R5 connector closeout: PASS as a reproducibility record. Two runs of the same snapshot produce the same native fingerprint and the same bundle fingerprint.

D1G live connectivity: NOT_APPLICABLE. The route marks a live session optional. None was run.

D1G.R4 reaction-moment import: NOT_APPLICABLE. The capability is out of scope and not implemented.

D1G.R4 solver execution: NOT_APPLICABLE. The connector does not run a solver.

Technical results form one partition: 5 PASS, 0 FAIL, 0 BLOCKED, 3 NOT_APPLICABLE. Those four technical classes sum to 8.

Human review is a second dimension. It is not a fifth mutually exclusive case result. Six rows require qualified human review, all six remain DEFERRED, and none are complete. Five of those six also have technical PASS. Adding the deferred count to the pass count double-counts those five rows. The historical engineering PASS rule still requires the qualified engineer. A technical PASS does not satisfy that rule.

Case ledger, with technical status first and human-review status second:

D1G.R1.EXTERNAL_SOLVER_ADAPTER_FOUNDATION. Subject adapter blob 8c0b567e5b2e58423ce62b30f38bd82c85d78b63. Technical EXECUTED and PASS. Human review required and DEFERRED, as a separate review obligation. Independent reference complete. Method evidence not required for this row. Reproducibility record not the required class. Applicability is the declared fixture member. Limitation: ingestion fidelity is not structural analysis.

D1G.R2.EXTERNAL_RESULT_PACKAGE_INGESTION. Subject result-package blob 3e6a57d294f6d2c69718d30db124715a816e7113. Technical EXECUTED and PASS. Human review required and DEFERRED. Method-implementation evidence complete. Independent comparison and the reproducibility record are not the required class for this row. Applicability is the version 1 package fixture. Limitation: ingestion is not engineering acceptance.

D1G.R4.SPACE_GASS_MEMBER_STATION_FORCE_IMPORT. Subject connector blob 89db7e6482cb2e2f0a4cfb620efeb552d0c358d8. Technical EXECUTED and PASS. Human review required and DEFERRED. Independent reference complete. Applicability is one station force at member start with node A as origin. Limitation: design axes are not implied, and the snapshot is not a commercial solver session.

D1G.R4.SPACE_GASS_SUPPORT_REACTION_FORCE_IMPORT. Same connector blob. Technical EXECUTED and PASS. Human review required and DEFERRED. Independent reference complete by exact identity of the frozen force components. Applicability is Fx, Fy, and Fz at the declared support node. Limitation: reaction moments are outside this capability.

D1G.R5.SPACE_GASS_CONNECTOR_CLOSEOUT. Same connector blob. Technical EXECUTED and PASS. Human review required and DEFERRED. Reproducibility record complete. This replay is not independent validation. Applicability is the exact frozen snapshot. Limitation: offline replay is not live connectivity.

D1G.LIVE_CONNECTIVITY. Same connector subject. Technical disposition NOT_APPLICABLE. No live session was run. Human review remains required and DEFERRED. The route marks the session optional, so the missing session is not a failed technical case.

D1G.R4.SPACE_GASS_REACTION_MOMENT_IMPORT. Technical disposition NOT_APPLICABLE. Human review is not required. The capability is not implemented.

D1G.R4.SPACE_GASS_SOLVER_EXECUTION. Technical disposition NOT_APPLICABLE. Human review is not required. The connector does not run a solver.

## Evidence classes

Used: INDEPENDENT_CALCULATION, METHOD_IMPLEMENTATION_EVIDENCE, REPRODUCIBILITY_RECORD.

Not used: LIVE_PROVIDER_SESSION, THIRD_PARTY_REFERENCE_OUTPUT, QUALIFIED_STRUCTURAL_ENGINEER_REVIEW.

The synthetic fixture and the example package are frozen repository literals. They are not relabelled as a commercial solver export.

## Independent reference

The independent statement does not call the adapter to produce the expected value. For a force in kilonewtons it is raw value times 1000 times the declared sign on the frozen mapping manifest. 1000 is the SI kilo prefix, stated before the comparison. The declared signs are data: fixture P_AX is -1, SPACE GASS Fx is +1.

EOS output compared only with EOS output is rejected. Replaying the connector to check fingerprints is a reproducibility record, not an independent structural validation.

## Analytical statement

Two arithmetic comparisons were recorded: fixture axial -12500 N and station axial 12500 N. Both matched. These are ingestion identities, not a closed-form beam solution and not a design resistance.

## Method evidence

R2 shows the documented version 1 package contract: schema accepted, raw 12.5 kN preserved, canonical conversion follows the same SI statement, ingestion status is not VERIFIED_GOVERNED by itself, and the package cannot appoint project, profile, or authority.

An implementation match is not engineering conformance.

## Reproducibility

Run identity D1G-ROUTE-EXECUTION-1. The same snapshot, mapping, and case map were executed twice. Native fingerprints matched and are 64 hex characters. Bundle fingerprints matched. Subject blobs are listed above.

## Tolerance

Numeric comparisons use exact equality. Absolute tolerance is 0. No relative band was introduced. The basis is the existing D1G rule that identity, sign, axis, and fingerprint checks are exact, plus the defined SI prefix. No tolerance was widened after a result.

## Applicability

R1 applies to the declared fixture member only. R2 applies to the version 1 package fixture. Station import applies to one station force at the member start with node A as origin. Reactions apply to Fx, Fy, and Fz at the declared support node. Replay applies to this exact snapshot revision. Live connectivity applies only when a governed live read exists. Reaction moments and solver execution are not applicable.

## Limitations

Adapter translation is not structural analysis. Ingestion is not engineering acceptance. Station import does not imply major or minor design axes. Reaction moments are outside the force-import capability. Offline replay is not independent validation and is not live connectivity. The synthetic snapshot is not a commercial solver session. No certified solver is claimed.

## Defects

No implementation defect was discovered by these comparisons. Runtime change count is 0. The execution record and its tests are evidence and test changes. No out-of-scope defect was opened. Reaction moments and solver execution remain pre-existing scope exclusions, not new defects.

## Deferred human review

Reviewer, outcome, finding, signature, and independent-human-calculation fields are unfilled. C10 qualified human review is not satisfied. D1F engineer review is not satisfied. D1G engineer validation is not satisfied. The review status remains DEFERRED_PENDING_DEVELOPMENT_BASELINE_FREEZE. The review is still required for D1 closeout. It is not waived, removed, or optional.

## Provider status

A live provider session is not required for this route and was not executed. No third-party reference output was claimed.

## Revision binding

Exact subject blobs are retained. A floating reference is not allowed. Historical references are not auto-repointed. A new revision does not inherit this validation, a later engineer review, or conformance.

## Boundaries

Validation pass is not engineering conformance. Implementation match is not engineering conformance. Standard selection is not engineering conformance. No certification and no regulatory approval are claimed. D1H, D1I, D1J, and D1K remain unsatisfied. The review baseline is not frozen. The structural pack is incomplete. EOS is not GA ready. D1K, D1L, D1N, and D2 through D9 stay closed. D9 remains COMPLETE_BOUNDED_WITH_LIMITATIONS. No schema change and no new dependency.

## Handoff

The next canonical phase is EOS-D1H-VALIDATION-EVIDENCE, type D1H_VALIDATION_EVIDENCE. D1G technical execution does not satisfy it. Counts after this record are 15 total, 9 completed, 6 remaining.
