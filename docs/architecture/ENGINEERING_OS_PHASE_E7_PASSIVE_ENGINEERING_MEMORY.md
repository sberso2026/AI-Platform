# Engineering OS Phase E7 — Passive Engineering Memory

**Status:** Complete  
**Baselines:** E0–E6 (`952a2ae` E6)  
**Roadmap note:** Earlier E0 roadmap labelled E7 “Tool Registry UX”. This phase **redefines E7 as Passive Engineering Memory**. Tool Registry UX remains absorbed by E6 Ask actions.

## Goal

Convert normal governed engineering work into reusable organisational knowledge **without** requiring engineers to manually maintain a knowledge system.

## Principle

```
Engineering Memory remembers authoritative engineering context, evidence, decisions and outcomes —
not hidden AI reasoning.
```

Memory is **evidence/context**, never automatic authority.

## Ownership

| Concern | Owner |
|---------|--------|
| AI Memory store (`ai_memories`) | **Platform Kernel** `MemoryService` |
| Knowledge Graph | **Platform Kernel** `KnowledgeGraphService` |
| Engineering memory contracts/adapters | Engineering OS Phase E7 |

`duplicateMemoryFrameworkDetected = false` · `duplicateKnowledgeGraphDetected = false`  
No second memory store or KG.

## Memory classes

WORKING_CONTEXT · PROJECT_MEMORY · ENGINEERING_KNOWLEDGE · ORGANISATIONAL_KNOWLEDGE

## Authority states

DRAFT · OBSERVED · REVIEWED · APPROVED · SUPERSEDED · REJECTED · UNKNOWN

## Capture flow

```
governed event
 → classify candidate
 → validate authority/evidence (reject CoT / unsupported AI facts)
 → dedupe by captureHash (tenant+source+event)
 → persist via Platform Memory adapter
 → link E3 EngineeringObjectReference(s)
 → provenance/audit
```

Passive sources (when contracts exist): approved decisions, TQ dispositions, reviewed actions, lessons, E6 tool results, document/object relationships, project outcomes. Missing domain events are **not invented**.

## Promotion

WORKING_CONTEXT **must not** automatically become ORGANISATIONAL_KNOWLEDGE.  
Path: candidate → evidence/authority check → optional human review → PROJECT / ENGINEERING / ORGANISATIONAL.

## E6 tool memory

Tool results become memory only with immutable `EngineeringToolResult`, provenance, and review/authority status.  
Failed / incomplete / blocked / experimental paths **do not** auto-become approved organisational knowledge.

## Ask flow

```
Ask → E3 context → E7 relevant memory → E2/E4 evidence → E5 reasoning → optional E6 tool → grounded response
```

Why? may cite memory with original source provenance. Memory summary alone does not replace the authoritative source.

## UX

Memory is invisible infrastructure. Contextual chips only when relevant:

- Previous similar work
- Relevant precedent
- Previous decision
- Lessons
- Why was this done?

No engineer-facing Memory primary navigation. Platform `/platform/memory` remains admin/governance inspection.

## Security / retention

- Tenant / workspace / project isolation
- Source permissions propagate; revoked sources cannot leak via memory
- No hidden-memory count disclosure
- Retention: RETAIN / ARCHIVE / SOFT_DELETE / DELETE (hard delete only when policy permits)
- Cross-tenant retrieval blocked

## Performance

- Bounded retrieval (default ≤8, max 20)
- Context-aware ranking
- Capture/retrieve latency instrumented on store stats
- No whole-company memory injection into prompts
