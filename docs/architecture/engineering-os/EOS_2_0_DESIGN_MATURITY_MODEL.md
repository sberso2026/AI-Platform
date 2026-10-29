# EOS 2.0 design maturity model

Phase: `EOS-2.0-ENGINEERING-LIFECYCLE-AND-DISCIPLINE-DESIGN-ARCHITECTURE`

Status: `ARCHITECTURE_DEFINED`. Maturity states are not implemented by this phase.

Design maturity is independent of approval. A mature record can still be unapproved. An approved record records a separate human `Approval`. Maturity is not professional certification, not a code compliance claim, and not an Issued for Construction authority by itself.

## States

The canonical maturity states are:

- `CONCEPT_INITIAL`
- `CONCEPT_REVIEWED`
- `FEASIBILITY_DEVELOPING`
- `FEASIBILITY_SELECTED`
- `FEED_DEVELOPING`
- `FEED_BASELINED`
- `DETAILED_DESIGN_IN_PROGRESS`
- `DETAILED_DESIGN_VERIFIED`
- `ISSUED_FOR_REVIEW`
- `ISSUED_FOR_APPROVAL`
- `ISSUED_FOR_CONSTRUCTION`

These states apply to design-basis statements, requirements under development, models, calculations, interfaces, and deliverables. A project may be in FEED while an individual object is still `CONCEPT_REVIEWED` if that object was not selected forward. The object state is not inferred from the project stage.

## Meaning

`CONCEPT_INITIAL` is an identified option with explicit unknowns. `CONCEPT_REVIEWED` means a human reviewed the option. It does not select it.

`FEASIBILITY_DEVELOPING` is comparative work in progress. `FEASIBILITY_SELECTED` means a human recorded the selected option. The selection is a `Decision`, not an `Approval` to construct.

`FEED_DEVELOPING` is baseline work in progress. `FEED_BASELINED` means the object is inside a FEED `ConfigurationBaseline`. Unresolved exceptions stay visible.

`DETAILED_DESIGN_IN_PROGRESS` is detailed work that cites the current basis and inputs. `DETAILED_DESIGN_VERIFIED` means the stated verification method was completed and evidence is linked. Verification is not approval.

`ISSUED_FOR_REVIEW` means the revision was issued to a reviewer. `ISSUED_FOR_APPROVAL` means it was issued to an approval authority. `ISSUED_FOR_CONSTRUCTION` means an authorized human approval exists for that revision and the IFC baseline includes it. Reaching the state name without the approval record is rejected.

## Movement

Forward movement is explicit. A later stage does not skip required evidence for that object. An object may remain at an earlier maturity when the project stage advances, and that lag is visible.

Return to an earlier maturity is a revision, not a silent edit. If the object was inside a freeze, the return opens an impact assessment.

Supersession keeps the old maturity on the old revision. The new revision starts at the maturity its evidence supports.

## Relationship to existing EOS states

EOS 1.0 technical-query statuses, evidence states, and authority statuses stay in their own records. They are not remapped onto this maturity list by this phase. A technical query can block a maturity transition. It does not become the maturity state.

The qualified D1 baseline remains a qualified review of its stated structural subjects. That qualification is not `ISSUED_FOR_CONSTRUCTION` and not an EOS 2.0 maturity implementation.
