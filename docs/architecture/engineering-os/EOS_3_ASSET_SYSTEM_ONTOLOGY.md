# EOS 3 — Asset/System Ontology

Phase: `EOS-3-DOMAIN-2-ASSET-SYSTEM-ONTOLOGY-AND-CONTEXT`  
Architecture: `FROZEN_FOR_IMPLEMENTATION_VALIDATION`

## Principle

Do **not** force:

`FACILITY > AREA > SYSTEM > SUBSYSTEM > ASSET > COMPONENT`

as one mandatory parent-child chain.

Support typed, directional, provenance-aware relationships:

| Type | Intent |
| --- | --- |
| `LOCATED_IN` | Location / physical context |
| `PART_OF_SYSTEM` | Functional system membership |
| `PART_OF_ASSET` | Physical asset composition |
| `SUPPORTS` | Structural/functional support |
| `CONNECTED_TO` | Connection |
| `SERVES` | Service relationship |
| `CONTAINS` | Containment |
| `ASSOCIATED_WITH` | Soft association |

`EOS_ASSET_ONTOLOGY_NOT_RIGID_SINGLE_TREE=PASS`

## Context kinds

- **Facility** — major operating or proposed facility  
- **Area** — subdivision of a facility  
- **System** — functional engineering system (not merely a physical container)  
- **Subsystem** — optional functional decomposition  
- **Asset** — physical or governed engineering asset (proposed or installed)  
- **Component** — optional lower-level constituent  

## Existing model audit

| Concern | Disposition |
| --- | --- |
| EOS 3.8 `eos3_operational_assets` | Extended — identity continuity preserved |
| EOS System / Interface objects | Preserved — Domain-2 SYSTEM may reference `systemObjectId` |
| Duplicate Asset model | **NO** |
| Duplicate System model | **NO** |

`EOS_EXISTING_ASSET_SYSTEM_MODEL_AUDITED=YES`  
`EOS_DUPLICATE_ASSET_MODEL_CREATED=NO`  
`EOS_DUPLICATE_SYSTEM_MODEL_CREATED=NO`

## Discipline

Discipline associations (primary / supporting / custodial / inspection) are attributes — **not** the ontology hierarchy.

Owner (Operations) ≠ engineering discipline (Structural/Mechanical).
