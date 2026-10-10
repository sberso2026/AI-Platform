# EOS-D1E-EU-C5-T2 — national profile binding

No torsion resistance method is implemented. Shear, interior punching, and the `MEMBER_TORSION` transport are unchanged.

## Selection basis

A profile is eligible only when one explicit first-generation EN 1992-1-1 context supplies the whole bounded torsion set: geometry, strut-angle domain, strength reduction, maximum resistance, reinforcement, and the shear-torsion interaction. Country, convenience, and which secondary note is easiest are not selection rules.

## Candidates

| Profile | Annex | What the evidence actually contains | Readiness |
| --- | --- | --- | --- |
| `EN1992-1-1-RECOMMENDED` | none | Walraven slides, 2 February 2008 (eurocodes.fi). Thin-wall thickness as area over outer perimeter, shear flow from demand and the centre-line area, and a recommended cotangent range of 1 to 2.5 for wall reinforcement designed like a beam. The torsion slides do not state the maximum torsional resistance, the strength-reduction factor, or the shear-torsion interaction equation. Edition and amendment are not stated on those slides. | not ready |
| `KIT-MSC-CONCRETE-SUMMARY` | not an annex document | Karlsruhe Institute of Technology MSc concrete summary. It states a strut resistance expression, a different cotangent domain, a numeric strength-reduction value, a squared shear-torsion interaction for solid sections, and a cracking check written with shear. That is a course summary, not a national-annex edition. | not ready |

No other candidate in the repository has a lawful, complete torsion parameter set.

`EU_C5_T2_SELECTED_PROFILE_ID = NONE`.

## Why the candidates do not combine

The two notes are independent and they do not describe one profile. The cotangent domain differs. Only the course summary states a strength-reduction value and an interaction form. Reinforcement placement of the angle function is not the same reading in both notes. Those conflicts stay closed. Nothing is averaged, and the German-course numbers are not copied into a base-standard method.

## Dependency result

Strut-angle minimum and maximum are not bound, because binding either published range would choose a profile. Strength reduction, design concrete strength factors, transverse reinforcement, longitudinal reinforcement, and the shear-torsion interaction stay unresolved. Effective thickness and enclosed area are described by the Walraven slides and are not coded. Shear flow remains established mechanics and is not treated as a resistance rule. The cracking check stays a combined shear-torsion matter; zero shear is not assumed.

## Decision

`BLOCKED_REQUIRED_NATIONAL_ANNEX`.

External action: `LICENSED_OR_VALIDATED_PROFILE_INPUT_REQUIRED`. A person must supply one national-annex identity, its edition, and the torsion parameter set that annex actually uses: strut-angle domain, strength reduction, maximum resistance, reinforcement, and the shear-torsion interaction. This phase does not open another search loop and does not start `EOS-D1E-EU-C6`.

Conformance stays `INTENDED_PROFILE`. The pack is not certified. Torsion validation debt stays unresolved.
