"use client";

import { useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@rtb/ui";
import type { WorkspaceProductAssignmentView } from "@rtb/platform-core";

type AvailableWorkspace = { id: string; name: string };

export function ProductWorkspacePanel({
  assignments,
  availableWorkspaces,
  installationId,
  productId,
  onChanged,
}: {
  assignments: WorkspaceProductAssignmentView[];
  availableWorkspaces: AvailableWorkspace[];
  installationId?: string;
  productId?: string;
  onChanged: () => void;
}) {
  const [selectedWorkspace, setSelectedWorkspace] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  const assignedIds = new Set(assignments.map((a) => a.workspaceId));
  const unassigned = availableWorkspaces.filter((w) => !assignedIds.has(w.id));

  async function assignWorkspace() {
    if (!selectedWorkspace || !installationId || !productId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/platform/workspace-product-assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: selectedWorkspace,
          installationId,
          productId,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Assignment failed");
      setSelectedWorkspace("");
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Assignment failed");
    } finally {
      setLoading(false);
    }
  }

  async function removeAssignment(assignmentId: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/platform/workspace-product-assignments?assignmentId=${assignmentId}`,
        { method: "DELETE" }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Removal failed");
      setConfirmRemove(null);
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Removal failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6" data-testid="product-workspaces-panel">
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Assigned workspaces</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {assignments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No workspaces assigned to this product.</p>
          ) : (
            assignments.map((row) => (
              <div
                key={row.workspaceId}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border p-3"
                data-testid={`workspace-assignment-${row.workspaceId}`}
              >
                <div>
                  <p className="font-medium">{row.workspaceName}</p>
                  <p className="text-xs text-muted-foreground">
                    Health: {row.healthStatus} · Seats in use: {row.seatUse}
                  </p>
                </div>
                {confirmRemove === row.assignmentId ? (
                  <div className="flex flex-wrap gap-2">
                    <p className="text-xs text-amber-800">
                      Removing revokes workspace access immediately.
                    </p>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={loading}
                      onClick={() => removeAssignment(row.assignmentId)}
                    >
                      Confirm remove
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setConfirmRemove(null)}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setConfirmRemove(row.assignmentId)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {unassigned.length > 0 && installationId && productId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Assign to workspace</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">Workspace</span>
              <select
                className="rounded-md border border-input px-3 py-2"
                value={selectedWorkspace}
                onChange={(e) => setSelectedWorkspace(e.target.value)}
                aria-label="Select workspace to assign"
              >
                <option value="">Select…</option>
                {unassigned.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </label>
            <Button disabled={!selectedWorkspace || loading} onClick={assignWorkspace}>
              Assign product
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
