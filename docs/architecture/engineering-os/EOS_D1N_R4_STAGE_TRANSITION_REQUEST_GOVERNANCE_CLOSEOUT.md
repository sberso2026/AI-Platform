# EOS-D1N-R4 Stage-Transition Request Governance Closeout

## Purpose

R4 records a governed request to consider a transition between canonical D1N design-progression states. The request names the exact orchestration context, the exact source progression record, the requested destination, the cited prerequisite assessments, and any evidence gaps those assessments already carry. Recording the request does not grant the transition.

## Binding

Every request cites one current R1 orchestration context by identifier and fingerprint, one current R2 progression record by identifier and fingerprint, and one or more R3 assessments by identifier and fingerprint. Evidence-gap references are required only for assessments that already have a gap. Floating labels such as latest or current are rejected. A foreign tenant, workspace, or project cannot satisfy the citation.

## Identity and states

The source stage is copied from the cited R2 record. A caller-supplied source that differs is rejected. The destination must be supplied explicitly and must be one of CONCEPT, PREFEASIBILITY, FEASIBILITY, FEED, or DETAILED_DESIGN. The pair must be one of the architecture forward pairs, and that pair must also be allowed by the existing default engineering lifecycle profile. Back-transitions and skips are not D1N requests. R4 does not choose the next stage.

## Prerequisites and gaps

R4 copies the assessment status, currentness citation, and gap status from the R3 records it was given. It does not recompute them. A cited stale assessment cannot support a current transition request, because the architecture already rejects stale inputs for a current transition. Missing, externally governed, and limited inputs can be cited, with their gap records, without closing the gap and without making the request approvable.

## Lifecycle

A new request is OPEN. A later request for the same orchestration context and source progression supersedes the open predecessor and leaves the predecessor reconstructable. Withdrawal marks the same record WITHDRAWN and appends history. Neither action rewrites the source, destination, citations, provenance, or fingerprint. Approved, accepted, and rejected are not request lifecycle states.

## Request versus approval

An open request is evidence that an authorized requester asked for the transition to be considered. It does not change the R2 progression state, approve the transition, authorize execution, validate engineering, approve engineering, or certify. A request whose cited assessments are all present, or that cites no gaps, remains unapproved.

## Authority, provenance, and fingerprint

The request authority is the existing orchestration-context authority. It is not stage-approval, engineering-approval, engineering-validation, certification, AI, or admin authority. Provenance, tenant, workspace, project, and the canonical fingerprint are required. Fingerprint verification does not approve the transition. The same request identifier and fingerprint replay the existing record. A second open request for the same source progression is rejected. Substituted context, progression, assessment, gap, authority, or scope is rejected.

## Boundary

R4 does not execute a transition, run a human or review gate, select an alternative, reassess currentness, integrate D1M, D1K, or D1L, validate, approve, run a solver, determine conformance, certify, author a calculation, or interpret CAD or BIM. Those runtime counts stay at zero. Upstream records are not repointed when a later progression or assessment is recorded. The canonical digital thread and currentness citation are reused. No schema and no dependency were added. Structural debt remains a limitation, the D1G certification blocker remains, and the structural pack remains incomplete.

## Next phase

The next phase is EOS-D1N-R5-HUMAN-DECISION-AND-REVIEW-GATE-INTEGRATION. It may cite an exact R4 request and record a human decision or review outcome. It is not started here.
