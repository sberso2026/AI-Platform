# EOS-D1K-R2 Semantic, Unit, Coordinate, and Axis Compatibility

## Purpose

D1K-R2 records deterministic compatibility diagnostics for a governed D1K-R1 interface and its exact source pin. It compares explicit source metadata with an explicit receiving requirement across semantic identity, schema identity and version, units, coordinate-system identity, and axis and sign convention identity.

A diagnostic may conclude MATCHING, INCOMPATIBLE, MISSING, or UNRESOLVED. Those states reuse the D1K-0 convention vocabulary. A matching diagnostic is not engineering approval, design approval, source validation, structural validation, or evidence that the source calculation is correct.

## Parent authority

Parent architecture: docs/architecture/engineering-os/EOS_D1K_0_CROSS_DISCIPLINE_STRUCTURAL_INTERFACES_ARCHITECTURE.md

R1 closeout: docs/architecture/engineering-os/EOS_D1K_R1_INTERFACE_IDENTITY_SOURCE_REFERENCE_FOUNDATION_CLOSEOUT.md

Parent roadmap: docs/architecture/engineering-os/EOS_POST_D1J_CANONICAL_ROADMAP.md

R1 remains the identity and exact source-reference foundation. R2 does not replace that record and does not create a second interface identity.

## Runtime

The runtime is packages/engineering-os/src/structural-systems/interface-compatibility.ts. Evaluation requires an existing R1 record in the same tenant, workspace, and project. A fingerprint mismatch fails closed. The R1 source id, revision, authority, evidence, provenance, and fingerprint are copied onto the diagnostic and are not rewritten.

Semantic identity is an allowlist. Equal registered identities match. Different registered identities are incompatible. An unregistered string is unresolved even when both sides use the same string. Labels are not compared by similarity.

Schema identity is an allowlist of schema id and version pairs. Exact pairs match. Two registered versions with no compatibility edge are incompatible. Unknown schema ids or versions are unresolved. No payload is rewritten.

Units reuse existingUnitFamily from the structural demand unit module. That lookup reports whether a unit belongs to an existing family. It does not scale a value. An exact unit match is MATCHING. Two different units in the same family, such as N and kN for force, are unresolved because conversion would be required and is not performed. Units in different families are incompatible. Unknown units are unresolved and are not mapped to a nearby unit.

Coordinate identity reuses D1F_COORDINATE_SYSTEMS. Axis identity reuses D1F_MEMBER_END_RELEASE_AXES. Sign identity reuses D1F_SIGN_CONVENTION_FIELDS. Exact registered identities match. Different registered identities are incompatible. Missing values stay missing. Unregistered values stay unresolved. No coordinate transform, axis reorder, or sign reversal is executed.

Aggregate conclusion is conservative. An incompatible required dimension keeps the aggregate incompatible. A missing required dimension keeps the aggregate missing when nothing is incompatible. There is no numeric compatibility score.

The diagnostic fingerprint uses fingerprintCanonical and includes the R1 interface fingerprint, source fingerprint, source revision, and governed diagnostic fields. A later source revision does not inherit the previous diagnostic. Reuse against a changed pin fails closed and requires a new evaluation.

## Boundaries

R2 does not convert units, transform coordinates, swap axes, reverse signs, reshape schemas, or reconcile conflicts. It does not execute a handoff. It does not approve an interface or a design. It does not run Civil, Geotechnical, Mechanical, Piping, Process, Electrical, or Instrumentation and Control calculations. It does not run D9 cycle detection. It does not start D1L. It does not absorb D1M or D1N. It does not add an engineering formula or a database migration. It does not make external references or internal discipline integration ready.

AI authority cannot create the diagnostic, invent a semantic, unit, coordinate system, axis convention, or sign convention, override the result, or approve engineering.

## Readiness

D1K architecture readiness and reference-runtime readiness remain true. External reference readiness, internal discipline integration readiness, and cross-discipline intelligence readiness remain false.

The bounded capability D1K.R2.SEMANTIC_UNIT_COORDINATE_AXIS_COMPATIBILITY is IMPLEMENTED_BOUNDED and NOT_VALIDATED. The umbrella D1K.STRUCTURAL_INTERFACE_RUNTIME stays NOT_IMPLEMENTED.

## Known debt

Concrete C10 engineer review remains pending. D1F system-orchestrator human review remains pending. D1G live validation, engineer validation, and certified-solver status remain unmet. D1H, D1I, and D1J engineer validation remain pending. D1I and D1J conformance validation remain pending. D1J concrete parameter semantics remain NOT_AVAILABLE. GA security debt remains.

## Next phase

The next authorized phase is EOS-D1K-R3-HANDOFF-RESPONSE-CHANGE-CONFLICT-GOVERNANCE. Its type is STRUCTURAL_INTERFACE_HANDOFF_RESPONSE_CHANGE_CONFLICT_GOVERNANCE. It may record requests, provisions, acknowledgements, responses, source changes, stale references, interface conflicts, and human-governed resolution state. It must not automatically resolve engineering conflicts, approve engineering, start D2 through D8, or start D9. R2 does not start that phase.

Closeout path: docs/architecture/engineering-os/EOS_D1K_R2_SEMANTIC_UNIT_COORDINATE_AXIS_COMPATIBILITY_CLOSEOUT.md
