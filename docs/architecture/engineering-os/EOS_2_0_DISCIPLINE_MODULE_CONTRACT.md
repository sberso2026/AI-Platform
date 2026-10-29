# EOS 2.0 discipline module contract

Phase: `EOS-2.0-ENGINEERING-LIFECYCLE-AND-DISCIPLINE-DESIGN-ARCHITECTURE`

Status: `ARCHITECTURE_DEFINED`. No discipline module in this contract is implemented by this phase.

Every discipline uses the same high-level module structure:

1. Discipline Home
2. Design Basis
3. Requirements
4. Inputs
5. Assumptions
6. Criteria
7. Systems / Assets
8. Models
9. Calculations
10. Interfaces
11. Risks
12. Decisions
13. Changes
14. Reviews
15. Deliverables
16. Engineering AI

A discipline may add discipline-specific objects by composition. It may not fork `Requirement`, `DesignBasis`, `Calculation`, `Interface`, `Change`, `Deliverable`, or `Approval` into an incompatible copy.

Calculations follow `Structured Inputs -> Deterministic Engine -> Traceable Result -> AI Explanation -> Human Engineering Decision`. Engineering AI in each module is advisory. It cannot approve.

The stage lists below are the architectural scope of each discipline. They are not a claim that EOS already calculates them.

## Structural

Concept: structural system options, framing concepts, material options, foundation concepts, preliminary load paths, modularization, preliminary quantities.

Feasibility: preliminary member sizing, preliminary wind and seismic actions, equipment loads, pipe-rack loading, foundation reactions, vibration screening, preliminary steel and concrete quantities, constructability.

FEED: structural design basis, load register, framing philosophy, foundation philosophy, material criteria, preliminary models, structural interfaces, preliminary calculations, member and foundation schedules, preliminary MTO.

Detailed Engineering: member analysis, connection design, base plates, anchors, equipment supports, slabs, walls, foundations, vibration, stability, fatigue where applicable, seismic and cyclone detailing, calculation packages, IFC deliverables.

Existing D1 is a bounded qualified structural pack for its stated subjects. It is not this full delivery scope. Complete wall design, wall shear, wall second-order behavior, boundary elements, and seismic wall detailing are not implemented. Connection design, base plates, anchors as a delivery package, fatigue, and IFC structural deliverables are not the qualified D1 baseline. This architecture does not mark those gaps closed.

## Civil

Concept: site layout, access, grading concept, drainage strategy, roads, stormwater, construction logistics.

Feasibility: preliminary cut and fill, catchments, drainage corridors, culverts, pavement options, flood constraints, quantities.

FEED: civil design basis, grading philosophy, drainage basis, road design basis, preliminary earthworks, drainage network, culvert sizing, pavement definition, civil MTO.

Detailed Engineering: final grading, drainage calculations, stormwater network, roads, pavements, hardstands, pits, culverts, trenches, earthworks quantities, IFC civil drawings.

Existing D2 civil records are bounded and are not this lifecycle calculator set.

## Geotechnical

Concept: regional geology, historic ground information, preliminary ground-risk model, foundation options, groundwater risks, ground-improvement options.

Feasibility: investigation plan, boreholes, CPT, test pits, preliminary bearing capacity, settlement, liquefaction screening, slope and excavation risk.

FEED: geotechnical design basis, interpreted ground model, design parameters, foundation recommendations, pile parameters, excavation parameters, ground-improvement requirements.

Detailed Engineering: settlement analysis, bearing capacity, pile capacity, lateral pile response, slope stability, retaining systems, excavation stability, dewatering, construction geotechnical controls.

Existing D3 geotechnical records are bounded and are not this analysis set.

## Mechanical

Concept: equipment technology options, rotating and static equipment concepts, utility philosophy, redundancy, maintainability, arrangement.

Feasibility: equipment sizing, preliminary duties, equipment count, power demand, package comparison, reliability, preliminary cost.

FEED: mechanical design basis, equipment list, equipment datasheets, package specifications, nozzle and interface requirements, maintenance philosophy, lifting and handling requirements.

Detailed Engineering: final datasheets, mechanical calculations, vendor data review, package integration, mechanical interfaces, alignment criteria, equipment support requirements, maintenance and access verification.

Existing D4 mechanical records are bounded and are not this equipment-delivery set.

## Piping

Concept: routing philosophy, material philosophy, major corridors, preliminary line sizing, isolation philosophy, tie-in concept.

Feasibility: preliminary line list, pressure-drop screening, routing options, pipe-rack allocation, material selection, stress criticality.

FEED: piping design basis, line list, piping material classes, valve philosophy, preliminary P&IDs, routing, stress-critical line register, tie-in register, nozzle-load interface register.

Detailed Engineering: final line sizing, stress analysis, supports, spring supports, flexibility, nozzle-load checks, slug, seismic, and wind cases, routing, isometrics, support drawings, MTO.

Existing D5 piping records are bounded and are not a piping-stress solver.

## Process

Concept: process route, technology alternatives, capacity scenarios, block flow diagrams, major equipment, utility philosophy.

Feasibility: mass balance, energy balance, process simulation, preliminary equipment sizing, preliminary hydraulics, utilities, option comparison.

FEED: process design basis, PFDs, heat and material balances, P&IDs, process datasheets, control philosophy, relief philosophy, HAZID and HAZOP preparation.

Detailed Engineering: final process calculations, hydraulic calculations, line sizing, relief and flare calculations, control-valve sizing, final P&IDs, operating envelopes, alarm and trip basis, commissioning inputs.

Existing D6 process records are complete only within their stated bounded limitations. They are not a process simulator.

## Electrical

Concept: power-source options, voltage philosophy, distribution concept, redundancy, emergency power.

Feasibility: preliminary load list, transformers, generation, voltage levels, electrical rooms, cable quantities, preliminary CAPEX.

FEED: electrical design basis, load list, single-line diagrams, power-system philosophy, transformer and MCC sizing, protection philosophy, earthing philosophy, hazardous-area interfaces.

Detailed Engineering: load flow, short circuit, protection coordination, arc flash, motor starting, harmonics, cable sizing, voltage drop, earthing, lighting, schedules, final single-line diagrams.

Existing D7 electrical runtimes through requirements, assumptions, and change are bounded records. D7 is not a complete electrical discipline and is not a power-system solver.

## Instrumentation and control

Concept: automation philosophy, control architecture, SIS concept, communications philosophy, instrumentation strategy.

Feasibility: instrument count, I/O estimate, control-system sizing, architecture alternatives, automation CAPEX.

FEED: I&C design basis, control philosophy, instrument index, I/O list, cause and effect, SIS requirements, control architecture, communication architecture.

Detailed Engineering: instrument datasheets, loop diagrams, logic, cause and effect, I/O schedules, cable schedules, control narratives, alarm rationalization, SIS verification, network architecture.

Existing D8 runtimes through requirements, assumptions, and change are bounded records. D8 is not a complete I&C discipline. A D8 requirement is not a counterpart discipline's adopted requirement. SIS verification is not implemented. D9 reasoning is not started.

## Shared rules

A discipline home shows stage, maturity, open interfaces, open changes, and authority limits. It does not show another discipline's unadopted source as if it were adopted.

Design basis, requirements, inputs, assumptions, and criteria cite exact revisions. Calculations and models cite those revisions. Interfaces cite the source and receiving revisions. Changes cite explicit dependencies. Reviews and deliverables cite the revisions they examined. Engineering AI cites the same revisions and labels facts, inferences, assumptions, recommendations, calculation results, and human decisions separately.
