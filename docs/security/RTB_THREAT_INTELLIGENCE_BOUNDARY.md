# Threat Intelligence Boundary (Phase 14C)

Future **integration-only** model. Do **not** build a threat-intelligence database in Phase 14C.

## Allowed future sources (adapters)

- Vendor advisories
- GitHub security advisories
- NVD/CVE feeds
- Microsoft security ecosystem signals (where applicable)
- Cloud-provider security alerts

## Boundary locks

| Concern | Ownership |
| --- | --- |
| Threat intel platform / CVE warehouse | INTENTIONALLY_EXTERNAL / MUST_NEVER_OWN as RTB product DB |
| Finding normalization | RESERVED → future Security & Assurance |
| Remediation tracking | Vulnerability Management process (ops) |

Security & Assurance may later normalize external findings into the control evidence catalogue.
It does **not** become SIEM, EDR, or a vulnerability database.
