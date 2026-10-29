# Asset Intelligence — Hierarchy Model

Single canonical asset identity may participate in **multiple typed, versionable hierarchy views**:
physical, functional, system, equipment, component, location, process, maintenance, inspection, Digital Twin reference.

Do **not** duplicate the asset to represent each hierarchy.

Examples: Plant→Area→System→Equipment→Component; Building→Level→Zone→Asset; Bridge→Span→Girder→Connection; Pipeline→System→Segment→Component.

Source: `packages/asset-intelligence/src/architecture/hierarchy.ts`
