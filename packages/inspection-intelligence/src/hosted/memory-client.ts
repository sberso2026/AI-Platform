/**
 * Test-only in-process inspection_* store with tenant/workspace RLS simulation.
 * Not a production persistence model. Production uses Platform Supabase.
 */
import type {
  HostedInspectionContext,
  InspectionDbClient,
  InspectionDbError,
  InspectionDbRow,
  InspectionQueryBuilder,
} from "./client";

export type MemoryActor = {
  tenantId: string | null;
  workspaceId: string | null;
  userId: string | null;
  workspaceMemberships?: string[];
};

type Store = Map<string, InspectionDbRow[]>;

class MemoryQuery implements InspectionQueryBuilder {
  private op: "select" | "insert" | "update" = "select";
  private pendingInsert: InspectionDbRow | null = null;
  private pendingUpdate: InspectionDbRow | null = null;
  private filters: Array<{ column: string; value: unknown; kind: "eq" | "is" | "in"; values?: readonly unknown[] }> = [];

  constructor(
    private readonly store: Store,
    private readonly table: string,
    private readonly actor: MemoryActor,
  ) {}

  select(_columns?: string): InspectionQueryBuilder {
    return this;
  }

  insert(values: InspectionDbRow | InspectionDbRow[]): InspectionQueryBuilder {
    this.op = "insert";
    this.pendingInsert = Array.isArray(values) ? values[0] ?? null : values;
    return this;
  }

  update(values: InspectionDbRow): InspectionQueryBuilder {
    this.op = "update";
    this.pendingUpdate = values;
    return this;
  }

  eq(column: string, value: unknown): InspectionQueryBuilder {
    this.filters.push({ column, value, kind: "eq" });
    return this;
  }

  in(column: string, values: readonly unknown[]): InspectionQueryBuilder {
    this.filters.push({ column, value: null, kind: "in", values });
    return this;
  }

  is(column: string, value: null): InspectionQueryBuilder {
    this.filters.push({ column, value, kind: "is" });
    return this;
  }

  async maybeSingle(): Promise<{ data: InspectionDbRow | null; error: InspectionDbError }> {
    const result = this.execute();
    if (result.error) return { data: null, error: result.error };
    return { data: result.rows[0] ?? null, error: null };
  }

  async single(): Promise<{ data: InspectionDbRow | null; error: InspectionDbError }> {
    const result = this.execute();
    if (result.error) return { data: null, error: result.error };
    if (result.rows.length !== 1) {
      return { data: null, error: { message: "JSON object requested, multiple (or no) rows returned", code: "PGRST116" } };
    }
    return { data: result.rows[0] ?? null, error: null };
  }

  then<TResult1 = { data: InspectionDbRow[] | null; error: InspectionDbError }, TResult2 = never>(
    onfulfilled?:
      | ((value: { data: InspectionDbRow[] | null; error: InspectionDbError }) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    const result = this.execute();
    const value = { data: result.error ? null : result.rows, error: result.error };
    return Promise.resolve(value).then(onfulfilled ?? undefined, onrejected ?? undefined);
  }

  private denied(): { rows: InspectionDbRow[]; error: InspectionDbError } {
    return { rows: [], error: { message: "new row violates row-level security policy", code: "42501" } };
  }

  private visible(row: InspectionDbRow): boolean {
    if (!this.actor.userId) return false;
    if (!this.actor.tenantId) return false;
    if (row.tenant_id != null && String(row.tenant_id) !== this.actor.tenantId) return false;
    if (row.workspace_id != null) {
      const ws = String(row.workspace_id);
      const memberships = this.actor.workspaceMemberships ?? (this.actor.workspaceId ? [this.actor.workspaceId] : []);
      if (!memberships.includes(ws)) return false;
    }
    return true;
  }

  private matchesFilters(row: InspectionDbRow): boolean {
    return this.filters.every((filter) => {
      if (filter.kind === "is") return row[filter.column] == null;
      if (filter.kind === "in") return (filter.values ?? []).includes(row[filter.column]);
      return row[filter.column] === filter.value;
    });
  }

  private execute(): { rows: InspectionDbRow[]; error: InspectionDbError } {
    if (!this.store.has(this.table)) this.store.set(this.table, []);
    const tableRows = this.store.get(this.table)!;

    if (this.op === "insert") {
      if (!this.actor.userId || !this.actor.tenantId) return this.denied();
      const row = { ...(this.pendingInsert ?? {}) };
      if (String(row.tenant_id) !== this.actor.tenantId) return this.denied();
      const memberships = this.actor.workspaceMemberships ?? (this.actor.workspaceId ? [this.actor.workspaceId] : []);
      if (row.workspace_id != null && !memberships.includes(String(row.workspace_id))) return this.denied();
      tableRows.push(row);
      return { rows: [row], error: null };
    }

    const matched = tableRows.filter((row) => this.visible(row) && this.matchesFilters(row));

    if (this.op === "update") {
      if (!this.actor.userId) return this.denied();
      const patch = this.pendingUpdate ?? {};
      for (const row of matched) {
        Object.assign(row, patch);
      }
      return { rows: matched, error: null };
    }

    return { rows: matched, error: null };
  }
}

export class MemoryInspectionDb {
  private readonly store: Store = new Map();

  clientFor(actor: MemoryActor): InspectionDbClient {
    return {
      from: (table: string) => new MemoryQuery(this.store, table, actor),
    };
  }

  seed(table: string, rows: InspectionDbRow[]): void {
    const existing = this.store.get(table) ?? [];
    this.store.set(table, [...existing, ...rows]);
  }

  rows(table: string): InspectionDbRow[] {
    return [...(this.store.get(table) ?? [])];
  }
}

export function memoryActor(context: HostedInspectionContext): MemoryActor {
  return {
    tenantId: context.tenantId,
    workspaceId: context.workspaceId,
    userId: context.actorUserId,
    workspaceMemberships: [context.workspaceId],
  };
}
