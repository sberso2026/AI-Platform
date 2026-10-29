# EOS-D1E-EU-C5-T3R — governed torsion profile recovery

Torsional resistance is not implemented. Shear, interior punching, and the `MEMBER_TORSION` transport are unchanged.

## Licensing and rule authority

A licensed standard file is not required to bind or later implement a derived rule. The repository does not store the standard, and this note does not reproduce protected clause text. Rule authority is the recorded source, the expression, and the profile identity.

Engineer validation is still pending. That does not block a reference-profile binding. Numerical validation is a later maturity step. Binding this profile does not certify EN 1992 conformance.

## Selected profile

`EU-EN1992-1-1-GEN1-TORSION-REFERENCE`

Type: reference implementation profile. It is not a national annex. Generation: first-generation EN 1992-1-1. Amendment: not confirmed. No second-generation rule is mixed in.

Primary source: Nemetschek Scia, Eurocode 2 training, EN 1992-1-1, 2011. Corroboration: J.C. Walraven, JRC workshop, 2 February 2008, for the thin-wall geometry, closed shear flow, and the recommended cotangent domain. Further corroboration: the FRILO reinforced-concrete section manual, for centre-line geometry, transverse reinforcement with cotangent in the denominator, and the separation of the German annex from the recommended expressions.

## Bound rules

Effective thickness is the outer area divided by the outer circumference. A hollow section also needs its actual wall thickness; that thickness is not invented. Enclosed area and its perimeter follow the wall centre-lines. Shear flow is demand over twice the enclosed area. It is mechanics, not a resistance.

Cotangent of the strut angle is selected by the designer from 1 to 2.5. There is no default angle. The recommended strength reduction is `0.6 * (1 - fck/250)` with `fck` in MPa. The non-prestressed axial concrete factor is 1. Design concrete strength and reinforcement design strength stay on the existing C1 rules; torsion does not pack `alpha_cc`, `gamma_c`, or `gamma_s`.

Maximum torsional resistance is `2 * nu * alphaCw * fcd * Ak * tef * sin(theta) * cos(theta)`. Vertical transverse reinforcement per unit length is demand over `2 * Ak * fywd * cot(theta)`. Total longitudinal steel is demand times `cot(theta) * uk / (2 * Ak * fyd)`. Neither rule chooses bars.

The shear-torsion strut check is the linear sum of the two utilisation ratios. Zero shear is the end of that expression, not a separate torsion-only method. The squared solid-section form is not used.

The minimum-reinforcement cracking check is outside this bounded method. It needs a shear resistance and national annexes replace it, so it is not required for the selected check and it is not given a torsion-only formula.

## Conflicts

The Karlsruhe course notes use another cotangent domain, a single strength-reduction number, a squared interaction, and a different reinforcement angle placement. Those differences are a different profile. They are rejected. They are not averaged.

## Validation

Engineer review remains `PENDING_HUMAN_ENGINEERING_REVIEW`. The resolver fails closed for a national-annex id, the wrong generation, a stale profile version, a cotangent outside 1 to 2.5, prestress, an unsupported section, a missing hollow-wall thickness, and the squared interaction.

## Next phase

`EOS-D1E-EU-C5-T4` may implement one bounded deterministic torsion method from this profile and validate it numerically. `EOS-D1E-EU-C6` does not start. Conformance stays `INTENDED_PROFILE`. The pack is not certified.
