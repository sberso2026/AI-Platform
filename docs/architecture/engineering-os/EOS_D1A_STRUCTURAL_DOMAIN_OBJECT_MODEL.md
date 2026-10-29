# EOS-D1A Structural Domain Object Model

Domain foundation for the Structural discipline pack. No design-code engines, FEA, SPACE GASS live execution, connection design, optimization certification, inspection algorithms, or Digital Twin state engines.

Package decision: contracts in `@rtb/types` `structural-domain.ts`; registry/guards in `@rtb/engineering-os` `src/structural-domain/`. No new package. No D1A migration.

## Taxonomy

`STRUCTURAL_SYSTEM`, `FRAME`, `MEMBER`, `BEAM`, `COLUMN`, `BRACE`, `PLATE`, `CONNECTION`, `NODE`, `SUPPORT`, `SECTION`, `MATERIAL`, `LOAD_CASE`, `LOAD_COMBINATION`, `ANALYSIS_MODEL`, `ANALYSIS_RESULT`, `DESIGN_CHECK`, `CAPACITY_RESULT`, `UTILIZATION_RESULT`, `FOUNDATION_INTERFACE`.

Beam/column/brace/plate are member specializations (`StructuralMember.memberKind`).

## Ownership

Engineering Core still owns decisions, assumptions, actions (register), risks, issues, technical queries, lessons, plus project/asset/document/system/interface/requirement. Structural objects reference those; they do not recreate them.

Load *actions* are `LOAD_CASE` / combination components, not the Core `action` register.

External solver IDs live in `sourceSystem` / `sourceObjectId` / `solverMappingRef`. They are not the source of truth.

Digital Twin measured/inferred state is referenced only (`digitalTwinExtensionId`). Domain object ≠ twin state.

## Relationships

System → frames, members, nodes, supports, sections, materials, load cases, analysis models.

Member → start/end nodes, section, material, system.

Frame → member/node/support refs.

Support → node; optional foundation interface.

Foundation interface → structural object + reaction/combination refs; `groundContextRef` only. Geotechnical properties are not owned here.

Connection → connected objects; `designEngineImplemented = false`.

Cross-discipline links use D0 `CrossDisciplineInterface` IDs (`crossDisciplineInterfaceIds` / `interfaceRefs`).

## Lifecycle

`DRAFT` → `DEFINED` → `UNDER_ANALYSIS` → `UNDER_REVIEW` → `VALIDATED` → `APPROVED`, plus `SUPERSEDED` / `RETIRED`.

Solver success ≠ `VALIDATED` / `APPROVED`. Utilization ≤ 1 ≠ approval.

## Analysis vs result vs design check

`ANALYSIS_MODEL` is definition (including solver profile ref). `ANALYSIS_RESULT` is deterministic output class, not approved engineering output. `DESIGN_CHECK` holds separate `demandRef` and `capacityRef`. `CAPACITY_RESULT` requires provenance and `llmOriginated = false`. `UTILIZATION_RESULT` is a separate object.

## Jurisdiction readiness (D1B)

`StructuralStandardContextRef`: jurisdictionProfile, standardProfile, standardFamily, standardCode, edition, amendment, nationalAnnex, effectiveDate.

Generic objects must not contain `as4100Clause`, `eurocodeClause`, `aiscClause`, or similar. AU section catalogs (e.g. AUST300) are a `sourceCatalog` with limited `jurisdictionApplicability`, not a global default.

## AI, evidence, provenance

AI suggestions remain advisory. LLM governed numeric origination is prohibited. Autonomous approval is prohibited.

Evidence bindings reuse D0 source kinds. Provenance reuses `EosGlobalProvenanceContract`. Identities carry tenantId/workspaceId for thread/twin/solver/document/inspection linkage.

## Maturity

Structural remains `REFERENCE_PARTIALLY_IMPLEMENTED`. D1A registers domain contracts only.

## D1B dependencies

Bind every governed calculation/tool to `StructuralStandardContextRef`. Do not implement combination engines or capacity formulas in D1B until the bind invariant exists on those calculations.
