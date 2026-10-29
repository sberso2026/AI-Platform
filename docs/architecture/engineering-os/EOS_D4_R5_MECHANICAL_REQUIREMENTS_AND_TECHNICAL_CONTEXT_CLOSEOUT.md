# EOS-D4-R5 Mechanical Requirements and Technical Context Closeout

## Purpose

R5 governs what Mechanical technical requirements and criteria apply to equipment, together with their basis, authority, and limitations. It does not calculate the design, silently adopt vendor claims, resolve engineering discrepancies, or claim conformance because a requirement or standard is recorded.

R1 remains the identity runtime at count one. R2 remains the equipment and system context runtime at count two. R3 remains the design-condition and performance context runtime at count three. R4 remains the vendor-data and evidence runtime at count four. R5 is the fifth Mechanical runtime and the one technical-requirements and technical-context runtime. Requirement categories are not separate runtimes. D4-0 architecture runtime flags stay at their historical zero. D1 structural pack complete remains no. D1N stays closed. Civil and Geotechnical remain complete and are not reopened.

## Exact R1-R4 reuse

Every R5 record names an R1 context, an R1 object, that object's exact revision fingerprint, an R2 subject and revision fingerprint, an R3 record and revision fingerprint, and an R4 record and revision fingerprint. Each upstream record must already be bound to the same object revision. Floating references such as latest or current are rejected. A fingerprint mismatch is rejected. Recording a requirement does not rewrite R1, R2, R3, or R4, and does not repoint a historical requirement onto a newer source.

## Mechanical technical requirements

A governed record stores the exact subject, the requirement statement, source and basis, authority, applicability, limitations, revision, provenance, currentness, and history. Supported subjects include equipment requirements, materials and construction, design life, mechanical rating criteria, fabrication, coating and protection where Mechanical-owned, inspection and testing, quality criteria, allowable equipment-specific criteria, project Mechanical specification requirements, code and standard references, and package Mechanical requirements. A source requirement and a vendor requirement remain distinct from an adopted Mechanical requirement.

## Technical context

Technical context may record construction or material category, equipment mechanical configuration, service-specific mechanical constraints, design-code applicability, fabrication or manufacturing constraints, inspection and testing criteria, equipment-specific allowable criteria, mechanical environmental constraints, and supplied technical limitations. Technical context is not a calculated design, not engineering validation, and not approval.

## Source and basis

An authoritative or adopted record requires a traceable basis. Allowed bases are a project specification, a client requirement, a Mechanical design basis, an exact R3 design or performance record, exact R4 vendor evidence, an applicable code or standard reference, authorized engineering input, a governed assumption only when that assumption is already explicitly established, or another D4-0 approved source. A basisless authoritative record is rejected.

## Source and vendor adoption boundary

A source requirement is not an adopted Mechanical requirement. A vendor requirement is not an adopted Mechanical requirement. Neither is adopted automatically. Adoption is a separate record with an explicit rationale and a proper Mechanical context authority. AI, admin, and the vendor party cannot invent an authoritative requirement or promote a candidate, a source, or vendor data into engineering truth. A candidate stays non-authoritative.

## Code and standard boundary

An applicable Mechanical code or standard may be recorded when it is explicitly supplied or adopted. Recording the reference does not determine conformance and does not certify the equipment. Conformance determination is rejected.

## Material and construction context

Equipment-specific material and construction context may be recorded where Mechanical owns it. That context is not a material-selection calculation and is not a validated material selection. Metallurgy, corrosion calculation, and fabricated material properties are rejected.

## Inspection and testing requirements

An inspection or test requirement may be recorded. The requirement does not mean the inspection was completed or the test passed. R4 vendor test evidence remains evidence. It does not automatically satisfy the requirement.

## R3 and R4 preservation

R5 may cite an exact R3 design or performance record and an exact R4 vendor-evidence record. It does not revise, recalculate, or rewrite those records. Vendor evidence is not an adopted requirement and is not engineering validation.

## Vendor and engineering discrepancy

When a cited vendor value and the requirement value differ, both exact records remain and the relationship is stored as unresolved. R5 does not decide which value is correct, does not let the vendor value override engineering, and does not let the engineering value override the vendor. Change and decision governance remain later. Review and validation remain later.

## Applicability and limitations

Every record states the equipment, package, service, or operating case it applies to, and states its limitations. A requirement for one subject is not propagated to another. A broad applicability such as all, global, every, or unspecified is rejected.

## Calculation prohibition

Equipment sizing, rotating and static equipment calculation, thermal-mechanical calculation, mechanical load calculation, vibration analysis, fatigue analysis, and design optimization remain at count zero. A formula or hidden calculation inside a requirement statement or value is rejected. Units on numeric values are stored as supplied and are not converted.

## R6, R7, R8, and R9 boundaries

Maintainability, access, and package runtime remain at count zero. R5 may record a supplied technical requirement that could later affect maintenance. It does not analyze access or implement package-access runtime. Broader requirement governance, assumptions, decisions, supersession change, and reassessment relationships remain at count zero, and change propagation remains at count zero. Discipline interfaces remain at count zero. An equipment-specific interface criterion may be stored as Mechanical context only. Review, validation, conformance, approval, and certification remain at count zero. A recorded requirement, technical context, or code reference is not validation or conformance.

## Currentness, provenance, fingerprint, and history

Currentness and fingerprints reuse the canonical mechanisms. No parallel currentness engine and no second fingerprint algorithm are created. Provenance is required and preserved. Replay of the same record and fingerprint returns the existing record. A conflicting replay is rejected. A duplicate current subject, statement, source revision, and applicability is rejected. Supersession marks the predecessor superseded and leaves its statement, source revision, and fingerprint unchanged. A changed source does not rewrite the requirement, rewrite history, or revalidate engineering. Tenant, workspace, and project must match the recorder. A stale upstream revision cannot be cited as current. Silent mutation and automatic repointing are rejected.

## Integrity and discipline boundaries

Duplicate requirements, replay, wrong equipment revision, stale source revision, source or basis spoofing, authority spoofing, code or standard spoofing, unit or value spoofing, cross-project and cross-tenant reference, provenance spoofing, fingerprint mismatch, and historical auto-repointing are rejected. Mechanical requirements do not become Structural, Civil, Geotechnical, Piping, Process, Electrical, or Instrumentation and Control requirements. Cross-discipline reasoning, conflict detection, and conflict resolution remain at count zero. D5 through D9 remain unstarted. No schema change. No new dependency. Maintainability, requirements and change, interfaces, review, the currentness thread, and the D9 source contract remain not ready.

## Evidence

Engineering OS typecheck passed. The Engineering OS suite passed 322 files and 1825 tests. Web typecheck passed. Types typecheck passed. Pilot scoped typecheck passed with the known isolated debt pattern and zero web tsc errors. Web lint passed with pre-existing warnings. Integration tests in the engineering-review suite passed, 2 tests. The raw security suite failed only on packages/engineering-review/src/migration.test.ts and packages/engineering-review-persistence/src/boundary.test.ts, both the established EOS-A16D import. Failure count is 2 and root cause count is 1. RLS guard tests passed. Secret scan passed with 618 files and 0 findings. Dependency audit is critical 0, high 0, moderate 1, advisory GHSA-w5hq-g745-h8pq on uuid through exceljs. Release governance typecheck passed, tests passed at 138, and the ledger returned ok.

## Next phase

The next phase is EOS-D4-R6-MAINTAINABILITY-ACCESS-AND-PACKAGE-CONTEXT, type MAINTAINABILITY_ACCESS_AND_PACKAGE_CONTEXT. It implements governed Mechanical maintainability, service-access, lifting and removal-space, and package-context records using exact R1 through R5 references. It records supplied or adopted maintenance envelopes, access constraints, lifting and removal requirements, package boundaries, and Mechanical arrangement constraints. It does not perform spatial clash detection, multidisciplinary optimization, structural lifting design, equipment calculations, discipline interfaces, review or validation, or D5 through D9 runtime. This closeout does not start that phase.
