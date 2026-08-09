# SPACE GASS Implementation Notes (Phase 13C)

Version: **0.3.0-spacegass**

## Bounded method selection — `linear_elastic_static`

**Selected method:** `linear_elastic_static`

### Rationale

1. Aligns with Digital Twin V1’s certified CalculiX capability class, keeping the
   first external structural solver method in the same engineering envelope.
2. Matches common SPACE GASS project workflows (linear-static member/frame analysis)
   without claiming nonlinear, modal, or dynamic methods.
3. Keeps four-layer qualification narrowly scoped: method → provider → application
   → execution (fail-closed / negative benchmarks).

Other methods (`nonlinear_static`, `modal`, `dynamic_response`) remain
**reserved** or **unavailable** in the capability registry.

## Qualification vs hosted certification

| Claim | Value |
| --- | --- |
| Adapter contract + mappers + fail-closed path qualified | true |
| Four-layer qualification records active for selected method | true |
| `spaceGassHostedExecutionCertified` | **false** |

Fixture dry-runs and negative benchmarks qualify the adapter gates. They do **not**
certify a live SPACE GASS binary execution in CI (none is present in-repo).

## Federation fixture

`packages/engineering-model-interoperability/fixtures/spacegass/sample-project.spacegass.json`

Represents export metadata: nodes, members, plates, supports, sections, materials,
member groups, and existing results. Legitimate for federation; not a live `.sgg`
binary parse.

## Fail-closed execution

`SPACEGASSSolverAdapter` probes `SPACEGASS_HOME` / `SPACEGASS_API` /
`SPACEGASS_EXECUTABLE`. When unavailable → `solver_unavailable` /
`license_unavailable`. Never falls back to CalculiX or fixture success
(`silentSolverFallbackAllowed=false`).

## Project policy

Execution requires `projectApprovedProviders` to include `spacegass`; otherwise
**abstain** (`project_not_approved`).
