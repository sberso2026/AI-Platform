import { failClosed } from "./errors";

/** Nominal ID branding — local to this package; the repo does not use a shared Brand helper. */
export type Brand<T, B extends string> = T & { readonly __brand: B };

export type TenantId = Brand<string, "TenantId">;
export type WorkspaceId = Brand<string, "WorkspaceId">;
export type ProjectId = Brand<string, "ProjectId">;
export type ReviewPackageId = Brand<string, "ReviewPackageId">;
export type ReviewRunId = Brand<string, "ReviewRunId">;
export type ReviewFindingId = Brand<string, "ReviewFindingId">;
export type FindingEvidenceId = Brand<string, "FindingEvidenceId">;
export type FindingDispositionId = Brand<string, "FindingDispositionId">;
export type ReviewRuleId = Brand<string, "ReviewRuleId">;
export type DocumentId = Brand<string, "DocumentId">;
export type ActorId = Brand<string, "ActorId">;

function brand<B extends string>(value: string, name: B): Brand<string, B> {
  if (typeof value !== "string" || !value.trim()) {
    failClosed("id_required", `${name} is required and must be a non-empty string`);
  }
  return value.trim() as Brand<string, B>;
}

export const asTenantId = (value: string): TenantId => brand(value, "TenantId");
export const asWorkspaceId = (value: string): WorkspaceId => brand(value, "WorkspaceId");
export const asProjectId = (value: string): ProjectId => brand(value, "ProjectId");
export const asReviewPackageId = (value: string): ReviewPackageId => brand(value, "ReviewPackageId");
export const asReviewRunId = (value: string): ReviewRunId => brand(value, "ReviewRunId");
export const asReviewFindingId = (value: string): ReviewFindingId => brand(value, "ReviewFindingId");
export const asFindingEvidenceId = (value: string): FindingEvidenceId => brand(value, "FindingEvidenceId");
export const asFindingDispositionId = (value: string): FindingDispositionId =>
  brand(value, "FindingDispositionId");
export const asReviewRuleId = (value: string): ReviewRuleId => brand(value, "ReviewRuleId");
export const asDocumentId = (value: string): DocumentId => brand(value, "DocumentId");
export const asActorId = (value: string): ActorId => brand(value, "ActorId");
