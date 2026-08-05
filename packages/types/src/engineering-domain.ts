/**
 * Phase 8A — Shared Engineering Domain Model.
 * Canonical entities owned by Engineering OS Core; modules must not fork ownership.
 */

export type EngineeringDomainEntityKind =
  | "project"
  | "asset"
  | "discipline"
  | "package"
  | "company"
  | "person"
  | "document"
  | "drawing"
  | "equipment"
  | "location"
  | "tag";

export const ENGINEERING_DOMAIN_ENTITY_KINDS: EngineeringDomainEntityKind[] = [
  "project",
  "asset",
  "discipline",
  "package",
  "company",
  "person",
  "document",
  "drawing",
  "equipment",
  "location",
  "tag",
];

/** Owning surface for each shared entity — modules consume, Core owns. */
export const ENGINEERING_DOMAIN_OWNERSHIP: Record<
  EngineeringDomainEntityKind,
  "engineering-os-core"
> = {
  project: "engineering-os-core",
  asset: "engineering-os-core",
  discipline: "engineering-os-core",
  package: "engineering-os-core",
  company: "engineering-os-core",
  person: "engineering-os-core",
  document: "engineering-os-core",
  drawing: "engineering-os-core",
  equipment: "engineering-os-core",
  location: "engineering-os-core",
  tag: "engineering-os-core",
};

export interface EngineeringPackage {
  id: string;
  tenant_id: string;
  workspace_id?: string;
  engineering_project_id?: string;
  package_code: string;
  package_name: string;
  package_type?: string;
  status: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface EngineeringPerson {
  id: string;
  tenant_id: string;
  workspace_id?: string;
  user_id?: string;
  display_name: string;
  email?: string;
  company_id?: string;
  discipline_id?: string;
  role_title?: string;
  status: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface EngineeringDrawing {
  id: string;
  tenant_id: string;
  workspace_id?: string;
  engineering_project_id?: string;
  document_id?: string;
  drawing_number: string;
  title: string;
  revision: string;
  discipline_id?: string;
  status: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface EngineeringEquipment {
  id: string;
  tenant_id: string;
  workspace_id?: string;
  engineering_project_id?: string;
  asset_id?: string;
  equipment_tag: string;
  equipment_name: string;
  equipment_type?: string;
  discipline_id?: string;
  status: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface EngineeringLocation {
  id: string;
  tenant_id: string;
  workspace_id?: string;
  engineering_project_id?: string;
  parent_location_id?: string;
  location_code: string;
  location_name: string;
  location_type?: string;
  status: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface EngineeringTag {
  id: string;
  tenant_id: string;
  workspace_id?: string;
  tag_key: string;
  tag_value: string;
  entity_kind?: EngineeringDomainEntityKind;
  entity_id?: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export function assertNoDuplicateDomainOwnership(
  claims: Array<{ entity: EngineeringDomainEntityKind; owner: string }>,
): void {
  for (const claim of claims) {
    const expected = ENGINEERING_DOMAIN_OWNERSHIP[claim.entity];
    if (claim.owner !== expected) {
      throw new Error(
        `Domain ownership violation: ${claim.entity} must be owned by ${expected}, got ${claim.owner}`,
      );
    }
  }
}
