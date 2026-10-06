# EOS-D1D-EU-6 Eurocode Steel Combined Actions

Governed Eurocode-profile **combined-action / interaction** architecture. Simultaneous actions are detected and represented without inventing EN 1993 interaction equations, exponents, interaction factors, equivalent-moment factors, buckling interaction coefficients, section classification, partial factors, or National Annex / NDP values. Unrelated load combinations are not mixed.

`IMPLEMENTED_EU_INTERACTION_METHODS = NONE`. All eight interaction types are `FRAMEWORK_ONLY`. A required interaction check returns `CHECK_UNDETERMINED`, not a synthetic utilization. `EU_STEEL_PACK_CERTIFIED = NO`. `EU_STEEL_IMPLEMENTATION_MATURITY = FRAMEWORK_PLUS_BOUNDED_METHODS`. Standard conformance remains `INTENDED_PROFILE`. Structural maturity remains `REFERENCE_PARTIALLY_IMPLEMENTED`.

## Scope

Architecturally supported interaction types:

- tension + uniaxial bending
- tension + biaxial bending
- compression + uniaxial bending
- compression + biaxial bending
- biaxial bending
- axial + biaxial bending (`N + Mx + My`)
- bending + shear
- axial + shear

Detection means `INTERACTION_REQUIRED`, not PASS/FAIL. Numerical EN 1993 interaction methods are not implemented.

Out of scope: torsion + axial/bending/shear; bolt, weld, bearing, block-shear, and other connection interaction; global frame stability / general FEA.

## Interaction taxonomy

Jurisdiction-neutral taxonomy, same-combination checks, revision compatibility, component-authority contracts, and the informational component-utilization vector live in `structural-steel/mechanics/interaction`. AU-5 interaction architecture was reviewed and reused only where jurisdiction-neutral. AU method IDs, AS 4100 coefficients, and AU standard metadata are not copied into the EU adapter. A parallel interaction framework was not created.

## Standard-part dependencies

`EU_INTERACTION_STANDARD_PART_DEPENDENCY_MODEL` binds member interaction to EN 1993-1-1 and records an EN 1993-1-5 dependency for plated bending/shear context. One EN 1993 part is not assumed to govern every interaction type. Unknown required parts fail closed. Edition and amendment remain `UNKNOWN_PENDING_CONFIRMATION` unless independently confirmed. Unknown edition cannot claim `CONFORMANCE_VALIDATED` or `CERTIFIED`.

Every numerical Eurocode interaction method, if later implemented, must bind jurisdiction profile, Eurocode family, standard part(s), edition, amendment/corrigendum, National Annex where applicable, NDP set where applicable, project context, calculation context, and method version.

## Combined-action context

`EurocodeSteelCombinedActionContext` records member, section, material, D1C demand refs (axial, major/minor moment, major/minor shear), component capacity vs mechanics refs, compression and bending stability refs, classification state, interaction rule ref, standard context, standard parts, National Annex / NDP refs, technical basis, provenance, validation state, and conformance state.

## D1C demand and same-combination rule

All actions come from governed D1C demand. `N`, `Mx`, `My`, `Vx`, and `Vy` are not regenerated inside EU-6. Interaction requires compatible simultaneous actions from the same load combination, or an explicitly governed envelope. Cross-combination interaction fails closed.

## Revision compatibility

Component demand and capacity inputs must share compatible member, analysis, section, material, standard-context, and method-version revisions. Stale or mismatched components fail closed (`revision mismatch` / `CHECK_UNDETERMINED`).

## Component-authority model

`MECHANICS_REFERENCE` is distinct from `CODE_PROFILE_CAPACITY`. A mechanics-reference component capacity is not treated as validated Eurocode resistance. Mixed-authority inputs are checked. Insufficient authority fails closed and does not silently promote mechanics results.

## Component utilization vector

Independent component ratios (axial, major/minor bending, major/minor shear) may be displayed for engineering information. The vector is not a combined-action check (`equalsInteractionCheck = false`). Component utilizations are not an interaction equation.

## Interaction-required detection

Deterministic detection covers axial + major/minor/biaxial bending, major + minor bending, bending + shear, and axial + shear. Detection does not produce PASS/FAIL.

## Tension + bending

Tension + uniaxial and tension + biaxial frameworks are registered. No numerical EN 1993 tension-bending equation is executed. Result: `CHECK_UNDETERMINED`.

## Compression + bending

Compression + uniaxial and compression + biaxial frameworks preserve compression stability, effective length, buckling axis, bending stability / LTB context, unbraced length, restraint, moment distribution, and classification as required inputs. Component-utilization addition is not used as the interaction check. Missing required stability yields `MISSING_STABILITY`.

## Biaxial bending

Governed biaxial bending framework. `Mx/Mcx + My/Mcy <= 1` is not assumed.

## Axial + biaxial bending

Explicit `N + Mx + My` framework. No universal three-component expression is manufactured.

## Bending + shear

EU-5 deferred bending/shear interaction. The framework is registered. Bending-resistance reduction, shear threshold, and interaction coefficient are not guessed. EN 1993-1-5 remains a declared plated dependency.

## Axial + shear

Architecture exists where a future governed method may require it. Universal axial/shear interaction is not assumed.

## No universal interaction equation

There is no global `N/Nc + M/Mc`, `Mx/Mcx + My/Mcy`, or `N/Nc + Mx/Mcx + My/Mcy` equation unless a later specifically governed adapter rule defines exact scope. Unknown relationships are not guessed.

## Classification and stability dependency

If a method depends on section classification, classification must be governed. Classification is not invented (`VALIDATION_REQUIRED` today → `MISSING_CLASSIFICATION`). Compression + bending must not ignore member buckling, LTB, effective length, unbraced length, or restraints where the governing rule requires them.

## National Annex / NDP dependency

Each registered numerical interaction rule is classified `NDP_REQUIRED`. Missing required Annex/NDP fails closed (`CHECK_UNDETERMINED`). There is no default EU National Annex. Annex is not inferred from user location. Wrong-country and wrong-edition annexes are rejected. Second-generation methods are not mixed with first-generation methods. UK Eurocode + UK National Annex is supported as a profile, not as EU membership.

## CHECK_UNDETERMINED semantics

`CHECK_UNDETERMINED` is mandatory when the interaction rule is unavailable or unvalidated, required classification or stability is unavailable, required Annex/NDP is missing, edition is incompatible, component authority is insufficient, or revisions mismatch. It is not PASS.

Supported check states: `CHECK_SATISFIED`, `CHECK_NOT_SATISFIED`, `CHECK_UNDETERMINED`.

## Implemented interaction methods

None. `EU_INTERACTION_INDEPENDENT_BENCHMARKS = NOT_APPLICABLE`. Component mechanics benchmarks do not validate a Eurocode interaction equation, coefficient, buckling interaction, or National Annex / NDP parameter.

## Framework-only interaction methods

All eight registered methods: tension/compression uniaxial and biaxial bending, biaxial bending, axial + biaxial bending, bending + shear, axial + shear. Each records rule/method identity, authority type, technical basis, standard parts, edition requirement, Annex/NDP dependencies, classification/stability dependencies, required inputs, applicability, output type, implementation version, validation state, conformance state, and empty benchmark refs. `LLM_MEMORY_ONLY`, unsourced web summaries, and unverified generated rules are rejected.

The interaction **framework** may be `IMPLEMENTED` while numerical code methods remain `FRAMEWORK_ONLY` / `INTENDED_PROFILE`.

## Result contract

`SteelCombinedActionResult` records member, combination, interaction type, component demand/capacity refs, component authority states, rule ref, interaction value (null until a governed numerical rule exists), criterion (null), check state, standard parts, edition, National Annex / NDP refs, technical basis, validation/conformance/benchmark states, provenance, and human-review state.

Where multiple interaction checks apply, all are preserved. Governing selection is deterministic (canonical interaction order).

## AI boundary

AI may detect likely interaction requirement, identify missing component checks, classification, or Annex/NDP, explain deterministic component results, explain why interaction remains undetermined, and suggest candidate sections.

AI may not invent interaction equations, exponents, coefficients, undocumented methods, classification, stability parameters, or NDPs; combine incompatible load cases; claim EN 1993 conformance; or approve design.

Optimizer candidates must satisfy applicable component checks and required validated interaction checks. `CHECK_UNDETERMINED` interaction is not design-valid.

## Approval separation

`CHECK_SATISFIED` would not equal `DESIGN_APPROVED`, `CONSTRUCTION_APPROVED`, or `IFC_APPROVED`. Automatic engineering approval is not introduced. Unfinished EU interaction is not exposed to Profile A (`EU_COMBINED_PILOT_EXPOSURE = NO`).

## Conformance limitation

`STANDARD_CONFORMANCE_STATE = INTENDED_PROFILE`. Edition and amendment remain `UNKNOWN_PENDING_CONFIRMATION`. Human review is required before `HUMAN_VALIDATED`, `PILOT`, `CONFORMANCE_VALIDATED`, or `CERTIFIED`. Runtime does not require copyrighted standard text.

## EU-7 handoff

EU-7 is the independent certification / remaining-capability gate. It must not treat this framework as certified interaction design. Remaining EU member-design work includes serviceability and any later governed numerical interaction methods, each requiring independent benchmarks, confirmed edition/amendment, governed classification/stability, and Annex/NDP context.
