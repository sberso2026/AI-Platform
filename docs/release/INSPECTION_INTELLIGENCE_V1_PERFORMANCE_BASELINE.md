# Inspection Intelligence V1 — Performance Baseline

## Scope
Hosted / local certification fixtures. **Not** an enterprise-scale capacity claim.  
Physical-device performance is **not claimed** unless separately executed.

## Emulation evidence
| Scenario | Fixture | Concurrency | Provider | Notes |
|----------|---------|-------------|----------|-------|
| Session ops | unit happy path | 1 | n/a | < 2s local |
| Offline reconcile | offline scenarios | 1 | n/a | Eng OS offline tests |
| Condition / predictive | domain product | 1 | fail-closed ML | advisory |
| AI Vision | `runAiVisionHappyPath` | 1 | approved pin | advisory |
| Public contracts / drift | GA closure | 1 | n/a | cert gate |
| Browser | Playwright phone/tablet | 1 | fixture HTML | CERTIFY_BROWSER=1 |

## Reporting fields
p50/p95 measured in cert environments are fixture-bound; timeouts use provider policy; retries are bounded; queue behavior fails closed on entitlement revocation.

## Separation
- Browser emulation: certified in CI  
- Physical devices: not claimed in Phase 9K
