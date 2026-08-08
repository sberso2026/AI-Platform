# Digital Twin Framework

> **Phase 12A discovery lock** — Architecture, ownership, and draft contracts are
> locked in Phase 12A (`0.1.0-discovery`). Start with
> [DIGITAL_TWIN_PHASE_12A_DISCOVERY.md](./DIGITAL_TWIN_PHASE_12A_DISCOVERY.md).
> No runtime, telemetry ingestion, simulation, or 3D viewer ships in 12A.
> Kernel tables below are **PRESERVE** foundation; auto-create rebinds in 12B+.

## Overview

Neutral digital twin registry used by Industrial OS, Fleet OS, Infrastructure OS, Smart Building OS, Smart City OS, and Autonomous Systems OS.

## Twin Types (system)

asset, equipment, building, vehicle, infrastructure, facility, system, city_zone, robot, sensor

## Tables

- `digital_twins` — Core registry with optional `knowledge_node_id` link
- `digital_twin_relationships` — Twin-to-twin relationships
- `digital_twin_attributes` — Key-value attributes with units
- `digital_twin_status_history` — Status change audit trail

## Rules

- Tenant-scoped with RLS
- Linkable to knowledge graph nodes
- Metadata-ready for future live telemetry (no streaming in Phase 1.5)
- Sensors can link to twins via `sensors.digital_twin_id`
