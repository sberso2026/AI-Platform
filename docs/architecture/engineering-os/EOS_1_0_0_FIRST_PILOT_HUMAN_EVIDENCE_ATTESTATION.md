# EOS 1.0.0 first pilot human evidence attestation

Phase: `EOS-1.0.0-FIRST-PILOT-HUMAN-EVIDENCE-ATTESTATION-AND-OPERATIONAL-CLOSURE`

Production domain: `https://eos-pilot.rtbea.com.au`

Production deployment: `dpl_7EBZUxhkVX7MjR44rYCgkg8odHgB`

Deployed git commit: `0c1ec9e06eea59ac089753f3c930f1a599b14648`

This document is evidence only. It does not change application runtime and it is not a production deployment.

Identity: `sberso@yahoo.com.au`

Operator: Silvestre Berso

Attestation date: 2026-10-28

No passwords, MFA codes, tokens, or secret values are stored here. No additional professional credentials are stated.

## Evidence classification model

1. `MACHINE_OBSERVED` means an authoritative production record or probe produced the fact.
2. `HUMAN_ATTESTED` means the operator stated that a visual or browser action occurred. It is not machine telemetry.
3. `MACHINE_CORROBORATED_HUMAN_ATTESTATION` means the operator statement and an independent machine record agree.
4. `NOT_OBSERVED` means neither a machine record nor an explicit attestation covers the fact.

Human-attested observations are not represented as machine telemetry.

## Machine-observed evidence

Production deployment status is READY. `/api/platform/build-identity` reports commit `0c1ec9e06eea59ac089753f3c930f1a599b14648`, production environment, and Supabase project `wcydlhqiqdwgoaqrlget`. `/api/health` returned 200. Graph mode is off. Pilot file upload is disabled. The kill switch state is active. Four monitoring channels are reported.

One confirmed identity holds an active owner membership on the original workspace and an active `pilot-engineer` membership on `eos-controlled-pilot`. No second auth user was created. With that identity's claims, owner administration is true, pilot administration is false, engineering execute is true, and engineering review and approval are false.

`TQ-001` in workspace `default` is `closed`. Its timeline records created, query updated, submitted, clarification requested, response submitted, accepted, and closed. The pilot timeline contains only `technical_query` events. That absence does not contradict the attested page visits, because page rendering is not written to the timeline.

One immutable `pilot_feedback_submitted` audit event exists for `eos-controlled-pilot` / `default` at 2026-10-28 07:46:05 UTC. Category is defect. Severity is medium. The original event was not altered.

Production authentication records `last_sign_in_at` 2026-10-28 12:02:50 UTC. No active session row was present at the evidence query. Auth audit rows did not provide a logout timestamp.

Unauthenticated `/engineering` returns 307. Unauthenticated upload-session returns 403. Public signup returns 422 `signup_disabled`. Storage has 6 restrictive closed policies, 6 inequality-closed policies, 2 private document buckets, and migration `20261027233000` present. Release ledger count is 144 and the maximum version is `20261027233000`.

Security incidents, data-policy violations, and engineering-authority violations observed in this closure are 0. Critical feedback is 0. High feedback is 0. Open blocking defects are 0.

## Human-attested evidence

The operator attests that the current Production application showed the Pilot Data Policy and the Engineering Authority Notice. Both notices are static and have no acknowledgement control. Acknowledgement is `NOT_APPLICABLE_STATIC_NOTICE`.

The operator attests that the active workspace was `eos-controlled-pilot / default`, the visible role was `pilot_engineer`, and the workspace header represented that pilot workspace.

The operator attests that representative Engineering OS surfaces loaded, including Engineering Systems, Engineering Workbench, Projects, Assets, Inspections, Documents, Risks, Technical Queries, Decisions, Actions, Feedback, and Engineering AI. Representative screenshots were described for Projects, Assets, Inspections, Actions, and Engineering AI. Those screenshots are not stored in this repository.

The operator attests that All Engineering stayed selected and answered the synthetic steel pipe-rack corrosion question with substantive general methodology, including section, geometry, material, corrosion extent, remaining thickness, section loss, pitting, interfaces, connections, base plate, anchors, deformation, loading, combinations, restraint, effective length, local buckling, global stability, inspection uncertainty, inaccessible surfaces, inspection history, exposure, assessment basis, and qualified review. The answer did not establish project adequacy, approval, or certification.

The operator attests that Current Project answered the same question with: `Insufficient authorised project evidence is available to provide a project-specific conclusion.` No project facts were fabricated.

The operator attests that switching back to All Engineering kept that scope selected and general methodology available.

The operator attests that logout was performed, and that a later protected-route attempt redirected to sign-in.

These statements are human attestation. They are not application click telemetry.

## Machine-corroborated human evidence

The closed TQ-001 lifecycle corroborates the technical-query part of the representative use case. The additional Workbench and register navigation remains human-attested. The combined use case is therefore `MACHINE_CORROBORATED_HUMAN_ATTESTATION`.

The operator's post-logout protection statement agrees with the machine result that unauthenticated `/engineering` returns 307. That protection result is `MACHINE_CORROBORATED_HUMAN_ATTESTATION`.

The operator's confirmation that both memberships remain correct agrees with the membership rows. Those membership facts are `MACHINE_CORROBORATED_HUMAN_ATTESTATION`.

## Relogin chronology

A machine sign-in exists at 2026-10-28 12:02:50 UTC. Logout has no machine timestamp. The order of logout, protected-route check, and that sign-in cannot be established from telemetry. Relogin is therefore `HUMAN_ATTESTED_MACHINE_SIGNIN_PRESENT`. This does not invent a logout-before-signin sequence.

## Medium feedback disposition

The immutable medium defect event of 2026-10-28 07:46:05 UTC was not deleted or rewritten. Keyword classification, without copying the feedback text, overlaps the technical-query editor, Engineering AI scope, and navigation themes. Those surfaces were remediated in `d736ed006cee1b56a59b422277ee4867354c193d`, `acd35d14287db0bd60908a3414296a34a1a711ec`, and `0c1ec9e06eea59ac089753f3c930f1a599b14648`. The feedback timestamp is after the editor-contrast commit and before the Engineering AI scope and general-guidance commits. The original event stays a medium non-blocking record. It is not reclassified as critical or high, and it does not by itself prevent operational closure.

## Unresolved evidence limitations

Page rendering, scope clicks, notice visibility, and logout are not written to `audit_events` or `engineering_timeline_events`. Engineering AI answers are not stored as project evidence. Owner-workspace page navigation was not separately attested and is `NOT_OBSERVED`. Web package metadata remains 0.1.0. One accepted moderate dependency remains (`uuid` via exceljs, GHSA-w5hq-g745-h8pq).

## Security boundary

Pilot administration on `eos-controlled-pilot` is denied. Engineering review and approval are denied. Cross-workspace data leak count is 0. Cross-workspace privilege bleed count is 0. Storage isolation remains the closed-policy control. Public signup is disabled. Public file upload is unavailable. Unscanned user upload is unavailable. Microsoft 365 Graph mode is off. No secret values are recorded in this artifact.

## Engineering authority boundary

General Engineering AI guidance is advisory. It is not a project conclusion, approval, or certification. The closed technical query is a synthetic pilot workflow. Deterministic engineering formulas, calculation result semantics, and the qualified D1 structural baseline were not changed by this documentation phase.

## Operational conclusion

Machine evidence and the labeled human attestation are consistent. No blocker was found. The first controlled pilot is operationally closed on that combined evidence model. This artifact does not invite additional pilot users and does not redeploy production.
