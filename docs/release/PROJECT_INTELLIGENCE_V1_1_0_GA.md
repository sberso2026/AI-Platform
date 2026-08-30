# Project Intelligence V1.1.0 Production GA

**Version:** `1.1.0`  
**Release tag:** `project-intelligence-v1.1.0`  
**Policy:** `docs/architecture/adr/ADR_APPLICATION_RELEASE_IDENTITY.md`  
**Identity:** `docs/release/PROJECT_INTELLIGENCE_RELEASE_IDENTITY.md`

Certified product baseline: `0787cb620c52b265d031b0dabd43432adbc32fbc`  
Release identity: `8d1168bb67904f84591915b5d8da27d95061eb41`  
Historical V1 (immutable): `project-intelligence-v1.0.0` → `34975b1cf660580d46287f24e746b8915903f768`

## Inheritance

Product certification at the 0787cb6 baseline remains in force. The identity
commit and this GA record do not change schema or product behavior.

## Limitations (not blockers)

| Class | Status |
|---|---|
| Durable historical report snapshots | POST_GA_CAPABILITY |
| PDF export | POST_GA_CAPABILITY |
| Live connector execution | PREVIEW_SEPARATE_CERTIFICATION |
| Shared authenticated route/client wall latency | GA_LIMITATION |
| Catalog/plan mismatch | CLOSED |

## Next

Do not start PI-11 as part of this GA. Promotion creates the annotated tag
`project-intelligence-v1.1.0` once; it never retargets V1.
