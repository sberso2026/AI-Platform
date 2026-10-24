# Inspection Intelligence — Mobile Privacy

## Policies

| Topic | Policy |
|-------|--------|
| Camera permission | Request only for authorised capture; rationale shown before prompt |
| Location metadata | Not required for Phase 9F capture; strip if present unless entitlement allows |
| EXIF | Minimize; strip GPS by default before durable store |
| Personal images | Consent required where people are identifiable |
| Signature images | Supplementary only; retention follows attestation legal hold |
| Device metadata | Minimize to viewport/capability class |
| Telemetry | Minimal capability/event identifiers; no media bytes or tokens |
| Retention / legal hold | Follow Platform Files + audit retention |
| Deletion eligibility | Subject to legal hold and chain-of-custody |

## Non-goals

No AI Vision inference; no private media store; no secrets in mobile metadata.
