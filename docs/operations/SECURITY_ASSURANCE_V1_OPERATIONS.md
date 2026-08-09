# Security & Assurance V1 Operations

Status: Frozen · Phase 15I

## Component health

Monitor separately (never collapse to a universal security score):

- control registry · evidence registry · assessment engine
- isolation assurance · AI/data assurance · secure compute assurance
- compliance intelligence · customer assurance

## Runbooks

### Stale evidence
Mark dependent assessments/claims stale or requires_review. Do not publish stale
positive customer claims.

### Assessment failure
Preserve candidate ≠ approved. Open findings; no automatic remediation.

### Finding lifecycle
Open → triage → remediate/accept → close. Finding ≠ incident.

### Exception expiry
Track expiry; expired exceptions reopen risk. automaticExceptionApprovalEnabled=false.

### Disclosure / package revocation
Governed review (`security_assurance.customer_assurance_review`). Immutable history;
supersede rather than silent-mutate.

### Framework update
Version mappings; reassess. Never auto-promote to certification claim.

### External assurance expiry
Update ExternalAssuranceReference state; dependent claims → requires_external_assurance.

### Evidence corruption / migration failure
Restore Sec&A metadata from platform backup. Prefer additive migrations; no rewrite.

### Backup / restore
RPO=`DEFINED_NOT_TESTED` · RTO=`MEASURED` · not SLA.

### Incident escalation
Platform IR process. Customer surfaces must not expose internal findings by default.

### Component degradation
Surface component health; do not invent a universal security score.
