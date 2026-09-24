# ERA Architectural Laws

These ten laws are frozen for ERA Target Architecture v1.0. Do not add laws in ERA-PILOT-0.

## LAW 1 — Engineering OS records

Engineering OS is the system of record. Canonical projects, documents, assets, requirements, risks, decisions, actions, technical queries, interfaces, vendors, workflow, and approvals live in Engineering OS (and its installed modules). ERA must reference those objects; it must not duplicate them as a competing register.

## LAW 2 — ERA reasons

ERA is the system of reasoning. It may derive findings, observations, evidence relationships, and (when later authorized) change, impact, attention, and readiness assessments. Reasoning output is advisory until a human disposes it.

## LAW 3 — Humans authorize

Humans are the system of authority. Only an attributable human actor may accept, reject, modify, assign, or close Review findings, accept residual engineering risk, authorize IFC, or approve engineering work. ERA must not autonomously exercise those authorities.

## LAW 4 — Every material ERA conclusion must trace to evidence

A material finding presented to an engineer must cite attributable evidence: source document, revision where known, and locator/span or equivalent. Unsupported detector or AI claims are suppressed, not displayed as verified.

## LAW 5 — ERA must not produce opaque engineering scores as substitutes for evidence

Confidence is not severity. Coverage percentages, risk scores, maturity scores, and readiness scores must not replace evidence. If a metric cannot be computed from stored data, ERA must say the quantity is not measured.

## LAW 6 — ERA may assess configured readiness criteria but may not approve proceeding

ERA may report document/machine-readiness and configured review-scope completion. It must not approve proceeding, authorize IFC, or declare engineering complete.

## LAW 7 — Silence is not assurance

Zero findings means: configured review completed, and no findings were identified within the selected review scope. It must never be represented as proof that a package is correct, safe, complete, compliant, approved, or ready for IFC.

## LAW 8 — Major capability expansion requires demonstrated engineering value

A target-architecture capability is not authorized for build merely because it is named. Expansion requires observed engineering need, a testable hypothesis, and an approved Capability Investment Case after evidence (normally PILOT-1).

## LAW 9 — Material conclusions must expose epistemic boundaries

Where applicable, a material ERA object must expose: what is known, what is assumed, what is unresolved, what is excluded, what is outside scope, evidence coverage (or that coverage is unmeasured), and material source limitations. WHY means engineering justification and provenance, not model chain-of-thought.

## LAW 10 — Human disagreement is evidence, not automatically truth

Neither ERA output nor engineer disagreement automatically establishes engineering truth. Adjudication may conclude ERA_WRONG, HUMAN_WRONG, BOTH_PARTLY_CORRECT, MISSING_CONTEXT, or INDETERMINATE.
