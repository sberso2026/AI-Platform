# EOS-D1D-AU-1 Australian Steel Tension

Bounded Australian steel **tension-member** capability on the D1D-0 common steel framework. Intended standard profile is AS 4100. This phase does **not** certify AS 4100 conformance and does not reproduce standard text.

Structural maturity remains `REFERENCE_PARTIALLY_IMPLEMENTED`. AU steel pack remains **not certified**.

## AU-1 scope

Implemented:

- nominal gross-yield tension resistance
- nominal net-fracture tension resistance
- deterministic governing selection (`min` of applicable results)
- simple tensile utilization `demand / governing capacity` where dimensionally valid

Explicitly unsupported:

- compression / member buckling
- bending / LTB
- shear
- combined actions
- connections
- capacity-reduction / resistance factors and other unconfirmed code coefficients

## Engineering-rule authority

Each method is an explicit engineering rule (`SteelEngineeringRule`). Allowed authorities are established mechanics, validated references, human-authored validated rules, certified external tool references, or other governed sources.

LLM memory, unsourced web summaries, blogs, forums, and unverified generated rules are rejected.

AU-1 methods use `ESTABLISHED_ENGINEERING_MECHANICS`:

- nominal yield force = yield stress × explicit gross area
- nominal fracture force = tensile strength × explicit net area

These are mechanics identities. They are **intended** for the AS 4100 Australian steel profile. They are **not** claimed as verified clause-for-clause AS 4100 design capacities.

## Intended AS 4100 profile vs conformance

| Field | AU-1 state |
| --- | --- |
| Jurisdiction | Australia |
| Standard family / code | AS / AS 4100 |
| Edition | `UNKNOWN_PENDING_CONFIRMATION` unless an engineer supplies a confirmed edition |
| Amendment | `UNKNOWN_PENDING_CONFIRMATION` unless confirmed |
| National Annex | `NOT_APPLICABLE` |
| Standard conformance | `INTENDED_PROFILE` |
| Binding | `IMPLEMENTED_UNVERIFIED_STANDARD_BINDING` |

Silent edition inference is forbidden. Later engineer confirmation can attach edition, amendment, and reference identifiers without rewriting the global steel core.

## Implemented methods

| methodId | Inputs | Output | Units | Maturity |
| --- | --- | --- | --- | --- |
| `AU_TENSION_GROSS_YIELD` | `fy`, `Ag` | `NOMINAL_GROSS_YIELD` | N | BENCHMARKED |
| `AU_TENSION_NET_FRACTURE` | `fu`, `An` | `NOMINAL_NET_FRACTURE` | N | BENCHMARKED |

Governing capacity is the lesser applicable result. Both results are preserved.

## Material and section inputs

Governed, provenanced, explicit:

- yield strength, ultimate strength, grade
- gross area, net area, section family, catalog source

Missing values fail closed. AUST300 may identify an AU catalog section; it does not invent `Ag`/`An`. Net area is never inferred from designation or set equal to gross area silently.

## Demand / capacity

D1C governed axial demand is consumed (`demandRef`, combination, units, sign convention, provenance). The AU adapter does not recalculate structural demand. Canonical internal force unit is newton. Tension-positive axial values are used for utilization.

## Capacity output

Each check records member/section/material refs, capacity type and value, units, engineering rule, method, intended standard profile, technical basis, tool/version, validation state, conformance state, and provenance. `llmOriginated` is always false.

Utilization ≤ 1 is `CHECK_SATISFIED`, not approval. Human review remains required. Automatic engineering approval is forbidden.

## Benchmarks

Independent hand calculations (N/mm² × mm² = N):

- 300 × 5140 = 1 542 000 N (gross yield)
- 440 × 4500 = 1 980 000 N (net fracture)

Tolerance reuses D1C `ENGINEERING_NUMERICAL_TOLERANCE`. Implementation is not used as its own expected-value generator.

## Fail-closed

Missing demand, material, geometry, provenance, incompatible units, unsupported section type, unsupported scope, unknown code parameter, standard-profile mismatch, and certified claims for unvalidated methods all fail closed. No guessed φ, ktu, or other code factors.

## AI boundary

AI may suggest checks, explain results, identify missing inputs, and propose candidate sections. AI may not originate capacity, invent properties or coefficients, approve design, or certify AS 4100 conformance. Optimizer candidates must be re-run through this same deterministic engine.

## Human validation and later AS 4100 mapping

`applyHumanRuleConfirmation` accepts engineer-supplied equation identifiers, parameters, applicability, edition, amendment, and reference ids. Default AU-1 methods stay at BENCHMARKED / INTENDED_PROFILE. HUMAN_VALIDATED, PILOT, CERTIFIED, and CONFORMANCE_VALIDATED require that confirmation path plus independent engineering review. Standard PDFs and substantial standard text are not stored or required at runtime.

## Next AU phase

EOS-D1D-AU-2: compression / member stability with explicit effective length. No silent effective-length assumption. Same engineering-rule authority model. AS 4100 conformance remains unvalidated until confirmed.
