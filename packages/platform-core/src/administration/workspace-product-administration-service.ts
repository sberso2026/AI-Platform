import type { WorkspaceProductAssignmentView } from "./administration-types";
import { normalizeHealthStatus } from "./status-normalizers";

export function mapWorkspaceProductAssignments(
  rows: Array<{
    assignment_id: string;
    workspace_id: string;
    workspace_name: string;
    product_slug: string;
    product_name: string;
    applications?: string[];
    seat_use?: number;
    installation_status?: string;
  }>
): WorkspaceProductAssignmentView[] {
  return rows.map((row) => ({
    assignmentId: row.assignment_id,
    workspaceId: row.workspace_id,
    workspaceName: row.workspace_name,
    productSlug: row.product_slug,
    productName: row.product_name,
    applications: row.applications ?? [],
    seatUse: row.seat_use ?? 0,
    healthStatus: normalizeHealthStatus({
      installationStatus: row.installation_status,
    }),
  }));
}
