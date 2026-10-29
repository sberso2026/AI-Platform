# EOS-D2-R6 Civil Utility and Corridor Context Closeout

## Result

R6 records governed Civil utility and corridor spatial context on exact R1 Civil identity and applicable R2 spatial/surface, R3 grading, R4 roads, and R5 drainage references. It does not design electrical, mechanical, piping, process, instrumentation, or communications systems, and it does not size utilities, calculate capacity, generate a route, or resolve a clash.

D2 runtime count is six. Civil utility and corridor context is ready. Requirements and later phases are not ready. R7 has not started.

## Upstream binding

Every utility record cites an exact R1 context and an exact CIVIL_UTILITY_CORRIDOR object. Trench, pit, and crossing citations are exact R1 objects of those types, or an explicit empty list when none apply. The clearance envelope is an exact CLEARANCE_ENVELOPE object or an explicit null. Reserved space is an explicit supplied reference or an explicit null. Spatial citation is an exact R2 spatial-reference id. Surface citations are non-empty exact R2 surface-context ids. Grading, roads, and drainage citations are an explicit context id or an explicit null when that upstream context is not applicable. Floating labels, including latest, are rejected. A missing grading, roads, or drainage citation is rejected. A newer surface, grading, or drainage record is not substituted.

## Corridor, trench, pit, crossing, and clearance

One record holds the corridor identity, trench identities, pit identities, crossing identities, clearance envelope, and reserved-space reference. Several object types do not create several runtime counts. The utility and corridor context runtime count is one. Corridor classification and clearance separation are caller-supplied criteria. Storing a crossing or a clearance envelope does not resolve a conflict and does not validate a discipline system.

## Civil ownership and D4 through D8

R6 records where a corridor, trench, pit, crossing, or clearance envelope is reserved in Civil space, and which Civil objects it relates to. Relationship kinds are the existing R1 kinds PARENT and OBJECT_REFERENCE. Roles may cite a site, grading object, road object, drainage object, crossing, or reserved-space conflict. Those relationships do not change grading, road, or drainage records. D2 does not equal mechanical, piping, process, electrical, or instrumentation authority. D2 does not own D4 through D8 engineering truth.

## Routing, sizing, capacity, and quantity

A supplied corridor is not a generated route and is not an optimized route. R6 does not calculate pipe diameter, cable capacity, mechanical capacity, process capacity, trench quantity, excavation quantity, material quantity, or network capacity. Those runtime counts remain zero.

## Assumptions and evidence

Assumption and evidence citations are existing R1 CIVIL_ASSUMPTION and CIVIL_EVIDENCE_REFERENCE objects. R6 does not create a parallel assumption-governance capability. An evidence citation is not engineering validation. The recorder cannot invent authoritative clearance or separation criteria.

## Currentness, provenance, fingerprint, and history

Currentness uses CURRENT, STALE, REASSESSMENT_REQUIRED, and SUPERSEDED. A CURRENT record requires CURRENT upstream records. A STALE record may cite a superseded upstream record exactly. Supersession does not repoint surface, grading, road, or drainage ids. Provenance is required. The fingerprint is fingerprintCanonical. Identical replay returns the existing record. Conflicting identity and a wrong fingerprint are rejected. Records are frozen and history is appended. Tenant, workspace, and project must match the upstream record. The recorder remains CIVIL_CONTEXT_AUTHORITY and is not Civil engineering authority.

## Boundary

Automatic utility routing, route optimization, automatic conflict resolution, utility sizing, capacity calculation, utility quantity, trench quantity, and excavation quantity runtime counts remain zero. Electrical, mechanical, piping, process, and instrumentation design runtime counts remain zero. Automatic grading, earthworks calculation, road geometric design, hydrology, and hydraulic calculation runtime counts remain zero. Civil validation, approval, and certification runtime counts remain zero. D1 integration, D3 integration, D4 through D8 integration, and D9 integration runtime counts remain zero. D1 remains incomplete. D1N remains closed. D3 through D9 remain unstarted. No schema and no dependency were added.

## Security and release

The canonical security suite fails only on packages/engineering-review/src/migration.test.ts and packages/engineering-review-persistence/src/boundary.test.ts. Both failures are the existing EOS-A16D import of EICAR_TEST_SIGNATURE from @rtb/engineering-review. Failure count is 2 and root cause count is 1. RLS guard tests passed. Secret scan passed with 0 findings. Production audit remains critical 0, high 0, moderate 1. The remaining moderate finding is the pre-existing uuid advisory. No new critical or high dependency vulnerability appeared. Release governance tests passed at 113. Release typecheck passed. Ledger integrity is ok. No new security or release regression was introduced.

## Next phase

The next phase is EOS-D2-R7-REQUIREMENTS-ASSUMPTIONS-AND-CHANGE, type REQUIREMENTS_ASSUMPTIONS_AND_CHANGE. Implement governed Civil requirements, assumptions, decisions/change context using canonical EOS primitives and exact D2 object references. Record requirement applicability, assumption provenance, decision rationale, explicit affected-object relationships and change/reassessment context. Do not automatically redesign Civil objects, infer undocumented dependencies, perform calculations, validate engineering, approve engineering, certify, or start D3-D9.
