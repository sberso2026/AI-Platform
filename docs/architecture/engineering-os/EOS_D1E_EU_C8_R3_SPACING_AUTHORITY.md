# EOS-D1E-EU-C8-R3 minimum clear spacing authority

## Scope

This phase binds a spacing sub-pack under `EU-EN1992-1-1-GEN1-C8-DETAILING-REFERENCE`. It does not calculate spacing.

The bound scope is ordinary non-prestressed concrete, individual straight deformed bars of one nominal diameter, and clear surface-to-surface spacing. Mesh, prestressing tendons, bundles, couplers, and seismic detailing stay outside that scope.

## Source

The Joint Research Centre Brussels 2011 detailing slide states minimum clear spacing as the maximum of three terms: a coefficient times the nominal bar diameter, the maximum aggregate size plus an allowance, and 20 mm. The same slide draws that clear gap both beside and above a bar, so one rule covers those two directions for individual bars. It does not state a separate layer formula or a bundle diameter.

The slide labels the diameter coefficient and the aggregate allowance as recommended values. This profile does not apply those recommendations. Both remain explicit nationally determined inputs. A missing value fails closed. The 20 mm term is the absolute term inside the stated maximum and is a profile parameter.

A 25 mm result on the same slide is an illustration of that maximum for a 20 mm aggregate and a bar not larger than 25 mm. It is not a second rule.

## Geometry and materials

Measured clear spacing stays on the existing reinforcement geometry: centre distance minus the two bar radii. No second spacing geometry was added. Maximum aggregate size is an explicit material or project quantity. No second material model was added.

Unequal nominal diameters are outside the bound scope. A project spacing requirement that could raise or lower the governed minimum is not bound.

## What this is not

C7 crack-control bar spacing is a different rule and stays deferred. Cover assembly is unchanged. Anchorage and laps are not bound. No spacing runtime method is registered.

Engineer validation is pending. Formal EN 1992 conformance is not claimed. The product claim remains the Eurocode concrete mechanics reference capability.

## Next phase

`EOS-D1E-EU-C8-R3B-SPACING-IMPLEMENTATION` may implement and numerically validate this bounded clear-spacing rule. It must keep the nationally determined coefficients explicit.
