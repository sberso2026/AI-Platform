# EOS-D2-R5 Drainage and Stormwater Context Closeout

## Result

R5 records governed drainage and stormwater context on exact R1 Civil identity and applicable R2 spatial/surface, R3 grading, and R4 roads references. It does not calculate hydrology, runoff, hydraulics, pipe size, channel flow, culvert size, detention storage, flood level, or flood routing.

D2 runtime count is five. Drainage and stormwater context is ready. Civil utility and later phases are not ready. R6 has not started.

## Upstream binding

Every drainage record cites an exact R1 context. Catchment, rainfall reference, network, node, link, pit, manhole, channel, culvert, outfall, and detention citations are exact R1 object identities of those types. Spatial citation is an exact R2 spatial-reference id. Surface citations are non-empty exact R2 surface-context ids. Grading and roads citations are an explicit context id or an explicit null when that upstream context is not applicable. Floating labels, including latest, are rejected. A missing grading or roads citation is rejected. A newer surface, grading, or road record is not substituted.

## Drainage and stormwater context

One record holds the catchment, network, nodes, links, and any supplied pit, manhole, channel, culvert, outfall, detention, and pipe references. Several object types do not create several runtime counts. The drainage context runtime count is one.

## Catchments

A catchment record stores identity, an explicit boundary reference, the receiving network, and rainfall or runoff criteria references. Storing a catchment does not calculate runoff or hydrology.

## Network, node, and link context

The record stores network, node, and link identity, pit and manhole identity, and explicit upstream or downstream relationships. Relationship kinds are the existing R1 kinds PARENT and OBJECT_REFERENCE. A network record does not mean a hydraulic model is complete. Capacity, velocity, headloss, hydraulic grade, surcharge, and pipe diameter are not computed.

## Rainfall and runoff criteria

Criteria are caller-supplied references. Rainfall kinds are rainfall source, design event, recurrence, climate-change factor, and drainage standard. Runoff kinds are runoff coefficient, runoff reference, and drainage standard. The recorder cannot invent rainfall or runoff criteria. Presence of those references does not mean hydrology has been performed. A flood-level citation is a supplied reference and is not a modelled flood level.

## Channels, culverts, outfalls, and detention

Channel, culvert, outfall, and detention identities may be recorded, or left explicitly null when not applicable. R5 does not size a culvert, calculate open-channel flow, calculate outlet control, route a flood, or size detention storage.

## R3 and R4 boundaries

Drainage may cite grading and roads context, including a relationship to a grading or road object. That relationship does not change the grading record or the road record. Supersession of a surface or grading record leaves the drainage citation on the original ids.

## Assumptions and evidence

Assumption and evidence citations are existing R1 CIVIL_ASSUMPTION and CIVIL_EVIDENCE_REFERENCE objects. R5 does not create a parallel assumption-governance capability. An evidence citation is not engineering validation or engineering approval.

## Currentness, provenance, fingerprint, and history

Currentness uses CURRENT, STALE, REASSESSMENT_REQUIRED, and SUPERSEDED. A CURRENT record requires CURRENT upstream records. A STALE record may cite a superseded upstream record exactly. Supersession does not repoint surface, grading, or road ids. Provenance is required. The fingerprint is fingerprintCanonical. Identical replay returns the existing record. Conflicting identity and a wrong fingerprint are rejected. Records are frozen and history is appended. Tenant, workspace, and project must match the upstream record. The recorder remains CIVIL_CONTEXT_AUTHORITY and is not Civil engineering authority.

## Boundary

Hydrology, runoff calculation, hydraulic calculation, pipe sizing, channel hydraulics, culvert sizing, detention sizing, flood modelling, flood routing, and drainage optimization runtime counts remain zero. Terrain generation, automatic grading, earthworks calculation, road geometric design, quantity calculation, and civil utility geometry runtime counts remain zero. Civil validation, approval, and certification runtime counts remain zero. D1 integration, D3 integration, D4 through D8 integration, and D9 integration runtime counts remain zero. D1 remains incomplete. D1N remains closed. D3 through D9 remain unstarted. No schema and no dependency were added.

## Security and release

The canonical security suite fails only on packages/engineering-review/src/migration.test.ts and packages/engineering-review-persistence/src/boundary.test.ts. Both failures are the existing EOS-A16D import of EICAR_TEST_SIGNATURE from @rtb/engineering-review. Failure count is 2 and root cause count is 1. RLS guard tests passed. Secret scan passed with 0 findings. Production audit remains the post-R4 baseline: critical 0, high 0, moderate 1. The remaining moderate finding is the pre-existing uuid advisory. No new critical or high dependency vulnerability appeared. Release governance tests passed at 112. Release typecheck passed. Ledger integrity is ok. No new security or release regression was introduced.

## Next phase

The next phase is EOS-D2-R6-CIVIL-UTILITY-AND-CORRIDOR-CONTEXT, type CIVIL_UTILITY_AND_CORRIDOR_CONTEXT. Implement bounded governed Civil utility/corridor context using exact D2 identity and applicable spatial, grading, roads and drainage references. Record corridor, trench, pit, crossing, clearance-envelope and Civil utility spatial context plus explicit relationships, provenance, currentness and fingerprint. Do not design electrical, mechanical, piping, process or instrumentation systems, perform utility sizing, calculate capacities, optimize routing, calculate quantities, or start D3-D9.
