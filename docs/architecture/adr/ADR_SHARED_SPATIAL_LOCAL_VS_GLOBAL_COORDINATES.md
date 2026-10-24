# ADR — Local vs Global Coordinates

Status: Accepted (Phase 12L discovery) · Date: 2026-08-09

## Context

Engineering models often use local project/site frames while enterprise views need
global CRS (EPSG). Twin spatial refs already allow `zoneRef` / `levelRef` and unit
system without defining a local-frame registry.

## Decision

- **Global CRS** identity is governed by Shared Spatial Domain CRS refs
- **Local frames** (site/grid/building) are REFERENCE concerns of Shared Spatial Domain
  but are **not implemented** in 12L
- Declared transforms between local and global frames follow CRS governance rules;
  execution remains forbidden
- Residual TEXT locations are not a substitute for either frame

## Consequences

- Draft `SpatialReference` may carry `localFrameId` optionally
- No automatic local↔global conversion
- Future register may bind location → default CRS + optional local frame
