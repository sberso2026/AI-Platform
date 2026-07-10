"use client";

import { useState } from "react";
import { Button, Input } from "@rtb/ui";
import type { CommercialSeatPool } from "@rtb/types";
import { CommerceConfirmAction } from "./commerce-confirm-action";

export function SeatPoolActions({
  pool,
  onChanged,
}: {
  pool: CommercialSeatPool;
  onChanged: () => void;
}) {
  const [userId, setUserId] = useState("");
  const [fromUserId, setFromUserId] = useState("");
  const [toUserId, setToUserId] = useState("");
  const [bulkUserIds, setBulkUserIds] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function post(path: string, body: Record<string, unknown>) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Action failed");
        return false;
      }
      onChanged();
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
      return false;
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3 rounded-md border border-border bg-slate-50/50 p-3">
      <p className="text-xs font-medium text-slate-600">{pool.pool_name}</p>
      <div className="flex flex-wrap items-end gap-2">
        <label className="text-xs">
          <span className="mb-1 block text-slate-500">Assign user ID</span>
          <Input className="h-8 w-40" value={userId} onChange={(e) => setUserId(e.target.value)} />
        </label>
        <Button
          size="sm"
          variant="outline"
          disabled={loading || !userId}
          onClick={() => post("/api/platform/commerce/seats/assign", { seatPoolId: pool.id, userId })}
        >
          Assign
        </Button>
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <label className="text-xs">
          <span className="mb-1 block text-slate-500">Remove user ID</span>
          <Input className="h-8 w-40" value={userId} onChange={(e) => setUserId(e.target.value)} />
        </label>
        <CommerceConfirmAction
          label="Remove"
          confirmMessage={`Remove seat assignment for user ${userId || "?"}?`}
          disabled={!userId}
          onConfirm={async () => {
            await post("/api/platform/commerce/seats/remove", { seatPoolId: pool.id, userId });
          }}
        />
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <label className="text-xs">
          <span className="mb-1 block text-slate-500">From user</span>
          <Input className="h-8 w-32" value={fromUserId} onChange={(e) => setFromUserId(e.target.value)} />
        </label>
        <label className="text-xs">
          <span className="mb-1 block text-slate-500">To user</span>
          <Input className="h-8 w-32" value={toUserId} onChange={(e) => setToUserId(e.target.value)} />
        </label>
        <Button
          size="sm"
          variant="outline"
          disabled={loading || !fromUserId || !toUserId}
          onClick={() =>
            post("/api/platform/commerce/seats/transfer", {
              seatPoolId: pool.id,
              fromUserId,
              toUserId,
            })
          }
        >
          Transfer
        </Button>
      </div>
      <div className="space-y-2">
        <label className="block text-xs text-slate-500">
          Bulk assign (comma-separated user IDs)
          <Input
            className="mt-1 h-8"
            value={bulkUserIds}
            onChange={(e) => setBulkUserIds(e.target.value)}
          />
        </label>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={loading || !bulkUserIds.trim()}
            onClick={() => {
              const assignments = bulkUserIds
                .split(",")
                .map((id) => id.trim())
                .filter(Boolean)
                .map((uid) => ({ seatPoolId: pool.id, userId: uid }));
              return post("/api/platform/commerce/seats/bulk-assign", { assignments });
            }}
          >
            Bulk Assign
          </Button>
          <CommerceConfirmAction
            label="Bulk Remove"
            confirmMessage="Remove all listed users from this seat pool?"
            disabled={!bulkUserIds.trim()}
            onConfirm={async () => {
              const userIds = bulkUserIds
                .split(",")
                .map((id) => id.trim())
                .filter(Boolean);
              const removals = userIds.map((uid) => ({ seatPoolId: pool.id, userId: uid }));
              await post("/api/platform/commerce/seats/bulk-remove", { removals });
            }}
          />
        </div>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
