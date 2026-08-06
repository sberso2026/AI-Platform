# Inspection Intelligence — Spatial and Time Models

**Phase:** 9A · Architecture only

## Spatial reference model

Inspection always occurs somewhere. Supported reference kinds:

Site, Facility, Building, Area, Zone, Room, Floor, Grid, Elevation, GPS, Coordinate System, Drawing Coordinate, BIM Object, Digital Twin Node, Asset, Equipment, Location Hierarchy.

Future: GIS compatibility (reserved).

### Rules

- Prefer Engineering OS location / asset / equipment IDs when available.
- GPS and drawing coordinates are attributes on sessions/observations, not a private GIS product.
- Digital Twin Node and BIM Object are **references**, not owned twin models.

## Time model

### Session / plan timestamps

planned, scheduled, started, paused, resumed, completed, approved, verified, closed.

### Recurrence & predictive (reserved)

- recurrence rules, inspection interval, inspection calendar
- next inspection / next due
- remaining life (input to future Asset Intelligence — not owned here)
- predictive scheduling (future; Platform AI / analytics — not private scheduler)

## Mobile-first architecture (reserved — no implementation)

Offline Mode, Tablet, Phone, Camera, QR Code, Barcode, GPS, Voice, Touch, Digital Signature, Photo Annotation, Sketch, Synchronization, Conflict Resolution.

Sync must target the same Inspection Intelligence APIs and Platform Files; conflict resolution is an extension point for later phases.
