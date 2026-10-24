import type { AssuranceReviewCitation, AssuranceReviewFindingRef } from "./types";

export type ReviewPackageRef = {
  id: string;
  tenantId: string;
  workspaceId: string;
  projectId?: string | null;
  name?: string | null;
  status?: string | null;
};

export interface AssuranceReviewGateway {
  getPackage(tenantId: string, workspaceId: string, packageId: string): Promise<ReviewPackageRef | null>;
  createPackage?(input: {
    tenantId: string;
    workspaceId: string;
    projectId: string;
    name: string;
    documentIds: readonly string[];
    actorId: string;
  }): Promise<ReviewPackageRef>;
  listFindings(packageId: string, tenantId: string, workspaceId: string): Promise<AssuranceReviewFindingRef[]>;
}

export class MemoryReviewGateway implements AssuranceReviewGateway {
  packages: ReviewPackageRef[] = [];
  findings: AssuranceReviewFindingRef[] = [];
  createdFindingCount = 0;

  async getPackage(tenantId: string, workspaceId: string, packageId: string): Promise<ReviewPackageRef | null> {
    void tenantId;
    void workspaceId;
    return this.packages.find((pkg) => pkg.id === packageId) ?? null;
  }

  async createPackage(input: {
    tenantId: string;
    workspaceId: string;
    projectId: string;
    name: string;
    documentIds: readonly string[];
    actorId: string;
  }): Promise<ReviewPackageRef> {
    if (!input.documentIds.length) throw new Error("documents_required");
    const pkg: ReviewPackageRef = {
      id: crypto.randomUUID(),
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      name: input.name,
      status: "ready",
    };
    this.packages.push(pkg);
    return pkg;
  }

  async listFindings(packageId: string, tenantId: string, workspaceId: string): Promise<AssuranceReviewFindingRef[]> {
    void tenantId;
    void workspaceId;
    return this.findings.filter((finding) => finding.reviewPackageId === packageId);
  }

  addPackage(pkg: ReviewPackageRef): ReviewPackageRef {
    this.packages.push(pkg);
    return pkg;
  }

  addHumanFinding(packageId: string, title: string): AssuranceReviewFindingRef {
    const finding: AssuranceReviewFindingRef = {
      id: crypto.randomUUID(),
      reviewPackageId: packageId,
      title,
      status: "awaiting_engineer",
      ownedBy: "engineering-review",
    };
    this.findings.push(finding);
    return finding;
  }
}

export class SupabaseReviewGateway implements AssuranceReviewGateway {
  constructor(private readonly supabase: { from(name: string): any }) {}

  async getPackage(tenantId: string, workspaceId: string, packageId: string): Promise<ReviewPackageRef | null> {
    void tenantId;
    void workspaceId;
    const { data, error } = await this.supabase
      .from("engineering_review_packages")
      .select("id,tenant_id,workspace_id,project_id,name,status")
      .eq("id", packageId)
      .maybeSingle();
    if (error) throw new Error(`Failed to load review package: ${error.message}`);
    if (!data) return null;
    return {
      id: String(data.id),
      tenantId: String(data.tenant_id),
      workspaceId: String(data.workspace_id),
      projectId: (data.project_id as string | null) ?? null,
      name: (data.name as string | null) ?? null,
      status: (data.status as string | null) ?? null,
    };
  }

  async listFindings(packageId: string, tenantId: string, workspaceId: string): Promise<AssuranceReviewFindingRef[]> {
    const { data, error } = await this.supabase
      .from("engineering_review_findings")
      .select("id,review_package_id,title,status,tenant_id,workspace_id")
      .eq("review_package_id", packageId)
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId);
    if (error) throw new Error(`Failed to list review findings: ${error.message}`);
    return ((data ?? []) as Record<string, unknown>[]).map((row) => ({
      id: String(row.id),
      reviewPackageId: String(row.review_package_id),
      title: String(row.title ?? ""),
      status: String(row.status ?? ""),
      ownedBy: "engineering-review" as const,
    }));
  }
}

export function assertSameScopeCitation(
  condition: { tenantId: string; workspaceId: string },
  pkg: ReviewPackageRef | null,
): ReviewPackageRef {
  if (!pkg) throw new Error("review_package_not_found");
  if (pkg.tenantId !== condition.tenantId) throw new Error("cross_tenant_review_link_denied");
  if (pkg.workspaceId !== condition.workspaceId) throw new Error("cross_workspace_review_link_denied");
  return pkg;
}

export function citationRecord(
  condition: { id: string; tenantId: string; workspaceId: string },
  pkg: ReviewPackageRef,
  actorId: string,
  now: string,
): AssuranceReviewCitation {
  return {
    id: crypto.randomUUID(),
    tenantId: condition.tenantId,
    workspaceId: condition.workspaceId,
    conditionId: condition.id,
    reviewPackageId: pkg.id,
    createdBy: actorId,
    createdAt: now,
  };
}
