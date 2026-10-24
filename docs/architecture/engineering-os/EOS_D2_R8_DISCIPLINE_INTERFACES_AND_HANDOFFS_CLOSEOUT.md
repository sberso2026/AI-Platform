# EOS-D2-R8 Discipline Interfaces and Handoffs Closeout

## Result

R8 records one bounded Civil interface and handoff capability. It covers a Civil-to-Structural handoff, a Civil-to-Geotechnical contract, and future placeholders for Mechanical, Piping, Process, Electrical, and Instrumentation and Control. It does not perform the engineering reasoning between those disciplines. D2 runtime count is eight. Discipline interface runtime is ready. Review and validation governance, the dedicated currentness digital thread, and the D9 source contract are not ready. R9 has not started.

## Canonical interface governance reused

Interface topics reuse the D2 architecture lists for Structural, Geotechnical, and future D4 through D8 exchanges. Authority equality flags reuse the architecture constants that keep Civil distinct from Structural and Geotechnical authority. Acknowledgement is not approval, AI cannot approve an interface, and silent source repointing is forbidden, reusing the D1K handoff-governance constants. When a Structural counterpart already exists, the handoff pins an exact D1K interface id, source revision, and fingerprint from that record. No second global cross-discipline framework was created. D1K records are read and are not mutated by recording a Civil handoff.

## Exact source and counterpart binding

Every handoff cites an exact R1 Civil context, an exact CIVIL_INTERFACE object, and an exact Civil source object with an explicit source revision and the source object's fingerprint at the time of recording. Floating labels, including latest, are rejected. A Structural counterpart id must match a D1K interface in the same tenant, workspace, and project, and the supplied revision must match that record. A CURRENT handoff cannot cite a superseded D1K revision. A STALE handoff may cite the superseded revision exactly. It is not repointed to the successor. Geotechnical and D4 through D8 counterparts are null. Supplying an invented counterpart id is rejected.

## D2 and D1

The Structural handoff can record site levels, grading near structures, roads and access, drainage interfaces, crossings, and Civil conditions affecting Structural assets. Civil owns the handoff record. Structural owns Structural engineering truth. D2 does not equal Structural authority, and D1 does not equal Civil authority. A receiving acknowledgement is stored as an acknowledgement. It is not validation, approval, or certification.

## D2 and D3

The Geotechnical contract can record the architecture topics, including soil parameters, groundwater, settlement criteria, excavation and fill criteria, slope criteria, subgrade criteria, Civil levels, earthworks geometry, and corridor geometry. Direction may be Civil toward Geotechnical or Geotechnical toward Civil. Because D3 runtime has not started, the counterpart reference stays empty and the handoff cannot be marked complete. No geotechnical record is fabricated.

## D4 through D8 placeholders

Mechanical, Piping, Process, Electrical, and Instrumentation and Control each have a placeholder handoff. The status is not yet available. The counterpart reference is empty. The limitation states that the counterpart discipline runtime has not started. Those placeholders do not start D4, D5, D6, D7, or D8. D2 does not own their engineering truth.

## Authority, limitations, and reasoning

A handoff does not transfer discipline authority. Evidence on the handoff does not validate the receiving discipline. An incomplete handoff is not a validated interface. Requirements, assumptions, decisions, and change records are citations of existing R7 records. R8 does not create a parallel governance engine. Cross-discipline reasoning, automatic conflict detection, automatic conflict resolution, and automatic counterpart validation runtime counts remain zero.

## Currentness, provenance, fingerprint, and history

Currentness reuses CURRENT, STALE, REASSESSMENT_REQUIRED, and SUPERSEDED. Provenance is required. The fingerprint is fingerprintCanonical. Identical replay returns the existing record. A conflicting fingerprint is rejected. Duplicate current signatures are rejected. Supersession appends history and does not rewrite the predecessor's counterpart pin. Tenant, workspace, and project must match. Records are frozen. The recorder remains CIVIL_CONTEXT_AUTHORITY.

## Boundary

Cross-discipline reasoning, conflict detection, conflict resolution, and counterpart validation runtime counts remain zero. Automatic grading design, earthworks calculation, road geometric design, hydrology, hydraulics, utility route optimization, and quantity calculation runtime counts remain zero. Civil review, validation, approval, and certification runtime counts remain zero. The dedicated currentness digital-thread runtime count and the D9 source-contract runtime count remain zero. D3 through D9 remain unstarted. D1 remains incomplete. D1N remains closed. No schema and no dependency were added.

## Security and release

The canonical security suite fails only on packages/engineering-review/src/migration.test.ts and packages/engineering-review-persistence/src/boundary.test.ts. Both failures are the existing EOS-A16D import of EICAR_TEST_SIGNATURE from @rtb/engineering-review. Failure count is 2 and root cause count is 1. RLS guard tests passed. Secret scan passed with 618 files and 0 findings. Production audit is critical 0, high 0, moderate 1. The remaining moderate finding is the pre-existing uuid advisory 1119441. No new critical or high dependency vulnerability appeared. Release governance tests passed at 115. Release typecheck passed. Ledger integrity is ok. No new security or release regression was introduced.

## Next phase

The next phase is EOS-D2-R9-REVIEW-AND-VALIDATION-GOVERNANCE, type REVIEW_AND_VALIDATION_GOVERNANCE. Implement bounded Civil review and validation governance using exact D2 records and evidence. Record review requests, reviewer authority, review findings, validation state and evidence requirements without claiming engineering conformance, approval or certification beyond evidence actually present. Preserve human engineering authority. Do not automatically validate calculations, approve designs, certify Civil work, perform calculations, or start D3-D9.
