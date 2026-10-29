# Inspection Intelligence — AI Vision Threat Model

## Trust boundaries

Provider outputs and client timestamps are **untrusted** until human validation.
Vision results are **advisory**.

## Controls

- Original evidence immutable; derivatives hashed with lineage
- EXIF/location removal and type/size validation before provider submission
- Tenant allowlist; no fallback to unapproved providers
- Fail closed on outage, policy denial, unsupported evidence
- Human validation requires authorised actor and reason; bulk approval forbidden
- Explicit reviewer action required before condition rating observed-input linkage
- Events carry identifiers/status only — no evidence bytes or secrets

## Residual risks

Browser/PWA offline wipe limitations remain. Physical-device camera/vision behaviour is
documented separately from emulation.
