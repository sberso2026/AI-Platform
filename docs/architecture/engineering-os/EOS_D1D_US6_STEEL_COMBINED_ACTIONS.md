# EOS-D1D-US-6 US Structural Steel Combined Actions

Governed AISC-profile **combined-action / interaction** architecture. Simultaneous actions are detected and represented without inventing AISC interaction equations, exponents, equivalent-moment factors, amplification factors, compactness rules, LRFD/ASD interaction factors, or shear/moment reductions. Unrelated load combinations and LRFD/ASD component strengths are not mixed.

`IMPLEMENTED_US_INTERACTION_METHODS = NONE`. All eight interaction types are `FRAMEWORK_ONLY`. A required interaction check returns `CHECK_UNDETERMINED`, not a synthetic utilization. `US_STEEL_PACK_CERTIFIED = NO`. `US_STEEL_IMPLEMENTATION_MATURITY = FRAMEWORK_PLUS_BOUNDED_METHODS`. Standard conformance remains `INTENDED_PROFILE`. Structural maturity remains `REFERENCE_PARTIALLY_IMPLEMENTED`. AISC edition remains `UNKNOWN_PENDING_CONFIRMATION`.

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

Detection means `INTERACTION_REQUIRED`, not PASS/FAIL. Numerical AISC interaction methods are not implemented.

Out of scope: torsion + axial/bending/shear; bolt, weld, bearing, block-shear, and other connection interaction; AISC seismic interaction; global frame stability / general FEA.

## Interaction taxonomy

Jurisdiction-neutral taxonomy, same-combination checks, revision compatibility, component-authority contracts, and the informational component-utilization vector live in `structural-steel/mechanics/interaction`. AU-5 and EU-6 interaction architecture was reviewed and reused only where jurisdiction-neutral. AS 4100 and EN 1993 method IDs, coefficients, National Annex / NDP values, and γ factors are not copied into the US adapter. A parallel interaction framework was not created.

## Component-authority model

`MECHANICS_REFERENCE` is distinct from `NOMINAL_STRENGTH`, `LRFD_DESIGN_STRENGTH`, and `ASD_ALLOWABLE_STRENGTH`. A mechanics-reference component cannot automatically substitute for required AISC code-profile strength. Insufficient authority fails closed.

## LRFD / ASD interaction isolation

Every AISC interaction check binds one explicit design method: LRFD or ASD. There is no default and no silent conversion. LRFD component strengths cannot be mixed with ASD component strengths in one check. Future numerical rules, if any, bind LRFD and ASD separately and are not transformed into each other.

## Same-combination requirement

All simultaneous actions come from governed D1C demand. `N`, `Mx`, `My`, `Vx`, and `Vy` are not regenerated. Interaction requires compatible simultaneous actions from the same load combination. Cross-combination interaction fails closed unless a separately governed envelope method exists (none in US-6).

## Load-basis compatibility

Interaction inputs must share compatible load basis, design method, combination type, and analysis model/revision. Incompatible demand/design-method context fails closed through the US-1/US-2 resolver.

## Revision compatibility

Component demand and capacity inputs must share compatible member, analysis, section, material, standard-context, AISC edition, design method, and method-version revisions. Mismatch fails closed.

## Interaction-required detection

Deterministic detection covers axial + major/minor/biaxial bending, major + minor bending, bending + shear, and axial + shear. Detection does not produce PASS/FAIL.

## Component-utilization vector

Independent component ratios (axial, major/minor bending, major/minor shear) may be displayed for engineering information. The vector is not a combined-action check (`equalsInteractionCheck = false`). Component utilizations below 1 do not constitute an AISC interaction pass.

## Tension + bending

Tension + uniaxial and tension + biaxial frameworks are registered. No numerical AISC tension-bending equation is executed. Result: `CHECK_UNDETERMINED`.

## Compression + bending

Compression + uniaxial and compression + biaxial frameworks preserve stability-analysis method (`EFFECTIVE_LENGTH_BASED`, `DIRECT_ANALYSIS_BASED`, `OTHER_GOVERNED_METHOD`), effective-length context, second-order analysis context, major/minor buckling, LTB, unbraced length, restraints, element classification, and local buckling as required inputs. Component-utilization addition is not used as the interaction check. Missing required stability yields `MISSING_STABILITY`. Incompatible stability methods fail closed.

## Biaxial bending

Governed biaxial bending framework. `Mx/Mcx + My/Mcy <= 1` is not assumed.

## Axial + biaxial bending

Explicit `N + Mx + My` framework. No universal three-component expression is manufactured.

## Bending + shear

US-5 deferred bending/shear interaction. The framework is registered. Bending-resistance reduction, shear threshold, and interaction coefficient are not guessed. Numerical implementation remains `NO`.

## Axial + shear

Architecture exists where a future governed AISC method may require it. Universal axial/shear interaction is not assumed.

## No universal interaction equation

There is no global `N/Nc + M/Mc`, `Mx/Mcx + My/Mcy`, or `N/Nc + Mx/Mcx + My/Mcy` equation unless a later specifically governed adapter rule defines exact scope and edition. Unknown relationships are not guessed.

## Stability-analysis dependency

Compression + bending interaction depends on the governed US-3 stability-analysis method. Assumptions from incompatible methods are not mixed. Second-order context is represented; amplified moments are never fabricated.

## Classification / local-buckling / LTB dependency

Interaction may depend on element classification and local buckling (US-4). Classification is not guessed (`VALIDATION_REQUIRED` today → `MISSING_CLASSIFICATION`). Component mechanics are not assumed to already include AISC local-buckling reductions. LTB context is required where the governed rule needs it (`MISSING_LTB` when unresolved).

## Local amendments

If a local/project amendment affects an interaction rule, the dependency is explicit. Unknown required amendment: `CHECK_UNDETERMINED`.

## Direct-contract profile

AISC interaction architecture operates for non-US projects using a contractually specified AISC profile. Direct-contract context does not imply local building-code compliance.

## Implemented interaction methods

None. `US_INTERACTION_INDEPENDENT_BENCHMARKS = NOT_APPLICABLE`. Component mechanics benchmarks do not validate an AISC interaction equation, coefficient, stability interaction, classification dependency, or LRFD/ASD interaction rule. Self-referential benchmarks are prohibited. If numerical LRFD and ASD methods later exist, each requires separate method validation.

## Framework-only interaction methods

All eight registered methods: tension/compression uniaxial and biaxial bending, biaxial bending, axial + biaxial bending, bending + shear, axial + shear. Each records rule/method identity, authority type, technical basis, AISC edition requirement, design-method applicability, component-authority requirements, stability/classification/local-buckling/LTB dependencies, required inputs, factor/amendment dependencies, applicability, output type, implementation version, validation state, conformance state, and empty benchmark refs. `LLM_MEMORY_ONLY`, unsourced web summaries, and unverified generated rules are rejected.

The interaction **framework** may be `IMPLEMENTED` while numerical code methods remain `FRAMEWORK_ONLY` / `INTENDED_PROFILE`.

## CHECK_UNDETERMINED semantics

`CHECK_UNDETERMINED` is mandatory when the interaction rule is unavailable or unvalidated, required AISC component strength is unavailable, only mechanics-reference components exist, design method mismatches, load combinations mismatch, revisions mismatch, stability method is missing or incompatible, classification is unavailable, local buckling or LTB is unresolved, a required parameter is missing, a local amendment conflicts, or the AISC edition is incompatible. It is not PASS.

Supported check states: `CHECK_SATISFIED`, `CHECK_NOT_SATISFIED`, `CHECK_UNDETERMINED`.

## Benchmark state

Not applicable. No numerical AISC interaction method is implemented. Benchmarks of component mechanics do not equal AISC interaction conformance.

## Conformance limitation

Implementation maturity is `FRAMEWORK_PLUS_BOUNDED_METHODS`. Standard conformance remains `INTENDED_PROFILE`. Unknown AISC edition prevents a conformance claim. The US steel pack is not certified.

## AI boundary

AI may detect likely interaction requirement, identify missing component strengths, load/design-method mismatch, missing stability, classification, LTB, or local-buckling context, explain why interaction is undetermined, and suggest candidate sections.

AI may not invent interaction equations, exponents, coefficients, amplified moments, classification, stability methods, or LRFD/ASD factors; mix load combinations or design methods; originate an AISC interaction result; claim conformance; or approve design.

## US-7 handoff

US-7 is the independent certification / validation gate. US-6 does not expose unfinished US interaction design to the current pilot. Optimizer candidates cannot be classified design-valid while interaction remains `CHECK_UNDETERMINED`. Member interaction checks do not establish global frame stability.
