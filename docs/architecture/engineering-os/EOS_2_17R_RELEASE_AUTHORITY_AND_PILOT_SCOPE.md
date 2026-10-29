# EOS 2.17R Release Authority and Pilot Scope

## PR-002

`RELEASE_SIGNATORY_IDENTIFIED=NO`

`RELEASE_SIGNATORY_AUTHORITY_VERIFIED=NO`

`AI_RELEASE_SIGNATORY=NO`

Existing release governance names a role, not a person. `assertProductionIdentity` checks the Production project reference `wcydlhqiqdwgoaqrlget`. It does not name a human. The EOS 2.16 checklist says a named human must sign and that this record must not invent that person. The rollback runbook says a workspace owner, admin, pilot engineer, or AI is not the Production release authority.

The EOS 1.0 attestation records an operator and a pilot-engineer membership on `eos-controlled-pilot / default`, plus an owner membership on another workspace. Those facts are EOS 1 evidence. They do not appoint anyone to approve controlled EOS 2.0 Production promotion. No professional registration, corporate office, or delegated EOS 2 release authority is stated in that attestation, and none is added here.

The D1 attestation `EOS_D1_QUALIFIED_STRUCTURAL_REVIEWER_ATTESTATION.md` names Silvestre Berso as Structural Engineer / Qualified Structural Reviewer for the D1 structural review scope. That document says the attestation is not certification, regulatory approval, or project design approval. It is an engineering-reviewer record. It is not an appointment to approve EOS 2 Production software promotion. This closeout does not convert it into one.

`RELEASE_SIGNATORY_NAME` is not assigned. `RELEASE_SIGNATORY_ROLE` is not assigned. `RELEASE_SIGNATORY_AUTHORITY_BASIS` is none. `RELEASE_SIGNATORY_DECISION_SCOPE` is not assigned. `AI_RELEASE_SIGNATORY=NO`.

## PR-003

`PRODUCTION_PILOT_WORKSPACE_IDENTIFIED=YES`

`PRODUCTION_PILOT_WORKSPACE_ID=5c85d773-3b79-43b2-b138-c6251f566768`

`PRODUCTION_PILOT_WORKSPACE_EOS_2_ENROLLED=NO`

`PR_003_RESOLVED=YES`

The first EOS 2 Production cohort is the existing EOS 1 controlled pilot: tenant `eos-controlled-pilot`, workspace `Default Workspace`, id `5c85d773-3b79-43b2-b138-c6251f566768`. It is the only workspace in that tenant. It has one active `pilot-engineer` membership. Its `engineering-os` access is the existing allow override `EOS 1.0.0 controlled pilot workspace access`. It has no installation, subscription, or licence, and none was added. The other 396 active `engineering-os` installations were not selected. Staging workspace `eos-qa-a` and synthetic project `EOS-QA-001` are not Production candidates. EOS 2 enrollment remains absent.

## Scope that a future signatory would approve

The decision, when a human makes it, is only controlled EOS 2.0 Production pilot promotion. It does not certify calculations, regulatory compliance, SIL, project designs, or customer deliverables. Software release authority stays separate from engineering approval authority.
