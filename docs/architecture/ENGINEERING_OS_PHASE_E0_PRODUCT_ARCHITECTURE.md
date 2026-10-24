# Engineering OS — Phase E0 Product Architecture

Status: Locked (E0) · `EngineeringIntelligenceLayerContractLocked = true`  
ADR: `docs/architecture/adr/ADR_ENGINEERING_INTELLIGENCE_LAYER_E0.md`  
Preserves: Engineering OS V1.0 GA (`engineering-os-v1.0.0`) and certified module tags

## Product principles (locked)

1. Engineering OS sits **above** client tools / systems of record.
2. Do not duplicate authoritative data unnecessarily.
3. Native AI/search must work **without** client Copilot, SAP, Fabric, or data lake.
4. Enterprise systems are **optional connectors**, never hard dependencies.
5. **Assistant-first** UX; structured modules remain available.
6. Platform complexity is **hidden** from normal engineers.
7. Conversation is interface → engineering context is intelligence → governed tools perform
   work → evidence establishes trust → **humans retain engineering authority**.
8. AI recommendations are **advisory** unless explicitly governed otherwise.
9. Missing / conflicting / partial evidence must be represented — **never fabricated**.
10. Governance is **ambient** (provenance / audit / versioning with minimal friction).
11. **Vendor-neutral** logical architecture; cloud/AI vendors are adapters.
12. Support progressive deployment (small consultancy → enterprise).
13. No mandatory SAP / M365 / Copilot dependency.
14. Existing external systems remain systems of record where authoritative.
15. Engineering OS owns **canonical engineering context/intelligence**, not arbitrary
    copies of external systems.
16. Engineer-facing features should reduce search, clicks, duplicate entry, or context
    switching where practical.

## Target layers

```
Experience
  Ask Engineering OS · My Engineering · Explore · Intelligence
        │
Engineering Domain (canonical shared + module-consumed)
  projects · assets · documents/drawings · requirements · TQs/RFIs
  decisions/actions · risks/issues · inspections · calculations
        │
Engineering Intelligence (certified / future modules)
  Engineering Reasoning Assistant
  Project Intelligence · Asset Intelligence · Inspection Intelligence
  Decision / Risk / Assurance / Explainability intelligence
        │
Engineering Capability
  Tool Registry · governed engineering tools
  Engineering Memory · Knowledge Graph · agent/runtime orchestration
        │
Native Services (zero-connector capable)
  search/RAG · document intelligence · AI-provider abstraction
  storage · identity · workflow/event services
        │
Enterprise Integration (optional)
  M365/SharePoint/Teams/email · Google Workspace
  SAP/Maximo/IFS/Pronto · Fabric/data platforms
  DMS/GIS/digital twins · generic REST/file/database adapters
```

## Relationship to V1 composition shell

Phase 14 locked Engineering OS as the **composition and governance shell** that must
never own PI/II/AI/PC/DT/EMI business logic. E0 **does not reverse** that decision.

E0 clarifies that the shell + shared domain + native services together form the
**Engineering Intelligence Layer** product: engineers interact primarily via Experience
surfaces; modules remain the owners of certified intelligence domains.

## Experience surfaces (target)

| Surface | Intent |
| --- | --- |
| Ask Engineering OS | Assistant-first entry; retrieves context; proposes advisory actions; invokes governed tools |
| My Engineering | Personal work queue: assigned actions, reviews, TQs, inspections, recent context |
| Explore | Search / browse projects, assets, documents, registers without module sprawl |
| Intelligence | Launch installed intelligence modules and cross-module insights |

Structured module routes (`/engineering/apps/*`) remain available for specialists and
for certification/Release detail.

## Deployment profiles (summary)

| Profile | Intent |
| --- | --- |
| ESSENTIAL | Native Engineering OS only; no enterprise AI/connectors required |
| PROFESSIONAL | Cross-project/company intelligence + selected integrations |
| ENTERPRISE | Federated enterprise systems + advanced governance/integration |

Full contract: `ENGINEERING_OS_PHASE_E0_DEPLOYMENT_PROFILES.md`.

## Compatibility

- V1 public contracts remain frozen.
- Certified module ownership matrices remain authoritative.
- Connectors normalize into domain contracts; they do not become second owners.
