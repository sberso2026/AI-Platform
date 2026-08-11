# Engineering OS Phase E3 — Canonical Engineering Context & Relationship Model

**Status:** Complete (contract + resolver + E2 Ask enrichment)  
**Baselines:** E0 `a9650d3` · E1 `2752e1a`/`296a06e` · E2 `20a2c2f`  
**Roadmap note:** Earlier E0 roadmap labelled E3 as “My Engineering”. This phase **redefines E3 as Canonical Context**. Experience “My” surfaces remain E1; E4+ may deepen personalisation.

## Goal

Move Engineering OS from grounded record search toward **engineering-context intelligence** by establishing a vendor-neutral model for:

- what engineering object is this?
- what is related to it?
- where did the relationship come from?
- how certain is the identity/relationship?

**Non-goals:** second Knowledge Graph; transferring KG ownership into Engineering OS; SAP/connectors; fabricating future domain modules.

## Core principle

```
External-system record  ≠  Engineering OS engineering object
```

Engineering OS maintains **canonical context + references**. Source systems remain authoritative for their owned records.

## Ownership / non-regression

E3 owns only:

- canonical domain context contracts
- identity mapping semantics
- relationship semantics
- bounded context assembly for Engineering OS

E3 does **not** own PI / Asset Intelligence engines / II / Decision-Risk-Assurance engines / KG platform / Engineering Memory / Tool Registry / connector framework / external SoR data / document control authority.

Reuse existing domain entities (projects, assets, documents, registers). **No duplicate tables.**

## Architecture

```text
External systems
      ↓ refs / mappings (native/mock in E3)
Canonical Engineering Objects
      ↓ relationships (FK + engineering_object_links)
Engineering Context Resolver
      ↓ bounded EngineeringContextBundle
Engineering Retrieval / Ask (E2 path, context-enriched)
```

## Object identity model

`EngineeringObjectReference` — extensible `objectType` taxonomy.

**Implemented now:** PROJECT, ASSET, DOCUMENT, DECISION, ACTION, RISK, ISSUE, TECHNICAL_QUERY, LESSON  

**Future-registrable (types only — no fake routes/modules):** DRAWING, REQUIREMENT, CALCULATION, RFI, INSPECTION, FINDING, DEFECT, MEASUREMENT, INTERVENTION, WORK_ORDER_REFERENCE, EQUIPMENT, LOCATION, …

## External mapping model

`ExternalIdentityMapping` with `MappingStatus`:

| Status | Meaning |
|--------|---------|
| MATCHED | Confirmed / steward-verified |
| PROBABLE_MATCH | Candidate; not silently merged |
| UNRESOLVED | Seen but not linked |
| CONFLICTING | Same external id → different canonical objects |

Rules:

- multiple external IDs → one canonical object allowed
- never silently merge conflicts
- confidence omitted / null when no valid scoring basis
- external data remains externally authoritative

`EngineeringIdentityReconciliationService` — list unresolved/probable/conflicting; confirm / reject / mark unresolved; permissioned + auditable.

## Relationship semantics

`EngineeringRelationship` with controlled extensible types, including:

BELONGS_TO_PROJECT, RELATES_TO, REFERENCES, AFFECTS, DERIVED_FROM, SUPPORTED_BY, RESULTED_IN, RESOLVES, ADDRESSES, HAS_ACTION, HAS_DECISION, HAS_RISK, HAS_ISSUE, HAS_TECHNICAL_QUERY, HAS_DOCUMENT, HAS_ASSET, HAS_LESSON, PARENT_OF

**States:** CONFIRMED · INFERRED · PROPOSED · CONFLICTING · UNKNOWN  

Inferred relationships must never be presented as confirmed.

Edges are **derived** from existing FKs / object links (no major DB migration). Keyword co-occurrence **never** creates relationships.

## Provenance model

Every mapping/relationship carries `EngineeringProvenance`:

- source type / id
- mechanism: RULE | MODEL | RETRIEVAL | USER | IMPORT | SYSTEM
- actor (human only when actually human)
- rule/model/tool version when generated
- timestamp + evidence refs

Machine-created edges use SYSTEM/RULE/MODEL — never claim human authority.

## Context resolution flow

`EngineeringContextResolver`:

1. validate tenant/workspace/user context  
2. resolve explicit object if present  
3. resolve active project  
4. load authorised relationships (bounded depth)  
5. determine related objects  
6. preserve ambiguity/conflict  
7. produce `EngineeringContextBundle`

**ContextState:** RESOLVED · PARTIAL · AMBIGUOUS · CONFLICTING · INSUFFICIENT · UNKNOWN  

Hard limits (default): maxRelatedObjects=40, maxRelationships=80, maxDepth=2. No unbounded graph walk; no whole-project hydration for every Ask.

Unauthorized objects/relationships/mappings are **omitted silently** (no “N hidden related…” side channel).

## SoR boundary

| Layer | Authority |
|-------|-----------|
| External ERP/CMMS/etc. | Source-of-record for their records |
| Engineering OS domain tables | Canonical engineering objects already owned by EOS |
| E3 mappings/relationships | Context/reference layer — not a second SoR copy of SAP |

## Progressive reconciliation

Stewards reconcile via API (`EngineeringIdentityReconciliationService`). Normal engineers are not forced into reconciliation UX during Ask/work.

## E2 retrieval integration

```text
Before (E2):
Ask → query → EngineeringRetrievalService → EngineeringSearchService → evidence

After (E3):
Ask → EngineeringContextResolver → EngineeringContextBundle
    → enriched EngineeringSearchQuery (relatedObjectIds)
    → EngineeringRetrievalService → EngineeringSearchService → evidence
```

- contextual expansion only within authorised boundaries  
- lexical search remains available  
- no semantic provider / connector dependency  
- resolver failure → safe degrade to E2  
- prefer explicit HAS_* relationships for “show related actions” etc.  

Document body extraction remains **out of scope** (E2 limitation preserved).

## Security model

Mandatory isolation: tenant · workspace · project · object · relationship.  
Adversarial coverage: unauthorized related object; cross-tenant link attack; no hidden-count disclosure.

## Ambient relationship creation

When domain creates already know FKs (decision in project, action linked to decision), edges are derived at resolve time (`ambientRelationshipsFromCreate` / FK assembler). Generic attachments without known semantics stay `RELATES_TO` only.

## Packages / entry points

- `packages/engineering-os/src/phase-e3/contracts.ts`
- `canonical-context-assembler.ts`
- `canonical-context-resolver.ts`
- `canonical-context-reconciliation.ts`
- `ask-context-bridge.ts`
- `services/supabase-context-provider.ts`
- `services/grounded-ask.ts` (E3 enrichment + E2 fallback)

## Known limitations

- No SAP/enterprise connector implementation in E3  
- No second KG store; KG platform ownership unchanged  
- Relationships derived; not a full graph DB  
- Document body extraction still metadata-limited  
- Reconciliation UI is API-first / minimal  

## E4 readiness

E3 establishes canonical context for future Ask reasoning, Engineering Memory composition, and tool/agent context injection. **Do not start E4 automatically.**
