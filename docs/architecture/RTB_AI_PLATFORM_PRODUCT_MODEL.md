# RTB AI Platform — Product Model

**Phase:** 7A — Platform Core Separation and Production Closure  
**Platform name:** RTB AI Platform (commercial brand pending)

## Hierarchy (locked)

```text
RTB AI Platform
  → Operating Systems
      → Applications
          → Features / agents / tools
```

### Examples

```text
Engineering OS
  → Project Intelligence
      → Documents
      → Meetings
      → Findings
      → Reports
  → Inspection Intelligence (future)
  → Project Controls (future)

Business OS
  → future applications

Fleet OS
  → future applications
```

## Installation model

- One customer installs **one** RTB AI Platform tenant.
- The same tenant may install **one or more** Operating Systems.
- Do **not** create one platform instance per OS.
- Applications install under an OS; features are not separate commercial platforms.

## Non-goals (Phase 7A)

- Building Business OS
- Adding Engineering OS business features
- Weakening Phase 5 commerce / installation / release governance
- Making Microsoft Teams live Graph a platform release blocker

## Related docs

- [RTB_AI_PLATFORM_MULTI_OS_RUNTIME.md](./RTB_AI_PLATFORM_MULTI_OS_RUNTIME.md)
- [RTB_AI_PLATFORM_DATA_OWNERSHIP.md](./RTB_AI_PLATFORM_DATA_OWNERSHIP.md)
- [RTB_AI_PLATFORM_BOUNDARY_AUDIT.md](./RTB_AI_PLATFORM_BOUNDARY_AUDIT.md)
- [RTB_AI_PLATFORM_PACKAGING_AND_LICENSING.md](../product/RTB_AI_PLATFORM_PACKAGING_AND_LICENSING.md)
