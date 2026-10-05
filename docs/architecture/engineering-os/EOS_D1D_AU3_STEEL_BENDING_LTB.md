# EOS-D1D-AU-3 Australian Steel Bending and Lateral-Torsional Stability

Bounded Australian-profile **bending / lateral-stability** capability on the D1D-0 steel core and AU-1/AU-2 engineering-rule model. Intended standard profile remains AS 4100. This phase does **not** certify AS 4100 section or member bending capacity.

Structural maturity remains `REFERENCE_PARTIALLY_IMPLEMENTED`. AU steel pack remains **not certified**. Edition and amendment remain `UNKNOWN_PENDING_CONFIRMATION`. `AS4100_CONFORMANCE_VALIDATED = NO`.

## Scope

Implemented (mechanics reference only):

- elastic first-yield moment `My = fy × Z` about an explicit major or minor axis
- uniform-moment elastic critical LTB moment
  `Mcr = √[(π² E Iy / L²)(G J + π² E Iw / L²)]`
  for doubly-symmetric prismatic members with load at the shear centre
- deterministic governing selection among evaluated modes
- mechanics-reference utilization against the governing reference moment

Explicitly unsupported / `VALIDATION_REQUIRED`:

- section classification limits, shape factors, and effective widths
- plastic section modulus capacity
- capacity-reduction factors
- moment modification factors (αm) and LTB reduction factors (αs)
- AS 4100 member bending capacity / code-profile LTB
- shear
- combined actions (AU-5)
- torsional design capacity
- connections

Deflection is not recalculated. D1C remains the deflection handoff.

## Bending axes

`BENDING_MAJOR` and `BENDING_MINOR` are explicit. Major-axis bending is not assumed. Minor-axis LTB is not invented.

## Section bending

Governed elastic section modulus is required for the requested axis. Missing Z fails closed. Plastic / classified section capacity is not implemented and is not guessed.

## Stability model

`SteelBendingDesignContext` binds member, section, material, D1C moment demand refs, bending axis, member length, unbraced length with provenance, lateral / torsional / warping restraint, moment-distribution context, engineering rule, intended standard profile, provenance, and `sectionClassificationState = VALIDATION_REQUIRED`.

Structural support condition is **not** treated as LTB restraint.

## Unbraced length

When LTB is applicable (major axis and any LTB input present), unbraced length must be explicitly supplied with provenance. It is never defaulted from member length or invented by AI. Missing or AI-tagged provenance fails closed.

## Restraint

LTB requires explicit lateral, torsional, and warping restraint. `unknown` fails closed. Support labels in `restraintDescription` are not reused as LTB restraint.

## Moment distribution

Moment-distribution context may be recorded. No code-specific moment modification factor is applied. Requesting αm fails closed as an unknown code parameter. The elastic LTB method is the uniform-moment, shear-centre reference.

## Elastic mechanics references

| Class | AU-3 treatment |
| --- | --- |
| Elastic first-yield My | `MECHANICS_REFERENCE` / `ELASTIC_BENDING_REFERENCE`, benchmarked |
| Elastic critical LTB Mcr | `MECHANICS_REFERENCE` / `ELASTIC_LTB_REFERENCE`, benchmarked |
| AS 4100 Ms / Mb / φ / αm / αs | `VALIDATION_REQUIRED` / fail closed if requested |
| Section classification | `VALIDATION_REQUIRED`; limits are not guessed |

Mechanics-reference results are **not** labelled `AS4100_MEMBER_BENDING_CAPACITY`. `ELASTIC_LTB_EQUALS_CODE_MEMBER_CAPACITY = NO`. `MECHANICS_REFERENCE_EQUALS_CODE_CAPACITY = NO`.

## LTB boundary / code-profile limitations

Code-profile LTB is not implemented. Unknown coefficients are not synthesized. Load-height other than shear centre fails closed. Standard text is not ingested.

## Implemented methods

| methodId | methodType | Inputs | Output class | Maturity |
| --- | --- | --- | --- | --- |
| `AU_BENDING_ELASTIC_MAJOR` | ELASTIC_BENDING_REFERENCE | fy, Zyy | MECHANICS_REFERENCE | BENCHMARKED |
| `AU_BENDING_ELASTIC_MINOR` | ELASTIC_BENDING_REFERENCE | fy, Zzz | MECHANICS_REFERENCE | BENCHMARKED |
| `AU_BENDING_ELASTIC_LTB` | ELASTIC_LTB_REFERENCE | E, G, Izz, J, Iw, Lu, LTB restraints | MECHANICS_REFERENCE | BENCHMARKED |

Conformance state remains `INTENDED_PROFILE`. Binding remains `IMPLEMENTED_UNVERIFIED_STANDARD_BINDING`.

If LTB inputs are absent, only first-yield is returned (`PARTIAL`). If any LTB input is present on the major axis, the full LTB set is required.

## Demand, utilization, and check state

D1C governed bending demand is reused (load case/combination, sign, location, units, provenance). AU bending does not recalculate structural demand.

Design-code member/section capacity and classification are absent, so the design check verdict is `CHECK_UNDETERMINED`. A mechanics-reference D/C ratio may still be reported. Utilization does not approve the design. Check result does not equal approval.

## Benchmarks

Independent hand calculations:

- major My: 300 N/mm² × 1 000 000 mm³ = 300 000 N.m
- minor My: 300 N/mm² × 200 000 mm³ = 60 000 N.m
- elastic Mcr: E = 200 GPa, G = 80 GPa, Iy = 20×10⁶ mm⁴, J = 5×10⁵ mm⁴, Iw = 2×10¹¹ mm⁶, Lu = 8 m → 168 757 N.m

EOS is not used as its own benchmark authority.

## Conformance status

`AS4100_STANDARD_EDITION = UNKNOWN_PENDING_CONFIRMATION`  
`AS4100_AMENDMENT_STATE = UNKNOWN_PENDING_CONFIRMATION`  
`AS4100_CONFORMANCE_VALIDATED = NO`  
`AU_STEEL_PACK_CERTIFIED = NO`  
`IMPLEMENTATION_MATURITY = BENCHMARKED` (mechanics methods only)  
`STANDARD_CONFORMANCE_STATE = INTENDED_PROFILE`  
Benchmarking is not AS 4100 conformance.

## AI boundary

AI may identify missing bending/stability inputs, suggest a likely governing axis, suggest candidate restraints, explain results, suggest alternative sections, and prepare candidate scenarios.

AI may **not** choose unbraced length silently, invent restraint, invent LTB coefficients, invent classification, invent capacity, claim AS conformance, or approve design.

## Human-review requirements

HUMAN_VALIDATED / PILOT / CERTIFIED require engineer confirmation of the bending rule, section classification, unbraced length, restraint, moment distribution, LTB assumptions, benchmark, standard profile, and conformance. Automatic engineering approval is forbidden. Optimizer-proposed sections must be rechecked for bending, applicable stability modes, and existing tension/compression checks.

Unfinished AU bending is not exposed automatically to Profile A (`AU_BENDING_PILOT_EXPOSURE = NO`).

## Next phase

EOS-D1D-AU-4: shear, still without guessed code coefficients and without combined-action interaction (AU-5).
