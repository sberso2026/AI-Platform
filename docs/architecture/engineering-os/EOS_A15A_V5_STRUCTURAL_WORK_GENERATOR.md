# EOS-A15A-V5 Structural Engineering Work Generator

Discipline overlay on Engineering OS Work Generator. Not a structural analysis package and not a new intelligence domain.

**Classification:** SYNTHETIC_DEMONSTRATION_DATA where the Crusher fixture is used. Not real project design.

**Pilot flags remain NO:** CONTROLLED_PILOT_READY, A15B_ELIGIBLE, READY_FOR_PRODUCTION.

## Workflow

Structural Work Plan → Structural Design Basis → governed inputs → Calculation Manifest → deterministic calculation/tool → results → Structural MTO → governed Design Report / Technical Note → Pre-Issue Review → engineer review.

Human engineering authority is retained. Calculation success is not `DESIGN_APPROVED`.

## Design basis

Every numeric or catalog input carries source, revision, status, and provenance.

Missing required basis yields `DESIGN_BASIS_INCOMPLETE`. EOS does not infer missing engineering values.

## Input provenance

Loads, combinations, geometry, and materials are governed engineering inputs. AI may assemble and explain them. AI may not invent:

loads, geometry, material properties, boundary conditions, member sizes, load combinations, design capacities, code factors, soil parameters, connection capacities, reinforcement, or engineering acceptance.

## Design standard governance

Standards are project-configured (`AS 4100`, `AS/NZS 1170` series, `AS 3600`, `AS 2159`, `AS/NZS 5131`, or client standards) only when the project supplies them. EOS does not hard-code a universal structural code or imply applicability without configuration.

## Load and combination governance

Numeric loads require value, unit, direction/application, source, revision, load case, and status.

Combinations come from the project design basis, governed code configuration, an engineer-defined combination set, or an approved deterministic rule set. Combination provenance is recorded.

## Geometry and materials

Unknown geometry is `GEOMETRY_REQUIRED`. Unknown steel grade is `MATERIAL_GRADE_REQUIRED`. No silent AI default material property may enter a governed calculation.

## Calculation manifest

The manifest lives inside Work Generator / Tool Orchestration. It identifies Work Plan, project, system/asset, discipline, calculation type, design standard/version, input references, input fingerprint, assumptions, load cases/combinations, engine/tool and version, expected outputs, created timestamp/actor, and verification status.

## Input fingerprint and staleness

A SHA-256 fingerprint is taken over governed material inputs. If a governed input changes, the result becomes `STALE` / `RECALCULATION_REQUIRED`. Previous results are not mutated.

## Deterministic-vs-solver boundary

Numeric work uses `EOS_STRUCTURAL_DETERMINISTIC_V1` method `SYNTHETIC_SS_BEAM_UDL_STATICS`:

- `V = wL/2`
- `M = wL^2/8`

This is independently testable synthetic statics. It is **not** AS 4100 / AS 3600 capacity, SPACE GASS execution, frame analysis certification, FEA certification, or dynamic analysis certification.

SPACE GASS remains:

- `API_AVAILABLE = NO`
- `REAL_SOLVER_EXECUTION = NOT_CERTIFIED`
- `PRODUCTION_USE_PERMITTED = NO`

No GUI, screen, keyboard, or mouse automation.

If code-specific capacity is not certified: `DEMAND_AVAILABLE` and `CAPACITY_METHOD_NOT_CERTIFIED`. Engineer-entered governed capacity may be used for utilization; EOS does not fabricate φMs.

## Result status

`CALCULATED`, `CALCULATION_INCOMPLETE`, `INPUT_REQUIRED`, `METHOD_NOT_CERTIFIED`, `STALE`, `REVIEW_REQUIRED`, `VERIFIED_BY_ENGINEER`.

`DESIGN_APPROVED` is forbidden as a consequence of calculation success.

Verified results are immutable. Changed inputs create a new revision/run.

## Engineer authority

The engineer inspects inputs, sources, formula/method, results, warnings, and limitations, then accepts for use, rejects, requests revision, or marks needs information. AI cannot verify its own engineering calculation.

## MTO integration

Calculation outputs may update Structural MTO (member section/count/length, mass from published unit mass). MTO retains V2/V3 provenance. A verified MTO is not overwritten; a new design revision creates a new MTO revision.

## Change Impact

Structural design changes may create POTENTIAL impacts: TECHNICAL, QUANTITY, COST, CONSTRUCTABILITY, SCHEDULE, CARBON.

QUANTITY may be deterministic. Cost only with approved rates (`COST_NOT_CALCULATED` otherwise). Carbon follows V1/V2: `NOT_APPLICABLE` is not a carbon gap; `REQUIRED` without an approved factor is `CARBON_NOT_CALCULATED`. Human confirmation required.

## Deliverable integration

V4 governed composition is reused. A Structural Design Report may include design basis, governing standards, loads/load cases, assumptions, structural system description, calculation summary, MTO summary, interfaces, limitations, outstanding information, and references. No invented compliance conclusion.

## Calculation XLSX

Controlled appendix sheets:

`01_Summary`, `02_Design_Basis`, `03_Loads`, `04_Load_Combinations`, `05_Geometry`, `06_Materials`, `07_Calculation`, `08_Results`, `09_Assumptions`, `10_Source_Register`, `11_Revision_History`.

Governed inputs identify provenance in table columns.

## Pre-Issue

Reused Review checks plus:

- missing design basis
- missing source
- stale calculation
- input fingerprint mismatch
- unverified calculation
- missing governing standard
- open assumption
- MTO inconsistent with current calculation
- report bound to stale calculation

Review does not independently perform structural engineering judgment unless a narrow certified deterministic rule exists.

## Digital Thread

Existing graph/projection relationships only:

Engineering Information → `SOURCE_FOR` → Calculation Manifest → `PRODUCED` → Calculation Result → `SUPPORTS` MTO / `USED_BY` Design Report. Calculation Rev A → `SUPERSEDED_BY` → Rev B.

No new graph store.

## My Engineering Day / Workbench

Actionable states: design basis incomplete, calculation input changed, recalculation required, calculation requires engineer review, MTO stale from structural change, Design Report stale, interface information required.

Workbench is a section of the existing Work Plan: Design Basis, Inputs, Calculation Manifest, Results, MTO, Deliverables, Review, Change Impact. No separate Structural OS shell.

## Anti-hallucination

Explicit missing states include `WIND_LOAD_REQUIRED`, `SEISMIC_INPUT_REQUIRED`, `GEOTECHNICAL_INPUT_REQUIRED`, `MATERIAL_GRADE_REQUIRED`, `CONNECTION_GEOMETRY_REQUIRED`, `CAPACITY_METHOD_NOT_CERTIFIED`. These are not auto-filled.

## Malware deferment

`HOSTED_MALWARE_SCANNER = DEFERRED_EXTERNAL_DEPENDENCY`

`RETURNED_ARTIFACT_ROUND_TRIP = DEFERRED_DEPENDENT_GATE`

Inbound returned user files remain fail-closed. Scanner provisioning is not reopened.

## Architecture freeze

No Structural Intelligence, Calculation Intelligence, Analysis Intelligence, MTO Intelligence, Cost Intelligence, Event Bus, graph store, DMS, solver framework, connector framework, or ScannerV2.
