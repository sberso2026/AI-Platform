# EOS-D1D-AU-4 Australian Steel Shear

Bounded Australian-profile **shear** capability on the D1D-0 steel core and AU-1 through AU-3 engineering-rule model. Intended standard profile remains AS 4100. This phase does **not** certify AS 4100 shear capacity.

Structural maturity remains `REFERENCE_PARTIALLY_IMPLEMENTED`. AU steel pack remains **not certified**. Edition and amendment remain `UNKNOWN_PENDING_CONFIRMATION`. `AS4100_CONFORMANCE_VALIDATED = NO`.

## Scope

Implemented (mechanics reference only):

- von Mises pure-shear yield `Vy = fy × Av / √3` using an **explicit governed shear area**
- elastic plate shear buckling `Vcr = τcr × Av` with
  `τcr = kv π² E / [12(1-ν²)(d/t)²]`
  where **kv is supplied**, never defaulted
- deterministic governing selection among evaluated modes
- mechanics-reference utilization against the governing reference force

Explicitly unsupported / `VALIDATION_REQUIRED`:

- AS 4100 shear capacity, φ, and 0.6 fy web rules
- web slenderness classification limits
- tension-field / post-buckling design
- stiffener design rules
- bending-shear and axial-shear interaction (AU-5)
- connection shear (bolts, welds, block shear, bearing, tear-out)
- torsional design

D1C remains the shear-demand and deflection handoff. AU shear does not recalculate member demand.

## Shear axes

`SHEAR_MAJOR` and `SHEAR_MINOR` are explicit. Bare `SHEAR` requires an explicit `shearAxis`. Major-web shear is not assumed. Av is **not** inferred for the other axis.

## Shear-area governance

`section.shearArea` must be an explicit governed property with units and provenance. Gross area, `d × tw`, and designation text are never substituted. Missing Av fails closed. AI-tagged provenance fails closed.

## Web geometry and slenderness

When web depth and thickness are supplied, `d/t` is recorded in `SteelWebSlendernessContext`. AS-profile slenderness limits are **not** applied (`limitState = VALIDATION_REQUIRED`). Limits are not guessed.

## Stiffeners

Stiffener state must be explicit: `UNSTIFFENED`, `TRANSVERSE_STIFFENED`, or `OTHER_GOVERNED_CONFIGURATION`. It is never inferred from section family. `unknown` fails closed. Transverse stiffening requires explicit spacing when buckling inputs are present.

## Mechanics-reference methods

| Class | AU-4 treatment |
| --- | --- |
| Von Mises shear yield | `MECHANICS_REFERENCE` / `ELASTIC_SHEAR_REFERENCE`, benchmarked |
| Elastic plate shear buckling | `MECHANICS_REFERENCE` / `ELASTIC_SHEAR_BUCKLING_REFERENCE`, benchmarked |
| AS 4100 Vv / φ / 0.6 fy | `VALIDATION_REQUIRED` / fail closed if requested |
| Web slenderness limits | `VALIDATION_REQUIRED`; limits are not guessed |

Results are **not** labelled `AS4100_DESIGN_CAPACITY`. `ELASTIC_SHEAR_BUCKLING_EQUALS_CODE_CAPACITY = NO`. `MECHANICS_REFERENCE_EQUALS_CODE_CAPACITY = NO`.

If buckling inputs are absent, only yield is returned (`PARTIAL`). If any buckling input is present, the full buckling set is required (E, ν, d, tw, Av, kv).

## Shear buckling boundary

kv is a governed input. The engine does not assume 5.34, 4.00, or any AS 4100 shear-buckling coefficient. Load-height and tension-field effects are out of scope.

## Tension-field boundary

`TENSION_FIELD_ACTION_IMPLEMENTED = NO`. Absence of tension-field is not treated as a zero-capacity contribution. Requesting it fails closed.

## Implemented methods

| methodId | methodType | Inputs | Output class | Maturity |
| --- | --- | --- | --- | --- |
| `AU_SHEAR_YIELD_REFERENCE` | ELASTIC_SHEAR_REFERENCE | fy, Av | MECHANICS_REFERENCE | BENCHMARKED |
| `AU_SHEAR_BUCKLING_REFERENCE` | ELASTIC_SHEAR_BUCKLING_REFERENCE | E, ν, d, tw, Av, kv | MECHANICS_REFERENCE | BENCHMARKED |

Conformance state remains `INTENDED_PROFILE`. Binding remains `IMPLEMENTED_UNVERIFIED_STANDARD_BINDING`.

## Unsupported methods

Code-profile shear, slenderness limits, capacity-reduction factors, tension field, connection shear, bending/shear interaction, axial/shear interaction, torsional design.

## Benchmarks

Independent hand calculations:

- yield: 300 N/mm² × 5 000 mm² / √3 = 866 025 N
- elastic buckling: E = 200 GPa, ν = 0.3, kv = 5.34 (supplied), d = 300 mm, tw = 8 mm, Av = 5 000 mm² → 3 432 068 N

EOS is not used as its own benchmark authority.

## Conformance limitations

`AS4100_STANDARD_EDITION = UNKNOWN_PENDING_CONFIRMATION`  
`AS4100_AMENDMENT_STATE = UNKNOWN_PENDING_CONFIRMATION`  
`AS4100_CONFORMANCE_VALIDATED = NO`  
`AU_STEEL_PACK_CERTIFIED = NO`  
`IMPLEMENTATION_MATURITY = BENCHMARKED` (mechanics methods only)  
`STANDARD_CONFORMANCE_STATE = INTENDED_PROFILE`  
Benchmarking is not AS 4100 conformance.

## Interaction handoff

AU-4 records `INTERACTION_REVIEW_REQUIRED = YES` and does **not** calculate a bending/shear or axial/shear reduction. Combined actions belong in AU-5.

## Human validation

HUMAN_VALIDATED / PILOT / CERTIFIED require engineer confirmation of the shear rule, shear area, web geometry, slenderness treatment, buckling treatment, stiffeners, benchmarks, standard profile, and conformance. Automatic engineering approval is forbidden. Optimizer-proposed sections must be rechecked for tension, compression, bending, and applicable shear.

Unfinished AU shear is not exposed automatically to Profile A (`AU_SHEAR_PILOT_EXPOSURE = NO`).

## AI boundary

AI may identify missing shear inputs, flag potentially slender webs, suggest a likely governing shear direction, explain deterministic results, suggest candidate sections, and flag future interaction review.

AI may **not** invent shear area, web geometry, code coefficients, slenderness limits, or stiffener conditions; originate shear capacity; claim AS 4100 conformance; or approve design.

## AU-5 dependency

EOS-D1D-AU-5: combined actions (axial + bending + shear interaction), still without guessed code coefficients.
