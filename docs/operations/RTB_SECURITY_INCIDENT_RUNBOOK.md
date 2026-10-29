# RTB Security Incident Runbook (Phase 14D)

`SecurityIncidentRunbookReady=true` · `IncidentEvidencePreservationReady=true`

## Intake

1. Open incident record (title, severity, category, detection time)
2. Assign Incident Commander
3. Page Security On-Call for SEV1/SEV2

## Containment playbooks (bounded)

### Suspected cross-tenant access

1. Freeze suspected sessions
2. Preserve audit_events (metadata only)
3. Run RLS verification on affected tables
4. Confirm `knownCrossTenantLeakageDetected` investigation outcome

### Compromised privileged credential

1. Revoke sessions / disable principal
2. Rotate credentials (see secret lifecycle)
3. Require MFA/AAL2 before re-enable

### External AI provider event

1. Fail-closed provider pin
2. Preserve AI audit refs (no prompts)
3. Re-enable only after clearance

### Execution-host compromise

1. Quarantine host / suspend jobs
2. Revoke host credentials
3. Rebuild from trusted baseline

### Production secret exposure

1. Emergency revoke
2. Rotate + validate
3. Retire old versions
4. Confirm secretExposureDetected remains false in repo scans

## Recovery & closure

- Restore service with least privilege
- Post-incident review within operational cadence
- Update gap/control evidence if control failure contributed

No contractual notification SLAs are defined in this runbook.
