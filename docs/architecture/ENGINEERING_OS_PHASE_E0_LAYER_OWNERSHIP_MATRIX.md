# Engineering OS — Phase E0 Layer / Ownership Matrix

Status: Locked (E0) · Preserves Phase 14 ownership locks and V1 module freezes

## Legend

| Token | Meaning |
| --- | --- |
| OWNS | Canonical authority |
| ORCHESTRATES | Aggregates / routes without owning business logic |
| CONSUMES | Reads via public contracts / refs |
| CONNECTS | Optional adapter; never hard dependency |
| MUST_NEVER_OWN | Forbidden ownership (regression if violated) |

## Layer ownership

| Layer / concern | Owner | Notes |
| --- | --- | --- |
| Experience shells (Ask / My / Explore / Intelligence) | Engineering OS | Composition UX; capability-based visibility |
| Engineering product navigation / launcher | Engineering OS | Hide uninstalled modules by default |
| Shared projects / assets / documents / registers | Engineering OS Shared Domain | Canonical engineering context |
| Shared Spatial Domain | `@rtb/engineering-shared-spatial-domain` | DT consume-only |
| Project Intelligence domain | `@rtb/project-intelligence` | EOS MUST_NEVER_OWN |
| Inspection Intelligence domain | `@rtb/inspection-intelligence` | EOS MUST_NEVER_OWN |
| Asset Intelligence domain | `@rtb/asset-intelligence` | EOS MUST_NEVER_OWN |
| Project Controls domain | `@rtb/project-controls` | EOS MUST_NEVER_OWN |
| Digital Twin domain | `@rtb/digital-twin` | EOS MUST_NEVER_OWN |
| Model Interoperability domain | `@rtb/engineering-model-interoperability` | EOS MUST_NEVER_OWN |
| Engineering Reasoning / AI Workspace policies | Engineering OS + Platform AI Runtime | Feature entitlement `ai_assistant`; advisory |
| Tool Registry / ETF | Platform / Engineering Tool Framework | Solver adapters fail-closed |
| Knowledge Graph **infrastructure** | Platform | Domain facts published via contracts |
| Engineering Memory (product semantics) | Engineering OS + modules | No duplicate KG infrastructure |
| Identity / tenants / seats / commerce | Platform | Connectors never replace Platform Identity |
| Native search / RAG / document intelligence | Platform + Engineering OS services | Required for ESSENTIAL profile |
| AI-provider abstraction | Platform AI Runtime | Vendor adapters behind interface |
| Storage (files/objects) | Platform Files | Tenant-scoped |
| Workflow / event bus | Platform | Modules publish/consume contracts |
| M365 / Google / SAP / Fabric / DMS / GIS adapters | Platform Connectors | Optional; CONNECTS only |
| External ERP/CMMS/DMS authoritative records | External SoR | Reference + mapping; see SoR policy |

## Cross-module rules (unchanged)

- Public contracts / events only — `privateCrossModuleCouplingDetected = false`
- No duplicate asset / project / spatial / KG / workflow / ETF ownership
- II / AI / DT consume Shared Asset Domain identity; they do not own it
- Interop binds to DT via public contracts only
- Commercial solver execution remains client-licensed / not RTB-certified where locked

## Experience → Intelligence mapping

| Experience action | Typical owners invoked |
| --- | --- |
| Ask: “open risks for project X” | EOS context + PI / Core registers |
| Ask: “condition of asset Y” | Shared Asset + Asset Intelligence |
| Ask: “inspection findings” | Inspection Intelligence |
| Explore documents | Shared documents + PI document intelligence (if installed) |
| Intelligence hub | Installed module launcher only |
