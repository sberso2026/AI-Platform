# EOS 2.17R Release Authority and Pilot Scope

## PR-002

`RELEASE_SIGNATORY_IDENTIFIED=YES`

`RELEASE_SIGNATORY_AUTHORITY_VERIFIED=YES`

`AI_RELEASE_SIGNATORY=NO`

`PR_002_RESOLVED=YES`

`FINAL_PRE_PROMOTION_GO_NO_GO=NOT_ISSUED`

The operator explicitly designated the signatory on 2026-10-29. The identity and role below are recorded as supplied. Earlier EOS 1 pilot-engineer evidence and the D1 structural reviewer attestation were not used as this authority.

Existing release governance names a role, not a person. `assertProductionIdentity` checks the Production project reference `wcydlhqiqdwgoaqrlget`. It does not name a human. The EOS 2.16 checklist says a named human must sign and that this record must not invent that person. The rollback runbook says a workspace owner, admin, pilot engineer, or AI is not the Production release authority.

The EOS 1.0 attestation records an operator and a pilot-engineer membership on `eos-controlled-pilot / default`, plus an owner membership on another workspace. Those facts are EOS 1 evidence. They do not appoint anyone to approve controlled EOS 2.0 Production promotion. No professional registration, corporate office, or delegated EOS 2 release authority is stated in that attestation, and none is added here.

The D1 attestation `EOS_D1_QUALIFIED_STRUCTURAL_REVIEWER_ATTESTATION.md` names Silvestre Berso as Structural Engineer / Qualified Structural Reviewer for the D1 structural review scope. That document says the attestation is not certification, regulatory approval, or project design approval. It is an engineering-reviewer record. It is not an appointment to approve EOS 2 Production software promotion. This closeout does not convert it into one.

`RELEASE_SIGNATORY_NAME=Silvestre Berso`

`RELEASE_SIGNATORY_ROLE=Founder and Authorized Production Release Authority`

`RELEASE_SIGNATORY_AUTHORITY_BASIS=Founder and authorized decision-maker of RTB Engineering and Analytics Pty Ltd for internal software Production releases`

`RELEASE_SIGNATORY_DECISION_SCOPE=EOS 2.0 Controlled Production Pilot Promotion`

`QUALIFIED_RUNTIME_COMMIT=bd9654fc35ce9bdcc8fc3a42570ae2cd92311c01`

`PRODUCTION_PILOT_TENANT=eos-controlled-pilot`

`PRODUCTION_PILOT_WORKSPACE_NAME=Default Workspace`

`PRODUCTION_PILOT_WORKSPACE_ID=5c85d773-3b79-43b2-b138-c6251f566768`

`EOS_2_0_QUALIFICATION_STATUS=QUALIFIED_BOUNDED`

`AI_RELEASE_SIGNATORY=NO`

`AI_PRODUCTION_GO_AUTHORITY=NO`

This authority is only the software release decision for that controlled pilot promotion. It does not constitute engineering design approval, calculation verification, IFC approval, professional engineering certification, statutory approval, or regulatory certification.

The acknowledged exclusions remain outside the qualified scope: unsupported deterministic engineering calculations, globally qualified external solver execution, autonomous engineering approval, regulatory certification, full enterprise document management, and full construction management.

EOS 2 stays disabled. It may be enabled only for this workspace during EOS 2.17 execution after the pre-enablement migration, backup, security, tenant-isolation, EOS 1 regression, smoke-test, and rollback controls have passed.

The declaration authorizes Silvestre Berso to issue the final human GO or NO-GO. It does not itself issue GO. No Production migration, deployment, or enrollment was performed from this designation.

## PR-003

`PRODUCTION_PILOT_WORKSPACE_IDENTIFIED=YES`

`PRODUCTION_PILOT_WORKSPACE_ID=5c85d773-3b79-43b2-b138-c6251f566768`

`PRODUCTION_PILOT_WORKSPACE_EOS_2_ENROLLED=NO`

`PR_003_RESOLVED=YES`

The first EOS 2 Production cohort is the existing EOS 1 controlled pilot: tenant `eos-controlled-pilot`, workspace `Default Workspace`, id `5c85d773-3b79-43b2-b138-c6251f566768`. It is the only workspace in that tenant. It has one active `pilot-engineer` membership. Its `engineering-os` access is the existing allow override `EOS 1.0.0 controlled pilot workspace access`. It has no installation, subscription, or licence, and none was added. The other 396 active `engineering-os` installations were not selected. Staging workspace `eos-qa-a` and synthetic project `EOS-QA-001` are not Production candidates. EOS 2 enrollment remains absent.

## Scope of the named signatory

The named human may issue GO or NO-GO only for the controlled EOS 2.0 Production pilot software promotion of `bd9654fc35ce9bdcc8fc3a42570ae2cd92311c01`, limited to workspace `5c85d773-3b79-43b2-b138-c6251f566768`. That decision does not certify calculations, regulatory compliance, project designs, or customer deliverables. Software release authority stays separate from engineering approval authority.
