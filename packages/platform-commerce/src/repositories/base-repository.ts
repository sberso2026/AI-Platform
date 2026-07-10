import type { SupabaseClient } from "@rtb/database";

export abstract class BaseRepository {
  constructor(protected readonly supabase: SupabaseClient) {}

  protected fail(action: string, error: { message: string }): never {
    throw new Error(`Commerce ${action} failed: ${error.message}`);
  }

  protected mapRows<T>(data: unknown): T[] {
    return (data ?? []) as T[];
  }

  protected mapRow<T>(data: unknown): T {
    return data as T;
  }

  protected mapMaybeRow<T>(data: unknown): T | null {
    return data ? (data as T) : null;
  }
}
