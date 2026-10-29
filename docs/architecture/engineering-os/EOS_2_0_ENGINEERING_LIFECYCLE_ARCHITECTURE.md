# EOS 2.0 engineering lifecycle architecture

Phase: `EOS-2.0-ENGINEERING-LIFECYCLE-AND-DISCIPLINE-DESIGN-ARCHITECTURE`

Status of this document: `ARCHITECTURE_DEFINED`. It does not implement, validate, qualify, or certify EOS 2.0. It does not change the EOS 1.0 production runtime, the controlled pilot, or the qualified D1 structural baseline.

EOS is the engineering delivery operating layer above specialist tools. Specialist deterministic engines may calculate. EOS owns the lifecycle, the design basis, the requirements, the assumptions, the constraints, the criteria, the inputs, the calculation and model metadata, the interfaces, the decisions, the risks, the technical queries, the changes, the reviews, the deliverables, the evidence, the provenance, the design maturity, the configuration state, the discipline coordination, and the human engineering authority.

Required pattern:

`Structured Inputs -> Deterministic Engine -> Traceable Result -> AI Explanation -> Human Engineering Decision`

AI must not silently improvise a deterministic engineering calculation. A missing input stays a missing input. A range stays a range. A recommendation is not an approval.

## Canonical lifecycle

The core stages are fixed:

1. `CONCEPT`
2. `FEASIBILITY`
3. `FEED`
4. `DETAILED_ENGINEERING`

Later stages may be added without replacing this core: construction engineering, commissioning, operations, brownfield modification, and decommissioning. Each later stage reuses the same objects, maturity axis, interface graph, change impact, freeze, and deliverable rules. A later stage does not rewrite Concept through Detailed Engineering.

### CONCEPT

Purpose: identify technically plausible solutions.

Concept accepts incomplete inputs when each gap is explicit. Outputs use ranges rather than false precision. Expected content includes a preliminary design basis, option generation, technology selection, high-level layouts, major interfaces, major hazards, preliminary quantities, preliminary cost and schedule implications, major unknowns, and decision criteria.

Every Concept output is labeled preliminary. Concept is not a design freeze and not a professional certification.

### FEASIBILITY

Purpose: determine whether candidate options are technically and economically viable.

Expected content includes preliminary calculations, preliminary sizing, alternative comparison, preliminary quantities, constructability, maintainability, CAPEX and OPEX inputs, technical risk, investigations required, major equipment or structure or system definition, an option-selection recommendation, and evidence gaps.

A feasibility recommendation is a human decision record. It is not approval to construct.

### FEED

Purpose: establish a controlled engineering baseline suitable for execution planning, procurement development, and detailed design.

Expected content includes a controlled design basis, defined requirements, selected technologies and configurations, major equipment definition, major load and data registers, discipline interfaces, PFD and P&ID maturity where applicable, layouts, preliminary models, preliminary calculations, specifications, material classes, datasheets, an engineering deliverable register, design reviews, HAZID and HAZOP interfaces, design-freeze gates, and visible unresolved assumptions and interfaces.

FEED baseline is a configuration state. It is not Issued for Construction.

### DETAILED_ENGINEERING

Purpose: produce fully traceable engineering deliverables suitable for procurement, fabrication, construction, installation, and commissioning.

Expected content includes final calculations, final models, final datasheets, final specifications, final drawings, final schedules, MTO and BOM, vendor integration, detailed interfaces, reviewed design changes, design verification, design approval only where an authorized human holds that authority, construction deliverables, and revision and configuration control.

Detailed Engineering does not grant approval because a deliverable reached a maturity state.

## Common engineering object model

These objects are shared by every discipline. Discipline modules extend them by composition. They do not copy the common object into a second incompatible type when inheritance or composition is enough.

`Project`, `Facility`, `Area`, `System`, `Subsystem`, `Asset`, `Equipment`, `Structure`, `Building`, `Line`, `Cable`, `Instrument`, `DesignBasis`, `Requirement`, `DesignCriterion`, `Assumption`, `Constraint`, `EngineeringInput`, `LoadCase`, `DesignCase`, `Calculation`, `EngineeringModel`, `ModelRevision`, `Interface`, `Decision`, `Risk`, `TechnicalQuery`, `Action`, `Change`, `ImpactAssessment`, `Deliverable`, `DeliverableRevision`, `VendorData`, `EngineeringReview`, `Approval`, `Evidence`, `Source`, `StandardReference`, `DesignMaturityState`, `ConfigurationBaseline`.

Every common object carries:

- stable identity
- version
- lifecycle stage
- project and workspace ownership
- tenant scope
- discipline, which may be common or a named discipline
- status
- revision
- provenance
- supersession, which is explicit and never inferred
- approval state, which is separate from maturity
- evidence relationship
- cross-discipline links, which cite exact counterpart identities and revisions

A superseded revision remains history. A later revision does not silently redirect historical requirements, assumptions, decisions, changes, reviews, or evidence. This continues the existing EOS rule that supersession is an explicit predecessor relationship.

`Calculation` stores metadata: inputs used, input revisions, engine or adapter identity, tool version, run identity, result reference, checksum, limitations, and human verification status. The numerical evaluation stays in a deterministic engine or an external solver adapter. EOS does not treat the metadata record as the calculation.

`EngineeringModel` and `ModelRevision` store model identity, source tool, exchange format, checksum, and the lifecycle stage. They are not a claim that the model is certified.

`Approval` is a human authority record. AI cannot create it. An administrator role cannot create it. Reviewer authority and approval authority stay separate, as they are in the EOS 1.0 pilot.

## Design basis

The Engineering Design Basis is one versioned object with scoped statements. Scopes are project-wide, discipline, system, and asset. A statement may also carry a jurisdiction profile and a standards profile.

A design-basis statement may cover environmental conditions, site conditions, operating conditions, design life, reliability targets, loads and actions, materials, safety requirements, client requirements, statutory requirements, assumptions, exclusions, and deviations.

Revisions are version-controlled. A change to an approved design-basis item must be able to open an `ImpactAssessment`. The assessment proposes affected objects. It does not approve the change and it does not recalculate dependents by itself.

An unapproved design-basis draft cannot be cited as the current approved basis. Citing a basis stores the basis revision. Floating citations are rejected, consistent with the existing fingerprint rule in the discipline R7 runtimes.

## Requirements

EOS 2.0 reuses the existing requirements model. It does not create a second requirements engine.

A source requirement, a candidate requirement, and an adopted requirement remain different records. Adoption is explicit, human, and reasoned. AI cannot adopt a requirement. A source requirement from another discipline is not an adopted requirement in the receiving discipline.

The trace is:

`Requirement -> Design Basis -> Discipline Design -> Calculation or Model -> Deliverable -> Review -> Verification Evidence`

Each requirement supports source, owner, discipline, applicability, verification method, status, linked evidence, and change history. Acceptance for purpose and approval statuses stay out of the requirement record. Approval remains the separate `Approval` object and requires the separated human authority.

Verification evidence shows how a requirement was checked. It is not itself the approval.

## Design freeze

Controlled freeze states are:

- Concept Freeze
- Feasibility Selection
- FEED Baseline
- Detailed Design Freeze
- IFC Baseline

A freeze is a `ConfigurationBaseline`. It identifies the included design basis, requirements, assumptions, calculations, models, interfaces, and deliverables, plus unresolved exceptions and the approving authorities. Material change after a freeze opens an impact assessment before a new revision can become current.

Freeze is not professional certification. IFC Baseline means the included set was issued for construction under the project's human authority. It does not certify the engineering.

## Deliverable governance

Deliverable types are calculations, drawings, specifications, datasheets, reports, schedules, lists and registers, models, MTO and BOM, and vendor documents.

Each deliverable supports document number, discipline, stage, revision, status, owner, reviewer, approver, linked requirements, linked calculations and models, superseded state, and evidence.

Reviewer and approver are different authorities. A deliverable maturity such as Issued for Review does not fill the approver field.

## Project controls integration

Project Controls remains a first-class EOS capability. This architecture does not replace Primavera P6, SAP, or an established cost system.

Engineering feeds Project Controls with deliverable status, engineering progress, design maturity, outstanding interfaces, technical queries, changes, decisions, procurement dependencies, construction readiness, engineering blockers, and forecast impacts.

The causal link is:

`Engineering change -> deliverable revision -> procurement impact -> construction impact -> cost or schedule impact`

EOS records the link and the evidence. The external cost or schedule system remains the system of record for its own quantities. An adapter exchanges identity, revision, status, and checksum. It does not grant EOS authority to approve cost or schedule.

## External solver boundary

Solver and model tools attach through vendor-neutral adapters. Named products are examples, not a commitment that the adapter exists. Integration does not certify the solver.

Each run records input provenance, model or tool version, calculation run identity, solver or tool version, result provenance, imported or exported artifact checksum, and human verification status.

Example families, not implementations:

- Structural: SPACE GASS, ETABS, SAP2000, STAAD, ANSYS, OpenSees
- Piping: CAESAR II, AutoPIPE
- Process: Aspen HYSYS, Aspen Plus, UniSim, AFT tools
- Electrical: ETAP, PowerFactory, SKM, EasyPower
- Model federation: AVEVA E3D, Plant 3D, IFC, and other controlled exchanges

## Engineering AI

Engineering AI reads discipline, lifecycle stage, project context, maturity, design basis, requirements, assumptions, interfaces, and current approved evidence. It labels each statement as `FACT`, `INFERENCE`, `ASSUMPTION`, `RECOMMENDATION`, `CALCULATION_RESULT`, or `HUMAN_DECISION`.

Concept: recommend options and expose unknowns. Feasibility: compare options and highlight technical and economic constraints. FEED: identify unresolved basis, interfaces, and freeze blockers. Detailed Engineering: identify inconsistencies, stale inputs, affected calculations, and deliverables.

AI cannot convert a recommendation into an approval. AI cannot invent project facts when evidence is absent. The EOS 1.0 All Engineering and Current Project behavior remains the advisory and evidence-governance boundary until a later phase extends it with explicit stage and discipline context.

## Security and authority

Workspace isolation, tenant isolation, and least privilege remain. Discipline roles and project roles are separate. Qualified reviewer authority is separate from engineering approval authority. Auditability and provenance remain mandatory.

Jurisdiction profiles and data-residency hooks are extensible. EU AI Act readiness, GDPR privacy by design, and NIS2-aligned cybersecurity controls are architecture requirements for later implementation. This document does not claim those certifications.

AI roles and administrator roles do not receive engineering approval authority.

## Jurisdiction and standards

The architecture is jurisdiction-neutral. Profiles may be added for Australia, the European Union, the United Kingdom, the United States, the Middle East, Asia-Pacific, and a project or client standard set.

EOS stores a standard identifier, edition, jurisdiction, applicability, a clause reference only where legally permitted, the project interpretation, supersession, and evidence. EOS does not reproduce proprietary standard text.

## What this phase does not do

No discipline calculator is built. No production deployment is made. No EOS 1.0 pilot control is weakened. The qualified D1 baseline is not invalidated. Existing D1 through D8 runtimes remain their current bounded records. Their presence is not an EOS 2.0 implementation.
