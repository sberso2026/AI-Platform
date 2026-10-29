# Project Controls Change Authority Boundary

Phase 11D. This document states the single boundary that Phase 11D exists to
protect: **Project Controls assesses change; it does not approve change.**

## The boundary in one line

Project Controls owns *intelligence about change*. It does not own *authority
over change*. `CHANGE_INTELLIGENCE_OWNERSHIP = "project_controls"` and
`CONTRACTUAL_CHANGE_AUTHORITY_OWNERSHIP = "reserved_not_project_controls"`.

## What Project Controls does

- Assembles `ChangeCandidate` subjects from change signals
- Resolves evidence into a `ChangeConfidence` and abstains when support is thin
- Produces a versioned `ChangeIntelligenceState` describing what the evidence
  supports about classification, status context and advisory impact
- Maintains `ChangeReference` pointers to change instruments owned elsewhere
- Runs an internal review workflow over its own assessments
- Rolls change intelligence into the `ProjectProfile`

## What Project Controls does not do

| Capability | Position | Enforcement |
| --- | --- | --- |
| Approve a contractual change | Forbidden | `CONTRACTUAL_CHANGE_APPROVAL_BY_AI_ALLOWED = false`, `assertNoContractualApproval()` |
| Execute a change | Forbidden | `CHANGE_EXECUTION_IMPLEMENTED = false`, `ChangeProvider.executeChange` throws |
| Price a change | Forbidden | `ChangeProvider.priceChange` throws, `COST_ENGINE_IMPLEMENTED = false` |
| Post to a financial ledger | Forbidden | `FINANCIAL_POSTING_IMPLEMENTED = false` |
| Mutate a budget | Forbidden | CHECK `budget_mutated = false` on every change row |
| Draw contingency | Forbidden | `CONTINGENCY_MANAGEMENT_IMPLEMENTED = false`, `ContingencyProvider` throws |
| Compute earned value | Forbidden | `EARNED_VALUE_IMPLEMENTED = false` |
| Compute critical path or float | Forbidden | `CPM_SCHEDULING_IMPLEMENTED = false`, `FLOAT_COMPUTATION_IMPLEMENTED = false` |
| Forecast | Forbidden | `FORECASTING_IMPLEMENTED = false` |
| Mutate canonical engineering risk | Forbidden | CHECK `core_risk_mutated = false` |
| Publish a change autonomously | Forbidden | `AUTONOMOUS_CHANGE_PUBLICATION_ALLOWED = false`, `AI_MAY_PUBLISH_CHANGE_FORBIDDEN = true` |

## Reserved owners of contractual change authority

Contractual change authority is deliberately unassigned. It is reserved for one
of the following, to be decided when the owning domain exists:

- `engineering_core` — if change determination becomes an engineering discipline
  concern rather than a commercial one
- a future **commercial / contracts domain** — the most likely home; owns
  variation orders, contract amendments and entitlement
- **Business OS** — if change approval is modelled as a general business approval
  rather than an engineering one
- **external** — the customer's own contract administration system of record

`CONTRACTUAL_CHANGE_AUTHORITY_CANDIDATE_OWNERS` enumerates these in
`version.ts`. Until one is chosen, `assertOwnershipLock()` fails closed if the
owner is ever set to `project_controls`.

## Financial ledger ownership

Phase 11D restates financial ledger ownership as
`external_finance_or_future_finance_domain`. Phase 11C spelled this
`platform_commerce_finance`, which read as though Platform Commerce would own
project financial ledgers. It will not: project cost ledgers belong either to an
external finance system of record or to a future finance domain that does not
yet exist. Platform Commerce owns entitlement, not project cost.

## Workflow approval is not contractual approval

Project Controls runs `project_controls.change_review`
(`draft → pending_review → approved | rejected | changes_requested → published`).
That workflow approves **the assessment**, meaning "a competent human agrees this
is what the evidence supports". It never approves **the change**.

`assertChangePublishable()` enforces three things before a publish:

1. The workflow state is `approved` — otherwise
   `change_publish_requires_approved_review`
2. The reviewer is not the assessor — otherwise
   `change_self_approval_forbidden`
3. No contractual approval is claimed — otherwise
   `change_assessment_approval_is_not_contractual_approval`

## Why this matters

Change is where engineering intelligence meets commercial consequence. A system
that quietly slides from "the evidence suggests a scope change" to "a scope
change has been approved" manufactures entitlement that nobody granted. The
boundary above is the reason Phase 11D can be advisory and still be useful:
users can trust the assessment precisely because it cannot become a decision.

## Related documents

- [Change model](PROJECT_CONTROLS_CHANGE_MODEL.md)
- [Change Intelligence engine overview](PROJECT_CONTROLS_CHANGE_INTELLIGENCE.md)
- [Ownership matrix](PROJECT_CONTROLS_OWNERSHIP_MATRIX.md)
