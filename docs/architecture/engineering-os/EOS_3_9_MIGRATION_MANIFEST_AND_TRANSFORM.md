# EOS 3.9 Migration Manifest and Transform

## Manifest

Immutable migration manifest includes:

- migration ID
- source project / generation / version
- target generation / version
- source object and relationship counts
- migration policy version
- transformations
- preserved / skipped / deferred objects
- qualification states
- hashes / fingerprints
- authorized actor
- timestamp
- rollback reference

## Object mapping (EOS 3.2)

Each canonical type is classified:

- `DIRECT_MAP`
- `EXTENDED_MAP`
- `TRANSFORM`
- `DEFER`
- `UNSUPPORTED`

No object disappears silently.

## Preservation

- Revisions remain historically traceable (not latest-only).
- Frozen EOS 2 baselines stay immutable and referenceable.
- Human decisions retain actor, authority, date, rationale, evidence, revision context.
- Assumptions, interfaces (source/receiver authority), deliverables (approval/release) preserved.
- Qualification: D1 stays `QUALIFIED_BOUNDED` where already bounded; non-D1 `NOT_QUALIFIED`; external solver not globally qualified. Migration does not broaden qualification.
- AI drafts/recommendations remain correctly classified (never promoted to human decision).
- Event/audit history preserved without re-executing historical events.
- Provenance and external DMS/solver references preserved.
- Project-to-asset mapping only per EOS 3.8 rules; no fabricated continuity.

## Workflow policy

Stable completed states map directly. Active unsupported states block or require controlled normalization.
