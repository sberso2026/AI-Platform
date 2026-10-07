# EOS-D1 Structural Completion Plan

Planning only. No Structural runtime, standards engine, SPACE GASS certification, or migration in this phase.

Baseline: `ca440678`. Structural maturity: `REFERENCE_PARTIALLY_IMPLEMENTED`. One Engineering OS + Structural as an activatable discipline pack. Not a Structural mini-OS. Not an EU-only product.

## Current capability

Reusable platform and Structural overlays already exist. They must be aligned, not rebuilt.

| Capability | Location | Classification |
|---|---|---|
| D0 discipline contracts, registry, guards, risk register | `@rtb/types` `discipline-capability.ts`; `@rtb/engineering-os` `discipline-capability/` | REUSABLE |
| EU-0 jurisdiction, AI, privacy, security, provenance | `@rtb/types` `global-governance.ts`; `global-governance/` | REUSABLE |
| Engineering Core registers (decision, assumption, action, risk, issue, TQ, lesson) | `@rtb/types` engineering-registers | REUSABLE — do not duplicate |
| Systems, interfaces, requirements, change, documents, assets, projects | Engineering Core | REUSABLE |
| Structural AI boundary (no invented loads/geometry/capacity; no self-approval) | `work-generator/structural/freeze.ts` `STRUCTURAL_AI_BOUNDARY` | REUSABLE |
| Work kinds, governed inputs, design basis, manifest, review actions | `work-generator/structural/types.ts` | REQUIRES_ALIGNMENT (missing jurisdiction/annex on standard bind) |
| Synthetic SS-beam UDL demand `V=wL/2`, `M=wL^2/8` | `compose.ts` `computeSimplySupportedUdlDemand` | SYNTHETIC_ONLY |
| Human-supplied capacity → utilization; otherwise `CAPACITY_METHOD_NOT_CERTIFIED` | `compose.ts` `runMemberCheck` | REQUIRES_ALIGNMENT / UNCERTIFIED |
| Crusher FEED fixture (AS 4100 2020, AS/NZS 1170.0 2002; not real design) | `fixture.ts` | SYNTHETIC_ONLY |
| Structural work API / UI overlay | `EngineeringStructuralWorkService`; `apps/web` work plans | REQUIRES_ALIGNMENT |
| AUST300 verified steel section catalog | `optimization-intelligence/spacegass-aust300-sections.ts` | REUSABLE (pilot catalog; not a design engine) |
| Optimization study, Pareto, immutable run manifest, human selection | `optimization-intelligence/` | REUSABLE platform; STRUCTURAL use UNCERTIFIED |
| A6 Structural Optimization Pilot (single-bay portal, PILOT_DEFINED loads) | `structural-pilot.ts`, `EOS_A6_STRUCTURAL_OPTIMIZATION_PILOT.md` | EXPERIMENTAL / UNCERTIFIED |
| SPACE GASS catalog, fail-closed adapter, host probe detect-only | `external-tools/`; `engineering-execution-host` spacegass probe | UNCERTIFIED |
| A5D certification model + independent reaction sanity | `spacegass-certification-model.ts` | EXPERIMENTAL (execution readiness, not design check) |
| Analysis Intelligence `LINEAR_STRUCTURAL_ANALYSIS` resolver | `analysis-intelligence/` | UNCERTIFIED / fail-closed REUSABLE |
| Discipline Intelligence Structural profile (AS 4100 / 1170 / 3600 listed CONFIGURED, edition null) | `discipline-intelligence/profile-defaults.ts` | REQUIRES_ALIGNMENT |
| Inspection Intelligence platform | `@rtb/inspection-intelligence` | REUSABLE platform; Structural models MISSING |
| Digital Twin / Digital Thread platforms | `@rtb/digital-twin`; EOS digital-thread | REUSABLE platforms; Structural extension MISSING |
| D0 Structural inspection/twin stubs | `STRUCTURAL_DISCIPLINE_PACK` | MISSING (declared, not implemented) |
| Cross-discipline interface metadata | D0 `CrossDisciplineInterface` | REUSABLE contract; Structural live links MISSING |
| Tenant/workspace isolation, MFA, commerce entitlement | Platform kernel / commerce | REUSABLE |

No existing certified Structural design-check capability. Do not rebuild certified generic EOS services.

## Gap matrix

| Gap | Close in | Notes |
|---|---|---|
| SPACE_GASS_LIVE_EXECUTION_NOT_CERTIFIED | D1G | Remain NOT_CERTIFIED until independent live proof; no silent fallback |
| NO_AS4100_CAPACITY_ENGINE | D1D | AU steel pack; after D1B bind |
| NO_AS3600_ENGINE | D1E | AU concrete pack; after D1B bind |
| NO_EUROCODE_NATIONAL_ANNEX_ENGINE | D1B + D1D/D1E | Member-state annex selected, not hard-coded EN |
| NO_AISC_ACI_ENGINE | D1D / D1E | US pack |
| SYNTHETIC_UDL_DEMAND_ONLY | D1C | Extend demand; not a general FEA |
| MEMBER_CONNECTION_FRAME_OBJECTS_NOT_IMPLEMENTED | D1A + D1F | Objects in D1A; connection *design engines* later/not all in D1 |
| INSPECTION_MODELS_NOT_IMPLEMENTED | D1H | Extend Inspection Intelligence |
| DIGITAL_TWIN_EXTENSION_NOT_IMPLEMENTED | D1I | No human/person twins |
| DESIGN_CHECK_NOT_CERTIFIED | D1D/D1E + D1L | Demand ≠ capacity; independent benchmarks |
| NO_STANDARD_EDITION_ANNEX_BINDING_ON_CALCULATIONS | D1B | Front-loaded before governed calcs |
| OPTIMIZATION_NOT_CERTIFIED | D1J | Reuse A5 study; human selection |
| DETERMINISTIC_TOOL_JURISDICTION_UNBOUND | D1B | Front-loaded; tool + jurisdiction + standard record |

## D0 risk allocation

Copied from `EOS_D0_GOVERNANCE_RISK_REGISTER`. Descriptions are not inferred from IDs.

| RISK_ID | DESCRIPTION | SEVERITY | LIKELIHOOD | MITIGATION | OWNER | REGISTER CLOSURE_PHASE | D1 ALLOCATION |
|---|---|---|---|---|---|---|---|
| D0-R01 | Discipline contract too generic for later pack implementation | MEDIUM | MEDIUM | Keep one shared contract; D1-D8 add pack data only, not new operating systems. | Engineering OS architecture | D1-D8 pack implementation | D1A Structural pack data on D0 contracts |
| D0-R02 | Future standards engines hard-code one jurisdiction or code family | HIGH | MEDIUM | Standards remain jurisdiction-selected with edition/amendment/national annex on EosEngineeringStandardRecord. | Discipline pack owners | D1+ standards engines | D1B binding + D1D/D1E adapters (not one formula file) |
| D0-R03 | AI authority ambiguity between suggestion, review, and approval | HIGH | MEDIUM | Output-class transitions, ReviewRule/ApprovalRule, and AI capability defaults forbid self-approval and LLM governed numerics. | AI governance | D1 runtime enforcement | Every D1 governed subphase; D1L gate |
| D0-R04 | Cross-discipline circular dependencies | MEDIUM | MEDIUM | Interfaces are declared metadata; D9 intelligence must detect cycles and keep AI impact advisory. | Cross-discipline intelligence | D9 | D1K declare Structural interfaces only; cycle detection remains D9 |
| D0-R05 | Jurisdiction profile conflicts on a single workspace | MEDIUM | MEDIUM | One selected jurisdiction profile per governed output; extendJurisdictionCatalog remains additive. | Global governance | D1+ project jurisdiction binding | D1B one profile per governed Structural output |
| D0-R06 | Standard edition/amendment/national annex version conflicts | MEDIUM | HIGH | Calculations must bind standard records, not bare code names; D1 closes unbound structural tool/jurisdiction. | Discipline pack owners | D1 | D1B |
| D0-R07 | External-tool result mismatch versus internal deterministic results | HIGH | HIGH | Reuse governed external-tool statuses; uncertified tools fail closed with no silent fallback. | External tool governance | D1 solver certification | D1G; compare solver vs D1C demand with explicit mismatch, never silent merge |
| D0-R08 | Provenance loss on discipline outputs | HIGH | MEDIUM | All packs inherit eos-eu-0-global-provenance; instance objects must attach the global provenance contract. | Engineering Core / pack owners | D1 instance objects | D1A objects + every governed result |
| D0-R09 | Discipline object duplication of Engineering Core registers | HIGH | LOW | CORE_REGISTER_OWNERSHIP_LOCK denies recreation of decision/assumption/action/risk/issue/TQ/lesson. | Engineering Core | D1 object design review | D1A ownership model (load *action* ≠ Core `action` register) |
| D0-R10 | Privacy leakage through discipline metadata | MEDIUM | MEDIUM | Classifiable data includes personal/AI categories; personal data remains optional and must not be introduced by default. | Privacy / data profile | D1+ object schemas | D1A schemas; engineeringData default |
| D0-R11 | Tenant leakage via discipline-global mutable state | HIGH | LOW | Registry is static catalog; instance objects inherit platform tenant/workspace context and security baseline isolation. | Platform security | D1 instance persistence | D1A persistence through platform context |
| D0-R12 | Overly broad Digital Twin scope including human/person twins | MEDIUM | LOW | Discipline extensions forbid humanPersonTwinAllowed; measured state remains distinct from inferred, thread, and AI memory. | Digital Twin governance | separate people-twin governance if ever required | D1I preserves prohibition; people-twin remains out of D1 |

All twelve risks allocated. No HIGH risk lacks a planned closure phase (R02, R03, R07, R08, R09, R11 close inside D1A/B/G/L).

## Object ownership model

| Object | Owner | Notes |
|---|---|---|
| project, asset, document, system, interface, requirement, change, impact, configuration_baseline | Engineering Core | Reference only |
| decision, assumption, action (register), risk, issue, technical_query, lesson | Engineering Core | Forbidden to recreate |
| structural_system, frame, member, beam, column, brace, plate, connection, support, node, section, material (structural), load_case, load_combination, structural_load_action, analysis_model, analysis_result, design_check, capacity_result, utilization_result, foundation_interface | Structural pack | Tenant/workspace via platform context |
| measured / inferred member/connection/foundation state | Digital Twin extension | measured ≠ inferred; Twin ≠ Thread ≠ AI Memory; no person twins |
| solver node/member/load IDs, native result tables | External solver representation | Mapped to EOS objects; never source of truth |

`beam` / `column` / `brace` / `plate` are member specializations, not separate SoTs. Core `action` register remains workflow/register action; Structural load actions use `structural_load_action`.

## One global Structural module

```
Structural Core (single pack in @rtb/engineering-os)
├── global structural domain
├── loads / actions abstraction
├── combinations abstraction
├── analysis abstraction (demand; first-order; future second-order/seismic inputs)
├── design-check abstraction (demand ≠ capacity ≠ utilization)
├── evidence / provenance
└── jurisdiction packs (not separate products)
     ├── AU
     ├── EU / EEA (National Annex selectable)
     ├── US
     └── future regions
```

`ONE_GLOBAL_STRUCTURAL_MODULE = YES`. No AU-only or EU-only Structural product.

## Jurisdiction / standard binding (D1B, early)

Every governed Structural calculation must bind:

- jurisdictionProfile
- standardFamily
- standardCode
- edition
- amendment
- nationalAnnex
- effectiveDate
- toolVersion
- calculationMethod

Invariant: `GOVERNED_STRUCTURAL_CALCULATION_STANDARD_BOUND = YES`. Bare names (`"AS 4100"`) are insufficient. Align `StructuralDesignStandard` and Discipline Intelligence CONFIGURED rows to `EosEngineeringStandardRecord`. Close `NO_STANDARD_EDITION_ANNEX_BINDING_ON_CALCULATIONS` and `DETERMINISTIC_TOOL_JURISDICTION_UNBOUND` in D1B before D1C governed demand expansion that claims a code, and before any D1D/D1E capacity engine.

## Jurisdiction packs

Standard-pack maturity: `FRAMEWORK_ONLY` → `IMPLEMENTED` → `BENCHMARKED` → `HUMAN_VALIDATED` → `PILOT` → `CERTIFIED`. Never CERTIFIED without independent benchmark + human validation.

### AU (`AU_STRUCTURAL_PACK_PLAN`)

- Standards metadata: AS/NZS 1170 (actions), AS 4100 (steel), AS 3600 (concrete); later AS 2159 / AS/NZS 5131 as optional.
- Engines: 1170 combination/action mapping (D1C); 4100 member checks (D1D); 3600 RC checks (D1E).
- Validation: published SA examples / handbook problems; hand calcs; edition+amendment recorded.
- Human review: all design checks and utilization; AI may not originate demand or capacity.

D1 start maturity: FRAMEWORK_ONLY after D1B.

### EU (`EU_STRUCTURAL_PACK_PLAN`)

- EN 1990, EN 1991, EN 1992, EN 1993, EN 1998 where applicable.
- National Annex is a required bind, not a default “EN” engine. Member-state annex selected on the calculation.
- Engines: EN 1991 actions/combinations (D1C); EN 1993 steel (D1D); EN 1992 concrete (D1E); EN 1998 only as input/combination hooks until a later bounded seismic subphase.
- Not EU market certification. EU high-water-mark inherited. `EU_ONLY_STRUCTURAL_PRODUCT = NO`.

### US (`US_STRUCTURAL_PACK_PLAN`)

- ASCE 7, AISC 360, ACI 318; future IBC/local as jurisdiction profile, not hard-coded national default.
- Engines: ASCE 7 load/combination mapping (D1C); AISC 360 (D1D); ACI 318 (D1E).

## Demand engine (D1C)

Replace/extend synthetic UDL as the *only* demand path. Keep the SS-beam UDL as a labelled SYNTHETIC demonstration method until superseded for a given calculation.

Plan support for: point loads, distributed loads, moments, combinations, member actions, frame actions, reactions, deflections, first-order analysis. Future: second-order, dynamic/seismic *inputs* (not a certified dynamic solver in D1).

Do not build a general FEA. Advanced analysis uses governed external solvers (D1G). Internal deterministic demand remains simple members / combinations / first-order where certified.

AI must not invent loads, combinations, or demand.

## Design-check architecture

`DesignCheck` separates: demand, capacity, utilization, standard clause, assumptions, governing case, evidence, tool, jurisdiction, standard edition, human review, approval.

`DEMAND_CAPACITY_SEPARATION = YES`. Human-entered governed capacity remains allowed. LLM may not manufacture demand or capacity. Calculation success ≠ DESIGN_APPROVED (already in freeze).

## Steel (D1D)

Section properties (reuse AUST300 as AU catalog seed, add pack catalogs); member classification where the selected standard requires it; tension, compression, bending, shear, combined actions, buckling, serviceability interfaces, utilization.

Jurisdiction adapters (AS 4100 / EN 1993 + annex / AISC 360), not one hard-coded formula engine.

## Concrete (D1E)

Material properties; RC section; flexure, shear, axial/bending interaction; serviceability; durability metadata; reinforcement representation.

Compatible with AS 3600, EN 1992 + annex, ACI 318 via adapters. Do not implement all clauses in first steel/concrete slices.

## Objects / connections / frames (D1A + D1F)

D1A: canonical instance objects + ownership + persistence context. D1F: frames, connections, supports, structural interfaces, foundation reactions.

Connection *object representation* ≠ connection *design engines*. D1 does not implement all connection types. Foundation interface consumes Geotechnical inputs (declared; Geotechnical pack remains PLANNED).

## External solvers (D1G)

SPACE GASS remains `NOT_CERTIFIED` until live execution is independently proven (licence, automation permission, adapter compatibility, result parser, units, independent sanity, no GUI automation).

Vendor-neutral solver port: inputs/outputs/version/standard/jurisdiction/provenance/validation. Future adapters (other analysis products) implement the same port. `UNCERTIFIED_SOLVER_SILENT_FALLBACK = NO`. Solver results that disagree with internal demand are mismatch evidence, not auto-truth.

## Inspection (D1H)

Extend Inspection Intelligence. Models: cracking, corrosion, section loss, deformation, fatigue indicators, connection distress, foundation movement, vibration evidence.

AI detection ≠ engineering condition decision ≠ repair approval. Finding classes already on D0 inspection contract.

## Digital Twin (D1I)

State: geometry, member identity, material, section, load state, analysis state, condition state, inspection evidence, measured response, inferred response.

measured ≠ inferred. Twin ≠ Thread ≠ AI Memory. `humanPersonTwinAllowed = false`.

## Optimization (D1J)

Reuse Optimization Intelligence. Preserve: multi-objective, Pareto, no automatic winner, human engineer selection (`humanSelectionRequired`), immutable run manifest, governed solver results, evidence/provenance.

Certification path: bound STRUCTURAL study to D1B standard bind + D1G certified solver or explicit SYNTHETIC/PILOT_DEFINED labels; forbid design-compliance claims (`EOS_A6_STRUCTURAL_DESIGN_CHECK` stays NOT_CERTIFIED until D1D/D1L). `OPTIMIZATION_HUMAN_SELECTION = YES`.

## Cross-discipline (D1K)

Use D0 `CrossDisciplineInterface`. Structural as sink/source:

- Piping → Structural: pipe-support / anchor loads
- Mechanical / Process → Structural: equipment and platform loads
- Electrical → Structural: equipment loads
- Structural → Geotechnical: foundation reactions; requires ground parameters
- Civil: earthworks/penetrations/platform interfaces
- Declared only; AI impact remains advisory; cycle detection is D9

## Consequence classification

| Class | Examples | Validation |
|---|---|---|
| LOW | document assistance, narrative explanation, missing-info prompts | Human oversight; not governed numeric truth |
| MEDIUM | candidate engineering finding, advisory impact, AI detection | Evidence + human validation; not approval |
| HIGHER ENGINEERING CONSEQUENCE | design checks, capacity, utilization, solver interpretation, combinations used for design | Independent benchmark, bound standard/edition/annex, tool version, human review + approval |

## D1 subphases

Recommended order retained (not silently reordered). Binding precedes governed standards calculations.

| ID | Name | Scope | Depends on | Gaps / risks | Packages | Deterministic vs AI | Tests / exit |
|---|---|---|---|---|---|---|---|
| D1A | Domain & Object Model | Canonical objects, ownership lock, tenant/workspace, provenance on instances | D0 | objects; R01 R08 R09 R10 R11 | `@rtb/types`, `@rtb/engineering-os` | objects only; AI none | ownership tests; no Core register dup; RLS/context |
| D1B | Jurisdiction / Standards / Edition / Annex Binding | Mandatory bind on governed calcs and tools; AU/EU/US pack FRAMEWORK_ONLY | D1A, EU-0 | gaps 11, 13; R02 R05 R06 | types + engineering-os + discipline-intelligence alignment | metadata; AI none | bind invariant tests; no AU/EU/US hard-code as universal |
| D1C | Loads, Combinations & Deterministic Demand | Extend beyond synthetic UDL; first-order member/frame demand abstractions | D1B | gap 6 | work-generator/structural; analysis-intelligence | deterministic demand; AI assemble only | UDL remains labelled synthetic; new demand methods have provenance; no LLM numerics |
| D1D | Steel Design Capability | Adapter architecture + first bounded AU 4100 slice; EN/AISC adapters stubbed | D1B, D1C | gaps 2, 4, 5, 10 | structural pack adapters | deterministic capacity; AI none | independent steel benchmark; demand/capacity split |
| D1E | Concrete Design Capability | Adapter architecture + first bounded AU 3600 slice; EN/ACI stubs. Architecture closed at EOS-D1E-CLOSEOUT; next execution is EOS-D1E-EU-C1 governed Eurocode concrete material/design rule foundation | D1B, D1C | gaps 3, 4, 5, 10 | structural pack adapters | deterministic capacity; AI none | independent RC benchmark |
| D1F | Frames, Connections & Foundation Interfaces | Frame/connection/support/foundation objects; not all connection designs | D1A, D1C | gap 7 remainder | engineering-os | representation; design engines optional/out | objects persist; Core lock holds |
| D1G | External Solver Integration & Certification | Vendor-neutral port; SPACE GASS live proof or remain NOT_CERTIFIED | D1B, D1C | gap 1; R07 | external-tools; execution-host | solver vs internal mismatch explicit | fail-closed; no silent fallback; live cert independent |
| D1H | Inspection & Condition | Structural inspection models on Inspection Intelligence | D1A | gap 8 | inspection-intelligence + pack | AI detection ≠ approval | finding-class tests |
| D1I | Structural Digital Twin | Member/connection/foundation state extension | D1A, D1F | gap 9; R12 preserve | digital-twin + pack | measured ≠ inferred | person-twin forbidden |
| D1J | Structural Optimization Certification | Certify STRUCTURAL study path with human selection | D1B, D1G, D1D as applicable | gap 12 | optimization-intelligence | solver governed; no auto winner | Pareto + immutable manifest + human selection tests |
| D1K | Cross-Discipline Structural Interfaces | Populate D0 interfaces with object/evidence | D1A, D1F | R04 defer cycles to D9 | discipline-capability registry data | advisory AI only | interface contract tests |
| D1L | Structural Global Certification Gate | Consequence classes, pack maturity, EU/global check, no EU-only claim | all prior in-scope | design-check cert | docs + tests | — | D1L checklist; EU_MARKET_READY remains NO |

Each subphase: security inheritance (no weaker auth), EU/global governance check, human validation for HIGHER consequence, no Profile A pilot regression (uploads, M365, SharePoint write, SPACE GASS uncertified unless D1G independently certifies).

## Certification strategy

`D1_CERTIFICATION_STRATEGY = YES`. Per subphase: scope, dependencies, packages, deterministic vs AI, standards/jurisdictions affected, tests, benchmark evidence, human validation, security, EU/global check, exit criteria — see table above.

Independent benchmarks: known reference problem; hand calc or trusted published example; comparison tolerance; tool version; standard/edition/annex; expected result; human engineering validation. No self-generated-only golden values for HIGHER consequence checks.

## Global / EU

`GLOBAL_STRUCTURAL_ARCHITECTURE = YES`. `EU_ONLY_STRUCTURAL_PRODUCT = NO`. Preserve human oversight, provenance, data minimization, tenant/workspace isolation, security inheritance, jurisdiction profiles, AI transparency labels, standard-version traceability, professional-authority titles as profiles not global hard-codes. Do not claim EU market readiness.

## Next

Ready for **D1A Structural Domain & Object Model**. D1A must not implement AS/EN/AISC engines, SPACE GASS certification, or inspection/twin runtimes.
