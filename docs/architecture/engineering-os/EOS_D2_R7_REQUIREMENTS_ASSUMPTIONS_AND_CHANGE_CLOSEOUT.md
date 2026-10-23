# EOS-D2-R7 Requirements, Assumptions, and Change Closeout

## Result

R7 records governed Civil requirements, assumptions, decisions, and explicit change or reassessment context on exact D2 object identities. It does not redesign the Civil engineering solution. One bounded capability covers all four record kinds. D2 runtime count is seven. Requirements, assumptions, and change context is ready. Discipline interfaces, review and validation governance, the dedicated currentness digital thread, and the D9 source contract are not ready. R8 has not started.

## Canonical primitives reused

Requirement status vocabulary and the AI approval boundary come from the existing information-requirement contract. Assumption validation status, assumption materiality, the single-selected-alternative check, and the human-only approval actor check come from the existing decision-intelligence invariants. Affected-object kinds reuse the R1 relationship kinds PARENT and OBJECT_REFERENCE. Jurisdiction profile ids reuse the existing global catalog, including apac-other. The Philippines is not a new profile id. Currentness reuses CURRENT, STALE, REASSESSMENT_REQUIRED, and SUPERSEDED. Maturity reuses CONCEPT through DETAILED_DESIGN. Fingerprints reuse fingerprintCanonical. Object identity reuses R1 CIVIL_REQUIREMENT, CIVIL_ASSUMPTION, CIVIL_DECISION, and CIVIL_EVIDENCE_REFERENCE records. No second fingerprint algorithm and no parallel currentness engine were created. The Supabase requirement, assumption, and decision services were not invoked, so no schema was opened. The change-workbench impact discovery path was not invoked, because that path infers dependencies beyond a declared edge.

## Requirements

A requirement record binds an exact CIVIL_REQUIREMENT object, supplied text, source, source revision, applicability, jurisdiction profile, evidence references, and exact affected D2 objects. A recorded requirement is not a satisfied requirement and is not engineering validated. Accepted-for-purpose status is rejected. The recorder cannot invent an authoritative requirement.

## Assumptions

An assumption record binds an exact CIVIL_ASSUMPTION object, a supplied statement, source, rationale, evidence, and exact affected objects. Canonical validation status is accepted only as unvalidated. A candidate suggestion is stored as a candidate and is not an authoritative adoption. An authoritative assumption cannot be invented. A recorded assumption is not engineering validated.

## Decisions

A decision record binds an exact CIVIL_DECISION object, a supplied statement, rationale, supplied alternatives, requirement and assumption object references, evidence, and an authority role that is author, reviewer, decision authority, lifecycle authority, or source authority. An AI recommendation is not a Civil engineering decision. A recorded decision is not validated and is not approved. Selecting a supplied alternative does not approve the decision.

## Change and reassessment

A change record names an initiating source, one exact changed object, and explicit affected-object relationships. When reassessment is required, only those explicit targets receive a reassessment mark. The mark means reassessment is required. It does not mean the engineering is invalid, does not trigger recalculation, and does not mean the engineering is validated. Undocumented dependencies are not inferred. Proximity is not an explicit relationship. Upstream grading, road, drainage, utility, and identity records are not rewritten, and their object identity is not repointed.

## Authority

The recorder remains CIVIL_CONTEXT_AUTHORITY. AI is not Civil engineering authority and cannot approve a requirement, assumption, decision, or change. An AI approval attempt is refused by the canonical human-approval actor check. Admin is not Civil engineering authority. Civil engineering authority is not granted by recording these contexts. Review, validation, approval, and certification remain outside R7.

## Boundary

Requirement, assumption, decision, and change automatic-redesign runtime counts remain zero. Automatic grading design, earthworks calculation, road geometric design, hydrology, hydraulics, utility route optimization, and quantity calculation runtime counts remain zero. Civil review, validation, approval, and certification runtime counts remain zero. The dedicated currentness digital-thread runtime count and the D9 source-contract runtime count remain zero. D1, D3, D4 through D8, and D9 integration counts remain zero. D1 remains incomplete. D1N remains closed. D3 through D9 remain unstarted. No schema and no dependency were added.

## Security and release

The canonical security suite fails only on packages/engineering-review/src/migration.test.ts and packages/engineering-review-persistence/src/boundary.test.ts. Both failures are the existing EOS-A16D import of EICAR_TEST_SIGNATURE from @rtb/engineering-review. Failure count is 2 and root cause count is 1. RLS guard tests passed. Secret scan passed with 618 files and 0 findings. Production audit is critical 0, high 0, moderate 1. The remaining moderate finding is the pre-existing uuid advisory 1119441. No new critical or high dependency vulnerability appeared. Release governance tests passed at 114. Release typecheck passed. Ledger integrity is ok. No new security or release regression was introduced.

## Next phase

The next phase is EOS-D2-R8-DISCIPLINE-INTERFACES-AND-HANDOFFS, type DISCIPLINE_INTERFACES_AND_HANDOFFS. Implement bounded governed Civil interface/handoff records using exact D2 object/evidence references. Support D2 to D1 Structural and D2 to D3 Geotechnical interface contracts plus future D4 through D8 handoff placeholders defined by D2 architecture. Preserve discipline authority, exact revisions, provenance, limitations and currentness. Do not perform cross-discipline engineering reasoning, automatically resolve conflicts, validate counterpart discipline data, transfer authority, or start D3-D9 runtime.
