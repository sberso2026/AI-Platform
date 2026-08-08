# ADR — Linear Referencing Boundary

Status: Accepted (Phase 12L discovery) · Date: 2026-08-09

## Context

Inventory finds **zero** chainage/stationing/linear-reference SQL or runtime in the
repo. Some infrastructure domains will need linear refs later.

## Decision

- Linear referencing is **RESERVED** under Shared Spatial Domain draft contracts
  (`LinearReferenceReservation`)
- No linear referencing runtime, tables, or analytics in Phase 12L
- Chainage/station fields in draft types are placeholders with `reserved: true`

## Consequences

- `spatialAnalyticsImplemented=false` covers linear measure analytics as well
- Implementation deferred to a later phase after location/CRS registers exist
