# EOS-D1N-R6 Alternative Design Branch Governance Closeout

## Purpose

R6 records one alternative-design branch as a traceable option under an existing D1N orchestration context. A branch identifies an option, the context that owns it, the assumptions, evidence, and decisions already recorded for it, and an optional citation of a governed selection decision. R6 does not decide which alternative is best.

## Branch identity

One branch runtime records a branch identifier, a non-authoritative display label, and the canonical record states open, decision cited, and retained historical. The display label is metadata. A label that asserts a best, optimal, preferred, safest, or cheapest design is rejected. Creating a branch does not create a second orchestration identity.

## Exact parent context

Every branch binds to one exact current R1 orchestration context by identifier and fingerprint. A floating parent such as latest, current, or active is rejected. The parent context must share the recording actor's tenant, workspace, and project.

## Progression reference

Where a branch is associated with a design-progression context, the association is an exact current R2 record that belongs to the same orchestration context. The fingerprint is copied. Recording a branch does not change the progression state. A selected branch does not advance maturity.

## Branch lineage

Lineage is explicit. A derived branch names its parent branch. Sibling branches that share an orchestration context remain siblings until a parent is named. Similar display labels do not create a parent. A missing parent is not invented. Supersession retains the prior branch as retained historical and does not treat that retention as derivation.

## Branch assumptions

Branch-specific assumptions cite an existing prerequisite assessment whose category is assumptions. The cited assessment identifier and fingerprint are copied, including a historical assessment that a later assessment has superseded. R6 does not author assumption text. Two branches may cite different assumption records. Recording the second branch does not overwrite the first.

## Branch evidence references

A branch may cite an existing engineering-evidence reference assessment. The citation is the assessment identifier and fingerprint. R6 does not author engineering evidence, calculations, or solver output. An evidence citation is traceability. It is not technical validation.

## Branch decision references

A branch may cite existing human-decision records by identifier and fingerprint. The outcome is copied from the cited record. R6 does not create the decision and does not change its rationale, outcome, or authority.

## Selection-decision reference

A branch may cite one existing human decision whose gate is major system selection. The citation moves the branch state to decision cited. Approval outcomes on that gate are recorded as selected by the governed decision. Any other cited outcome remains decision cited and is not treated as a D1N selection. The decision authority remains the lifecycle gate. The orchestration actor records the reference and does not become the decision maker.

## Selected versus validated

A branch cited by an approving selection decision is not engineering-validated, engineering-approved, conformant, or certified. Fingerprint verification does not select, validate, or certify the branch. The progression record is unchanged.

## Not selected versus invalid

A branch with no selection citation, or a branch whose cited decision is not an approval, is not engineering-invalid, noncompliant, or certification-failed. R6 does not infer a commercial, schedule, client, or constructability reason.

## No ranking or optimization

R6 has no ranking runtime and no numerical score runtime. Requests to mark a branch best, to assign a rank, or to assign a score are rejected. D1N, an AI actor, and an administrator role cannot authoritatively select the best alternative.

## No design generation

R6 does not generate a design variant and does not modify a structure. It does not author a structural calculation, execute a solver, interpret CAD or BIM, or perform multidisciplinary reasoning.

## AI and admin authority

AI may not invent branch assumptions, invent engineering evidence, select the best branch, mark a branch validated, or mark a branch certified. An administrator cannot select by role, rewrite the cited selection decision, or bypass branch governance. Neither AI nor an administrator is D1N engineering authority.

## Provenance

Each branch preserves the parent orchestration context, the progression reference where supplied, assumption references, evidence references, decision references, the selection-decision reference where supplied, the actor, the orchestration-context authority, tenant, workspace, project, timestamp, and provenance reference.

## Fingerprint

The branch fingerprint reuses the canonical fingerprint. No second algorithm is introduced. The fingerprint covers branch identity, parent context, progression reference, lineage, citations, scope, authority, and provenance. It does not include the mutable retained-historical status. Verification of the fingerprint is not validation, selection, or certification.

## Immutability and history

A recorded branch is frozen. A later change is a new branch record that names its predecessor. The predecessor becomes retained historical and keeps its fingerprint, citations, and selection reference. Silent mutation is rejected. History records creation and retention.

## Duplicate and replay

Replaying the same branch identifier and fingerprint returns the existing record. A different fingerprint for the same identifier is rejected. A branch cannot be substituted into another tenant, workspace, or project.

## Spoofing

Substitution of branch identity, parent context, progression context, assumption references, evidence references, decision references, selection reference, authority, provenance, fingerprint, or tenant, workspace, and project scope is rejected. An asserted fingerprint that does not match the canonical fingerprint is rejected.

## No auto-repointing

Exact historical references stay exact. A later assumption assessment, evidence assessment, or selection decision does not refresh a recorded branch. R6 does not reassess currentness and does not create a parallel currentness engine.

## Consolidated boundary

Currentness reassessment, D1M integration, D1K integration, and D1L integration remain zero. Stage-transition execution and automatic progression mutation remain zero. Engineering validation, engineering approval, solver execution, conformance, certification, structural-calculation authorship, CAD or BIM interpretation, authoritative ranking, numerical scoring, automatic variant generation, and automatic structural modification remain zero. D1M stays closed. D1K limitations stay in place. D1L stays complete and bounded with limitations. D9 and D2 through D8 stay at zero. No schema change and no dependency are added.

## Security evidence

Branch records enforce tenant, workspace, and project scope on the parent context, progression reference, assumption citations, evidence citations, decision citations, and selection citation. Authority remains the orchestration-context authority for the record and the lifecycle-gate authority for the cited decision. The known security baseline is unchanged by this phase. General-availability security debt still blocks general availability.

## Release evidence

The branch runtime, its test, the capability row, and the release classification are release-sensitive. The closeout is not a release-sensitive artifact. No release classification promotes best-design selection, ranking, design generation, progression mutation, transition execution, validation, approval, solver execution, conformance, certification, D1K readiness, D1L eligibility, D9, D2 through D8, or general availability.

## Runtime and readiness

D1N runtime has started. The current runtime count is 6. Orchestration identity, design progression, prerequisite assessment, stage-transition request, human gate, and alternative-branch governance are ready. Stage-transition execution, currentness reassessment, and handoff integration are not ready. The alternative-branch runtime count is 1. Earlier phase snapshots keep their own counts.

## Debt

C10, D1F, D1G, D1H, D1I, D1J, D1K, and D1L debt remain limitations and do not block this bounded phase. The D1G certification blocker remains. The structural pack remains incomplete. R6 does not resolve review, validation, solver, conformance, or certification debt.

## Next authorized phase

The next authorized phase is EOS-D1N-R7-CURRENTNESS-STALENESS-AND-REASSESSMENT. It may record a governed response when cited upstream evidence or context becomes stale or requires reassessment. It must not infer undocumented dependency propagation, automatically revalidate engineering, automatically reapprove transitions, refresh historical references, recertify, or mutate previous decisions or history. R7 is not started by this closeout.
