# EOS-A15A Demonstration Runbook

20–30 minute engineering-value narrative. Not an architecture internals tour.

## Preconditions

- Staging / non-production only.
- Feature freeze active (A15 = PROVE, not new domains).
- CONTROLLED_PILOT_READY = NO. Say this verbally at the start.
- Named cert users exist but HUMAN_AAL2_GATE is BLOCKED unless an operator completes TOTP in the browser.
- Returned user upload remains disabled (no hosted malware scanner).
- Current process HEAD should match the A15A commit before any browser demo.

## Setup / fixture reset

Reuse Crusher Support in-memory / certification fixtures. Do not seed production/customer data.

Reset: re-run `packages/engineering-os/src/pilot/eos-a15a-demonstrator.test.ts` (server-side demonstrator). Do not purge `content_base64`. Do not mix unrelated ERA leftovers.

## Sequence (Workbench-first)

1. My Engineering Day — WAITING_ON_OTHERS on Mechanical reactions; later RECENTLY_READY / DO_NOW.
2. `/engineering/work` — Start/continue Crusher Support Concept study.
3. Show governing information, open assumptions, geotechnical gap.
4. Option Study A/B/C — EOS does not pick a winner. Record a human Decision.
5. Continue into PFS / FEED without re-typing known context.
6. Generate company-template Design Report (or EOS Default fallback) into private object storage. Authorized download only.
7. Run Pre-Issue Review. Open a condition. No automatic approval. Rerun preserves history.
8. Vendor load Rev D. EOS marks Work Plan stale and lists potential impacts. Confirm one; mark notes drawing NOT_IMPACTED.
9. Construction RFI: anchor bolts vs reinforcement. Prepare governed response draft. Human remains issuer.
10. Commissioning / handover. Late change makes handover stale. Digital Thread answers “why?”.

Deep modules (Information, Review, Impact, Decisions) are specialist escapes, not the demo spine.

## Expected actions

Continue Work, Open Source, Generate Artifact, Run Pre-Issue Review, Assess Impact, Prepare Response, Record Decision, Prepare Handover.

Returning from Artifact / Review / Impact / RFI / Decision should keep project/work context (no generic Engineering home reset).

## Fallback if browser AAL2 unavailable

Present the certified in-process journey (`eos-a15a-demonstrator.test.ts` + this runbook). Do **not** inject JWT, copy cookies, disable MFA, or generate TOTP. Report AUTHENTICATED_BROWSER_HITL = NOT_TESTED.

## Verbal limitations

- Demonstration only; synthetic data; human retains engineering judgment.
- No solver, no EXAMPLE_ONLY formula as design acceptance, no live SharePoint/EDMS/BIM/P6.
- No untrusted returned-file upload.
- No productivity percentage, hours saved, or ROI.

## Cleanup

Leave staging data in place. Do not destructive-restore. Kill switch remains `EOS_CONTROLLED_PILOT_ENABLED=0` plus commerce installation suspend if a live session was opened.

## Engineer view (what they do vs what EOS prepares)

Engineer: select work, record assumptions/decisions, confirm impacts, disposition review conditions, issue RFI/handover.  
EOS: assemble governed context, generate drafts, detect stale sources, propose potential impacts, preserve provenance.  
EOS does not approve design, accept RFI, accept handover, or choose options.

## Assurance view

Authority remains human. Pre-Issue Review is evidence-backed and non-approving. Templates resolve by precedence (Project/Client → Company Official → EOS Default). New artifacts use private object storage with signed/authorized download. RLS/IDOR/service-role unchanged. AAL2, hosted malware, and dependency policy still block a controlled pilot.
