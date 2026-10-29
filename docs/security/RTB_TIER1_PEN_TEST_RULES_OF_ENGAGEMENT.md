# RTB Tier-1 Penetration Test Rules of Engagement

**Phase:** 16C — Tier-1 External Penetration Test Readiness  
**Version:** `0.3.0-pen-test-readiness`  
**Related:** `RTB_TIER1_EXTERNAL_PENETRATION_TEST_SCOPE.md`  
**Non-claim:** These rules authorize a commissioned independent assessment. They do **not** complete S07 by themselves.

## 1. Authorization

Testing is authorized only:

- Against targets listed in the signed scope / assessor package
- During the approved test window
- By named assessor personnel from the contracted firm
- Using provided test accounts / fixtures

## 2. Authorized test window

| Item | Policy |
|---|---|
| Window | Defined in the commissioning letter (start/end UTC) |
| Extensions | Require written RTB approval |
| Emergency stop | RTB or assessor may halt testing immediately on critical impact |

## 3. Allowed targets

- Security-test / staging hosts, APIs, and IdP fixtures listed in the assessor package
- Controlled Tenant A / Tenant B fixtures and roles
- Enterprise SSO/OIDC production capability paths in that environment
- Execution-host **control plane** endpoints expressly listed

## 4. Prohibited targets / activities

Unless separately authorized in writing:

- Production customer data destruction
- Uncontrolled denial-of-service or volumetric attack
- Destructive database actions (drop/truncate/mass delete)
- Physical security testing
- Employee social engineering
- Phishing of RTB staff or customers
- Credential theft outside provided test accounts
- Malware / ransomware deployment
- Commercial-license abuse (solver products)
- Testing of third-party infrastructure not listed (other tenants, shared cloud abuse)
- Weakening RTB controls “for convenience” during the test

## 5. Test intensity

- Active exploitation of vulnerabilities found in authorized targets is permitted when safe and non-destructive
- Prefer proof-of-concept that demonstrates impact without data loss
- Rate-limit probing is allowed at levels that do not impair multi-tenant shared platforms
- Automated scanning must be throttled and identifiable (User-Agent / source IPs disclosed)

## 6. Data handling

- Treat all findings, tokens, and customer-like fixture data as confidential
- Do not exfiltrate data beyond what is required to evidence a finding
- Do not publish raw vulnerabilities, exploit steps, or internal notes publicly
- Store evidence under assessor and RTB agreed secure channels only

## 7. DoS restrictions

- No uncontrolled DoS
- No intentional resource exhaustion against production
- Load tests that could impact shared hosting require prior written approval

## 8. Social engineering / phishing status

**Not authorized** for this engagement unless a separate written addendum is executed.

## 9. Credential handling

- Use only provided test accounts and secrets delivered via controlled assessor procedures
- Do not request or share production customer credentials
- Do not embed secrets in tickets, public repos, or chat outside the secure channel
- Report accidental secret exposure immediately

## 10. Solver-host restrictions

- Control-plane authorization testing only by default
- No destructive solver-host testing
- No licensed live ETABS/SPACE GASS execution unless expressly included and safely provisioned
- No commercial-license circumvention

## 11. Contact and escalation

Populated at commissioning (placeholders for package):

| Role | Contact |
|---|---|
| RTB technical lead | _TBD at commissioning_ |
| RTB security contact | _TBD at commissioning_ |
| Assessor engagement lead | _TBD at commissioning_ |
| After-hours / emergency | _TBD at commissioning_ |

## 12. Stop conditions

Immediately pause and escalate if:

- Suspected access to production customer data outside fixtures
- Suspected cross-tenant data exposure involving real customers
- Service-wide outage risk
- Evidence of active compromise unrelated to the test
- Legal/regulatory concern raised by either party

## 13. Emergency contact

Emergency contacts are listed in the assessor package and commissioning letter. Assessor must maintain a reachable point of contact during active testing hours.

## 14. Evidence and finding ownership

- External findings remain **externally owned**
- Findings enter RTB Security & Assurance via `ExternalAssuranceReference` / `SecurityFinding` / `SecurityEvidenceReference` patterns **without** changing frozen Security & Assurance V1 contracts
- External finding ≠ RTB self-assessment
- Do not mark vulnerabilities closed without evidence

## 15. Severity model (engagement reporting)

Prefer assessor CVSS / industry severity **plus** RTB business context. Labels:

| Severity | Expectation |
|---|---|
| Critical | Immediate triage; no silent acceptance |
| High | Priority remediation; no silent acceptance |
| Medium | Scheduled remediation |
| Low | Backlog with rationale |
| Informational | Track; no forced downgrade of higher severities |

Do not hide findings by downgrading labels.

## 16. Retest

Independent retest is required at minimum for:

- Critical and High findings
- Authentication / authorization defects
- Tenant-isolation defects
- Major data disclosure defects

## 17. Post-test hygiene (RTB + assessor cooperation)

- Revoke temporary credentials
- Remove or disable test accounts where appropriate
- Rotate exposed/shared test secrets
- Remove temporary allowlists
- Archive evidence securely
- Confirm cleanup completion in the engagement close-out note

## 18. Customer assurance boundary

After genuine S07 closure (future), customer-safe disclosure may state that independent penetration testing was completed. Raw vulnerabilities, exploit steps, and internal assessor notes remain governed and are not customer-default disclosures.
