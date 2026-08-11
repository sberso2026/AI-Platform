# Engineering OS Phase E8 — Engineering Action & Workflow Orchestration

**Status:** Complete  
**Baselines:** E0–E7 (`8170ba5` E7)  
**Roadmap note:** Earlier E0 roadmap labelled E8 “Connector framework productization”. This phase **redefines E8 as Action & Workflow Orchestration**. Connector productization remains a later theme.

## Goal

Convert grounded Ask / Why? / tool / memory outputs into **governed engineering work** with minimal duplicate entry and **explicit human control**.

## Principle

```
AI proposes.
Human reviews/authorises.
Existing domain service executes.
System records provenance/outcome.
```

No autonomous approval.

## Ownership

| Concern | Owner |
|---------|--------|
| Workflow Engine | **Platform Kernel** `WorkflowService` |
| Event Bus | **Platform Kernel** `EventBusService` |
| Registers (action/decision/risk/issue/TQ) | Existing Engineering OS services |
| Action proposal adapters | Engineering OS Phase E8 |

`duplicateWorkflowEngineDetected = false` — no second workflow framework.

## Contracts

`EngineeringActionProposal` with states:

PROPOSED · NEEDS_INPUT · READY_FOR_REVIEW · APPROVED · REJECTED · EXECUTING · COMPLETED · FAILED · CANCELLED · EXPIRED

**Action types** (existing domain support only):  
DRAFT_TQ_RESPONSE · DRAFT_REPORT · CREATE_ACTION · CREATE_DECISION_DRAFT · CREATE_RISK_DRAFT · CREATE_ISSUE_DRAFT · PROPOSE_INTERVENTION · ASSIGN_REVIEW · LINK_EVIDENCE · PREPARE_REGISTER_ENTRY · PREPARE_EXTERNAL_WRITE

## Authority classes

LOW_FRICTION · REVIEW_REQUIRED · APPROVAL_REQUIRED · EXTERNAL_WRITE · SAFETY_CRITICAL

Safety-critical: never auto-execute; explicit human reviewer; no AI approval role.

## Flow

```
E5/E6/E7 result
 → create proposal (context prefill)
 → validate permissions / tamper hash
 → human Accept / Edit / Reject
 → invoke existing domain/workflow adapter
 → audit + event + provenance
 → optional E7 memory candidate (COMPLETED only)
```

## External write

`PREPARE_EXTERNAL_WRITE` creates a proposal only.  
E4 write path remains disabled by default — execution blocked unless governed connector policy is explicitly enabled.

## Ask UX

Concise work actions: Create action · Draft response · Prepare decision · Add risk/issue · Assign review · Link evidence.  
Review panel: Accept · Edit · Reject · Execute (after accept).

AI-generated text remains **DRAFT** until human accepts — never implies issued/approved.

## E7 handoff

Completed governed actions may emit PROJECT_MEMORY candidates (`OBSERVED`).  
Rejected proposals are never promoted as organisational knowledge.
