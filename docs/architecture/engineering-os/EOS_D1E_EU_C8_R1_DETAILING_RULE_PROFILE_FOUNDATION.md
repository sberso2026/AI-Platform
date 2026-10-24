# EOS-D1E-EU-C8-R1 detailing rule and profile foundation

## Verdict

PASS_WITH_LIMITATIONS. One cover-assembly sub-pack is implementation-ready. Spacing, anchorage, and laps are not.

## What was bound

Profile `EU-EN1992-1-1-GEN1-C8-DETAILING-REFERENCE`, generation `EN1992-1-1-GEN1`. It is not a National Annex.

The Joint Research Centre Vienna 2010 cover lecture states:

- minimum cover is the maximum of the bond component, the durability component, and 10 mm;
- nominal cover is that minimum plus an explicit deviation allowance.

Those two relationships are the ready rules. The future check is provided cover against that nominal cover. No runtime method calculates it in this phase.

## Inputs that stay explicit

Bond cover is not taken from bar diameter. The same lecture also states bridge-slab face values, so the diameter identity is a different scope and is not bound.

Durability cover is not taken from an exposure class. The lecture says the durability component is nationally determined and depends on exposure and structural class. The lookup table was not recovered.

Deviation allowance is not defaulted. The lecture gives a recommended allowance and a narrower band when cover is measured. Those recommendations are not applied.

Exposure class is context only. A supplied exposure class does not create a durability cover.

## Not bound

The Brussels 2011 detailing lecture names spacing, bond quality, basic anchorage, modification factors, and laps. The extracted expressions for spacing, minimum anchorage, the large-bar bond factor, lap percentage, and lap minimum length are not clean enough to implement. Worked length tables are example-specific and are not general rules.

No aggregate size, bond condition, anchorage coefficient, or lap percentage is guessed.

## Reuse

Existing reinforcement bars, faces, layers, stored spacing, and geometric surface clearance are reused. Geometric clearance remains distinct from an EN 1992 cover check. No second cover, durability, anchorage, lap, or geometry engine was added.

C7 crack-control cover, crack spacing, and deferred deflection stay in C7. C8 physical cover is a separate check.

## Next phase

`EOS-D1E-EU-C8-R2-COVER-DURABILITY` implements the cover assembly only. Spacing, anchorage, and laps wait until their expressions are recovered.

Engineer validation is pending. Formal EN 1992 conformance is not claimed.
