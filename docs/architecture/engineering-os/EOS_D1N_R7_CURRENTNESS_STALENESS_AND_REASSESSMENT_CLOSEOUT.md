# EOS-D1N-R7 Currentness, Staleness, and Reassessment Closeout

## Purpose

R7 records whether an exact D1N record is still current against the dependencies that record already cites. A change in an explicit dependency can mark that record stale or reassessment-required. R7 does not make the engineering current again, and it does not rewrite the record that was current at the time.

## Canonical currentness

Current, stale, and superseded are the D1M currentness states. Reassessment-required records the existing rule that a changed explicit dependency requires reevaluation. No second currentness engine is created. Fingerprints continue to use the canonical fingerprint.

## Explicit dependencies

A currentness record names the affected D1N record and the dependency records it relies on. Dependencies are exact R1 orchestration contexts, R2 progression records, R3 assessments, R3 evidence gaps, R4 transition requests, R5 human decisions, or R6 alternative branches. A dependency that is not already on that list is rejected. Similar names, later records, and unstated relationships do not propagate currentness.

## Current, stale, reassessment, and supersession

A baseline record is current only while every cited dependency still matches its recorded fingerprint and is not itself stale. A successor dependency that is explicitly stale produces a stale currentness record. A successor dependency that is explicitly superseded produces a reassessment-required record. The prior currentness record becomes superseded and remains reconstructable. Supersession is not deletion. Stale does not mean engineering-incorrect, engineering-invalid, or certification-revoked. Reassessment-required does not mean engineering-invalid, engineering-revalidated, transition-revoked, or certification-revoked.

## Effect on R1 through R6

R7 reads R1 through R6 records and does not write them. An R2 successor does not cause R7 to advance, downgrade, or reset progression. An R3 successor does not rewrite the prior assessment status or evidence reference. An R4 request is not repointed, withdrawn, approved, or rejected. An R5 decision keeps its outcome, rationale, and fingerprint. An R6 branch keeps its evidence, assumption, and selection references and is not reselected.

## Reassessment record

One reassessment runtime records the affected record, the triggering dependency, the prior currentness, the resulting currentness, the trigger category, the actor, the orchestration-context authority, provenance, scope, timestamp, and fingerprint. The observed successor fingerprint is trigger evidence. It is not written back onto the historical dependency list.

## No auto-repoint and no historical mutation

The historical dependency list stays on the original fingerprints. A later record does not refresh those references. Silent mutation of currentness state is rejected. The superseded record still shows the currentness it had when it was recorded.

## No engineering revalidation

A reassessment is not engineering validation, engineering approval, a conformance recheck, or certification. It does not execute a solver, author a calculation, or interpret CAD or BIM. The recording authority is the orchestration-context authority. It is not the human decision authority and not engineering authority.

## AI and admin boundaries

AI cannot invent a dependency, revalidate engineering, reapprove a transition, or recertify. An administrator cannot force a record current, clear a reassessment requirement, or rewrite currentness history by role.

## Provenance

Each record preserves the affected record, triggering dependency, prior state, resulting state, actor, authority, reason category, tenant, workspace, project, timestamp, provenance reference, and history linkage.

## Fingerprint

The canonical fingerprint covers identity, the affected record, the explicit dependency set, the trigger, the prior and resulting states, scope, authority, and provenance. It does not cover the later superseded status. Fingerprint verification is not currentness, engineering validation, or completion of reassessment.

## Immutable history

History records creation and supersession. Reconstruction shows the original dependency set, the trigger, the stale or reassessment-required result, and the supersession chain.

## Duplicate, replay, and spoofing

Replaying the same reassessment identifier and fingerprint returns the existing record. A different fingerprint for that identifier is rejected. A second current record for the same affected record is rejected unless it supersedes the prior one. Substitution of the affected record, dependency, trigger, authority, provenance, fingerprint, or tenant, workspace, and project scope is rejected.

## Consolidated boundary

Automatic progression mutation, stage-transition execution, and branch reselection remain zero. Engineering validation, engineering approval, solver execution, conformance, certification, structural-calculation authorship, and CAD or BIM interpretation remain zero. D1M, D1K, and D1L integration remain zero, and handoff integration is not ready. D1M stays closed. D1K limitations stay in place. D1L stays complete and bounded with limitations. D9 and D2 through D8 stay at zero. No schema change and no dependency are added. The digital thread remains the canonical thread.

## Security evidence

Currentness records enforce tenant, workspace, and project scope on the affected record and every explicit dependency. Authority remains the orchestration-context authority. The known security baseline is unchanged. General-availability security debt still blocks general availability.

## Release evidence

The currentness runtime, its test, the capability row, and the release classification are release-sensitive. The closeout is not a release-sensitive artifact. No release classification promotes progression mutation, transition execution, branch reselection, validation, approval, solver execution, conformance, certification, D1M integration, D1K readiness, D1L eligibility, D9, D2 through D8, or general availability.

## Runtime and readiness

D1N runtime has started. The current runtime count is 7. Orchestration identity, design progression, prerequisite assessment, stage-transition request, human gate, alternative-branch governance, and currentness reassessment are ready. Stage-transition execution and handoff integration are not ready. The reassessment runtime count is 1. Earlier phase snapshots keep their own counts.

## Debt

C10, D1F, D1G, D1H, D1I, D1J, D1K, and D1L debt remain limitations. The D1G certification blocker remains. The structural pack remains incomplete. R7 does not resolve review, validation, solver, conformance, or certification debt.

## Next authorized phase

The next authorized phase is EOS-D1N-R8-D1M-D1K-D1L-HANDOFF-INTEGRATION. It may cite existing D1M, D1K, and D1L contracts. It must not absorb those tracks, bypass currentness, promote D1K readiness, determine D1L certification eligibility, certify, or start D9 or D2 through D8. R8 is not started by this closeout.
