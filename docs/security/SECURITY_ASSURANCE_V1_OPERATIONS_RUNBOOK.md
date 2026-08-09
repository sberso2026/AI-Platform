# Security & Assurance V1 Operations Runbook

Status: Ready · Phase 15H · `SecurityAssuranceV1OperationsRunbookReady = true`

## Service degradation

1. Identify degraded health signal (control registry, evidence, assessment, isolation,
   AI/data, secure compute, compliance intelligence, customer assurance).
2. Do **not** collapse into a universal security score.
3. Mark dependent assessments/claims as unknown/stale per freshness policy.
4. Escalate via existing incident pathway; Sec&A observes, does not own SIEM.

## Stale evidence

- Supporting evidence expired → dependent claims become stale / requires_review.
- Do not publish stale positive customer claims silently.

## Assessment failures

- Preserve candidate ≠ approved.
- Open findings via finding registry; finding ≠ incident.
- No automatic remediation or AI self-approval.

## Disclosure / package revocation

1. Revoke or supersede claim/package via governed review
   (`security_assurance.customer_assurance_review`).
2. Record AssuranceDisclosureRecord (metadata only).
3. Retain historical published packages for traceability; do not silent-mutate.

## Framework update

- Version framework mappings; re-run compliance assessment.
- Never auto-promote mapping to certification claim.

## External assurance expiry

- Mark ExternalAssuranceReference expired/pending/not_available.
- Dependent claims → requires_external_assurance / requires_review.
- S07 remains incomplete until genuine external evidence exists.

## Evidence corruption / migration failure

- Prefer restore of Sec&A metadata from platform backup.
- RPO = DEFINED_NOT_TESTED · RTO = MEASURED · not SLA.
- Do not rewrite historical migrations; additive only.

## Incident escalation

- Use platform incident-response process.
- Customer assurance surfaces must not expose internal incidents/findings by default.
