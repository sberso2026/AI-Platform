# RTB AI Platform — Product Model

**Phase:** 8A — Engineering OS Core Architecture  
**Platform name:** RTB AI Platform (commercial brand pending)

## Hierarchy (locked)

```text
RTB AI Platform
  → Operating Systems
      → Modules
          → Features / agents / tools
```

Commerce and installation lifecycle may still use the term `application_key` as a
compatibility bridge. Engineering OS product language is **Module**.

### Examples

```text
Engineering OS
  → Project Intelligence (module)
      → Documents
      → Meetings
      → Findings
      → Reports
  → Inspection Intelligence (module)
  → Project Controls (module)
  → Digital Twin (module)

Business OS
  → future modules

Fleet OS
  → future modules
```

## Installation model

- One customer installs **one** RTB AI Platform tenant.
- The same tenant may install **one or more** Operating Systems.
- Do **not** create one platform instance per OS.
- Modules install under an OS; features are not separate commercial platforms.

## Non-goals

- Building Business OS
- Weakening Phase 7B multi-OS certification
- Making Microsoft Teams live Graph a platform release blocker
- Reintroducing Cortex terminology

## Related docs

- [ENGINEERING_OS_ARCHITECTURE_PHASE_8A.md](./ENGINEERING_OS_ARCHITECTURE_PHASE_8A.md)
- [RTB_AI_PLATFORM_MULTI_OS_RUNTIME.md](./RTB_AI_PLATFORM_MULTI_OS_RUNTIME.md)
- [RTB_AI_PLATFORM_DATA_OWNERSHIP.md](./RTB_AI_PLATFORM_DATA_OWNERSHIP.md)
- [RTB_AI_PLATFORM_BOUNDARY_AUDIT.md](./RTB_AI_PLATFORM_BOUNDARY_AUDIT.md)
- [RTB_AI_PLATFORM_PACKAGING_AND_LICENSING.md](../product/RTB_AI_PLATFORM_PACKAGING_AND_LICENSING.md)
