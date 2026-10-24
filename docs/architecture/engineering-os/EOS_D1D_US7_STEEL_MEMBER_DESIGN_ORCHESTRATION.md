# EOS-D1D-US-7 US Structural Steel Member Design Orchestration

Bounded AISC-profile **member-design orchestration** that assembles US-1 through US-6 demand, mechanics-reference results, LRFD/ASD context, stability-analysis method, member-stability requirements, element classification, local buckling, LTB, combined-action requirements, governed serviceability, building-code / direct-contract context, completeness, validation, standard conformance, human review, and approval into one `USSteelMemberDesignRecord`. This phase does **not** certify AISC 360, invent interaction equations, invent deflection limits, mix LRFD with ASD, or approve members.

`US_STEEL_PACK_CERTIFIED = NO`. `US_STEEL_IMPLEMENTATION_MATURITY = FRAMEWORK_PLUS_BOUNDED_METHODS`. `STANDARD_CONFORMANCE_STATE = INTENDED_PROFILE`. `US_STEEL_RELEASE_CLASSIFICATION = INTERNAL_ENGINEERING_REFERENCE`. Structural maturity remains `REFERENCE_PARTIALLY_IMPLEMENTED`. Edition and amendment remain `UNKNOWN_PENDING_CONFIRMATION`.

## Scope

The orchestrator answers separately:

1. Which checks are applicable
2. Which mechanics evaluations are complete
3. Which AISC-profile strength checks are available
4. Which required checks are unavailable
5. Which checks are satisfied / not satisfied / undetermined
6. Whether serviceability is evaluable
7. Whether the member design is complete
8. Whether the LRFD/ASD context is coherent
9. Whether AISC conformance is validated
10. Whether building-code compliance is established
11. Whether human engineering review has occurred
12. Whether engineering approval has occurred

These questions are not collapsed into one PASS flag.

AU-6 and EU-7 member orchestration were reviewed. Jurisdiction-neutral record, taxonomy, applicability, completeness aggregation, fingerprint/invalidation, and D1C deflection contracts are reused. AU and EU code authority, coefficients, annex/NDP binding, and pass semantics are not reused as US rules. A parallel orchestration framework was not created.

## Four-layer result model

- **Mechanics evaluation** — bounded US-2 through US-5 references may be executed and recorded.
- **AISC code-profile design check** — AISC 360 resistance / interaction methods. Currently unavailable; result is `CHECK_UNDETERMINED`.
- **Building-code / contract compliance context** — adopted US building-code context or direct-contract AISC profile. Never inferred from an AISC check.
- **Engineering approval** — never set by US-7. Remains `not_approved`.

A mechanics-reference ratio below 1 is not an AISC pass. Mechanics completeness is not AISC code-design completeness. A future valid AISC member check is not building-code compliance. Direct-contract AISC evaluation is not local building-code compliance.

## Mechanics vs AISC design completeness

Mechanics: `COMPLETE_FOR_AVAILABLE_MECHANICS` | `INCOMPLETE_MECHANICS_INPUT` | `MECHANICS_METHOD_UNAVAILABLE` | `NOT_APPLICABLE`.

Code-design incompleteness reasons include `CODE_METHOD_UNAVAILABLE`, `INTERACTION_METHOD_UNAVAILABLE`, `DESIGN_METHOD_REQUIRED`, `LOAD_BASIS_INCOMPATIBLE`, `STABILITY_METHOD_REQUIRED`, `ELEMENT_CLASSIFICATION_REQUIRED`, `LOCAL_BUCKLING_RULE_REQUIRED`, `EFFECTIVE_LENGTH_REQUIRED`, `UNBRACED_LENGTH_REQUIRED`, `LTB_CONTEXT_REQUIRED`, `AISC_EDITION_REQUIRED`, `LOCAL_AMENDMENT_CONFLICT`, `BUILDING_CODE_CONTEXT_REQUIRED`, `SERVICEABILITY_CRITERION_REQUIRED`, `VALIDATION_REQUIRED`, `STALE_RESULT`, `MISSING_INPUT`, `UNSUPPORTED_SCOPE`. FRAMEWORK_ONLY / VALIDATION_REQUIRED methods do not count as complete.

`IMPLEMENTED_US_INTERACTION_METHODS = NONE`. Required interaction keeps code-design `CHECK_UNDETERMINED`. Component checks cannot substitute for interaction. US-7 does not add interaction equations. Mixed LRFD/ASD strengths in one member evaluation fail closed.

## LRFD / ASD coherence

Design method is required where code-design applies. There is no default LRFD or ASD. All code-profile component strengths and interaction results in one member evaluation must use compatible design-method semantics. Load-basis / design-method mismatch fails closed. LRFD and ASD each work with US customary or SI units when the project context supplies them.

## Check taxonomy and applicability

Canonical categories: `TENSION`, `COMPRESSION`, `STABILITY_COMPRESSION` (compression stability), `BENDING_MAJOR`, `BENDING_MINOR`, `STABILITY_LTB` (LTB), `SHEAR_MAJOR`, `SHEAR_MINOR`, `WEB_STABILITY`, `COMBINED_ACTION`, `DEFLECTION`, `OTHER_SERVICEABILITY`.

Dependencies tracked separately: design method, load/design-method compatibility, stability-analysis method, element classification, local buckling, building-code context where required, local amendments where required.

Applicability is deterministic from demand presence, unbraced length, simultaneous actions, and explicit serviceability request. Applicability is not adequacy.

## Stability-analysis, effective-length, and second-order context

US-3 stability-analysis method context is preserved (`EFFECTIVE_LENGTH_BASED`, `DIRECT_ANALYSIS_BASED`, `OTHER_GOVERNED_METHOD`). Incompatible mixing of effective-length assumptions, second-order assumptions, component strengths, and interaction methods is rejected.

Governed effective length, axis, and provenance are preserved. K is never defaulted. Second-order context is preserved when supplied. Moment amplification is never fabricated during orchestration.

## Classification, local buckling, LTB, shear/web

Element classification is propagated and remains `VALIDATION_REQUIRED`. Classification is never guessed. Required local-buckling rules stay explicit; a missing rule prevents AISC code pass. LTB preserves unbraced length, restraint, moment-gradient, and load-application context where supplied. Unknown required LTB code method remains `CHECK_UNDETERMINED`. Shear/web preserves shear-area, web geometry, slenderness, panel, stiffener, elastic web-buckling, and code-profile web-strength availability. Stiffener state is never silently assumed.

## Interaction limitation

US-6 numerical interaction methods remain unimplemented. Multi-action members trigger the US-6 interaction assessment. Missing numerical interaction yields `CHECK_UNDETERMINED` and blocks overall AISC code-design satisfaction. LRFD/ASD mismatch in interaction inputs also blocks code pass.

## Serviceability and source governance

`USSteelServiceabilityContext` plus `SteelServiceabilityResult`. D1C deflection demand is reused. US-7 does not add a deflection solver. Strength/ultimate demand is not used as serviceability by default. Load case/combination/basis for serviceability must be explicit and distinct from strength demand.

Criteria must be governed (`PROJECT_REQUIREMENT`, `CLIENT_REQUIREMENT`, `ENGINEERING_DESIGN_CRITERIA`, `BUILDING_CODE_REQUIREMENT`, `REFERENCED_STANDARD_RULE`, `LOCAL_AMENDMENT`, `HUMAN_CONFIRMED_RULE`, other governed sources). AISC is not assumed to be the sole source. Absolute displacement and `L/n` are supported only when the value and `n` are supplied. Common ratios such as `L/240` through `L/600` are never defaulted.

Missing criterion: `CHECK_UNDETERMINED` / `SERVICEABILITY_CRITERION_REQUIRED`. Local-amendment and building-code dependencies fail closed when required and unresolved. Direct-contract projects may use governed project/client criteria without a US building-code adoption context; that evaluation does not establish local building-code compliance.

Vibration, drift, rotation, local deformation, equipment alignment, floor response, and cladding/interface limits are extensible and unimplemented.

## Completeness matrix and governing issue

Each applicable check records applicability, authority (mechanics / code-profile / governed), state, completeness, and reason. Governing issue priority is `CHECK_NOT_SATISFIED`, then `CHECK_UNDETERMINED`, then `CHECK_SATISFIED`, in canonical taxonomy order, considering authority, interaction incompleteness, serviceability, stability, and compliance context. Highest utilization does not always govern. There is no universal member utilization.

## Versioning / invalidation

Fingerprints cover geometry/section/material, demand/combination, design method, effective lengths, unbraced length, restraint, stability method, classification, criterion, AISC edition, building-code edition, local amendment, and method versions. Dependent results are invalidated rather than reused. Historical member records remain reproducible when later editions appear. Stale result reuse fails closed.

## Conformance, review, and approval

Member records report `INTENDED_PROFILE`. Affirmative AISC / US-code / building-code compliance language is not emitted. Human review: `NOT_REVIEWED` | `UNDER_REVIEW` | `REVIEWED` | `REQUIRES_REVISION`. Approval remains `not_approved`. US-7 never auto-approves.

Governed report language includes: mechanics reference evaluated; AISC code-profile strength unavailable; interaction validation required; design method context incomplete; serviceability criterion required; building-code compliance not evaluated; human engineering review required; standard conformance not validated.

## AI boundary and optimization handoff

AI may explain completeness, missing code method, missing design-method context, load-basis mismatch, stability/classification/interaction/serviceability/compliance gaps, and may suggest candidate sections. AI may not promote mechanics to AISC strength, select LRFD/ASD, invent K, invent Cb, invent classification, invent local-buckling rules, invent interaction equations, invent serviceability criteria, invent building-code compliance, invent local amendments, claim conformance, or change approval. Every candidate must be fully reprocessed through this orchestrator. `CHECK_UNDETERMINED` is not optimization-valid.

The handoff exposes applicable checks, mechanics/code results, failed/undetermined checks, design-method context, stability and classification/local-buckling constraints, interaction completeness, serviceability, building-code/direct-contract context, conformance state, and mass/property metadata.

## Analysis, connection, and seismic boundaries

A member check does not establish connection, bolt, or weld adequacy; foundation, anchor, or geotechnical approval; complete global frame/system stability; general 3D FEA; seismic member-design compliance; or connection design. Those remain unvalidated unless a separately certified capability exists.

## US-8 validation dependency

US-8 is the independent validation / conformance / release gate. US-7 orchestration correctness does not require AISC numerical code-profile strength methods, numerical interaction equations, AISC conformance, building-code compliance validation, or pack certification. Current US member capability is not exposed as production AISC design and is not exposed to the current Profile A pilot.
