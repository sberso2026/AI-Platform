import { failClosed } from "./errors";
import {
  asDocumentId,
  asReviewPackageId,
  type DocumentId,
  type ReviewPackageId,
} from "./ids";
import {
  assertOwnershipImmutable,
  createReviewOwnership,
  type ReviewOwnership,
} from "./ownership";

export const REVIEW_DOCUMENT_ROLES = [
  "specification",
  "drawing",
  "calculation",
  "basis",
  "other",
] as const;
export type ReviewDocumentRole = (typeof REVIEW_DOCUMENT_ROLES)[number];

export const REVIEW_PACKAGE_STATUSES = ["draft", "ready", "in_review", "completed", "archived"] as const;
export type ReviewPackageStatus = (typeof REVIEW_PACKAGE_STATUSES)[number];

export type ReviewPackageDocument = {
  documentId: DocumentId;
  revision: string;
  role: ReviewDocumentRole;
  documentNumber?: string;
  inclusion: "current" | "superseded";
};

export type ReviewPackage = ReviewOwnership & {
  id: ReviewPackageId;
  name: string;
  status: ReviewPackageStatus;
  documents: readonly ReviewPackageDocument[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export function createReviewPackage(input: {
  id: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  name: string;
  documents?: readonly {
    documentId: string;
    revision: string;
    role: ReviewDocumentRole;
    documentNumber?: string;
    inclusion?: "current" | "superseded";
  }[];
  createdBy: string;
  now?: string;
}): ReviewPackage {
  if (!input.name?.trim()) failClosed("package_name_required", "Review package name is required");
  if (!input.createdBy?.trim()) failClosed("actor_required", "Review package requires a creator");
  const ownership = createReviewOwnership(input);
  const now = input.now ?? new Date().toISOString();
  return {
    id: asReviewPackageId(input.id),
    ...ownership,
    name: input.name.trim(),
    status: "draft",
    documents: (input.documents ?? []).map(mapPackageDocument),
    createdBy: input.createdBy.trim(),
    createdAt: now,
    updatedAt: now,
  };
}

function mapPackageDocument(doc: {
  documentId: string;
  revision: string;
  role: ReviewDocumentRole;
  documentNumber?: string;
  inclusion?: "current" | "superseded";
}): ReviewPackageDocument {
  if (!doc.revision?.trim()) failClosed("revision_required", "Package documents require a revision");
  if (!(REVIEW_DOCUMENT_ROLES as readonly string[]).includes(doc.role)) {
    failClosed("document_role_invalid", "Invalid document role", { role: doc.role });
  }
  return {
    documentId: asDocumentId(doc.documentId),
    revision: doc.revision.trim(),
    role: doc.role,
    documentNumber: doc.documentNumber?.trim() || undefined,
    inclusion: doc.inclusion ?? "current",
  };
}

export function updateReviewPackage(
  pkg: ReviewPackage,
  patch: {
    name?: string;
    status?: ReviewPackageStatus;
    documents?: ReviewPackage["documents"];
    ownership?: ReviewOwnership;
    now?: string;
  },
): ReviewPackage {
  if (patch.ownership) assertOwnershipImmutable(pkg, patch.ownership);
  return {
    ...pkg,
    name: patch.name?.trim() || pkg.name,
    status: patch.status ?? pkg.status,
    documents: patch.documents ?? pkg.documents,
    updatedAt: patch.now ?? new Date().toISOString(),
  };
}
