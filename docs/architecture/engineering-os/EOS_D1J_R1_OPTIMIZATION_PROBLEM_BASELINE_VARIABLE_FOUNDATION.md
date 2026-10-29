EOS-D1J-R1 optimization problem, baseline, and variable foundation

This phase records the first bounded D1J runtime. It reuses the D1J-0 architecture, the optimization-intelligence fingerprint and variable-type vocabulary, and D1F structural identity. It does not evaluate an objective, a constraint, or feasibility. It does not generate a candidate, run an optimizer, execute a solver, mutate a design model, or create certification evidence.

A problem is FOUNDATION_DEFINED. That status is not optimization-ready. Objective and constraint references stay unbound until R2. A complete variable set does not change that boundary.

Scope is an explicit structural system or an explicit member set taken from D1F identity. Full-project scope is not inferred, and member membership is not inferred from geometry.

The baseline resolver accepts only a D1F structural system or a D1F member. Version, content fingerprint, authority, and validation state come from that identity. A caller expectation can reject a mismatch. It cannot replace the canonical fingerprint, authority, or validation state. The pin does not float to a later source version. A correction is a new baseline reference and a successor problem. The source body is not copied.

Parameters are the allowlisted semantics GOVERNED_CATALOGUE_CHOICE, GOVERNED_ENUMERATION, GOVERNED_BOUNDED_QUANTITY, GOVERNED_INTEGER_COUNT, and GOVERNED_BOOLEAN_CHOICE. They map onto the existing discrete, categorical, continuous, integer, and boolean variable types. A property path, JSON path, or prototype path is rejected. The registry is not a model setter. Registering a variable does not change the target identity.

A dimensional quantity uses the existing unit system. A missing unit is not inferred. A domain must be an approved catalogue, governed engineering rule, or project constraint, with that source authority and fingerprint. Caller numbers without a source are not a governing domain. A search range may be narrower than the governing domain and is stored as a search bound. It is not an engineering limit, and it cannot extend past the governing domain. Catalogue entries and enumeration choices must already exist on the source. Unknown applicability is rejected.

A variable set sorts variable fingerprints before hashing, so input order does not change the fingerprint. The same target and parameter are one variable. A conflicting domain is not merged. An empty set is rejected. Binding a set creates a successor problem and leaves the prior problem in history.

Provenance keeps registration authority distinct from baseline authority and domain-source authority. History is append-only. Staleness of the baseline source, structural target, domain source, D1B binding, or parameter-registry version marks the dependent foundation stale without rewriting the pinned fingerprint and without deleting history.

The next phase is EOS-D1J-R2-OBJECTIVE-CONSTRAINT-FEASIBILITY-REFERENCE-FOUNDATION. It may record objectives, constraints, required checks, and feasibility references on this foundation. It still must not generate candidates, execute a solver, or claim certification. D1G remains uncertified.
