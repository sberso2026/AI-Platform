# Engineering OS Phase E5 — Engineering Reasoning, Evidence & Explainability

**Status:** Complete  
**Baselines:** E0 `a9650d3` · E1 `2752e1a`/`296a06e` · E2 `20a2c2f` · E3 `e011f6d` · E4 `c50a2d9`  
**Roadmap note:** Earlier E0 roadmap labelled E5 as “Document intelligence hardening”. This phase **redefines E5 as Engineering Reasoning & Explainability**. Document hardening may follow in a later phase.

## Goal

Upgrade Ask from grounded retrieval to **evidence-based engineering reasoning** while preserving human engineering authority.

## Core flow

```text
Ask
 → E3 ContextResolver
 → E2 native retrieval
 → E4 eligible connector evidence (optional)
 → evidence assessment
 → applicable rule/tool/intelligence lookup (reuse only — no new rules engine)
 → grounded engineering response
 → concise Why? explanation
 → human action/review
```

## Ownership

E5 owns reasoning/explainability contracts and Ask composition.  

E5 does **not** own: tools, KG, memory, connectors, PI/II/AI/PC/DT/EMI engines.

Reuses Project Controls explainability semantics (Explanation ≠ CoT; Traceability ≠ approval).

## Contracts

- `EngineeringReasoningRequest` / `EngineeringReasoningResponse`
- Basis: EVIDENCE_BASED · DERIVED · ASSUMED · INSUFFICIENT_EVIDENCE · CONFLICTING · UNKNOWN
- Modes: explain · compare · summarise · identify_gaps · derive_supported_conclusion · recommend_next_action
- `EngineeringWhyExplanation` — finding, key evidence, rule/tool basis, assumptions, uncertainty, authority
- Authority: ADVISORY · REQUIRES_HUMAN_REVIEW · ABSTAINED · INSUFFICIENT_AUTHORITY

## Rules

- Client-specific claims must be evidence-grounded
- Fact / inference / assumption remain distinct
- No fabricated standards, revisions, approvals, calculations, citations, or confidence
- Missing/conflicting evidence reduces certainty or abstains
- No hidden CoT / platform internals
- AI remains advisory; no autonomous approval
- Confidence omitted when no valid basis

## Evidence handling

- Preserves E2/E4 provenance (`engineering_os_native` | `connector_external`)
- Retains superseded evidence when material (never hides)
- Surfaces conflicts; does not silently pick a winner without authority/revision justification
- Connector UNKNOWN permissions never treated as trusted

## Why? UX (`/engineering/ask`)

Concise default + expandable details:

1. Answer / finding  
2. Why? (basis, rules/models/tools, assumptions, authority)  
3. Sources  
4. Limitations / conflicts  
5. Suggested actions (always `requiresHumanReview`)

## Failure model

Reasoning provider failure → **deterministic retrieval-grounded answer** (`degradedToRetrievalOnly`), never fabricated authority.

## Performance

- Bounded evidence (default 12)
- No full-corpus prompt stuffing
- Timing: `evidenceAssemblyMs`, `reasoningMs`, `totalMs`

## Packages

- `packages/engineering-os/src/phase-e5/`
- `services/grounded-ask.ts` — composes E5 after retrieval
- `apps/web/.../ask-engineering-shell.tsx` — Why? UI

## Known limitations

- Deterministic reasoning first; LLM refine optional and fail-closed
- No new governed rules engine — discloses when none apply
- Does not perform formal calculation/design verification
- Document body extraction still E2-limited

## E6 readiness

Reasoning + Why? contracts ready for Memory/KG publish composition. **Do not start E6 automatically.**
