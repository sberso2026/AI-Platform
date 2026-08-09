# Security Logging & Monitoring Baseline (Phase 14C)

Do **not** build a full SIEM in Phase 14C.

## Current inventory

| Stream | Status | Notes |
| --- | --- | --- |
| Platform / module audit | implemented_bounded | Authz, commerce, module evidence events |
| Application logs | implemented_bounded | Hosting logs; retention/access formalization incomplete |
| AI provider / tool events | implemented_bounded | AI Runtime audit/provider failures |
| Execution-host events | implemented_bounded | Job authz, isolation, failures |
| Admin / privileged events | implemented_bounded / gap | Needs privileged MFA + clearer admin audit (see S01) |
| Security alerting / correlation | missing / external | No RTB SIEM; future EXTERNAL integration |

## External SIEM boundary

RTB Security & Assurance may **export/normalize** security-relevant events.
SIEM ownership remains **EXTERNAL** (customer or RTB-operated third-party stack).
Tamper resistance and long retention are provider/ops concerns until formally evidenced.
