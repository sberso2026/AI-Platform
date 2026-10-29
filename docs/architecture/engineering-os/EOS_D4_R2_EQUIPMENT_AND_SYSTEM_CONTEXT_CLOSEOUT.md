# EOS-D4-R2 Equipment and System Context Closeout

## Purpose

R2 records what a Mechanical equipment identity or system identity represents. It classifies the identity, states a descriptive service or function, and records explicit system or package membership. It does not state design pressure, performance, vendor data, or engineering adequacy.

R1 remains the identity runtime at count one. R2 is the second Mechanical runtime. D4-0 architecture runtime flags stay at their historical zero. D1 structural pack complete remains no. D1N stays closed. Civil and Geotechnical remain complete and are not reopened.

## Exact R1 identity reuse

Every R2 record names an R1 context, an R1 object, and that object's exact revision fingerprint. A floating reference such as latest is rejected. A fingerprint that does not match the named revision is rejected. Superseding the R1 object does not rewrite an existing R2 record onto the new revision. Repointing is rejected.

## Equipment classification

Classification uses the D4-0 category allowlist: rotating categories such as pump, compressor, fan or blower, turbine, motor mechanical context, and other rotating machinery; static categories such as vessel, tank, heat exchanger, separator, mechanical skid, and packaged static equipment; package categories; and other Mechanical categories for HVAC where the project assigns it, materials handling, and lifting or mechanical handling. A freeform or unknown classification is rejected. A category that does not match the R1 object type is rejected. Classification does not establish design adequacy. Motor mechanical context does not transfer electrical authority to D7.

## Service and function

A governed service or function may be pumping, compression, ventilation, heat transfer, storage, separation, lifting, material handling, a packaged utility function, or another allowlisted Mechanical function. That statement is not a Process design basis and is not validated Mechanical performance.

## System and package membership

Membership is explicit. An equipment identity may belong to a Mechanical system identity or a Mechanical package identity. A component identity may belong to equipment or a package. Shared tags, proximity, document co-occurrence, and similarity do not create membership. Duplicate current membership of the same identities and revisions is rejected.

## Descriptive context boundary

A description, role, orientation category, and operating-context sentence may be stored. The record is not a design condition, performance record, vendor record, or validated engineering. Structured design pressure, flow, capacity, speed, power, vendor curves, certified weights, center of gravity, and nozzle data are rejected.

## Discipline boundaries

D4 does not equal D1, D2, D3, D5, D6, D7, or D8 authority. Process design basis, piping design, electrical design, and control philosophy are rejected. No Structural, Civil, or Geotechnical engineering content is recorded. No discipline handoff runtime is started.

## Currentness, provenance, fingerprint, and history

Currentness and fingerprints reuse the canonical mechanisms. Provenance is required. Replay of the same record and fingerprint returns the existing record. A conflicting record is rejected. Supersession marks the predecessor superseded, appends history, and leaves the predecessor fingerprint and the original R1 revision fingerprint unchanged. Tenant, workspace, and project must match the recorder. Maturity is cited and is not advanced automatically. AI and admin are not Mechanical engineering authority.

## Runtime state

Runtime count is two. Design conditions, performance, vendor data, mechanical requirements, maintainability, discipline interfaces, review and validation, the dedicated currentness thread, the D9 source contract, sizing, calculations, vibration analysis, fatigue analysis, design optimization, approval, certification, and cross-discipline reasoning remain zero. D5 through D9 remain unstarted. No schema change. No new dependency.

## Evidence

Engineering OS typecheck passed. The Engineering OS suite passed 319 files and 1822 tests. Web typecheck passed. Pilot scoped typecheck passed with the known isolated debt pattern and zero web tsc errors. Web lint passed with pre-existing warnings. Integration tests in the engineering-review suite passed. The raw security suite failed only on packages/engineering-review/src/migration.test.ts and packages/engineering-review-persistence/src/boundary.test.ts, both the established EOS-A16D import. Failure count is 2 and root cause count is 1. RLS guard tests passed. Secret scan passed with 618 files and 0 findings. Dependency audit is critical 0, high 0, moderate 1, advisory GHSA-w5hq-g745-h8pq on uuid through exceljs. Release governance typecheck passed, tests passed at 135, and the ledger returned ok.

## Next phase

The next phase is EOS-D4-R3-DESIGN-CONDITIONS-AND-PERFORMANCE-CONTEXT, type DESIGN_CONDITIONS_AND_PERFORMANCE_CONTEXT. It records governed design-condition and performance context on exact R1 and R2 identities, and it keeps source requirements, Process conditions, Mechanical design conditions, performance data, and validated engineering distinct. It does not size equipment, ingest vendor data, calculate, open discipline interfaces, review or validate, or start D5 through D9. This closeout does not start that phase.
