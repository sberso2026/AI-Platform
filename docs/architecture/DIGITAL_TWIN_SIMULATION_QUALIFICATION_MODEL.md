# Digital Twin — Simulation Qualification Model (Four-Layer Lock)

Status: simulation_assurance · Version: `0.8.0-simulation-assurance` · Phase: `12H`

## Terminology lock (critical)

| Term | Meaning | Does NOT mean |
| --- | --- | --- |
| **registered** | Method or provider appears in a Twin registry | Qualified, approved, or executable under assurance |
| **qualified** | A governed qualification record exists for a layer | Application-qualified, execution-qualified, or engineering-approved |
| **application-qualified** | Method+Provider permitted for a declared application context | Universally valid or engineering-approved |
| **execution-qualified** | A specific run meets all layer + pin + validation + review gates | Engineering approval or universal accuracy |
| **engineering-approved** | Human engineering acceptance (separate review) | Automatic consequence of any qualification layer |
| **successful run** | Orchestrator completed without error | Validated, accurate, or approved |
| **validated** | Technical validation state recorded | Universally accurate or engineering-approved |

**Lock:** `registered ≠ qualified ≠ application-qualified ≠ execution-qualified ≠ engineering-approved`  
**Lock:** `successful run ≠ validated ≠ universally accurate`

## Four layers

1. **SimulationMethodQualification** — versioned method-layer qualification (`draft` → `superseded`). Fixture qualification proves framework only.
2. **SimulationProviderQualification** — method-specific provider qualification. Does **not** auto-inherit across all methods.
3. **SimulationApplicationQualification** — context-bounded Method+Provider permission for a declared application.
4. **SimulationExecutionQualification** — issued only when all layers + pins + units + immutable input + successful run + validation + human review are satisfied. Statuses `not_qualified` → `superseded`. **No auto engineering approval.**

## Eligibility outcomes (fail-closed)

`eligible` · `conditionally_eligible` · `not_eligible` · `insufficient_evidence` · `qualification_expired` · `qualification_revoked` · `unknown`

Every outcome carries explicit reasons. Unknown evidence → `insufficient_evidence` or `unknown`, never silent pass.

## Expiry / revocation

Qualifications carry `effectiveFrom` / `effectiveTo`, `suspendedAt`, `revokedAt`, `supersededBy`. Historic records remain traceable. Validity is evaluated **at execution time**.

## Simulation package

`TwinSimulationPackage` + `simulation-package-manifest.json` domain object + integrity (hash mismatch detection) + method-specific completeness policy from Method Qualification required artifact classes. Platform Files refs only — no large binaries in Twin tables.

## External solvers

External engineering solver adapter contracts are **reserved stubs only**.  
`externalEngineeringSolverAdaptersImplemented = false` · `nativeEngineeringSolverImplemented = false`.
