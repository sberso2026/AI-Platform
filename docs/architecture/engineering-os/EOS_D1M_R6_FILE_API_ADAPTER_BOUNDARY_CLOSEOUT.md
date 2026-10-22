# EOS-D1M-R6 File and API Adapter Boundary Closeout

## Status

Phase: EOS-D1M-R6-FILE-API-ADAPTER-BOUNDARY

Status: ADAPTER_BOUNDARY_IMPLEMENTED

Maturity: STRUCTURAL_CAD_OR_BIM_FILE_API_ADAPTER_BOUNDARY_IMPLEMENTED

Parent architecture: docs/architecture/engineering-os/EOS_D1M_0_CAD_OR_BIM_INTELLIGENCE_ARCHITECTURE.md

R1 closeout: docs/architecture/engineering-os/EOS_D1M_R1_CAD_OR_BIM_ARTIFACT_SOURCE_REVISION_FOUNDATION_CLOSEOUT.md

R2 closeout: docs/architecture/engineering-os/EOS_D1M_R2_SOURCE_OBJECT_STRUCTURAL_TARGET_MAPPING_CLOSEOUT.md

R3 closeout: docs/architecture/engineering-os/EOS_D1M_R3_GEOMETRY_SEMANTIC_EVIDENCE_CLOSEOUT.md

R4 closeout: docs/architecture/engineering-os/EOS_D1M_R4_UNIT_COORDINATE_AXIS_REFERENCE_CLOSEOUT.md

R5 closeout: docs/architecture/engineering-os/EOS_D1M_R5_MODEL_RELATIONSHIP_EVIDENCE_CLOSEOUT.md

Runtime: packages/engineering-os/src/structural-systems/cad-bim-adapter-boundary.ts

This phase records who may later supply CAD or BIM evidence, through which exact contract, and under which trust and provenance rules. It does not implement CAD or BIM interoperability. A registered adapter is not a parser. A declared format is not support. An authenticated source is not engineering validation.

## 1. R1 through R5 dependency chain

The adapter boundary names the existing R1 through R5 phase operations as the only destinations a contract may admit. It reuses those phase identities. It does not call the R1 source recorder, the R2 mapping recorder, the R3 geometry or semantic recorders, the R4 reference-context recorder, or the R5 relationship recorder. Admission of an operation class does not execute that operation.

## 2. Adapter identity

An adapter is identified by adapter id, exact version, boundary class, source class, owning module, provenance, scope, and fingerprint. Display name is not identity. The same id with the same fingerprint returns the existing record. The same id with a different version or boundary is rejected.

## 3. Adapter version

Every identity binds an exact version. Latest, current, newest, head, and the existing floating labels are rejected. The runtime does not upgrade a version.

## 4. Adapter contract

A contract binds an existing identity to an exact contract version, one permitted R1 through R5 operation, a parser-trust class, provenance, scope, and a fingerprint. The same contract id with the same fingerprint returns the existing contract. A different fingerprint for the same id is rejected.

## 5. Capability declaration

A capability declaration names one architecture format token and must repeat that token's architecture disposition. IFC, neutral exchange, and structured API stay candidate future adapters. RVT, DWG, DXF, and Tekla native stay unsupported in D1M-0.

## 6. Capability versus actual support

A declaration never sets format support. Supported format count remains zero. IFC, RVT, DWG, DXF, and Tekla runtime support remain false. A caller cannot mark a capability supported or substitute a disposition.

## 7. File and API boundary

FILE_SOURCE_BOUNDARY and API_SOURCE_BOUNDARY are distinct classes stored on the adapter identity and copied onto the contract. An API source is not given higher engineering trust than a file source.

## 8. Source authentication

A submission stores the authenticator id and whether the caller says the source was authenticated. Authentication records who supplied the envelope. It does not authorize the source, validate the engineering, or approve the API content.

## 9. Authority

Recording requires interface record authority. Engineering approval authority, certification authority, and administrator authority are rejected. Adapter authority is not engineering approval, certification, or administrator authority.

## 10. Provenance

Identity, contract, capability, and submission each require a provenance reference. A blank provenance reference is rejected. An AI party cannot supply provenance.

## 11. Parser trust boundary

The only trust classes are unavailable, untrusted, and isolated. Trusted and verified are rejected because no parser exists. No numeric trust score is accepted.

## 12. Parser trust versus engineering trust

A recorded trust class does not validate engineering content. Parser output is not validated engineering evidence. Contract flags for engineering validation and certification stay false.

## 13. Untrusted-file security model

The recorded policy requires parser isolation, resource limits, and decompression limits, and it rejects malformed payloads, external reference fetch, path traversal, unsafe embedded content, and arbitrary URL fetch. A locator that contains a parent segment, a URL scheme, a drive path, a UNC path, or a rooted path is rejected. This policy is not a parser.

## 14. Unsupported-format handling

An unknown format token is rejected. An unsupported architecture disposition cannot be rewritten into a candidate or a supported claim. Unsupported formats are not auto-accepted. Unknown formats do not default to supported.

## 15. Evidence submission contract

A submission envelope stores adapter contract fingerprint, capability fingerprint, authenticator, declared source format, evidence fingerprint, intended operation, locator, provenance, and exact tenant, workspace, and project. Execution performed stays false.

## 16. R1 reuse

R1 remains the source-reference path. The boundary reuses the R1 phase identity and does not create a parallel artifact governance store.

## 17. R2 reuse

R2 remains the mapping path. The boundary reuses the R2 phase identity and does not create a parallel mapping engine.

## 18. R3 reuse

R3 remains the geometry and semantic evidence path. The boundary reuses the R3 phase identity and does not create a parallel model-evidence engine.

## 19. R4 reuse

R4 remains the unit, coordinate, and axis reference path. The boundary reuses the R4 phase identity and does not create a parallel reference-context engine.

## 20. R5 reuse

R5 remains the relationship-evidence path. The boundary reuses the R5 phase identity and does not create a parallel relationship engine.

## 21. No governance bypass

A submission that asks to execute, ingest a file, connect a vendor, fetch a URL, or mark engineering validated is rejected. The adapter cannot bypass R1, R2, R3, R4, or R5.

## 22. Fingerprints

Contract, capability, and submission fingerprints reuse the canonical fingerprint. No second fingerprint algorithm is introduced. Verifying a contract fingerprint does not mean a format is supported or that engineering content is validated.

## 23. Immutability

Identity and contract content are not silently mutated. A later contract uses a new id and a current predecessor. The predecessor status becomes superseded. Its fingerprint is not rewritten.

## 24. History

Created and superseded events are appended for identity, contract, capability, and submission records. Capability history is preserved with the same history log. Auto-upgrade and capability auto-promotion are rejected.

## 25. Duplicate and replay handling

The same submission id and fingerprint returns the existing envelope. A second active submission of the same contract, evidence fingerprint, and operation is rejected. Conflicting duplicates are not written as a second authoritative record.

## 26. AI boundary

AI, LLM, and optimizer parties cannot invent adapter identity, version, format support, parser trust, or provenance. They cannot bypass unsupported-format handling or mark adapter output engineering validated. No AI parsing runtime and no AI format-adapter runtime exist.

## 27. Admin boundary

Administrator authority cannot record an adapter and is not adapter engineering authority. Assurance for privileged administration is unchanged.

## 28. No parsing

CAD or BIM parse runtime count is zero. Object extraction runtime count is zero.

## 29. No ingestion

CAD or BIM file ingestion and generic engineering file ingestion runtime counts are zero. A file boundary does not ingest a file.

## 30. No real format adapters

Format-adapter runtime count is zero. Format-adapter readiness remains no. Adapter-boundary readiness is yes. Those two states are different.

## 31. No vendor connectors

Vendor API connector runtime count is zero. New external connector runtime count is zero. An API boundary does not create a vendor connector.

## 32. No arbitrary URL fetching

Arbitrary external URL fetch runtime count is zero. A locator is not permission to fetch network content or to read an unrestricted filesystem path.

## 33. D1K boundary

Cross-discipline governance is reused. No parallel D1M cross-discipline interface is created. Internal discipline integration and cross-discipline intelligence remain not ready.

## 34. D1L boundary

The D1L track remains complete with limitations. The adapter boundary is not D1L certification eligible.

## 35. D1N boundary

D1N remains not absorbed. D1N runtime is not started and its runtime count is zero.

## 36. D9 boundary

D9 is not absorbed. D9 runtime is not started. D9 runtime count and global cycle detection remain zero. D2 through D8 runtime is not started and its count is zero.

## 37. Security evidence

Scope is enforced. Cross-tenant, cross-workspace, and cross-project submissions are rejected. Adapter spoofing, contract substitution, capability substitution, and provenance stripping are rejected. No schema change and no new dependency were added. The known security baseline remains the pre-existing pair of failures with one root cause. This phase does not treat that raw suite as passing and does not add a regression.

## 38. Release evidence

The capability row is implemented bounded, not validated, framework only, and release-classified with the existing global classification. It does not claim format support, parsing, ingestion, a connector, adapter trust as engineering trust, structural interpretation, validation, conformance, solver certification, certification, or product general availability. Supported format count stays zero.

## 39. Readiness matrix

Architecture ready: yes. Source-reference runtime ready: yes. Model-evidence runtime ready: yes. Adapter-boundary runtime ready: yes. Format-adapter runtime ready: no. Structural interpretation runtime ready: no. Change-governance runtime ready: no. D1 structural pack complete: no. Post-D1J debt, the D1G certification blocker, D1K limitations, and GA security debt remain preserved.

## 40. Exact next authorized phase

EOS-D1M-R7-CHANGE-STALENESS-SUPERSESSION. Type: CAD_OR_BIM_CHANGE_STALENESS_SUPERSESSION. Scope: record governed change, staleness, and supersession across the existing D1M evidence chain, including artifact revision, mapping, geometry, semantics, unit and coordinate and axis context, relationship evidence, and adapter contract context where applicable. Historical records stay immutable. No automatic engineering revalidation, reinterpretation, or certification. R7 is not started by this phase.
