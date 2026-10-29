# EOS-D1E-EU-C10-R2 Method and Member Benchmarks

Independent benchmark execution for the bounded Eurocode concrete methods and member orchestrators. A passing benchmark is numerical evidence. It is not engineer validation, national-profile validation, formal conformance, or certification.

## Independence

Countable evidence is LEVEL_1 or stronger and does not take its expected value from the production evaluator.

- LEVEL_0 self-reference is not independent.
- LEVEL_1 is an independent closed-form derivation owned by the evidence module.
- LEVEL_2 is a published numeric anchor.
- LEVEL_3 external software and LEVEL_4 multi-source comparison were not available.
- Model-generated expected values are not accepted.
- Expected values are not rewritten from production output.
- A failed comparison is recorded as FAIL. Tolerance is not widened to force a pass.

## Classification correction

A profile parameter, an explicit engineering input, and a designer-selected parameter are not automatically nationally determined parameters.

- Genuine NDP candidates, not nationally validated: C5 `CRd,c` and `v,min` coefficient, and the C8 spacing bar-diameter coefficient and aggregate allowance when they are explicit NDP inputs.
- Profile-parameter candidates: C6 balance and beta coefficients, C7 reference-profile coefficients, C8 absolute minimum cover, C8 anchorage diameter divisor.
- Explicit inputs: C6 `phiEf`, effective length, and end moments; C8 basic-anchorage stress and bond stress. `phiEf` is not an NDP.
- Designer-selected: C6 `c` inside the governed bounds 8 to 10. `c` is not an NDP.
- `gamma_c` and `gamma_s` remain explicit declared partial-factor inputs. Their national status is deferred to C10-R4.

C5 benchmarks that use `CRd,c = 0.12` and `v,min` coefficient `0.035` are labelled `PROFILE_VALUE_ASSUMED_FOR_REFERENCE_BENCHMARK`.

## Executed inventory

| Capability | Result | Independence | Notes |
| --- | --- | --- | --- |
| C2 flexure | PASS | LEVEL_1 | Equivalent-rectangle hand derivation versus fiber integration. Difference classified, not averaged. |
| C3 uniaxial N-M | PASS | LEVEL_1 | Explicit zero-axial target. Pure axial routing requires a declared axis. |
| C4 P-M-M | PASS | LEVEL_1 | Diagonal section vertex. Not member stability. |
| C5 shear | PASS | LEVEL_2 | Published 47800 N and 62517 N anchors. |
| C5 punching | PASS | LEVEL_2 | Interior 0.67 MPa and 4060 mm perimeter. Edge remains unsupported. |
| C5 torsion | PASS | LEVEL_1 | Rectangular closed form. No general interaction. |
| C6 nominal curvature | PASS | LEVEL_1 | Closed form from profile parameters. Intermediate curvature, creep, length, and C6-to-C3 handoff inputs checked. |
| C7 crack width | BLOCKED_INDEPENDENCE | none | One repository recovery. Single governed source remains. |
| C7 explicit long-term | BLOCKED_INDEPENDENCE | none | Explicit phi and shrinkage only. No calculated creep or shrinkage. |
| C8 cover | BLOCKED_INDEPENDENCE | none | Not durability design and not provided-cover compliance. |
| C8 spacing | BLOCKED_INDEPENDENCE | none | Equal-diameter scope is not expanded. |
| C8 basic anchorage | BLOCKED_INDEPENDENCE | none | Not design anchorage, compression anchorage, or laps. |

## Orchestrators

Routing and aggregation are checked against the published contract. Expected states are contract literals. Orchestrator output is not used to mint those states. Routing equivalence does not prove the underlying formula.

| Member | Routing | Underlying methods | End to end |
| --- | --- | --- | --- |
| Beam | PASS | Partial. C2 is LEVEL_1. C7 and C8 stay blocked. | NO |
| Column | PASS | C3, C4, and C6 are LEVEL_1. C6 output is not sent to C4. | NO |
| Solid slab | PASS | Supplied strip routes to C2. Orthogonal moments are not C4. | NO |
| Wall section | PASS | Pure flexure can route to C2. Shear, second order, boundary elements, and seismic scopes do not execute. | NO |

The C6-to-C3 handoff checks the independently computed total moment, the single compression-to-tension sign change, and the C3 axial and moment inputs. It does not call the column orchestrator to create the expected chain.

## Tolerance, units, boundaries, and fingerprints

Tolerance classes reused from C10-R1: exact algebraic, floating-point algebraic, iterative equilibrium, interaction surface, engineering rounding, and external comparison. No single global percentage is used.

Unit checks cover newton-metres for flexure and torsion, newtons for shear, megapascals for punching stress, and millimetre versus metre eccentricity for C6.

Boundary and fail-closed checks cover unsupported geometry, missing partial factors, a generation mismatch, an edge punching request, a non-rectangular torsion section, a C6 curvature factor outside 8 to 10, and the absence of inferred effective length.

Each executed record stores method identity, formula fingerprint, parameter fingerprint, inputs, expected values, tolerance, result, and limitations. A changed formula fingerprint invalidates a passing record. Stale profile versions are rejected. Stale evidence is not reused.

## Ledger and review pack

The repository ledger is `packages/engineering-os/src/structural-concrete/eu-c10/benchmarks.ts`. It has 16 records: 11 passing and 5 blocked. No database schema change is required.

C10-R3 can review the passing LEVEL_1 and LEVEL_2 records and the explicit blocked C7 and C8 records. An engineer may later add an independent calculation as a separate artifact. That review does not by itself validate a national profile or formal conformance.

Remaining debt includes engineer validation, national-profile validation, NDP validation, formal conformance, and independent evidence for C7 and C8. Deferred member capabilities stay deferred.
