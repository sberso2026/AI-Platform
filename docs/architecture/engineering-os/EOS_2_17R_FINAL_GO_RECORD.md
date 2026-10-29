# EOS 2.17R Final GO Record

`FINAL_PRE_PROMOTION_GO_NO_GO=GO`

`HUMAN_PRODUCTION_GO_AUTHORITY=YES`

`AI_PRODUCTION_GO_AUTHORITY=NO`

`AI_RELEASE_SIGNATORY=NO`

Silvestre Berso, Founder and Authorized Production Release Authority of RTB Engineering and Analytics Pty Ltd, issued GO on 2026-10-29 for the controlled EOS 2.0 Production pilot software promotion.

`RELEASE_SIGNATORY_NAME=Silvestre Berso`

`RELEASE_SIGNATORY_ROLE=Founder and Authorized Production Release Authority`

`RELEASE_SIGNATORY_AUTHORITY_BASIS=Founder and authorized decision-maker of RTB Engineering and Analytics Pty Ltd for internal software Production releases`

`RELEASE_SIGNATORY_DECISION_SCOPE=EOS 2.0 Controlled Production Pilot Promotion`

`QUALIFIED_RUNTIME_COMMIT=bd9654fc35ce9bdcc8fc3a42570ae2cd92311c01`

`PRODUCTION_PILOT_TENANT=eos-controlled-pilot`

`PRODUCTION_PILOT_WORKSPACE_NAME=Default Workspace`

`PRODUCTION_PILOT_WORKSPACE_ID=5c85d773-3b79-43b2-b138-c6251f566768`

`EOS_2_INITIAL_STATE=DISABLED`

`LEGACY_PROJECT_AUTO_MIGRATION=NO`

`SYNTHETIC_PRODUCTION_TRANSFER=NO`

`APPLICATION_ROLLBACK_DEPLOYMENT_ID=dpl_7EBZUxhkVX7MjR44rYCgkg8odHgB`

This GO does not constitute engineering design approval, calculation verification, professional engineering certification, IFC approval, statutory approval, or regulatory certification. EOS 2.0 remains `QUALIFIED_BOUNDED`.

## Fingerprint verified before migration

| Item | Value |
| --- | --- |
| Production commit | `0c1ec9e06eea59ac089753f3c930f1a599b14648` |
| Production deployment | `dpl_7EBZUxhkVX7MjR44rYCgkg8odHgB` |
| Supabase | `wcydlhqiqdwgoaqrlget` |
| Ledger | 144, maximum `20261027233000` |
| Pending manifest | 14, hash mismatch 0, destructive count 0 |
| Post-GO backup SHA-256 | `7ec6a70389874eeb14bc7972000a8972df1e8506e863997b8c1e510f4bf5f6b0` |
| Backup completed | `2026-10-29T03:30:07.828Z` |
| EOS 2 enrollment | Absent |
| Controlled-pilot tenants | 0 |

`FINAL_GO_RECORD_FINGERPRINT=b869ab5d13e4cb4bb8eda5ca24bd4d2e3d8e7c812da808b83cda9df96f37d428`

The fingerprint is the SHA-256 of those bound values in a fixed order: signatory, role, scope, qualified runtime, production commit, production deployment, ledger count, ledger maximum, backup checksum, workspace id, EOS 2 state `DISABLED`, legacy auto-migration `NO`, synthetic transfer `NO`, and decision `GO`.

The GO becomes invalid for a later execution if the production commit, deployment, ledger, qualified runtime, migration manifest, backup applicability, pilot workspace, signatory, EOS 2 rollout control, or a Critical or High security status changes before that execution uses it.

## Execution boundary

The post-GO backup was taken before migration. Fourteen manifest versions were then applied. The qualified runtime was deployed. EOS 2 was not enabled. Authenticated pilot smoke was not run, so the named workspace was not enrolled.
