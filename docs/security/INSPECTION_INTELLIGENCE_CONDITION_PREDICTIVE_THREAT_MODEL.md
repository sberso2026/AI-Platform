# Inspection Intelligence — Condition / Predictive Threat Model

## Trust boundaries

Client timestamps, offline drafts, and advisory signal dispositions are **untrusted** until
server authorization. Predictive outputs are **advisory**.

## Controls

- Condition overrides require reason, actor, and preserve prior values
- Publication requires authorised role; offline ratings remain drafts
- Predictive ML providers fail closed (`ml_provider_not_certified`)
- No remaining useful life or production ML accuracy claims
- Events carry identifiers/status only — no evidence bytes or tokens
- RLS tenant isolation on server mirrors

## Misuse cases

- Treating advisory signals as confirmed failures
- Aggregating incompatible schemes (blocked)
- Publishing without approval (blocked)
- Claiming Twin/Asset Intelligence ownership (forbidden)

## Residual risks

Browser/PWA offline wipe limitations from Phase 9G remain. Physical-device evidence is
documented separately from emulation.
