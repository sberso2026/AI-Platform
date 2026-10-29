# RTB Tier-1 Pen-Test Remediation, Retest & S07 Closure

**Phase:** 16C  
**Version:** `0.3.0-pen-test-readiness`

## 1. Severity framework

Prefer assessor CVSS / industry severity plus RTB business context:

| Severity | Business expectation |
|---|---|
| Critical | Immediate triage; no silent acceptance |
| High | Priority remediation; no silent acceptance |
| Medium | Scheduled remediation with owner |
| Low | Backlog with rationale |
| Informational | Track; do not use to hide higher severities |

Do not downgrade labels to avoid remediation.

## 2. Finding governance

External findings enter existing Security & Assurance architecture:

- `ExternalAssuranceReference`
- `SecurityFinding`
- `SecurityEvidenceReference`
- Customer Assurance (customer-safe summaries only when approved)

**Preserve:**

- External finding ≠ RTB self-assessment
- External assurance remains externally owned
- Do **not** modify Security & Assurance V1 frozen contracts

## 3. Remediation workflow

1. Finding received (external report / ticket)
2. Triage (severity, exploitability, tenant impact)
3. Owner assigned
4. Risk confirmed
5. Remediation implemented
6. Internal validation
7. External retest where required
8. Closure evidence archived
9. Exception only where formally accepted (critical/high must not be silently accepted)

## 4. Retest requirements

Independent retest required at minimum for:

- Critical
- High
- Authentication / authorization defects
- Tenant-isolation defects
- Major data disclosure defects

## 5. S07 closure criteria (locked)

`S07ExternalPenTestComplete=true` **only** when genuine independent evidence confirms:

| Evidence | Required |
|---|---|
| External report reference | Yes |
| Assessor identity / company | Yes |
| Scope covered | Yes |
| Assessment date | Yes |
| Methodology | Yes |
| Findings summary | Yes |
| Remediation status | Yes |
| Retest evidence (where required) | Yes |
| Approved assurance reference | Yes |

**Forbidden:**

- Setting S07 true from internal tests alone
- Fake / simulated external auditor results
- Self-issued external pen-test opinions

Until then:

- `S07ExternalPenTestComplete=false`
- `Tier1EnterpriseProductionReady=false`
- `S08CustomerSsoProductionReady=true` (preserved from 16B)

## 6. Customer assurance (future)

After genuine S07 closure, approved customer-safe statement may include:

> Independent penetration testing completed

Do not expose raw vulnerabilities, exploit steps, or internal assessor notes unless specifically governed.
