# EOS 2.15R Hosted Critical Path Evidence

## Runtime under test

| Item | Value |
| --- | --- |
| Deployment | `dpl_Am7AhnHwv7Hjdymx4e73AXrfv75C` |
| Source commit | `af6612bdebe40616dab18525ceab4dc70f03621e` |
| Environment | Vercel preview |
| Database | Staging Supabase `rntonzigxwxcjlcsadip` |
| Actor | Synthetic qualification engineer in workspace `eos-qa-a` |
| Project | `EOS-QA-001` / `SYNTHETIC_QUALIFICATION_PROJECT` |
| Equipment | `P-101` |

The mutations below were submitted through the signed-in qualification panel on the hosted preview. That panel calls the application qualification API with the user session. Direct SQL was not used as the evidence of execution. A later read confirmed the rows the application had written.

## Application actions

| Action | Role | Application result |
| --- | --- | --- |
| Vendor revision for P-101 | mechanical | Committed. Approval not granted. |
| Structural receiver accepted by mechanical | mechanical | Denied. Receiver authority required. |
| Structural receiver acceptance | structural | Committed. Approval not granted. |
| Electrical receiver acceptance | electrical | Committed. Approval not granted. |
| Materiality finalization | ai | Denied. |
| Structural materiality | structural | Committed as a human material impact. Approval not granted. |
| Electrical materiality | electrical | Committed as a human material impact. Approval not granted. |
| Freeze approval | ai | Denied. |
| Freeze approval | owner | Denied. |
| Deliverable approval | owner | Denied. |
| IFC release | owner | Denied. |
| Deliverable disposition | structural | Committed. Disposition `REVALIDATION_REQUIRED`. Revision unchanged. Approval not granted. |

## Persisted chain

Mechanical issued the controlled values and then the vendor revision through the application:

- `p101-mass-runtime`: operating mass `12000 kg`, structural receiver `accepted` (historical).
- `p101-power-runtime`: motor power `75 kW`, electrical receiver `accepted` (historical).
- `p101-mass-runtime-r2`: operating mass `14000 kg`. The original structural receiver remains `pending`. An authorized structural action inserted a separate `accepted` receiver. Acceptance was not inherited.
- `p101-power-runtime-r2`: motor power `110 kW`. The original electrical receiver remains `pending`. An authorized electrical action inserted a separate `accepted` receiver.

Change `chg-p101-runtime` records the mass change from `12000 kg` to `14000 kg`.

Candidate impacts remain:

- structural `UNASSESSED`
- electrical `UNASSESSED`
- structural `MATERIAL_IMPACT` with required action `RECALCULATE`
- electrical `MATERIAL_IMPACT` with required action `RECALCULATE`

All four impact rows have `recalculated=false`. The change row has `baseline_rewritten=false` and `deliverable_revised=false`. The candidate rows were not rewritten into material impacts. The human decision is a separate persisted row. AI did not finalize materiality.

Deliverable `str-dwg` remains revision `1` and freshness `potentially_stale`. The application did not create a revision, withdraw the deliverable, or approve it.

FEED freeze key `feed` still has fingerprint prefix `d718a0888df3d926`, the same baseline recorded before this path. The current project state differs from that frozen baseline.

## Audit

Staging `engineering_delivery_audit` contains six `application_%` rows for this path. The distinct actions are:

- `application_vendor_revision`
- `application_receiver_accepted`
- `application_materiality_assessed`
- `application_deliverable_disposition`

Each action records the acting role in its detail and `approvalGranted=false`.

## Authority and isolation

Unauthorized interface acceptance, materiality finalization, freeze approval, deliverable approval, and IFC release were denied by the hosted application. The authorized structural and electrical roles could record their own decisions. AI did not approve.

The unrelated workspace `eos-qa-b` opened the same hosted page and did not receive `EOS-QA-001`.

## Bounded answers

After the runtime change existed, the hosted qualification API returned four answers and `approvalGranted=false`:

- What changed for P-101? Deterministic record of the mass and power revision.
- Which disciplines are affected? Deterministic dependency naming structural and electrical candidates.
- Which deliverables are potentially stale? Deterministic record.
- Why is this package not ready for release? Human decision required. No automatic release.

## Limitation

`engineering_interface_receivers` and `engineering_change_candidate_impacts` expose insert and select to the application role, not update. The hosted route therefore inserts the authorized decision and leaves the original pending or unassessed row in place. That preserves history. It does not grant an in-place update. No formula, result semantic, schema, or production baseline changed.
