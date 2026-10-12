# EOS-D1E-EU-C8-R3B minimum clear spacing

## Scope

The runtime method is `EU_RC_MIN_CLEAR_SPACING_EN1992_REFERENCE`. It checks one pair of individual straight deformed bars that share one nominal diameter. The spacing context is supplied as `HORIZONTAL_ADJACENT` or `VERTICAL_LAYER_ADJACENT`. The method does not classify an arbitrary pair from coordinates.

Unlike diameters fail closed. Bundles, welded mesh, prestressing tendons, crack-control bar spacing, and a project spacing overlay are outside this method.

## Profile and inputs

The method reuses `EU-EN1992-1-1-GEN1-C8-SPACING-REFERENCE` under `EU-EN1992-1-1-GEN1-C8-DETAILING-REFERENCE`.

Required spacing is the maximum of three explicit terms: the bar-diameter coefficient times the nominal diameter, the maximum aggregate size plus the aggregate allowance, and the absolute minimum stored on the spacing profile. The coefficient and the allowance are nationally determined inputs. A missing value fails closed. Zero is an explicit value for those inputs and for maximum aggregate size. A missing value is not replaced by zero. The nominal diameter must be positive.

The absolute minimum is read from the profile parameter. It is not written into the evaluator.

## Geometry and check

Measured clear spacing is `barPairClearSpacingMm` in the existing reinforcement geometry. That is the same surface-to-surface distance `evaluateBarGeometry` uses. Centre distance minus the two radii stays in that one function.

A negative measured clearance is intersecting geometry and is undetermined, not a normal spacing failure. A measured clearance of zero is valid geometry and is not satisfied when the required clearance is greater than zero.

When the measured clearance is positive, utilization is required clearance divided by measured clearance. A value of at most one is satisfied. Ties among governing terms are reported as multiple components.

The method rechecks a supplied layout. It does not move bars.

## Limits

The rule source remains a single governed reference. Engineer validation is pending. Formal EN 1992 conformance is not claimed. The product claim remains the Eurocode concrete mechanics reference capability. The bounded sub-claim is a minimum-clear-reinforcement-spacing reference capability.

Anchorage and laps are still unbound. The next phase is targeted anchorage rule recovery, not an anchorage implementation.
