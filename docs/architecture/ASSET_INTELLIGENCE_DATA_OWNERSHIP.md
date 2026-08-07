# Asset Intelligence — Data Ownership

**assetIdentityOwnership:** `engineering_os_shared_domain`  
**assetIntelligenceOwnership:** `asset_intelligence`  
**duplicateAssetOwnershipDetected:** `false`

## Principle
Engineering OS Shared Asset Domain is authoritative for **canonical asset identity**.  
Asset Intelligence owns **intelligence about assets**, referencing canonical `assetId` values only.  
**No duplicate asset registry.**

## Ownership matrix (summary)

| Concern | Owner |
|---------|-------|
| Asset identity / hierarchy refs / class / equipment / component / systems / locations | Engineering OS Shared Domain |
| Documents refs / lifecycle identity / external ids | Engineering OS Shared Domain |
| Inspection history / evidence | Inspection Intelligence |
| Project knowledge / findings / reasoning | Project Intelligence |
| Condition / health / criticality / reliability / failure / degradation / predictive / RUL (advisory) | Asset Intelligence |
| Canonical risk register | Engineering Core (AI may emit risk *signals*) |
| Twin / simulation / geometry | Digital Twin (future) |
| Sensor streams | SHM / external |
| Work orders / execution | Future Maintenance / CMMS / EAM |
| Cost / schedule | Project Controls (future) |

Machine-checkable matrix: `packages/asset-intelligence/src/architecture/ownership-lock.ts`
