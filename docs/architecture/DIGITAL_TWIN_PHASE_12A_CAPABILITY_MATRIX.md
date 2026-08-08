# Digital Twin — Phase 12A Capability Matrix

Status: discovery · `productionDigitalTwinReady = false`

## Capability matrix

| Capability | Discovery | Runtime | Notes |
| --- | --- | --- | --- |
| Architecture lock | true | n/a | ownership matrix + terminology |
| Version constants | true | n/a | `0.1.0-discovery` |
| Draft public contracts | true | false | `0.1.0-draft` only |
| Kernel twin tables | preserve | n/a | PRESERVE foundation |
| Twin registration service | preserve | rebind 12B | kernel `DigitalTwinService` |
| Auto twin on asset create | documented | rebind 12B | `core-services.ts` |
| Module registry entry | stub | false | `coming_soon` |
| Product UI | false | false | no `/engineering/apps/digital-twin` |
| Live telemetry | false | false | `LIVE_TELEMETRY_IMPLEMENTED = false` |
| simulation | false | false | `SIMULATION_EXECUTION_IMPLEMENTED = false` |
| 3D viewer | false | false | `THREE_D_VIEWER_IMPLEMENTED = false` |
| SHM runtime | false | false | boundary doc only |
| Digital thread persistence | false | false | model doc only |
| Physical actuation | false | false | disabled |
| Automatic control | false | false | disabled |
| Own AI stack | false | false | consumes II/PI/AI contracts |

## Module boundaries

| Module | Twin relationship |
| --- | --- |
| Asset Intelligence | consumes advisory slices |
| Inspection Intelligence | consumes inspection history |
| Project Intelligence | consumes knowledge refs |
| Project Controls | consumes frozen V1 advisory context |
| SHM | consumes sensor streams |
| Platform kernel telemetry | consumes event refs |

## Commerce

Entitlement placeholders exist (`digital_twin.execute` permission seed). No GA
packaging or module enable in Phase 12A.
