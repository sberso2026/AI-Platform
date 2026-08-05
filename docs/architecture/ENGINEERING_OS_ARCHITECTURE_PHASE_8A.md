# Engineering OS — Core Architecture (Phase 8A)

**Platform:** RTB AI Platform  
**Operating System:** Engineering OS (first commercial OS)

## Hierarchy

```text
RTB AI Platform
  → Operating Systems
      → Modules
          → Features
```

Engineering OS hosts modules. Modules must not bypass Engineering OS for navigation,
routes, permissions, workspace visibility, search, AI, or events.

## Initial modules

| Module key | Name | Status |
|------------|------|--------|
| `project_intelligence` | Project Intelligence | Production (Phase 8B) |
| `inspection_intelligence` | Inspection Intelligence | Coming soon |
| `project_controls` | Project Controls | Coming soon |
| `digital_twin` | Digital Twin | Coming soon |

Commerce may still use `application_key` for installs; Engineering OS product language is **Module**.

## Shared Engineering Domain Model

Owned by Engineering OS Core (no duplicate ownership across modules):

Projects, Assets, Disciplines, Packages, Companies, People, Documents, Drawings, Equipment, Locations, Tags.

## Shell

- Dashboard (`data-testid="engineering-os-shell"`)
- Module launcher (`/engineering/modules`)
- Global engineering search
- AI workspace
- Cross-module navigation via install-gated Eng OS nav

## Shared services

Document references, timelines, attachments, comments, approvals, version history, audit, reporting, AI context.

## Engineering AI framework

Knowledge retrieval, evidence grounding, citations, human approval, cost controls, prompt registry, capability registry.

Modules consume shared AI interfaces — independent AI stacks are forbidden.

## Registration

`EngineeringModuleRegistry` in `@rtb/engineering-os` — register navigation, routes, permissions, workspace visibility, search providers, AI capabilities, event handlers.

## Related

- [RTB_AI_PLATFORM_PRODUCT_MODEL.md](./RTB_AI_PLATFORM_PRODUCT_MODEL.md)
- [PROJECT_INTELLIGENCE_PHASE_8B.md](./PROJECT_INTELLIGENCE_PHASE_8B.md)
- Package: `@rtb/engineering-os`
