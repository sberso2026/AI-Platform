# EOS-D1L-0 Structural Global Certification Gate Architecture

## Purpose

D1L is the structural global certification gate. It will later decide whether one explicit structural engineering claim has enough governed evidence for a defined certification class. This phase defines that architecture. It does not certify a claim, a solver, a project, or the structural pack.

## Canonical scope

The architecture separates architecture readiness, evidence completeness, engineer validation, conformance, solver qualification, cross-discipline evidence, standards and jurisdiction applicability, certification eligibility, the certification decision, and release classification. A software stage that returned pass is not any of those later states.

## Dependencies

The gate reuses D1A structural identity, existing standard and jurisdiction profile references, D1D and D1E design-check evidence where a claim uses them, D1F system identity where the scope is a system, D1G solver evidence where a claim depends on a solver, D1H and D1I evidence only where the claim uses them, D1J study evidence only where the claim is an optimization-study claim, and D1K interface evidence only where the claim depends on another discipline. It does not start those tracks again.

## Non-goals

This phase does not grant certification, conformance, engineer validation, or solver certification. It does not complete the structural pack. It does not start D2 through D9, implement cycle detection, execute a design calculation, add a solver, close review debt, or manufacture missing evidence.

## Terminology

Eligibility means the declared prerequisites for a claim are present. Certification is a later decision by a certification authority. Release eligibility is a product-governance state. General availability is a product state. None of these words substitutes for another.

## Claim identity

A future claim identifies its claim id, workspace, project, D1A structural target, claim type, scope, applicable calculation evidence, pinned standard edition, pinned jurisdiction profile version, source revisions, evidence fingerprints, human authority, certification status, and history. The structural target kind comes from the D1A object kinds. No second asset identity is defined.

## Claim types

The governed types are an analysis-result claim, a design-check claim, and an optimization-study evidence claim. Those match evidence the repository already has. There is no single claim that certifies the whole structural pack.

## Certification scope

A claim scope is a check, a member, a subsystem, a structural system, or a project claim. Certification of one scope does not certify a wider scope. A partial result is not a global certification.

## Evidence hierarchy

Source engineering evidence is the model, analysis, design check, inputs, assumptions, and referenced sources. Validation evidence shows the method maturity. Engineer-review evidence shows who reviewed the claim and which revision they reviewed. Conformance evidence shows that an implementation followed a stated requirement. Solver qualification evidence shows the solver status required by that claim. Cross-discipline evidence is the D1K pin, compatibility, lifecycle, conflict, staleness, disposition, and composition record when the claim depends on another discipline. Standards and jurisdiction evidence pin the governing profile. Certification authority evidence identifies who may later decide. These categories stay separate.

## Evidence manifest

A future manifest names the claim, scope, workspace, project, structural target, standard profile and edition, jurisdiction profile and version, design evidence, analysis evidence, validation evidence, engineer-review evidence, conformance evidence, solver qualification evidence, cross-discipline evidence, authority evidence, provenance, dependency fingerprints, and a manifest fingerprint. The manifest uses exact revisions. Latest is not an exact reference.

## Validation, review, conformance, and solver evidence

Validation, engineer review, conformance, and solver qualification are separate inputs. Completeness of the package is not certification. Engineer validation is not certification. A conformance pass is not certification. Executing a solver is not solver certification. A validated solver is not a certified solver unless that qualification evidence exists.

## D1K cross-discipline evidence

D1K evidence is mandatory only when the claim declares a cross-discipline dependency. The manifest then cites the D1K interface, exact source revision, source authority, source class, R1 fingerprint, R2 result and fingerprint, R3 lifecycle, unresolved conflict, staleness, human disposition, and R4 composition. An unpinned current interface is not allowed. Stale D1K evidence cannot support a current certification. An unresolved certification-relevant conflict cannot be ignored. A D1K human disposition is not certification approval. D1L does not resolve the conflict and does not create a second interface system.

## Standards and jurisdiction

An engineering standard, a jurisdiction, a regulatory profile, a company requirement, and a project requirement are separate axes. No code is hard-coded as the global default. Australia is not the default and the European Union is not the global profile. A future certification pins the standard edition and the jurisdiction profile version. Latest standard and current jurisdiction rules are not certification references. This architecture does not add code checks.

## Consequence and reliability seam

The repository has no canonical consequence or reliability class and no numeric class factors. A future claim may cite a governed profile reference. This phase does not invent those factors or an unvalidated classification system.

## Requirement matrix

Requirements are selected from the claim type, scope, jurisdiction, engineering standard, design stage, solver dependency, and D1K dependency. An analysis-result claim that uses the D1G solver requires solver qualification and is blocked while D1G live validation, engineer validation, conformance, and certified-solver status are unmet. A design-check claim requires the check evidence and engineer review for that check. An optimization-study claim may cite D1J evidence and is not eligible merely because D1J closed. A caller cannot turn off a mandatory requirement. A governed profile may be selected. It cannot delete required evidence.

## Blocker taxonomy

Blockers use a closed set: missing evidence, stale evidence, invalid evidence, insufficient authority, pending or failed engineer review, missing or failed conformance, unqualified solver, unresolved or stale or incompatible D1K interface, missing jurisdiction or standards profile, unsupported claim type, unresolved parameter semantics, and an unresolved release condition where a product rule applies. Severity is a hard blocker, an advisory, an informational limitation, or deferred unrelated debt. A hard blocker prevents eligibility. An advisory does not become a hard blocker by default. An explanation cannot downgrade a hard blocker.

## Eligibility and decision states

The state names are not assessed, evidence incomplete, blocked, pending review, ineligible, eligible, certification decision pending, certified, certification denied, and stale. Eligible is not certified. Certified still requires an authorized decision. This phase defines the names and does not implement transitions that grant certification.

## Authority

The roles are evidence producer, engineer reviewer, conformance authority, solver qualification authority, certification authority, administrator, system diagnostic, and AI assistant. They are not interchangeable. An administrator is not a certification authority. Technical administration does not imply engineering certification authority. AI is not a certification authority.

## Decision record

A future decision record would keep the claim, scope, authority, decision, evidence manifest, standards and jurisdiction pins, source revisions, solver evidence, review evidence, conformance evidence, D1K evidence, blocker state, provenance, time, fingerprint, and supersession. This phase does not record a decision.

## Fingerprints, provenance, and history

Fingerprints reuse the existing canonical fingerprint. No second algorithm is defined. Provenance is taken from the governing evidence and is not invented. History is append-only. A later decision does not erase a denial, a blocker, a prior revision, or a stale state.

## Change invalidation

Eligibility becomes stale when governing evidence changes, including the structural model, calculation result, design input, solver version, review evidence, conformance evidence, standard, jurisdiction profile, D1K source, D1K compatibility, or D1K lifecycle. A certification result is not carried onto changed evidence. Reassessment is required.

## Digital thread

The future chain stays on the existing thread: structural source, calculation or check evidence, validation, engineer review, conformance, solver qualification where required, D1K evidence where required, the D1L manifest, eligibility evaluation, and an authorized decision. No parallel certification thread is defined.

## AI boundary and human oversight

AI may later summarize evidence. AI may not mark a claim eligible, mark it certified, grant certification, waive a blocker, or clear a hard blocker. There is no certification confidence score. Deterministic checks and engineer judgment stay distinct. A review record must show who reviewed, what scope and revision they reviewed, and when. Human oversight is not an unchecked boolean.

## Release, security, and general availability

Release eligibility is not certification eligibility. Engineering certification is not product general availability. GA security debt still blocks general availability. It does not block this architecture and it is not, by itself, an engineering-certification blocker. The known security suite remains a raw failure on the inherited migration and persistence boundary tests. That raw result is not a pass.

## D1G and other debt

D1G live validation, D1G engineer validation, D1G conformance, and the unmet certified-solver status remain hard blockers for a certification claim that depends on that solver. They are not resolved here. Concrete C10 review is nonblocking to architecture and blocking to a concrete design-check claim that depends on C10. D1F system-orchestrator review is nonblocking to architecture and blocking to a system-scope claim that depends on it. D1H engineer validation is nonblocking to architecture and blocking to a claim that uses inspection-condition evidence. D1I engineer and conformance validation are nonblocking to architecture and blocking to a claim that uses that twin evidence. D1J engineer validation, conformance validation, and unavailable concrete parameter semantics are nonblocking to architecture, blocking to an optimization-study claim, and blocking to a claim that uses those parameters. GA security debt blocks general availability only.

## Readiness

Architecture is ready. The eligibility model is not ready. Certification runtime is not ready. Certification eligibility is not satisfied. Certification authority is not ready to issue a decision. The structural pack is not complete. D1M and D1N are not absorbed. No production schema is changed.

## Future decomposition

The canonical sequence after this architecture is a claim and exact evidence-manifest foundation, then eligibility blocker evaluation, then standards and jurisdiction profile governance, then certification authority and decision records, then evidence invalidation and supersession, then closeout. None of those phases is started here.

## Next authorized phase

The next phase is EOS-D1L-R1-CERTIFICATION-CLAIM-EVIDENCE-MANIFEST-FOUNDATION. It records a scoped claim and an exact evidence manifest. It does not evaluate eligibility, issue certification, grant conformance, certify a solver, or start D2 through D9.

## Non-claims

This architecture does not claim that any structural result is certified, that D1G is a certified solver, that D1J completion creates eligibility, that a D1K disposition approves certification, that release eligibility is certification, or that general availability is granted.
