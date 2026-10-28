# EOS 2.0 discipline capability matrix and implementation roadmap

Phase: `EOS-2.0-ENGINEERING-LIFECYCLE-AND-DISCIPLINE-DESIGN-ARCHITECTURE`

Status of the matrix: `ARCHITECTURE_DEFINED`.

States used below mean only what they say:

- `ARCHITECTURE_DEFINED`: this EOS 2.0 phase defines the scope.
- `IMPLEMENTED`: a bounded runtime exists in the repository today.
- `VALIDATED`: the bounded runtime has its own technical validation evidence.
- `QUALIFIED`: a qualified human review accepted a stated scope.
- `CERTIFIED`: not claimed. EOS does not certify a discipline, a project, a solver, or a deliverable in this phase.

No cell marked `ARCHITECTURE_DEFINED` is `IMPLEMENTED` by this phase. Existing D-series runtimes are records and bounded checks. They are not the lifecycle calculators listed in the discipline contract.

## Current repository reading

D1 Structural has a qualified review baseline for its stated subjects, including the later C7 calculated-mode re-review for class N. That baseline is `QUALIFIED` for the stated scope only. It is not full structural delivery. Several subjects still exclude complete wall design, seismic wall detailing, and other delivery products named in the EOS 2.0 structural contract. D1 remains incomplete as a discipline delivery module.

D2 Civil, D3 Geotechnical, D4 Mechanical, and D5 Piping have bounded record runtimes through requirements, assumptions, and change. Those runtimes are `IMPLEMENTED` as records. They are not the Concept-to-Detailed calculators in the contract. They are not `CERTIFIED`.

D6 Process is complete only within its stated bounded limitations. It is not a process simulator and not this FEED or Detailed process scope.

D7 Electrical has bounded runtimes through requirements, assumptions, and change. D7 is not a complete electrical discipline and not a power-system solver.

D8 Instrumentation and Control has bounded runtimes through requirements, assumptions, and change. D8 is not a complete I&C discipline. SIS verification is not implemented. D9 reasoning is not started.

EOS 1.0 Engineering AI can give general methodology and can abstain when project evidence is missing. That behavior is `IMPLEMENTED` for the pilot advisory path. It is not stage-aware EOS 2.0 Engineering AI, and it is not an approval authority.

## Matrix

For every discipline below, Concept, Feasibility, FEED, and Detailed Engineering capabilities in the module contract are `ARCHITECTURE_DEFINED`. Deterministic internal engines for those full stage lists are not implemented. External solver adapters are `ARCHITECTURE_DEFINED` and not implemented. AI advisory capability for stage-specific delivery is `ARCHITECTURE_DEFINED`. Human review is required for every discipline at every stage. The future phase is the roadmap phase named in the last column.

| Discipline | Current EOS capability | Capability gap | Future phase |
| --- | --- | --- | --- |
| Structural | Qualified D1 baseline for stated subjects only. Not full member, connection, foundation, or IFC delivery. | Lifecycle structural delivery, load register, and IFC package are not the qualified baseline. | EOS-2.3 |
| Civil | Bounded D2 records. | Site, drainage, pavement, and earthworks delivery are not implemented as EOS 2.0 calculators. | EOS-2.7 |
| Geotechnical | Bounded D3 records. | Investigation, ground model, pile, slope, and excavation delivery are not implemented as EOS 2.0 analyses. | EOS-2.8 |
| Mechanical | Bounded D4 records. | Equipment list, datasheets, and package delivery are not implemented as EOS 2.0 calculators. | EOS-2.5 |
| Piping | Bounded D5 records. | Line list, stress, supports, isometrics, and MTO delivery are not implemented as EOS 2.0 calculators. | EOS-2.6 |
| Process | Bounded D6 records within stated limitations. | Balances, simulation, P&ID delivery, and relief calculations are not this architecture's implementation. | EOS-2.4 |
| Electrical | Bounded D7 records. D7 is not complete. | Load flow, short circuit, protection, cable, and SLD delivery are not implemented. | EOS-2.9 |
| Instrumentation and Control | Bounded D8 records. D8 is not complete. | Index, I/O, cause and effect, logic, and SIS verification are not implemented. | EOS-2.10 |

Human-review requirement for every row: a qualified reviewer and, where the project separates them, an approval authority. AI and admin roles are not those authorities.

## Implementation roadmap

The default sequence is kept. Structural delivery is placed before geotechnical delivery because EOS-2.3 can consume governed geotechnical interface inputs entered as explicit assumptions. It must not pretend those inputs are a geotechnical analysis. Process remains before mechanical and piping because process duties are the source interfaces for equipment and lines. Cross-discipline intelligence and change impact come after the discipline modules exist to link. Design freeze and deliverable governance come after the objects they baseline. The qualification gate is last.

1. `EOS-2.1-ENGINEERING-LIFECYCLE-FOUNDATION`
2. `EOS-2.2-COMMON-DESIGN-BASIS-AND-REQUIREMENTS`
3. `EOS-2.3-STRUCTURAL-DESIGN-DELIVERY`
4. `EOS-2.4-PROCESS-DESIGN-DELIVERY`
5. `EOS-2.5-MECHANICAL-DESIGN-DELIVERY`
6. `EOS-2.6-PIPING-DESIGN-DELIVERY`
7. `EOS-2.7-CIVIL-DESIGN-DELIVERY`
8. `EOS-2.8-GEOTECHNICAL-DESIGN-DELIVERY`
9. `EOS-2.9-ELECTRICAL-DESIGN-DELIVERY`
10. `EOS-2.10-IC-DESIGN-DELIVERY`
11. `EOS-2.11-CROSS-DISCIPLINE-INTERFACE-INTELLIGENCE`
12. `EOS-2.12-ENGINEERING-CHANGE-IMPACT-INTELLIGENCE`
13. `EOS-2.13-DESIGN-FREEZE-AND-DELIVERABLE-GOVERNANCE`
14. `EOS-2.14-MULTIDISCIPLINE-INTEGRATED-PROJECT-DEMONSTRATION`
15. `EOS-2.15-EOS-2-0-ENGINEERING-DELIVERY-QUALIFICATION-GATE`

No phase in this list is started by the architecture documents. EOS-2.1 is the next phase.
