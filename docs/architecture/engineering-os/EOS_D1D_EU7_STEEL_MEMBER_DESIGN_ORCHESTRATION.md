# EOS-D1D-EU-7 Eurocode Steel Member Design Orchestration

Bounded Eurocode-profile **member-design orchestration** that assembles EU-1 through EU-6 demand, mechanics-reference results, stability requirements, combined-action requirements, and governed serviceability into one `EurocodeSteelMemberDesignRecord`. This phase does **not** certify EN 1993, invent interaction equations, invent deflection limits, or approve members.

`EU_STEEL_PACK_CERTIFIED = NO`. `EU_STEEL_IMPLEMENTATION_MATURITY = FRAMEWORK_PLUS_BOUNDED_METHODS`. `STANDARD_CONFORMANCE_STATE = INTENDED_PROFILE`. `EU_STEEL_RELEASE_CLASSIFICATION = INTERNAL_ENGINEERING_REFERENCE`. Structural maturity remains `REFERENCE_PARTIALLY_IMPLEMENTED`. Edition and amendment remain `UNKNOWN_PENDING_CONFIRMATION`.

## Scope

The orchestrator answers separately:

1. Which actions/checks are applicable
2. Which mechanics have been evaluated
3. Which code-profile methods are available (currently none numerically)
4. Which required checks remain unavailable
5. Check states: satisfied / not satisfied / undetermined
6. Whether serviceability is evaluable
7. Whether member design is complete
8. Eurocode conformance state
9. Remaining human review
10. Whether engineering approval is present

These questions are not collapsed into one PASS flag.

AU-6 member orchestration was reviewed. Jurisdiction-neutral record, taxonomy, applicability, completeness aggregation, fingerprint/invalidation, and D1C deflection contracts are reused. AU standard authority, AS 4100 coefficients, and AUST300 defaults are not reused as EU rules. A parallel orchestration framework was not created.

## Three-layer result model

- **Mechanics evaluation** — bounded EU-2 through EU-5 references may be executed and recorded.
- **Code-profile design check** — EN 1993 resistance / interaction methods. Currently unavailable; result is `CHECK_UNDETERMINED`.
- **Engineering approval** — never set by EU-7. Remains `not_approved`.

A mechanics-reference ratio below 1 is not a Eurocode pass. Mechanics completeness is not code-design completeness.

## Mechanics vs code-design completeness

Mechanics: `COMPLETE_FOR_AVAILABLE_MECHANICS` | `INCOMPLETE_MECHANICS_INPUT` | `MECHANICS_METHOD_UNAVAILABLE` | `NOT_APPLICABLE`.

Code-design incompleteness reasons include `CODE_METHOD_UNAVAILABLE`, `INTERACTION_METHOD_UNAVAILABLE`, `NATIONAL_ANNEX_REQUIRED`, `NDP_REQUIRED`, `STANDARD_EDITION_REQUIRED`, `SERVICEABILITY_CRITERION_REQUIRED`, `VALIDATION_REQUIRED`, `MISSING_INPUT`, `STALE_RESULT`. FRAMEWORK_ONLY / VALIDATION_REQUIRED methods do not count as complete.

`IMPLEMENTED_EU_INTERACTION_METHODS = NONE`. Required interaction keeps code-design `CHECK_UNDETERMINED`. Component checks cannot substitute for interaction. EU-7 does not add interaction equations.

## Check taxonomy and applicability

Canonical categories: `TENSION`, `COMPRESSION`, `STABILITY_COMPRESSION` (compression stability), `BENDING_MAJOR`, `BENDING_MINOR`, `STABILITY_LTB` (LTB), `SHEAR_MAJOR`, `SHEAR_MINOR`, `WEB_STABILITY`, `COMBINED_ACTION`, `DEFLECTION`, `OTHER_SERVICEABILITY`.

Applicability is deterministic from demand presence, unbraced length, simultaneous actions, and explicit serviceability request. Applicability is not adequacy.

## Serviceability and load-context governance

`EurocodeSteelServiceabilityContext` plus `SteelServiceabilityResult`. D1C deflection demand is reused. EU-7 does not add a deflection solver. ULS demand is not used as SLS by default. Load case/combination for serviceability must be explicit and distinct from ultimate demand.

Criteria must be governed (`PROJECT_REQUIREMENT`, `CLIENT_REQUIREMENT`, `ENGINEERING_DESIGN_CRITERIA`, `VALIDATED_STANDARD_RULE`, `NATIONAL_ANNEX_RULE`, `HUMAN_CONFIRMED_RULE`, other governed sources). Absolute displacement and `L/n` are supported only when the value and `n` are supplied. `L/200` through `L/500` are never defaulted.

Missing criterion: `CHECK_UNDETERMINED` / `SERVICEABILITY_CRITERION_REQUIRED`. Serviceability may depend on EN 1990, project criteria, National Annex, or NDP. Missing required Annex/NDP fails closed. No default Annex.

Vibration, drift, rotation, local deformation, equipment alignment, and floor response are extensible and unimplemented.

## National Annex / NDP dependency

Member records preserve jurisdiction profile, Eurocode family, parts (EN 1993-1-1 and EN 1993-1-5 dependency), edition, amendment, National Annex, NDP set, and method versions. Edition is not inferred. Unknown edition cannot claim `CONFORMANCE_VALIDATED`. Second-generation methods are isolated. Historical fingerprints remain reproducible; dependent results are invalidated rather than overwritten.

## Completeness matrix and governing issue

Each applicable check records applicability, authority (mechanics / code-profile / governed), state, completeness, and reason. Governing issue priority is `CHECK_NOT_SATISFIED`, then `CHECK_UNDETERMINED`, then `CHECK_SATISFIED`, in canonical taxonomy order. Highest utilization does not always govern. There is no universal member utilization.

## Versioning / invalidation

Fingerprints cover section, material, demand/combination, effective lengths, unbraced length, restraint, criterion, standard context, National Annex, NDP set, edition, generation, and method versions. Stale result reuse fails closed.

## Conformance, review, and approval

Member records report `INTENDED_PROFILE`. `EN1993_COMPLIANT` is not emitted. Human review: `NOT_REVIEWED` | `UNDER_REVIEW` | `REVIEWED` | `REQUIRES_REVISION`. Approval remains `not_approved`. EU-7 never auto-approves.

Governed report language includes: mechanics reference evaluated; code-profile check unavailable; interaction validation required; serviceability criterion missing; member code-design check incomplete; human engineering review required; standard conformance not validated.

## AI boundary and optimization handoff

AI may explain completeness, missing checks, Annex/NDP gaps, interaction gaps, mechanics, and serviceability, and may suggest candidate sections. AI may not promote mechanics to Eurocode capacity, invent criteria or NDPs, claim conformance, or change approval. Every candidate must be fully reprocessed. `CHECK_UNDETERMINED` is not optimization-valid.

The handoff exposes applicable checks, mechanics/code results, failed/undetermined checks, governing constraints, serviceability, interaction completeness, and conformance state.

## Analysis, connection, and foundation boundaries

Member checks do not establish connection design, foundation/geotechnical adequacy, or global frame stability. D1C remains bounded. General 3D FEA is not claimed.

## EU-8 validation dependency

EU-8 is the independent certification / remaining-capability gate. It must not treat this orchestration as certified EN 1993 member design. Remaining work includes governed numerical code-profile capacities, numerical interaction methods, confirmed edition/amendment, and independent validation evidence.
