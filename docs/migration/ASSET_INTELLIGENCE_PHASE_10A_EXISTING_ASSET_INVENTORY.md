# Asset Intelligence Phase 10A — Existing Asset Inventory

**Status:** Discovery only · No production migration  
**Date lock:** Phase 10A

## Classification legend
`canonical` · `shared-domain` · `intelligence` · `compatibility` · `legacy` · `duplicate` · `candidate-ai` · `future-twin` · `future-maintenance` · `unknown`

## Inventory

| Surface | Path / identity | Classification |
|---------|-----------------|---------------|
| EngineeringAsset type | `packages/types/src/engineering.ts` | canonical |
| engineering_assets table | `supabase/migrations/20260203000000_batch_20_engineering_tables.sql` | canonical |
| engineering_asset_types | same migration | canonical |
| EngineeringAssetService | `packages/engineering-os/src/services/core-services.ts` | canonical |
| Assets UI/API | `apps/web/.../engineering/assets/*`, `api/engineering/assets` | canonical |
| Shared domain ownership doc | `docs/architecture/ENGINEERING_OS_SHARED_DOMAIN_OWNERSHIP.md` | shared-domain |
| EngineeringEquipment / Location types | `packages/types/src/engineering-domain.ts` | shared-domain (typed; limited SQL) |
| EngineeringAssetRef | `packages/engineering-os/src/domain-sdk` | shared-domain |
| PI AssetAdapter | `packages/project-intelligence/.../engineering-core-adapters.ts` | intelligence (consume Core) |
| PI findings assetId | PI findings / documents | intelligence |
| II AssetReference | `packages/inspection-intelligence/src/architecture/asset-reference.ts` | intelligence (ref only) |
| II InspectionTarget | `.../inspection-target.ts` | intelligence |
| II public contracts ii.asset.reference / observation.feed | `public-module-contracts.ts` @ 1.0.0 | intelligence |
| II AI consumer fixture | `consumer-contracts.ts` ownership none | candidate-ai |
| II Twin consumer fixture | same | future-twin |
| digital_twins tables | kernel migrations | future-twin |
| Digital Twin module | module-registry `coming_soon` | future-twin |
| KG node types asset / engineering_asset | seed migrations | shared-domain / compatibility |
| asset_intelligence package/module | **absent before 10A** | candidate-ai (created as discovery skeleton) |
| Component as first-class register | not present | unknown → shared-domain future |
| digital_twin_assets table | documented in DATABASE.md but no CREATE | unknown / legacy doc |
| Work orders / CMMS | absent | future-maintenance |

## Conclusion
Canonical asset identity and hierarchy already exist in Engineering OS Shared Domain.  
No competing Asset Intelligence registry exists. Phase 10A locks AI as intelligence-about-assets only.
