# Security & Assurance Ownership Matrix

Status: Locked · `SecurityAssuranceOwnershipLocked = true` · Phase 15A

Legend: **OWNS** · **CONSUMES** · **REFERENCES** · **EVIDENCES** · **ORCHESTRATES** ·
**INTEGRATES** · **EXTERNAL** · **RESERVED** · **MUST_NEVER_OWN**

| Concern | Security & Assurance | Platform Core | Platform Intelligence | Ops / DevOps | External |
| --- | --- | --- | --- | --- | --- |
| Security Control Catalogue | OWNS | — | — | CONSUMES | — |
| Security Evidence Records | OWNS (metadata) | EVIDENCES | EVIDENCES | EVIDENCES | INTEGRATES |
| Security Assessment / Posture | OWNS | — | — | CONSUMES | — |
| Security Exceptions | OWNS | — | — | ORCHESTRATES | — |
| Compliance Mapping | OWNS | — | — | — | REFERENCES |
| Isolation Assurance results | OWNS (assessment) | AUTHORITATIVE RLS | — | — | — |
| Finding normalization | OWNS (normalized) | — | — | — | INTEGRATES feeds |
| Customer Assurance metadata | OWNS (approved) | — | — | — | EXTERNAL reports |
| Identity / AuthN / IdP | MUST_NEVER_OWN | OWNS | — | — | EXTERNAL IdP |
| MFA / break-glass enforcement | EVIDENCES | OWNS | — | ORCHESTRATES | — |
| Policy Engine / PDP | MUST_NEVER_OWN / CONSUMES | — | OWNS | — | — |
| Audit system | MUST_NEVER_OWN / CONSUMES | OWNS | — | — | — |
| AI Runtime / prompts / tools | MUST_NEVER_OWN / EVIDENCES | — | OWNS | — | — |
| Tool Framework | MUST_NEVER_OWN | — | — | — | — |
| Execution Host | MUST_NEVER_OWN / EVIDENCES | — | — | — | — |
| Platform Files store | MUST_NEVER_OWN / REFERENCES | OWNS | — | — | — |
| SIEM / EDR / vuln DB | MUST_NEVER_OWN | — | — | INTEGRATES | EXTERNAL |
| ISO / SOC2 opinions | MUST_NEVER_OWN | — | — | — | EXTERNAL |
| Data Governance policies | EVIDENCES / ORCHESTRATES | — | — | — | Legal/Governance OWNS |
| Secure SDLC execution | EVIDENCES | — | — | OWNS | — |
| Customer SSO (S08) | EVIDENCES readiness | OWNS (Platform Identity) | — | — | EXTERNAL IdP |
| External pen test (S07) | EVIDENCES / ORCHESTRATES program | — | — | — | EXTERNAL |

## UNKNOWN ownership

**None remaining** after this matrix.
