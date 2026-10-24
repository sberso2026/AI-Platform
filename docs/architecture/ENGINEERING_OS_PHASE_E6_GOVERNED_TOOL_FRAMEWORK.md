# Engineering OS Phase E6 — Governed Engineering Tool Framework

**Status:** Complete  
**Baselines:** E0–E5 (`80b52fd` E5)  
**Roadmap note:** Earlier E0 roadmap labelled E6 as “Engineering Memory & KG publish”. This phase **redefines E6 as Governed Engineering Tool Framework**. Memory/KG remains a later phase.

## Goal

Enable Ask / Engineering Reasoning to **discover and invoke governed engineering tools** without allowing LLM reasoning to impersonate calculations, verification, or certified analysis.

## Principle

```
Reasoning determines what capability may be needed.
Tool executes governed work.
Result carries provenance.
Engineer retains authority.
```

## Registry ownership

**Platform Intelligence Tool Registry** remains the system of ownership  
(`duplicateEngineeringToolFrameworkDetected = false`).

Engineering OS provides:
- engineering capability/tool **contracts**
- discovery/invocation **adapters**
- deterministic **reference executors**
- E5 Why? provenance bridge

No second registry, policy engine, or execution framework.

## Architecture

```text
Ask
 → E3 context / E2 evidence / E4 connectors
 → E5 reasoning
 → tool need identified (action or intent)
 → governed discovery + permission/certification checks
 → EngineeringToolInvocationService
 → EngineeringToolResult (immutable)
 → grounded answer + Why? + tool provenance
 → human review
```

## Contracts

`EngineeringTool`, `EngineeringToolResult`, discovery/invocation request types.

**ToolType:** DETERMINISTIC_CALCULATION · RETRIEVAL · RULE_CHECK · ANALYTICAL_MODEL · AI_ML_MODEL · QUERY · ESTIMATOR · COMPARATOR  

**Status:** AVAILABLE · UNAVAILABLE · DISABLED · DEPRECATED · UNCERTIFIED  

**Certification:** CERTIFIED · VALIDATED · EXPERIMENTAL · UNCERTIFIED  

**Output kinds:** CALCULATED · CHECKED · ESTIMATED · PREDICTED · RETRIEVED · FAILED · INCOMPLETE  

## Reference tools (executable fixtures)

| toolId | Type | Certification |
|--------|------|---------------|
| `eos.rectangle_area` | DETERMINISTIC_CALCULATION | VALIDATED |
| `eos.document_title_comparator` | COMPARATOR | VALIDATED |
| `eos.material_length_estimator` | ESTIMATOR | EXPERIMENTAL |
| `eos.evidence_keyword_check` | RULE_CHECK | CERTIFIED |

Architectural capability slots (Structural Calculator, FEA Query, etc.) are registered as **UNAVAILABLE / capability-only** — not fake calculators.

## Governance

- No autonomous engineering approval (`reviewRequired: true`)
- LLM cannot fabricate `EngineeringToolResult`
- Uncertified/experimental blocked on `requireCertifiedPath`
- Explicit units required where `unitRequired`
- Missing inputs → INCOMPLETE (request information)
- Timeout/error → fail closed, no substitute results
- Immutable frozen result + input/output hashes

## Ask UX

Actions: **Run check · Compare · Verify · Estimate · Analyse**  
Input panel collects critical inputs/units before invocation. Registry internals not exposed.

## Known limitations

- In-process reference executors only (no live CalculiX/ETABS in E6 Ask path)
- Platform registry bridge optional for permission/logUsage
- Capability-only catalog entries remain unavailable until real tools exist

## E7 readiness

Governed discovery/invocation + Ask actions ready for deeper Tool Registry UX / durable admin. **Do not start E7 automatically.**
