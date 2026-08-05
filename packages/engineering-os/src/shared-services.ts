/**
 * Phase 8A — Shared Engineering services contracts.
 * Modules consume these; they must not implement private forks.
 */

export type EngineeringSharedServiceId =
  | "document_references"
  | "engineering_timelines"
  | "attachments"
  | "comments"
  | "approvals"
  | "version_history"
  | "audit"
  | "reporting"
  | "ai_context"
  | "activity"
  | "notification";

export const ENGINEERING_SHARED_SERVICE_IDS: EngineeringSharedServiceId[] = [
  "document_references",
  "engineering_timelines",
  "attachments",
  "comments",
  "approvals",
  "version_history",
  "audit",
  "reporting",
  "ai_context",
  "activity",
  "notification",
];

export interface EngineeringSharedServiceDescriptor {
  id: EngineeringSharedServiceId;
  name: string;
  description: string;
  owner: "engineering-os-core";
}

export const ENGINEERING_SHARED_SERVICES: EngineeringSharedServiceDescriptor[] = [
  {
    id: "document_references",
    name: "Document References",
    description: "Cross-module document reference resolution",
    owner: "engineering-os-core",
  },
  {
    id: "engineering_timelines",
    name: "Engineering Timelines",
    description: "Shared timeline events across modules",
    owner: "engineering-os-core",
  },
  {
    id: "attachments",
    name: "Attachments",
    description: "File attachments bound to engineering entities",
    owner: "engineering-os-core",
  },
  {
    id: "comments",
    name: "Comments",
    description: "Threaded comments on engineering objects",
    owner: "engineering-os-core",
  },
  {
    id: "approvals",
    name: "Approvals",
    description: "Human approval workflows for engineering actions",
    owner: "engineering-os-core",
  },
  {
    id: "version_history",
    name: "Version History",
    description: "Version lineage for documents and controlled objects",
    owner: "engineering-os-core",
  },
  {
    id: "audit",
    name: "Audit",
    description: "Immutable audit trail for engineering operations",
    owner: "engineering-os-core",
  },
  {
    id: "reporting",
    name: "Reporting",
    description: "Shared reporting shell and export hooks",
    owner: "engineering-os-core",
  },
  {
    id: "ai_context",
    name: "AI Context",
    description: "Shared AI context assembly for modules",
    owner: "engineering-os-core",
  },
  {
    id: "activity",
    name: "Activity",
    description: "Shared engineering activity event recording",
    owner: "engineering-os-core",
  },
  {
    id: "notification",
    name: "Notification",
    description: "Shared notification dispatch for engineering workflows",
    owner: "engineering-os-core",
  },
];

export interface EngineeringSharedServicesFacade {
  list(): EngineeringSharedServiceDescriptor[];
  has(id: EngineeringSharedServiceId): boolean;
}

export function createEngineeringSharedServicesFacade(): EngineeringSharedServicesFacade {
  const ids = new Set(ENGINEERING_SHARED_SERVICE_IDS);
  return {
    list: () => ENGINEERING_SHARED_SERVICES,
    has: (id) => ids.has(id),
  };
}
