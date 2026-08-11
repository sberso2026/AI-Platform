# Engineering OS — Production Architecture

**Status:** E12 certified (links canonical architecture; does not replace locked V1 matrices)  
**Baseline:** E11 `fc871d4`

## Canonical sources (do not duplicate)

| Topic | Canonical doc |
|-------|----------------|
| Product architecture (E0) | [ENGINEERING_OS_PHASE_E0_PRODUCT_ARCHITECTURE.md](./ENGINEERING_OS_PHASE_E0_PRODUCT_ARCHITECTURE.md) |
| Layer ownership | [ENGINEERING_OS_PHASE_E0_LAYER_OWNERSHIP_MATRIX.md](./ENGINEERING_OS_PHASE_E0_LAYER_OWNERSHIP_MATRIX.md) |
| V1 ownership | [ENGINEERING_OS_V1_OWNERSHIP_MATRIX.md](./ENGINEERING_OS_V1_OWNERSHIP_MATRIX.md) |
| Product boundary | [ENGINEERING_OS_PRODUCT_BOUNDARY.md](./ENGINEERING_OS_PRODUCT_BOUNDARY.md) |
| SoR policy | [ENGINEERING_OS_PHASE_E0_SYSTEM_OF_RECORD_POLICY.md](./ENGINEERING_OS_PHASE_E0_SYSTEM_OF_RECORD_POLICY.md) |
| Connector boundary | [ENGINEERING_OS_PHASE_E0_CONNECTOR_BOUNDARY.md](./ENGINEERING_OS_PHASE_E0_CONNECTOR_BOUNDARY.md) |

## Production posture (E12)

Engineering OS is a **vendor-neutral Engineering Intelligence Layer**:

- Native Ask / retrieval / reasoning / tools / memory / actions / intelligence routing
- Enterprise connectors and Copilot federation are **optional adapters**
- No duplicate KG, memory, tool registry, workflow engine, or intelligence registry
- Provider implementations remain adapters (`VendorNeutralLogicalArchitecture`)

Machine-readable audit: `runArchitectureOwnershipAudit()` in `@rtb/engineering-os` phase-e12.

See [ENGINEERING_OS_E12_CERTIFICATION.md](./ENGINEERING_OS_E12_CERTIFICATION.md).
