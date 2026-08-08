/**
 * Phase 12E — EngineeringTimeSeriesReadPort.
 *
 * Read-only access to Asset Intelligence engineering time series.
 * Twin MUST NOT write to asset_intelligence_time_series.
 */

import type { ObservationQuality } from "./observation-quality";

export type EngineeringTimeSeriesObservation = {
  seriesId: string;
  assetId: string;
  attributeKey: string;
  unit: string;
  observedAt: string;
  value: number;
  quality: ObservationQuality;
  evidenceRef?: string;
};

export type EngineeringTimeSeriesWindow = {
  seriesId: string;
  attributeKey: string;
  unit: string;
  observations: EngineeringTimeSeriesObservation[];
  windowStart: string;
  windowEnd: string;
};

export type EngineeringTimeSeriesAggregate = {
  seriesId: string;
  attributeKey: string;
  method: "mean" | "min" | "max" | "count";
  value: number | null;
  sampleCount: number;
  windowStart: string;
  windowEnd: string;
};

export type EngineeringTimeSeriesFreshness = {
  seriesId: string;
  lastObservationAt?: string;
  freshnessMs?: number;
  quality: ObservationQuality;
  sourceAvailable: boolean;
};

export type EngineeringTimeSeriesReadPort = {
  readonly kind: "engineering_time_series_read_port";
  readonly ownerModule: "asset_intelligence";
  readonly readOnly: true;
  latestObservation(
    tenantId: string,
    workspaceId: string,
    seriesId: string,
  ): Promise<EngineeringTimeSeriesObservation | null>;
  window(
    tenantId: string,
    workspaceId: string,
    seriesId: string,
    windowStart: string,
    windowEnd: string,
  ): Promise<EngineeringTimeSeriesWindow>;
  aggregate(
    tenantId: string,
    workspaceId: string,
    seriesId: string,
    method: EngineeringTimeSeriesAggregate["method"],
    windowStart: string,
    windowEnd: string,
  ): Promise<EngineeringTimeSeriesAggregate>;
  quality(
    tenantId: string,
    workspaceId: string,
    seriesId: string,
  ): Promise<ObservationQuality>;
  freshness(
    tenantId: string,
    workspaceId: string,
    seriesId: string,
  ): Promise<EngineeringTimeSeriesFreshness>;
};

/** Memory stub for unit tests — no production use. */
export function createMemoryEngineeringTimeSeriesReadPort(
  seed: EngineeringTimeSeriesObservation[] = [],
): EngineeringTimeSeriesReadPort {
  const observations = [...seed];
  return {
    kind: "engineering_time_series_read_port",
    ownerModule: "asset_intelligence",
    readOnly: true,
    async latestObservation(_tenantId, _workspaceId, seriesId) {
      const filtered = observations
        .filter((o) => o.seriesId === seriesId)
        .sort((a, b) => a.observedAt.localeCompare(b.observedAt));
      return filtered[filtered.length - 1] ?? null;
    },
    async window(_tenantId, _workspaceId, seriesId, windowStart, windowEnd) {
      const filtered = observations.filter(
        (o) =>
          o.seriesId === seriesId &&
          o.observedAt >= windowStart &&
          o.observedAt <= windowEnd,
      );
      return {
        seriesId,
        attributeKey: filtered[0]?.attributeKey ?? "",
        unit: filtered[0]?.unit ?? "",
        observations: filtered,
        windowStart,
        windowEnd,
      };
    },
    async aggregate(_tenantId, _workspaceId, seriesId, method, windowStart, windowEnd) {
      const win = await createMemoryEngineeringTimeSeriesReadPort(observations).window(
        _tenantId,
        _workspaceId,
        seriesId,
        windowStart,
        windowEnd,
      );
      const values = win.observations.map((o) => o.value);
      let value: number | null = null;
      if (values.length > 0) {
        switch (method) {
          case "mean":
            value = values.reduce((a, b) => a + b, 0) / values.length;
            break;
          case "min":
            value = Math.min(...values);
            break;
          case "max":
            value = Math.max(...values);
            break;
          case "count":
            value = values.length;
            break;
        }
      }
      return {
        seriesId,
        attributeKey: win.attributeKey,
        method,
        value,
        sampleCount: values.length,
        windowStart,
        windowEnd,
      };
    },
    async quality(_tenantId, _workspaceId, seriesId) {
      const latest = await createMemoryEngineeringTimeSeriesReadPort(observations).latestObservation(
        _tenantId,
        _workspaceId,
        seriesId,
      );
      return latest?.quality ?? "missing";
    },
    async freshness(_tenantId, _workspaceId, seriesId) {
      const latest = await createMemoryEngineeringTimeSeriesReadPort(observations).latestObservation(
        _tenantId,
        _workspaceId,
        seriesId,
      );
      const now = Date.now();
      const freshnessMs = latest ? now - Date.parse(latest.observedAt) : undefined;
      return {
        seriesId,
        lastObservationAt: latest?.observedAt,
        freshnessMs,
        quality: latest?.quality ?? "missing",
        sourceAvailable: latest !== null,
      };
    },
  };
}

/** Postgres/AI-backed adapter — reads asset_intelligence_time_series WITHOUT writing. */
export function createPostgresEngineeringTimeSeriesReadPort(client: {
  from(table: string): {
    select(cols: string): {
      eq(col: string, val: unknown): {
        eq(col: string, val: unknown): {
          eq(col: string, val: unknown): {
            order(col: string, opts: { ascending: boolean }): {
              limit(n: number): Promise<{ data: unknown[] | null; error: { message: string } | null }>;
            };
          };
        };
      };
    };
  };
}): EngineeringTimeSeriesReadPort {
  const TABLE = "asset_intelligence_time_series";

  async function loadSeries(
    tenantId: string,
    workspaceId: string,
    seriesId: string,
  ): Promise<Record<string, unknown> | null> {
    const { data, error } = await client
      .from(TABLE)
      .select("id, asset_id, attribute_key, unit, points, recorded_at")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("id", seriesId)
      .order("recorded_at", { ascending: false })
      .limit(1);
    if (error || !data?.[0]) return null;
    return data[0] as Record<string, unknown>;
  }

  function mapPoints(row: Record<string, unknown>): EngineeringTimeSeriesObservation[] {
    const points = (row.points as Array<{ observedAt: string; value: number; quality?: string }>) ?? [];
    return points.map((p) => ({
      seriesId: String(row.id),
      assetId: String(row.asset_id),
      attributeKey: String(row.attribute_key),
      unit: String(row.unit),
      observedAt: p.observedAt,
      value: p.value,
      quality: (p.quality as ObservationQuality) ?? "unknown",
    }));
  }

  return {
    kind: "engineering_time_series_read_port",
    ownerModule: "asset_intelligence",
    readOnly: true,
    async latestObservation(tenantId, workspaceId, seriesId) {
      const row = await loadSeries(tenantId, workspaceId, seriesId);
      if (!row) return null;
      const points = mapPoints(row);
      return points[points.length - 1] ?? null;
    },
    async window(tenantId, workspaceId, seriesId, windowStart, windowEnd) {
      const row = await loadSeries(tenantId, workspaceId, seriesId);
      const points = row ? mapPoints(row) : [];
      const filtered = points.filter(
        (o) => o.observedAt >= windowStart && o.observedAt <= windowEnd,
      );
      return {
        seriesId,
        attributeKey: String(row?.attribute_key ?? ""),
        unit: String(row?.unit ?? ""),
        observations: filtered,
        windowStart,
        windowEnd,
      };
    },
    async aggregate(tenantId, workspaceId, seriesId, method, windowStart, windowEnd) {
      const win = await createPostgresEngineeringTimeSeriesReadPort(client).window(
        tenantId,
        workspaceId,
        seriesId,
        windowStart,
        windowEnd,
      );
      const values = win.observations.map((o) => o.value);
      let value: number | null = null;
      if (values.length > 0) {
        switch (method) {
          case "mean":
            value = values.reduce((a, b) => a + b, 0) / values.length;
            break;
          case "min":
            value = Math.min(...values);
            break;
          case "max":
            value = Math.max(...values);
            break;
          case "count":
            value = values.length;
            break;
        }
      }
      return {
        seriesId,
        attributeKey: win.attributeKey,
        method,
        value,
        sampleCount: values.length,
        windowStart,
        windowEnd,
      };
    },
    async quality(tenantId, workspaceId, seriesId) {
      const latest = await createPostgresEngineeringTimeSeriesReadPort(client).latestObservation(
        tenantId,
        workspaceId,
        seriesId,
      );
      return latest?.quality ?? "missing";
    },
    async freshness(tenantId, workspaceId, seriesId) {
      const latest = await createPostgresEngineeringTimeSeriesReadPort(client).latestObservation(
        tenantId,
        workspaceId,
        seriesId,
      );
      const now = Date.now();
      return {
        seriesId,
        lastObservationAt: latest?.observedAt,
        freshnessMs: latest ? now - Date.parse(latest.observedAt) : undefined,
        quality: latest?.quality ?? "missing",
        sourceAvailable: latest !== null,
      };
    },
  };
}
