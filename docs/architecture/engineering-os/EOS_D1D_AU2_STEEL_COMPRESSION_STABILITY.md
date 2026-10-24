# EOS-D1D-AU-2 Australian Steel Compression and Member Stability

Bounded Australian-profile **compression / member-stability** capability on the D1D-0 steel core and AU-1 engineering-rule model. Intended standard profile remains AS 4100. This phase does **not** certify AS 4100 member capacity.

Structural maturity remains `REFERENCE_PARTIALLY_IMPLEMENTED`. AU steel pack remains **not certified**.

## Scope

Implemented (mechanics reference only):

- nominal squash load `fy × Ag`
- Euler elastic buckling `π² EI / Le²` about explicit major and minor axes
- deterministic governing selection among evaluated modes
- mechanics-reference utilization against the governing reference load

Explicitly unsupported:

- AS 4100 member capacity, buckling curves, and capacity-reduction factors
- section classification limits
- bending / LTB
- shear
- combined actions
- connections
- torsional / flexural-torsional buckling (architecture reserved; fail closed)

## Compression context

`AuCompressionDesignContext` binds member, section, material, D1C axial demand, member length, per-axis effective lengths, buckling axes, restraint, engineering rule, intended standard profile, provenance, and `sectionClassificationState = VALIDATION_REQUIRED`.

## Effective-length governance

Effective length must be explicitly supplied per evaluated axis, or computed as `k × L` only when both the factor and member length are governed with provenance. It is never inferred from vague support labels, never defaulted to `k = 1`, and never supplied by AI. Missing or AI-tagged provenance fails closed.

## Buckling modes

`MAJOR_AXIS` and `MINOR_AXIS` are evaluated when requested. `BOTH` requires **both** major and minor effective lengths; a single length is not reused silently. Torsional modes fail closed as unsupported.

## Engineering-rule authority

AU-1 authority types are reused. Implemented methods are `ESTABLISHED_ENGINEERING_MECHANICS`. LLM memory, unsourced web summaries, and unverified generated rules are rejected.

## Generic mechanics vs AS-profile rules

| Class | AU-2 treatment |
| --- | --- |
| Squash and Euler | `MECHANICS_REFERENCE`, benchmarked |
| AS 4100 φNc, αb, λn, buckling curves | `VALIDATION_REQUIRED` / fail closed if requested |
| Section classification | `VALIDATION_REQUIRED`; limits are not guessed |

Euler results are **not** labelled `AS4100_DESIGN_CAPACITY`. `ELASTIC_BUCKLING_EQUALS_CODE_CAPACITY = NO`.

## Implemented methods

| methodId | Inputs | Output class | Maturity |
| --- | --- | --- | --- |
| `AU_COMPRESSION_SQUASH_YIELD` | fy, Ag | MECHANICS_REFERENCE | BENCHMARKED |
| `AU_COMPRESSION_EULER_MAJOR` | E, Iyy, Le,major | MECHANICS_REFERENCE | BENCHMARKED |
| `AU_COMPRESSION_EULER_MINOR` | E, Izz, Le,minor | MECHANICS_REFERENCE | BENCHMARKED |

Conformance state remains `INTENDED_PROFILE`. Binding remains `IMPLEMENTED_UNVERIFIED_STANDARD_BINDING`. Edition/amendment remain `UNKNOWN_PENDING_CONFIRMATION`.

## Demand, utilization, and check state

D1C axial demand is reused (compression-negative). Design-code member capacity is absent, so the design check verdict is `CHECK_UNDETERMINED`. A mechanics-reference D/C ratio may still be reported. Utilization does not approve the design.

## Benchmarks

Independent hand calculations:

- squash: 300 N/mm² × 5140 mm² = 1 542 000 N
- Euler major: π² EI / Le² with E = 200 GPa, Iyy = 100×10⁶ mm⁴, Le = 8 m → 3 084 251 N
- Euler minor: Izz = 20×10⁶ mm⁴, Le = 8 m → 616 850 N

## Fail-closed

Missing demand, fy, E, I, effective length, restraint, units, unsupported section/mode, unknown code coefficients, and certified claims for unvalidated methods fail closed.

## Human validation and AI

Human review remains required. HUMAN_VALIDATED / PILOT / CERTIFIED require engineer confirmation of rule, Le treatment, stability assumptions, benchmarks, and conformance. AI may flag missing Le or modes; AI may not invent Le, classification, buckling factors, capacity, or approval.

## Next AU phase

EOS-D1D-AU-3: bending / member stability including LTB inputs, still without guessed code coefficients.
