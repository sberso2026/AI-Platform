# EOS-D1D-AU-7 Australian Steel Validation and Conformance Gate

Independent assurance of the current Australian-profile steel capability (D1D-0 through AU-6). This phase classifies what EOS can truthfully claim. It does **not** add design formulas, invent interaction equations, infer the AS 4100 edition, or certify the AU steel pack.

Structural maturity remains `REFERENCE_PARTIALLY_IMPLEMENTED`. `AU_STEEL_PACK_CERTIFIED = NO`. `AS4100_CONFORMANCE_VALIDATED = NO`. Edition and amendment remain `UNKNOWN_PENDING_CONFIRMATION`.

## Validation taxonomy

Separate dimensions (never collapsed):

- implementation maturity
- numerical validation
- engineering validation
- standard conformance
- product release state
- engineering approval

A benchmark does **not** equal standard conformance. Numerical validation does **not** equal project approval.

## Method validation inventory

Ten numerical mechanics-reference methods are independently hand-benchmarked (`PASS` numerical validation, `ENGINEERING_VALIDATION_REQUIRED`, conformance `INTENDED_PROFILE`):

| methodId | class | not equal to |
| --- | --- | --- |
| `AU_TENSION_GROSS_YIELD` | mechanics reference | AS 4100 φNt |
| `AU_TENSION_NET_FRACTURE` | mechanics reference | AS 4100 φNt |
| `AU_COMPRESSION_SQUASH_YIELD` | mechanics reference | code compression capacity |
| `AU_COMPRESSION_EULER_MAJOR` | mechanics + stability | code compression design |
| `AU_COMPRESSION_EULER_MINOR` | mechanics + stability | code compression design |
| `AU_BENDING_ELASTIC_MAJOR` | mechanics reference | code member moment capacity |
| `AU_BENDING_ELASTIC_MINOR` | mechanics reference | code member moment capacity |
| `AU_BENDING_ELASTIC_LTB` | mechanics + stability | code LTB member capacity |
| `AU_SHEAR_YIELD_REFERENCE` | mechanics reference | AS 4100 Vv |
| `AU_SHEAR_BUCKLING_REFERENCE` | mechanics + stability | code shear design |

Eight AU-5 interaction types remain `FRAMEWORK_ONLY` / `NOT_APPLICABLE` numerically. `IMPLEMENTED_INTERACTION_METHODS = NONE`.

No method is classified `CODE_PROFILE_METHOD`.

## Benchmark audit

Independent hand-calculation expected values, explicit inputs/units/tolerances, and provenance. EOS output is not the expected-value source. Scored comparisons record actual results. Self-referential benchmarks are forbidden.

Third-party commercial software comparison: **not available** (not fabricated).

## Conformance matrix

See `AU_STEEL_VALIDATION_MATRIX`. Every capability: `conformanceValidated = false`, `certified = false`. Combined actions: not implemented numerically. Serviceability and member orchestration: implemented as governed behaviour, not as code criteria.

## Bounded supported scope

`NUMERICALLY_VALIDATED` single-action mechanics references listed above, when inputs are explicit and fail-closed.

Not supported as design-validated: AS 4100 member design, section classification, φ, interaction, default L/n, connections, foundations, general FEA, SPACE GASS live execution.

## Combined-action limitation

Members that require interaction remain `CHECK_UNDETERMINED`. Component utilizations cannot substitute. General AU member design is **not** validated.

## Serviceability status

AU-6 orchestration validated: D1C deflection reused, criterion explicit, no default L/n, ULS not used as SLS by default, missing criterion fails closed. This is orchestration validation, not universal design criteria.

## Analysis limitation

D1C remains bounded statics. `GENERAL_FEA_CAPABILITY_CLAIMED = NO`. SPACE GASS live execution remains `NOT_CERTIFIED`.

## Standard identity

Edition and amendment are `UNKNOWN_PENDING_CONFIRMATION`. They are not inferred.

## AI boundary

LLM numerical authority, AI conformance authority, and AI approval remain **NO**. AI cannot promote method maturity or certify conformance.

## Release classification

`INTERNAL_ENGINEERING_REFERENCE`. Not Profile A pilot, not general availability, not certified engineering use.

## Product claim level

`BENCHMARKED_ENGINEERING_CAPABILITY`. Not engineer-validated pack, not conformance-validated, not certified design capability.

## Result warnings (when AU results are shown)

- engineering review required
- AS 4100 conformance not validated
- interaction check unavailable when combined actions apply
- bounded analysis scope
- not approved for construction

## Validation debt

Exact edition/amendment; tension/compression/bending/LTB/shear code capacity; section classification; web slenderness; combined-action equations; standard serviceability criteria; third-party comparisons; human engineering validation; solver certification.

## Priority plan

1. SAFETY_CRITICAL — code compression/bending/LTB/shear capacity, section classification, interaction equations  
2. CONFORMANCE_CRITICAL — edition/amendment, tension code rules, web slenderness, SLS criteria, human validation  
3. COMMERCIAL_RELEASE_CRITICAL — third-party comparisons, solver certification  
4. ENHANCEMENT — none ranked in this gate

## Next jurisdiction phase

EOS-D1D-EU-1: European steel adapter and National Annex binding (no formulas), inheriting global-first architecture and this AU assurance classification.
