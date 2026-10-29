# EOS 2.18R Staging Validation Evidence

Staging Supabase: `rntonzigxwxcjlcsadip`

Staging was migrated before Production. Ledger after the additive migration: 147. Maximum version: `20261029140000`.

Staging deployment: `dpl_mchJL3jgpsaS1ZTf8YaGxpTsT3VS`

URL: `https://rtb-ai-platform-h2xbl7zpw-silvestres-projects-96ea276a.vercel.app`

Source commit: `031777b75403f6e3390c2aaff5cd909d4fe512e5`

Target: preview. Status: Ready. `STAGING_REMEDIATION_SOURCE_PROVENANCE_VERIFIED=YES`

The preview hostname is behind deployment protection, so the staging browser was not logged in. The staging workflow was executed as the staging engineer through `eos2_18r_persist` under that user's RLS, which is the function the production route calls. Tenant `60e7cdcf-e055-4d67-9a27-49055c8a99e6`. Workspace `11003b34-ff40-4f1e-973e-734cd0612ca9`.

| Check | Result |
| --- | --- |
| Engineering Basis create and revise | revision 1 then 2; a repeated request key and a stale expected revision did not create revision 3 |
| Structural object | revision 1, then 2, then 3 after the deliverable; history length 2 |
| Interface | two rows; current revision 2; receiver pending; previous row superseded |
| Deliverable | revision 1, approval pending, release not_released; freshness became potentially_stale after the later structural revision |
| Change and materiality | one case, three impacts created UNASSESSED; mechanical materiality recorded as NO_MATERIAL_IMPACT by the human action |
| Freeze | frozen true, approval pending; a later update did not change the snapshot |
| Authority | accept interface and acting role ai denied; Pilot-0001 rejected |
| Retry | duplicate request did not add a revision |
| RLS | a second workspace saw 0 basis, discipline, interface, change, deliverable, and freeze rows |
| Empty settings to controlled_pilot | PASS, then restored |
| Empty settings to off | PASS, then restored |
| Existing eos2 mode update | PASS |
| Invalid mode | rejected, auditedSuccess false |
| Null settings expression | produces controlled_pilot; the tenant column itself rejects a null settings write |

The staging tenant mode was restored to `controlled_pilot`. Staging was not promoted to Production.
