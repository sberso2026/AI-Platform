# Inspection Intelligence — Versioning & Compatibility (Phase 9J)

## Semantic versions

| Surface | Version |
|---------|---------|
| Module | `1.0.0-ii-release` |
| Public contracts | `1.0.0` (`>=1.0.0 <2.0.0`) |
| Services | `1.0.0` per service |
| Pack SDK | `0.6.0` |
| Manifest schema | `inspection-intelligence-module-manifest/1` |

## Migration strategy

Additive minor changes preferred. Breaking changes require a major bump, dual-run window, and
documented migration notes.

## Deprecation policy

Deprecated contracts remain available for at least one minor cycle with `deprecationNotice` set
before removal in the next major.

## Backward compatibility

Consumers within published compatibility ranges continue to work. Incompatible majors are denied.

## Rollback

Restore prior module/pack/contract pins via registry rollback **without** mutating governed
inspection records.
