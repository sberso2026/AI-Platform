# EOS 3.13R GA Activation Evidence

## Pre-activation verification

| Check | Result |
|-------|--------|
| Candidate fingerprint | `sha256:c5d2bef972bd4a8b108d32b8d762da58a6fe4a301977ac724630479ab25af158` VERIFIED |
| Pre-activation Production deploy | `dpl_8fKpNWQDpXzoaNT7jQXvV8heeZjd` READY |
| Pre-activation runtime | `429e0452319641b717864c50ce6a40507548a7a9` |
| Migration ledger | 170 |
| Cross-workspace leak | 0 |
| Enabled enrolled workspaces | 1 |
| External customer hold | ACTIVE |

## Activation delta (authorized)

- `EOS3_VERSION=3.0.0`
- `EOS3_RELEASE_STATUS=GENERAL_AVAILABILITY`
- `eos3-ga-authorization.ts` human GO binding
- Production access reason `active_general_availability` for explicit enrolled workspaces only
- No schema migration; no claim/qualification expansion; live LLM/connectors remain disabled

## Post-activation controls

| Control | Status |
|---------|--------|
| Access model | EXPLICIT_ENTITLEMENT_AND_ENROLLMENT |
| Access default | DENY |
| Public self-service | NO |
| External customer release | NOT_AUTHORIZED |
| Live LLM | NOT_SUPPORTED |
| Real connectors | NOT_SUPPORTED |
| D1 | QUALIFIED_BOUNDED |
| Non-D1 | NOT_QUALIFIED |
| Kill switch | operational (fail-closed) |
| EOS 2 auto-migration | 0 |

## Activation deployment

| Field | Value |
|-------|-------|
| `EOS_3_PRODUCTION_DEPLOYMENT_ID` | `dpl_7uVMd6bKM1g8Kc1VyNEkSwvfE37r` |
| `EOS_3_PRODUCTION_RUNTIME_COMMIT` | `a7b23b48656a224cb606b12baeb202849c0c731f` |
| Ready state | READY |
| Alias | https://eos-pilot.rtbea.com.au |

`EOS_3_PRODUCTION_RUNTIME_MATCHES_AUTHORIZATION=YES` — Production runtime is frozen GA candidate `429e0452` plus authorized GA activation delta only (identity/status + GA GO binding; no schema/claim/qualification expansion).
