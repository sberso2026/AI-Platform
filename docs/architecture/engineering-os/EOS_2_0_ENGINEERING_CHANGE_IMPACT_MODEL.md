# EOS 2.0 engineering change impact model

Phase: `EOS-2.0-ENGINEERING-LIFECYCLE-AND-DISCIPLINE-DESIGN-ARCHITECTURE`

Status: `ARCHITECTURE_DEFINED`. Impact propagation is not implemented by this phase. Existing discipline change records identify explicit dependencies and reassessment. They do not propagate a change into another discipline's calculations.

## Proposal, not approval

EOS proposes impacted objects from explicit links. Human engineers decide whether each impact is real. There is no autonomous approval and no autonomous recalculation.

A `Change` cites at least one explicit dependency: target kind, target identity, and exact revision. An `ImpactAssessment` lists candidate impacts found by walking those explicit links and the interface graph. AI may suggest additional candidates, and each suggestion is labeled `RECOMMENDATION`, not `FACT`, until a human adds it as an explicit dependency.

## Example

`Pump duty changed` may affect pump selection, motor rating, electrical load, cable sizing, transformer loading, nozzle geometry, piping hydraulics, piping stress, support reactions, structural loads, foundations, cost, schedule, and procurement.

Those effects are candidates only where an interface, calculation input, model input, deliverable, or requirement link already cites the pump duty or cites an object that cites it. EOS does not invent the chain from the example alone.

## After a freeze

Material change after Concept Freeze, Feasibility Selection, FEED Baseline, Detailed Design Freeze, or IFC Baseline requires an impact assessment before the new revision can become current. The assessment records included objects, excluded objects, the human decision on each candidate, and the resulting deliverable revisions.

The causal project-controls link is:

`Engineering change -> deliverable revision -> procurement impact -> construction impact -> cost or schedule impact`

Cost and schedule quantities remain in the external project-controls system. EOS stores the identity of the external record and the revision it saw. EOS does not approve the cost or the schedule.

## What a change is not

A change is not a redesign, a recalculation, a protection setting, a line size, a foundation size, a SIL verification, or an approval. Completing an impact assessment does not close those engineering actions. Each action remains its own record with its own authority.
