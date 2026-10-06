# EOS-D1D-US-8 US Structural Steel Independent Validation, AISC Conformance Classification and Release Gate

Independent assurance of US-1 through US-7. This phase classifies what the US structural steel capability can truthfully claim. It does **not** implement missing AISC design equations, invent LRFD/ASD factors, invent interaction, classification, Cb, K, shear-area, or web-slenderness rules, infer AISC or ASCE editions, populate building-code adoption datasets, promote mechanics to AISC strengths, treat benchmarks as AISC conformance, treat an AISC member check as building-code compliance, self-certify EOS, or claim professional approval.

`US_STEEL_PACK_CERTIFIED = NO`. `US_STEEL_IMPLEMENTATION_MATURITY = FRAMEWORK_PLUS_BOUNDED_METHODS`. `US_STEEL_STANDARD_CONFORMANCE_STATE = INTENDED_PROFILE`. `US_STEEL_RELEASE_CLASSIFICATION = INTERNAL_ENGINEERING_REFERENCE`. `US_STEEL_PRODUCT_CLAIM_LEVEL = BENCHMARKED_ENGINEERING_REFERENCE_CAPABILITY`. Structural maturity remains `REFERENCE_PARTIALLY_IMPLEMENTED`. AISC edition and amendment remain `UNKNOWN_PENDING_CONFIRMATION`.

## Validation dimensions

Kept independent (never collapsed into one boolean):

- implementation maturity
- numerical validation
- engineering validation
- standard conformance
- building-code compliance
- product release state
- software certification
- project engineering approval

A mechanics benchmark does **not** equal AISC conformance. AISC conformance evidence is required against the exact applicable standard identity, edition, amendment/errata, design method, method scope, code rule, required dependencies, and local-amendment context where applicable. AISC conformance alone does **not** establish adopted-building-code compliance. Numerical validation, AISC conformance, building-code compliance, and software certification do **not** equal project approval.

## Method inventory and classification

Every US-2 through US-7 method is inventoried in `US_METHOD_VALIDATION_INVENTORY` with authority, AISC edition requirement, design-method and unit-system applicability, load/stability/classification/local-buckling/amendment dependencies, inputs, scope, version, benchmarks, and validation states.

Classifications used:

- `ENGINEERING_MECHANICS_REFERENCE` — tension, squash, elastic bending, elastic shear
- `ELASTIC_BUCKLING_REFERENCE` — Euler, elastic LTB, elastic shear buckling
- `NOMINAL_STRENGTH_METHOD` / `LRFD_DESIGN_STRENGTH_METHOD` / `ASD_ALLOWABLE_STRENGTH_METHOD` — FRAMEWORK_ONLY AISC-profile placeholders (not counted as implemented)
- `INTERACTION_METHOD` — FRAMEWORK_ONLY detection; no numerical methods
- `SERVICEABILITY_METHOD` — governed-criterion orchestration
- `ORCHESTRATION_METHOD` — US-7 member design record

Mechanics references are not classified as AISC design strengths. Code-profile method count is 28. Implemented count is 0. Validated count is 0. `GENERAL_US_MEMBER_CODE_DESIGN_VALIDATED = NO`.

## AISC standard-binding audit

US-1 family, edition/version model, LRFD/ASD, building-code adoption context, load-standard dependency, seismic-standard dependency, connection-standard dependency, local amendments, direct-contract profile, project overrides, source precedence, and historical-version immutability remain in force. Edition is not inferred. Unknown governing edition prevents `CONFORMANCE_VALIDATED` and `CERTIFIED`. Historical issued contexts remain reproducible and are not overwritten.

## Building-code adoption audit

Building code is not the AISC steel standard. Adoption metadata (adopting authority, building-code edition, effective date, referenced standards, local amendments, project context, source authority, conflict detection) is modelled. Real-world adoption datasets are **not** populated by this audit. An AISC design result does not automatically establish adopted-building-code compliance.

## Direct-contract profile audit

Projects may use a contractual AISC profile outside US geography. AISC is not hardcoded to US geography. Direct contract may establish contract-profile evaluation. Direct contract does **not** equal local building-code compliance.

## Load-standard dependency audit

Load standard remains separate from the AISC member standard. ASCE/load-standard edition is not silently inferred. D1C remains the demand engine. The US adapter does not duplicate a load-combination engine.

## LRFD/ASD audit

Design method is explicit. There is no default LRFD or ASD and no silent conversion. LRFD and ASD strength semantics and factors remain separate. Interaction inputs and member design cannot mix design methods. Design method is independent from unit system. Architecturally valid combinations are LRFD+US customary, LRFD+SI, ASD+US customary, and ASD+SI.

## Local amendment audit

Local amendment identity, base-code compatibility, and edition compatibility are explicit. Amendments are not inferred from location and values are not guessed. Conflicts fail closed.

## Stability governance audit

No default K. Support labels do not automatically define K. Effective-length provenance is required. Stability-analysis method is explicit. Incompatible stability methods do not mix. Second-order context is distinct in invalidation. D1C is not claimed as complete AISC stability analysis. Cb, classification, and local-buckling rules are not guessed.

## Common-mechanics audit

Shared tension, Euler, effective-length, bending, LTB, and shear mechanics remain jurisdiction-neutral. They contain no AS 4100, Eurocode, National Annex, NDP, AISC, LRFD, ASD, or US local-amendment authority. Identical physical inputs produce consistent AU, EU, and US mechanics-reference results within declared tolerances. This validates physics only. Shared physics does **not** imply shared code resistance, design factor, classification rule, interaction equation, conformance, or approval.

## Benchmark audit

Eleven independent hand-calculation benchmarks for US-2 through US-5 mechanics methods. Expected values are not produced by the production adapter. Inputs, expected/actual results, units, tolerance, technical basis, and provenance are explicit. `US_BENCHMARK_AUDIT_RESULT = PASS`. Self-referential benchmarks are forbidden. A mechanics benchmark validates mechanics only.

Third-party commercial comparison: **not available** (not fabricated).

## Method validation states

- Tension: numerically validated mechanics (`FyAg` / `FuAn`); AISC code-profile validation required; standard conformance not validated. Effective-net-area, LRFD/ASD tension strengths, and block shear remain unpromoted.
- Compression: numerically validated squash and Euler references. Euler is not AISC member compression strength. Compression strength curve, classification/local buckling, torsional and flexural-torsional buckling, stability-analysis method, and LRFD/ASD factors remain unvalidated.
- Bending / LTB: numerically validated elastic major/minor My and uniform-moment elastic Mcr. Elastic bending and elastic LTB are not AISC flexural strength. Classification, local buckling, Cb, transition parameters, and LRFD/ASD strengths remain unvalidated.
- Shear / web: numerically validated von Mises yield and elastic plate buckling. Elastic shear is not AISC shear strength. Elastic shear buckling is not AISC web strength. Web slenderness, web stability, tension-field action, and LRFD/ASD strengths remain unvalidated.
- Interaction: `IMPLEMENTED_US_INTERACTION_METHODS = NONE` after US-8. Required combined action with no numerical AISC interaction method remains `CHECK_UNDETERMINED`.
- Serviceability: US-7 orchestration validated (D1C deflection reused, no duplicate solver, ULS/SLS distinct, criterion governed, no ungoverned default span-ratio limits, absolute and span-ratio criteria accepted when supplied, local-amendment and building-code and direct-contract context supported, missing criterion fail-closed). This is orchestration validation, not universal serviceability limits.
- Member orchestration: mechanics complete does not equal AISC code design complete. Mechanics ratio below 1 does not equal AISC pass. Missing code-profile strength, required interaction unavailable, or mixed LRFD/ASD → `CHECK_UNDETERMINED`. A failed valid governed check → `CHECK_NOT_SATISFIED`.

## Four-layer result model

MECHANICS, AISC CODE DESIGN, BUILDING-CODE / CONTRACT COMPLIANCE, and ENGINEERING APPROVAL remain separate. No member becomes `BUILDING_CODE_COMPLIANT` solely from an AISC calculation.

## Supported / unsupported scope

Supported: benchmark-validated structural mechanics references with governed AISC-profile context, LRFD/ASD governance, building-code/direct-contract context, and fail-closed member orchestration.

Not supported as design-validated: complete AISC steel design, code-profile strengths, numerical interaction, default span-ratio limits, connections, seismic steel design, foundations, global frame stability, general 3D FEA, certified construction use.

## Product claim and release

`BENCHMARKED_ENGINEERING_REFERENCE_CAPABILITY`. Release remains `INTERNAL_ENGINEERING_REFERENCE`. Pack remains uncertified. Result warnings include mechanics-reference-only, unvalidated AISC strength, required LRFD/ASD method context, unavailable interaction, unconfirmed AISC edition, building-code compliance not established, incomplete local-amendment context, engineering review required, and not approved for construction.

## Analysis and adjacent-discipline boundaries

D1C remains bounded. Member checks do not establish connection design, seismic compliance, foundation adequacy, or global frame stability. General FEA is not claimed. Candidate optimization requires deterministic recheck and cannot accept `CHECK_UNDETERMINED` as design-valid.

## AI authority

AI may explain completeness and gaps. AI may not choose AISC edition, choose LRFD/ASD, invent Fy/Fu, K, Cb, classification, local-buckling, shear-area, web-slenderness, interaction, serviceability criteria, or local amendments, claim AISC conformance, claim building-code compliance, or approve design. Optimizers must fully recheck candidates.

## Validation matrix, debt, and priority

See `US_STEEL_VALIDATION_MATRIX`, `US_VALIDATION_DEBT_REGISTER`, and `US_VALIDATION_PRIORITY_PLAN`. Safety-critical debt includes compression/flexural/LTB/web code strength, classification, torsional and flexural-torsional buckling, interaction, connections, and seismic design. Conformance-critical debt includes exact AISC edition/amendment, building-code adoption datasets, load-standard edition, local amendments, material/catalog sources, tension/shear code rules, Cb, transition parameters, SLS criteria, and human confirmation. Commercial-release-critical debt includes catalogs, third-party comparison, and solver certification.

## Three-jurisdiction architecture state

One common mechanics core, one common object model, and one common orchestration concept remain, with jurisdiction-specific authority adapters:

- AU: standard-profile model
- EU: Eurocode + National Annex + NDP
- US: building-code adoption + referenced standards + LRFD/ASD + local amendments

Global-first architecture is preserved. EU high-water-mark is inherited and is not reduced. EOS is not an EU-only product. Shared invalidation remains jurisdiction-neutral. AU/EU method inventory, validation matrix, orchestration, and authority semantics are not regressed. Cross-jurisdiction parameter leakage is forbidden.

## D1D closeout handoff

US-8 closes the US steel assurance gate for current bounded mechanics-plus-orchestration. Pack remains uncertified. Next phase is **D1D closeout**. This does not authorize general AISC design use, building-code compliance claims, or professional sign-off.
