# Project Intelligence — Teams Equivalence Matrix

**Phase:** 6C-3D  
**Frozen baseline:** `ab1f44276715888123d9f669464987e6f7c39b6c`

| Scenario | Frozen behaviour | Integrated behaviour | Category |
|----------|------------------|----------------------|----------|
| Meeting URL parsing | Loose external id extract | Strict HTTPS Teams host + path validation | equivalent_with_improvement |
| Graph validationToken handshake | Plain-text echo | Same contract | equivalent |
| clientState verification | Reject mismatch | Reject + durable audit | equivalent_with_improvement |
| Notification dedupe | In-process Map | Durable unique provider_event_id | equivalent_with_improvement |
| Session creation from webhook | Auto-create session | Map existing or create draft candidate only | acceptable_documented_deviation |
| Tenant resolution | Env JSON map | Provider connection.provider_tenant_id | acceptable_documented_deviation |
| Bot join start/stop | Stub external bot API | Unsupported; controls disabled | equivalent (both non-production) |
| Recording | Not proven | Unsupported | equivalent |
| Transcript | Partial / incomplete | Post-meeting retrieval into PI segments when consented | acceptable_documented_deviation |
| Error surface | Ad-hoc JSON | Nested `teams_*` error codes | equivalent_with_improvement |
| Provider metadata | Opaque metadata bag | Capability status matrix | equivalent_with_improvement |
| Participant mapping | Limited | Explicit unresolved identity | equivalent_with_improvement |

## Not claimed

- Bot-join equivalence to a production Teams bot
- Live realtime transcript equivalence without latency evidence
- Zoom / Google Meet equivalence

## Verdict legend

- `equivalent`
- `equivalent_with_improvement`
- `acceptable_documented_deviation`
- `not_equivalent`
- `not_tested`
