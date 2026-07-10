import type { SupabaseClient as SBClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import type { KernelDatabase } from "./kernel-types";
import type { CommerceDatabase } from "./commerce-types";

export type SupabaseClient = SBClient<Database & KernelDatabase & CommerceDatabase>;
