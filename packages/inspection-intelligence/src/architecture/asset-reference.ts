/**
 * AssetReference interfaces — identity only.
 * Asset Intelligence is NOT implemented.
 */

export type AssetReferenceIdentity = {
  tenantId: string;
  workspaceId: string;
  assetId: string;
  equipmentId?: string;
};

export type AssetReferenceHierarchy = {
  parentAssetId?: string;
  pathIds: string[];
};

export type AssetReferenceLocation = {
  locationId?: string;
  siteId?: string;
  gps?: { lat: number; lon: number; alt?: number };
  coordinateSystem?: string;
};

export type AssetReferenceVersion = {
  registerVersion?: string;
  revisionId?: string;
  asOf?: string;
};

export type AssetReferenceSnapshot = {
  identity: AssetReferenceIdentity;
  hierarchy?: AssetReferenceHierarchy;
  location?: AssetReferenceLocation;
  version?: AssetReferenceVersion;
  capturedAt: string;
};

export type AssetReference = {
  identity: AssetReferenceIdentity;
  hierarchy?: AssetReferenceHierarchy;
  location?: AssetReferenceLocation;
  version?: AssetReferenceVersion;
};
