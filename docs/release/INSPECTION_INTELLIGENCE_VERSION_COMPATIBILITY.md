# Inspection Intelligence — Version & Compatibility (GA)

## Version
**1.0.0** = GA baseline (tag `inspection-intelligence-v1.0.0`)

| Change | Rule |
|--------|------|
| PATCH | Backward-compatible fixes |
| MINOR | Backward-compatible feature additions |
| MAJOR | Breaking public-contract or compatibility changes |

## Compatibility surfaces
- Schema, public contracts, SDK, packs, models, policies, module manifest
- Pack majors denied without compat review
- Model/policy unknown versions fail closed
- Rollback restores pins without silent governed-record mutation
- Deprecation window: ≥1 minor cycle with notice

Authoritative policy module: `domain/versioning-compatibility.ts`
