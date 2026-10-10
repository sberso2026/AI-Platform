# EOS-D1E-EU-C5-T3 — human national-profile binding

No human-governed national annex input is present. Torsional resistance is not implemented. Shear, interior punching, and the `MEMBER_TORSION` transport are unchanged.

## Required input

A person must supply one profile record. The record has to name the profile, country or jurisdiction, base standard, edition, amendment, national annex, annex edition, annex amendment, engineering source, authority class, human validator, validation date, and validation status. Missing identity is not inferred. `NONE`, `AUTO`, `DEFAULT`, `RECOMMENDED`, and location are not annex identities.

The same record must carry the torsion parameter set: strut-angle domain, strength reduction, axial concrete factor where the annex uses it, the design-concrete-strength route, effective thickness, enclosed area, effective perimeter where the annex uses it, shear-flow classification, cracking or threshold rule, maximum torsional resistance, transverse reinforcement, longitudinal reinforcement, and the shear-torsion interaction. Each numerical parameter needs units, source, annex identity, applicability, version, and human validation. Pending validation does not complete the binding.

## Current result

`EXTERNAL_PROFILE_INPUT_PRESENT = NO`.

`PROFILE_TORSION_BINDING_COMPLETE = NO`.

The resolver `resolveEuC5TorsionNationalProfile` fails closed with `HUMAN_PROFILE_INPUT_REQUIRED`. No country was selected. No annex value was stored. No second rule engine and no database migration were added.

C1 and C1C material rules were not copied or extended, because there is no annex against which to test reuse.

## Next action

`HUMAN_PROFILE_INPUT_REQUIRED`.

`EOS-D1E-EU-C5-T4` does not start. `EOS-D1E-EU-C6` does not start. Conformance stays `INTENDED_PROFILE`. The pack is not certified.
