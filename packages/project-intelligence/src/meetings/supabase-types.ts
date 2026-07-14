/** Minimal Supabase-like client surface used by meeting services. */

export type MeetingDbError = { message: string; code?: string } | null;

export type MeetingQueryResult = {
  data: Record<string, unknown> | null;
  error: MeetingDbError;
  count?: number | null;
};

export type MeetingListResult = {
  data: Record<string, unknown>[] | null;
  error: MeetingDbError;
  count?: number | null;
};

/**
 * Chainable query builder. Terminal methods return Promises.
 * Avoid a callable `then` so TypeScript can await terminal calls safely.
 */
export type MeetingQueryBuilder = {
  select: (columns?: string, options?: Record<string, unknown>) => MeetingQueryBuilder;
  insert: (values: unknown) => MeetingQueryBuilder;
  update: (values: unknown) => MeetingQueryBuilder;
  delete: () => MeetingQueryBuilder;
  eq: (column: string, value: unknown) => MeetingQueryBuilder;
  neq: (column: string, value: unknown) => MeetingQueryBuilder;
  gt: (column: string, value: unknown) => MeetingQueryBuilder;
  gte: (column: string, value: unknown) => MeetingQueryBuilder;
  lt: (column: string, value: unknown) => MeetingQueryBuilder;
  lte: (column: string, value: unknown) => MeetingQueryBuilder;
  is: (column: string, value: unknown) => MeetingQueryBuilder;
  in: (column: string, values: unknown[]) => MeetingQueryBuilder;
  order: (column: string, options?: Record<string, unknown>) => MeetingQueryBuilder;
  limit: (count: number) => MeetingQueryBuilder;
  maybeSingle: () => Promise<MeetingQueryResult>;
  single: () => Promise<MeetingQueryResult>;
};

export type MeetingSupabaseClient = {
  from: (table: string) => MeetingQueryBuilder;
};

/** Worker client extends table access with SECURITY DEFINER RPCs. */
export type MeetingWorkerClient = MeetingSupabaseClient & {
  rpc: (
    fn: string,
    args?: Record<string, unknown>,
  ) => Promise<{ data: unknown; error: MeetingDbError }>;
};

export function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function asRecordList(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.map(asRecord) : value ? [asRecord(value)] : [];
}

/** Await a builder that may resolve as a list query (Supabase thenable). */
export async function awaitList(
  builder: MeetingQueryBuilder,
): Promise<MeetingListResult> {
  const result = await (builder as unknown as Promise<MeetingListResult>);
  return {
    data: asRecordList(result.data),
    error: result.error,
    count: result.count,
  };
}

/** Await insert/update/delete without select. */
export async function awaitMutation(
  builder: MeetingQueryBuilder,
): Promise<{ error: MeetingDbError }> {
  const result = await (builder as unknown as Promise<{ error: MeetingDbError }>);
  return { error: result.error };
}

/** Await a `.single()` / `.maybeSingle()` terminal call. */
export async function awaitSingle(
  resultPromise: Promise<MeetingQueryResult>,
): Promise<MeetingQueryResult> {
  return resultPromise;
}
