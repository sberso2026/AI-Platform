# Architecture expansion freeze

## Status

**PENDING** — the freeze does not begin until `CONTROLLED_PILOT_READY = YES`.

As of ERA-PILOT-0 that condition is **not** met:

| Gate | Current evidence |
| --- | --- |
| LIVE_AAL2 | NOT_PROVEN — named pilot `cert-er-a1` requires human TOTP enrollment |
| Hosted malware scanner | NOT_CONFIGURED — `RTB_REVIEW_CLAMAV_URL` is not assigned on the hosted Review runtime |
| Review / Core RLS, trusted audit, schema | Newly re-attested in ERA-PILOT-0 execution (see phase report) |
| Dependency disposition | VALID for controlled pilot until 2026-10-20 if the production advisory set is unchanged; otherwise HUMAN_REVIEW_REQUIRED |

The freeze is therefore **documented but not active**. Emergency security fixes, defects, pilot instrumentation, evidence-quality fixes, and reliability fixes remain allowed.

## When ACTIVE

The freeze begins only when `CONTROLLED_PILOT_READY = YES`.

During an active freeze, do not build major new intelligence engines unless:

1. PILOT-1 evidence identifies a material problem,
2. root-cause analysis supports a software intervention,
3. a Capability Investment Case is approved by an authorized human.

The freeze is not a claim that architecture is permanently complete.

## Explicitly not authorized

ERA-8 capability expansion; live LLM; autonomous engineering actions; CAD/BIM intelligence; drawing geometry reasoning; FEA engine; readiness/risk/maturity scoring; Change / Impact / Contradiction engines; expanded Assumption Engine; graph visualization; executive dashboard expansion; billing; commercial packaging.
