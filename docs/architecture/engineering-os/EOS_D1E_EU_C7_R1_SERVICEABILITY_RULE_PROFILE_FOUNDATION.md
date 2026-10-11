# EOS-D1E-EU-C7-R1 — serviceability reference profile

This phase binds one first-generation serviceability profile. It does not calculate crack width, deflection, creep, or shrinkage.

## Selected v1 scope

Ordinary non-prestressed rectangular beams and solid slabs. The ready method is a crack-width check. Cover, bar diameter, cracked-section steel stress, tensile strength, moduli, duration, and the allowable crack width are explicit inputs. Quasi-permanent service actions must already be combined. Minimum crack reinforcement, bar-diameter tables, and bar-spacing tables are not bound. No reinforcement is designed.

Prestressed serviceability, fire, seismic serviceability, shell or solid cracking, construction-stage analysis, and full viscoelastic analysis are out of scope.

## Crack width

The profile reuses the JRC Eurocode 2 ULS/SLS workshop (J.C. Walraven). Maximum crack spacing is a cover term plus a bar term. The mean strain difference uses the cracked-section steel stress, a duration factor, the explicit tensile strength, and the modular ratio, and it is not taken below the workshop floor. Crack width is the product of spacing and that strain difference.

Bending and pure tension use different effective-tension heights. Those sets are not mixed. An intermediate strain factor must be supplied inside the workshop endpoints. High-bond and plain surfaces are explicit. Duration is explicit: short-term or long-term.

The exposure table of recommended crack limits is not applied. The allowable width is an input.

Uncracked sections do not enter the crack-width check. There is no interpolated crack state in this profile. Tension stiffening is the duration factor inside the mean strain difference, not a separate model.

## Deflection

The same workshop shows span-to-depth control. The extracted algebra is not clean enough to bind, so that method is excluded. Curvature interpolation was not recovered. Deflection is not implementation-ready.

## Creep and shrinkage

Creep coefficient and shrinkage strain are explicit inputs. Humidity, age, cement type, and notional size are not defaulted, and the calculation models are not bound. C6 continues to require its own explicit effective creep ratio. A later caller may copy a C7 creep value into that input. C7 does not replace a stored C6 value.

## Materials and actions

Concrete compressive strength and modulus already pass through the existing characteristic-property path. Tensile strength is not synthesized. The existing tension rule remains limited to ultimate flexure, so serviceability requires the explicit tensile property. Reinforcement modulus remains the explicit material property.

Service combinations stay on the existing combination contract. This profile accepts only a quasi-permanent service combination. It stores no combination factors. An ultimate combination is rejected.

## Conflicts

Spacing coefficients are the workshop numbers, not a second symbolic multiplier. Worked-example arithmetic is not used as a coefficient. Effective-tension height follows the declared strain case. The span-to-depth expression is rejected until a clean source is bound. Nothing is averaged.

This is not a National Annex. No nationally determined value is guessed.

## Sequence

Crack-width evaluation is next. Calculated creep and shrinkage follow. Deflection waits on a clean method. Integrated serviceability closeout is last.

Engineer validation remains pending. Conformance stays an intended profile. A licensed standard PDF is not required and is not stored.
