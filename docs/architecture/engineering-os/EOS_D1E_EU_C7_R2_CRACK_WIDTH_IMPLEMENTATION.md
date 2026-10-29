# EOS-D1E-EU-C7-R2 — bounded crack-width check

This phase evaluates one crack-width check on the existing serviceability profile. It does not design reinforcement, and it does not calculate creep, shrinkage, or deflection.

## Scope

Ordinary non-prestressed rectangular beams and solid slabs. The service combination must already be a quasi-permanent SLS combination. Ultimate combinations are rejected. Quasi-permanent is the combination for this reference method. It is not claimed as a universal project rule.

## Steel stress

The section kernel provides uncracked elastic resultants. It does not produce a cracked-section service steel stress. The check therefore requires an explicit SLS steel stress with its own provenance. An ultimate steel stress is rejected. The value is not defaulted.

## Crack state

Gross area, centroid, and second moment come from the existing section geometry. Extreme-fiber elastic stress uses those properties with tension-positive axial force and a positive moment that tensions the bottom fiber. The section is cracked only when that tension exceeds the explicit effective tensile strength. An uncracked section returns zero crack width and does not run the cracked formula. A recorded tensile strength on the concrete material is not substituted for the explicit effective tensile strength.

## Crack width

Cover is the cover to the bar surface. Effective tension height uses the profile factors. Bending takes the minimum of the cover-depth term, the neutral-axis term, and half the section depth. Pure tension takes the minimum of the cover-and-diameter term and half the thickness. Effective area is the section width times that height. The reinforcement ratio, modular ratio, duration factor, mean strain difference, spacing, and crack width follow the bound profile. The strain floor comes from the profile. The allowable width is a project requirement.

Bond, duration, and strain case are explicit. No coefficient is selected by the assistant.

## Check

The width is compared with the project limit. Equality satisfies the check. Utilization is the width divided by that limit when both are valid.

## Validation

Expected values are reconstructed from the profile parameters and ordinary section properties. They do not call the runtime check. Engineer validation and formal conformance remain pending. The next phase is the explicit creep and shrinkage contract, not deflection.
