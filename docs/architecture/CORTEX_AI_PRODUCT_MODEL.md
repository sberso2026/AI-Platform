# Cortex AI — Product Model

**Phase:** 7A — Platform Core Separation and Production Closure  
**Product name:** Cortex AI (provisional platform brand for the shared RTB AI Platform)

## Hierarchy (locked)

```text
Cortex AI Platform
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

- One customer installs **one** Cortex AI Platform tenant.
- The same tenant may install **one or more** Operating Systems.
- Do **not** create one platform instance per OS.
- Applications install under an OS; features are not separate commercial platforms.

## Non-goals (Phase 7A)

- Building Business OS
- Adding Engineering OS business features
- Weakening Phase 5 commerce / installation / release governance
- Making Microsoft Teams live Graph a platform release blocker

## Related docs

- [CORTEX_AI_MULTI_OS_RUNTIME.md](./CORTEX_AI_MULTI_OS_RUNTIME.md)
- [CORTEX_AI_DATA_OWNERSHIP.md](./CORTEX_AI_DATA_OWNERSHIP.md)
- [CORTEX_AI_PLATFORM_BOUNDARY_AUDIT.md](./CORTEX_AI_PLATFORM_BOUNDARY_AUDIT.md)
- [CORTEX_AI_PACKAGING_AND_LICENSING.md](../product/CORTEX_AI_PACKAGING_AND_LICENSING.md)
