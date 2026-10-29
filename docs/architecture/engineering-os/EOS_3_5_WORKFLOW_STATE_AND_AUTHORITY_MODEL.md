# EOS 3.5 Workflow State and Authority Model

`EOS_3_GOVERNED_WORKFLOW_ARCHITECTURE_IMPLEMENTED=YES`

`EOS_3_WORKFLOW_DEFINITION_MODEL_IMPLEMENTED=YES`

`EOS_3_WORKFLOW_DEFINITION_VERSIONING=PASS`

`EOS_3_WORKFLOW_INSTANCE_MODEL_IMPLEMENTED=YES`

`EOS_3_WORKFLOW_TRANSITION_VALIDATION=PASS`

`EOS_3_INVALID_TRANSITION_REJECTION=PASS`

`EOS_3_WORKFLOW_AUTHORITY_MATRIX_IMPLEMENTED=YES`

`EOS_3_WORKFLOW_AUTHORITY_ENFORCEMENT=PASS`

## Definition model

Each `Eos3WorkflowDefinition` carries: workflow identity, version, object type, allowed states, allowed transitions, required roles, human checkpoints, optional non-authoritative auto actions, jurisdiction context.

Instances bind to the **workflow version used at create time** so historical records remain interpretable.

## Representative lifecycles

| Object | States (abbrev.) |
| --- | --- |
| Interface | DRAFT → ISSUED → RECEIVED → ACCEPTED/REJECTED / SUPERSEDED |
| Decision | DRAFT → ANALYSIS → READY_FOR_HUMAN_DECISION → DECIDED / SUPERSEDED |
| OptimizationRun | DEFINED → READY → RUNNING → COMPLETED/FAILED / SUPERSEDED |
| Deliverable | DRAFT → REVIEW → APPROVED → RELEASED; STALE / SUPERSEDED |
| Baseline | DRAFT → READY → FROZEN / SUPERSEDED |
| Review | DRAFT → IN_REVIEW → ACCEPTED/REJECTED |

## Authority examples

- Draft → Review: creator/engineer
- Review → Accepted: reviewer
- Interface ACCEPTED: receiver only
- Decision → Decided: decision_owner only
- Deliverable → Approved: approver; → Released: release_authority
- Baseline → Frozen: freeze_authority

AI on a `humanCheckpoint` edge → `ai_workflow_authority_denied`.

## Work items

Assignment to user/role/team is operational. `assignmentGrantsAuthority=false`. Completing a work item does not grant engineering approval.
