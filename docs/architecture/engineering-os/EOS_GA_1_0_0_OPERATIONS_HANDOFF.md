# EOS GA 1.0.0 operations handoff

Path: docs/architecture/engineering-os/EOS_GA_1_0_0_OPERATIONS_HANDOFF.md

## 1. Release identity

PRODUCT: RTB Engineering OS
VERSION: 1.0.0
EOS_GA: YES
EOS_GA_READY: YES
EOS_GA_RELEASE_DECISION: APPROVED
GA_STATUS: GENERAL_AVAILABILITY

Platform GA means the bounded release gates are satisfied. It does not mean deployment, publication, project certification, regulatory approval, or professional sign-off.

GA_DECLARATION_REQUIRES_DEPLOYMENT: NO
GA_DECLARATION_REQUIRES_PUBLICATION: NO
PRODUCTION_DEPLOYMENT_PERFORMED: NO
PUBLICATION_PERFORMED: NO

## 2. Release commit

GA_RELEASE_COMMIT: 407f5a32b0c1651d28e79cb23442da509d5de956
GA_RELEASE_COMMIT_VERIFIED: YES

That commit contains the final decision record and updates the blocker registry and readiness reconciliation. Those records reference the clean security state, the migration ledger, the known limitations, and the bounded D1 through D9 state.

## 3. Baseline fingerprint

GA_BASELINE_FINGERPRINT: sha256:827f54e1f1327fb8f17dc4e7391ea827062eaebb9e033ea69b6f3d56706c5d70
Scope and blob list: docs/architecture/engineering-os/EOS_GA_1_0_0_BASELINE_MANIFEST.md

## 4. Operational scope

Operations use the controls the repository already defines. This handoff does not add an SLO, an uptime target, or a customer-notification period.

Sources:

1. docs/architecture/engineering-os/EOS_DISASTER_RECOVERY_RUNBOOK.md
2. docs/architecture/engineering-os/EOS_CONTROLLED_PILOT_RUNBOOK.md
3. docs/architecture/engineering-os/EOS_A14B_RELIABILITY_PERFORMANCE_RECOVERY_PILOT_OPERATIONS.md
4. docs/security/RTB_UNIFIED_INCIDENT_RESPONSE.md
5. docs/operations/RTB_SECURITY_INCIDENT_RUNBOOK.md
6. docs/security/RTB_PLATFORM_BACKUP_RESTORE_RUNBOOK.md
7. docs/release/RTB_MIGRATION_RELEASE_GOVERNANCE.md
8. docs/engineering-review/security/incident-response.md

The A14B timing figures are pilot thresholds for a small named-user profile. They are not GA service levels. Staging disaster recovery does not claim PITR. Platform RPO is DEFINED_NOT_TESTED and follows the provider backup schedule. Platform RTO is MEASURED on a fixture or isolated restore and is not an enterprise SLA.

## 5. Known limitations

GA_LIMITATIONS_BASELINE_CURRENT: YES

C3: complete interaction surface not validated. Member stability not validated.
C6: effective length is supplied. phiEf is supplied. No biaxial second-order integration.
C7: class N calculated creep and shrinkage only. S and R are not validated production scope. No temperature adjustment. phiEf is outside the calculated method. The size-time cap stays fail-closed where unbound. Fingerprint fp:ac109d1f.
C9 slab: no complete two-way slab analysis or design.
C9 wall: no complete wall design. Wall shear, wall second-order behavior, boundary-element design, and seismic wall detailing are not implemented.
Project certification is separate from platform GA and remains UNSATISFIED.
Regulatory approval is not implied.
An unsupported scope request is not a software defect.

## 6. Monitoring inventory

MONITORING_INVENTORY_DEFINED: YES
Alerts stay system-health. They do not score people or watch engineer activity. /api/health must not include secrets or file bodies.

APPLICATION_HEALTH. Signal: application responds, and the pilot check is HTTP 200 without secrets. Severity: availability. Owner type: Platform On-Call. Response: restart from the recorded HEAD using the disaster-recovery runbook. Escalation: Incident Commander if the service does not return.

SECURITY_HEALTH. Signal: canonical security suite, secret scan, and security alerts such as rtb.review.security_alert. Severity: SEV1 through SEV4 from the unified incident model. Owner type: Security On-Call. Response: contain, preserve metadata, do not accept a new failing baseline. Escalation: Security On-Call for SEV1 and SEV2.

DATA_ACCESS_HEALTH. Signal: RLS deny across tenant or workspace, and review.cross_tenant_attempt. Severity: SEV1 if isolation fails. Owner type: Platform Kernel / DB owner. Response: freeze suspected sessions, preserve audit metadata, rerun RLS verification. Escalation: Security On-Call and Incident Commander.

JOB_HEALTH. Signal: JobService pending retry up to max_retries, then failure. Poison items stay bounded and must not block a successful checkpoint. Severity: job failure. Owner type: Platform On-Call. Response: replay by source event id without multiplying Attention fingerprints. Escalation: Platform On-Call.

AI_SERVICE_HEALTH. Signal: external AI provider security or availability event. Severity: provider failure. Owner type: AI Runtime owner. Response: contain the provider path. Escalation: Security On-Call when the event is a security event. AI output remains not human engineering approval.

CONNECTOR_HEALTH. Signal: connector failure, malware-scanner health, and optional Profile A connector state. Severity: connector failure. Owner type: Platform On-Call. Response: disable the connector or omit its runtime environment. A Profile A connector that is not applicable must not by itself fail pilot health. Escalation: Security On-Call if malware ingestion is suspected.

DATABASE_HEALTH. Signal: Postgres is the source of work-plan, artifact, review, and impact state, not process memory. Severity: connectivity or integrity. Owner type: Platform Kernel / DB owner. Response: isolated restore, never an unattended in-place overwrite. Escalation: Incident Commander.

RELEASE_HEALTH. Signal: release-governance tests, typecheck, ledger-only integrity, and artifact classification. Severity: release regression. Owner type: the production-promotion approval in the migration governance document. Response: block promotion. Escalation: do not apply SQL that the guard rejects.

ENGINEERING_EXECUTION_HEALTH. Signal: execution success or failure, convergence or blocked state, unsupported scope, runtime error, and method revision identity. Severity: execution failure. Owner type: Execution Host owner. Response: record operational state. Escalation: qualified engineering review only when the failure is a material method defect.

## 7. Engineering execution monitoring

ENGINEERING_EXECUTION_MONITORING_DEFINED: YES
MONITORING_SUCCESS is not ENGINEERING_VALIDATION. Monitoring records operational state. It does not approve a calculation, and it does not copy confidential project engineering payloads into tickets or logs.

## 8. Incident classes

INCIDENT_CLASSIFICATION_DEFINED: YES
Customer communication is not automatic. The unified incident procedure requires security-lead authorization when impact is confirmed. The review incident runbook leaves external notice to an authorized human. This handoff adds no notice deadline.

SECURITY_INCIDENT. Release freeze: when the canonical suite fails or a SEV1 control is open. Rollback consideration: yes, using the supported restore path. Evidence invalidation: only affected security evidence. Security escalation: yes. Engineering review: when engineering authority is touched. Customer communication: only under the existing authorization rule.

DATA_ISOLATION_INCIDENT. Release freeze: yes if isolation failed. Rollback consideration: yes. Evidence invalidation: affected access-control evidence. Security escalation: yes. Engineering review: no, unless an engineering record was exposed. Customer communication: existing authorization rule.

ENGINEERING_CALCULATION_DEFECT. Release freeze: for the affected method claim, not for unrelated platform operations. Rollback consideration: for the affected release only. Evidence invalidation: affected methods only. Security escalation: no, unless isolation or authority is also broken. Engineering review: yes if material. Customer communication: not invented here.

ENGINEERING_GOVERNANCE_DEFECT. Release freeze: for the affected claim. Rollback consideration: if a release asserted the broken governance. Evidence invalidation: affected records only. Security escalation: if the defect changes AI or approval authority. Engineering review: yes. Customer communication: existing authorization rule.

AVAILABILITY_INCIDENT. Release freeze: no, unless the cause is a release regression. Rollback consideration: application restart or the pilot kill switch. Evidence invalidation: no. Security escalation: only if availability hides a security impact. Engineering review: no. Customer communication: existing authorization rule.

DATA_INTEGRITY_INCIDENT. Release freeze: for the affected storage path. Rollback consideration: restore from retained bytes inside the rollback window, or isolated database restore. Evidence invalidation: mismatched artifacts. Security escalation: if exposure occurred. Engineering review: no. Customer communication: existing authorization rule. Orphans are reported and are not auto-deleted.

RELEASE_REGRESSION. Release freeze: yes. Rollback consideration: do not promote. Evidence invalidation: the release evidence that failed. Security escalation: if the regression is security. Engineering review: if the regression is an engineering method. Customer communication: no.

DEPENDENCY_VULNERABILITY. Release freeze: critical or high under the accepted posture. Rollback consideration: patch or hold the dependency. Evidence invalidation: no engineering evidence by itself. Security escalation: yes. Engineering review: no. Customer communication: existing authorization rule. The current moderate advisory stays disclosed and is not reclassified by this handoff.

EXTERNAL_PROVIDER_FAILURE. Release freeze: no, unless the provider path violates a security gate. Rollback consideration: disable that connector or provider. Evidence invalidation: no. Security escalation: for a provider security event. Engineering review: no. Customer communication: existing authorization rule.

## 9. Engineering-defect governance

ENGINEERING_DEFECT_GOVERNANCE_DEFINED: YES
ENGINEERING_DEFECT_CAN_BE_SILENTLY_PATCHED: NO

Path: identify the defect, assess scope, name the affected methods and evidence, judge release impact, record project impact only where a governed project record exists, apply a targeted fix, validate that fix independently, and obtain qualified rereview when the change is material. Then refresh only the affected release baseline.

## 10. Security incident governance

Use the unified incident lifecycle: intake, ownership, technical escalation, security escalation, containment, evidence preservation, recovery, authorized customer-communication decision, post-incident review, closure.

A post-GA failure of the canonical security suite stays a release-blocking regression until it is fixed. There is no new exception register in this handoff.

## 11. Rollback and recovery

ROLLBACK_GOVERNANCE_SOURCE: docs/release/RTB_MIGRATION_RELEASE_GOVERNANCE.md, docs/security/RTB_PLATFORM_BACKUP_RESTORE_RUNBOOK.md, and docs/architecture/engineering-os/EOS_DISASTER_RECOVERY_RUNBOOK.md

ROLLBACK_CAPABILITIES: application restart from the recorded HEAD; pilot stop by EOS_CONTROLLED_PILOT_ENABLED=0 or by suspending the engineering-os commerce installation; connector stop by omitting the Microsoft runtime environment; database restore to an isolated target from a provider backup; artifact recovery from retained content_base64 inside the rollback window for named fixtures; configuration preserved by not purging audit rows.

ROLLBACK_LIMITATIONS: release-governance commands do not roll back a database. Staging disaster recovery does not claim PITR. RPO is not an RTB SLA. An irreversible migration is not an automatic safe rollback. Restore does not overwrite the active database in place unless an explicit operator procedure says so. Private packages were not published, so there is no package-registry rollback. Feature flags that default off, including the read-only solver connector, are not a general release-rollback product.

POST_GA_SCHEMA_CHANGE_REQUIRES_MIGRATION_GOVERNANCE: YES. A schema change needs a forward migration, a compatibility analysis, a rollback or forward-fix strategy, an RLS review, a tenant-isolation review, a release-ledger entry, and deployment sequencing. Production promotion still uses the migration guard. Emergency security SQL is a backport, not a bulk push of staging.

## 12. Release-health checklist

GA_RELEASE_HEALTH_SNAPSHOT_CREATED: YES

For a later release, rerun and record, without a predetermined test count:

- canonical security suite clean pass
- RLS regression pass
- secret scan pass
- dependency posture within the accepted critical and high threshold, with residual advisories disclosed
- release-governance tests pass
- release-governance typecheck pass
- release-ledger integrity pass
- artifact consistency pass
- application health without secrets
- engineering runtime smoke only for the paths the change touches

Snapshot at this handoff, version 1.0.0:

CANONICAL_SECURITY_SUITE: PASS
SECURITY_FAILURE_COUNT: 0
GA_SECURITY_GATE: PASS
RLS_REGRESSION_GATE: PASS
SECRET_SCAN: PASS
DEPENDENCY_AUDIT: PASS
CRITICAL_DEPENDENCY_COUNT: 0
HIGH_DEPENDENCY_COUNT: 0
MODERATE_DEPENDENCY_COUNT: 1
ACTIVE_GA_BLOCKER_COUNT: 0
RELEASE_GOVERNANCE_TESTS: PASS
RELEASE_GOVERNANCE_TEST_COUNT: 220
RELEASE_GOVERNANCE_TYPECHECK: PASS
RELEASE_LEDGER_INTEGRITY: PASS
RELEASE_ARTIFACT_CONSISTENCY: PASS

## 13. Release types

POST_GA_RELEASE_TYPES_DEFINED: YES

The public contract list at 1.0.0 is frozen. Internal package wiring is not a public API change. PUBLIC_API_CHANGE_REQUIRES_SEMVER_ASSESSMENT: YES.

PATCH_RELEASE: no frozen-contract change and no engineering-method change. Minimum gates are the release-health checklist.
MINOR_RELEASE: not available inside the frozen 1.0.0 contracts. An additive public contract needs a new governed contract version before it is called minor.
MAJOR_RELEASE: required before a breaking change to a frozen public contract. This handoff does not open that version.
SECURITY_HOTFIX: uses the emergency remediation rule. Do not bulk-push staging. Do not skip the production guard, the security suite, RLS validation, the ledger, artifact consistency, or a security impact assessment.
ENGINEERING_CORRECTIVE_RELEASE: a material method fix. It cannot be silent. It adds targeted validation and qualified rereview of the affected evidence.

HOTFIX_GOVERNANCE_DEFINED: YES. No repository rule permits a shorter test set for urgency. This handoff does not add one.

## 14. Owner-role model

POST_GA_OPERATIONAL_OWNER_MODEL: existing runbook roles, not new named people and not new statutory duties.

Platform On-Call owns the Engineering OS aggregate. Security On-Call owns security escalation. Identity owner owns privileged access with Security On-Call. AI Runtime owner owns provider events. Execution Host owner owns solver and execution-host events. Ops and the Secret Management owner own secrets. Platform Kernel / DB owner owns tenant isolation. Incident Commander is assigned at intake. The qualified structural reviewer remains the D1 review role and is not a product-release authority. Review owner remains the review-pilot incident owner.

## 15. Issue triage

ISSUE_TRIAGE_MODEL_DEFINED: YES

BUG: software behavior contradicts a governed contract.
ENGINEERING_METHOD_DEFECT: a reviewed or claimed calculation method is wrong. It follows the defect path and is not silent.
SECURITY_DEFECT: isolation, credential, boundary, or accepted-posture failure. Default is release-blocking when the canonical suite fails.
FEATURE_REQUEST: new capability. It does not reopen a closed bounded track by itself.
UNSUPPORTED_SCOPE_REQUEST: the limitation inventory already excludes it. That is not a defect.
PROJECT_CERTIFICATION_REQUEST: stays on the certification track. Platform operations do not satisfy it.
INTEGRATION_FAILURE: connector, provider, or host failure under the connector and provider rules.
DATA_ISSUE: integrity or restore, without treating monitoring success as validation.

## 16. Customer-claim boundary

GA_MARKETING_CLAIM_BOUNDARY_DEFINED: YES

EOS general availability does not mean automatic engineering approval, regulatory approval, project certification, professional sign-off, or compliance with every jurisdiction. AI cannot grant itself engineering authority. AI output is not human engineering approval.

## 17. Post-GA change control

POST_GA_CHANGE_CLASSIFICATION_DEFINED: YES
TARGETED_INVALIDATION_MODEL_PRESERVED: YES
MATERIAL_ENGINEERING_CHANGE_INHERITS_EXISTING_REVIEW: NO

A material change requires an impact assessment, identification of the affected evidence, invalidation of only that evidence, revalidation or rereview, and a refresh of the affected release baseline. Unaffected D1 through D9 evidence stays valid. A material change does not inherit the old review.

NONMATERIAL_DOCUMENTATION_CHANGE. Review: no. Validation: no. Release governance: no, unless the text changes a release record. Semver: none. Security gate: no. Engineering impact assessment: no.

NONMATERIAL_INTERNAL_REFACTOR. Review: no when behavior is unchanged. Validation: the tests that lock that behavior. Release governance: no. Semver: none. Security gate: yes if the refactor touches the security boundary. Engineering impact assessment: no when behavior is unchanged.

PUBLIC_API_COMPATIBLE_CHANGE. Review: contract review. Validation: contract tests. Release governance: yes. Semver: not inside frozen 1.0.0; a new contract version is required before a minor label. Security gate: yes. Engineering impact assessment: only if an engineering contract moves.

PUBLIC_API_BREAKING_CHANGE. Review: yes. Validation: yes. Release governance: yes. Semver: major, and not this 1.0.0 surface. Security gate: yes. Engineering impact assessment: yes if engineering consumers change.

ENGINEERING_BEHAVIOUR_CHANGE. Review: targeted. Validation: targeted. Release governance: yes if a release claim changes. Semver: none unless a frozen public contract changes. Security gate: no, unless authority or isolation changes. Engineering impact assessment: yes.

CALCULATION_METHOD_CHANGE. Review: qualified rereview of the affected method. Validation: independent validation of that method. Release governance: yes for an engineering corrective release. Semver: none unless a frozen public contract changes. Security gate: no. Engineering impact assessment: yes.

SECURITY_ARCHITECTURE_CHANGE. Review: security. Validation: the security suite and RLS. Release governance: yes. Semver: none unless a frozen public contract changes. Security gate: yes. Engineering impact assessment: yes if engineering authority changes.

DATABASE_SCHEMA_CHANGE. Review: RLS and tenant isolation. Validation: migration guard. Release governance: yes, including a ledger entry. Semver: none by itself. Security gate: yes. Engineering impact assessment: only if engineering records change meaning.

AI_AUTHORITY_OR_GOVERNANCE_CHANGE. Review: governance. Validation: the authority tests that already forbid self-approval. Release governance: yes. Semver: none unless a frozen public contract changes. Security gate: yes. Engineering impact assessment: yes. AI cannot self-grant engineering authority.

JURISDICTION_OR_STANDARD_PROFILE_CHANGE. Review: qualified review of the affected profile. Validation: the affected profile only. Release governance: yes if a conformance claim changes. Semver: none unless a frozen public contract changes. Security gate: no. Engineering impact assessment: yes. A profile change does not create regulatory approval.

C7_POST_GA_CHANGE_CONTROL_DEFINED: YES. Current fingerprint fp:ac109d1f. Creep and shrinkage validated cement class remains N. Temperature adjustment, phiEf, and a national profile remain not validated. A material change to calculated long-term behavior requires a targeted C7 impact assessment.

D1F_POST_GA_CHANGE_CONTROL_DEFINED: YES. Current blobs remain system-evaluation.ts 1db11bfc7481dc01fabedb320d44d156f2dc4f37 and structural-systems-r3.ts 27e902bdba212fcc79adf2c27a99b686f80d7192. A material change requires D1F review impact assessment. Qualified D1F status does not carry silently onto a material revision.

A16D_DEPENDENCY_INVERSION_PRESERVED: YES. A future forbidden engineering-os import of @rtb/engineering-review is a release-blocking regression.

## 18. Certification track

PROJECT_CERTIFICATION_TRACK_STATUS: UNSATISFIED
PROJECT_CERTIFICATION_TRACK_SEPARATE_FROM_PLATFORM_OPERATIONS: YES

## 19. Handoff status

EOS_GA_POST_RELEASE_BASELINE_ESTABLISHED: YES
EOS_GA_OPERATIONS_HANDOFF_COMPLETE: YES

Phase 14E froze Engineering OS V1.0 and said not to generate another feature phase from that overview. No later canonical document names a V1.1 planning phase. The next state is ordinary governed operations on this baseline, not a new engineering-development phase.
