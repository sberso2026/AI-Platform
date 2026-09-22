import { evaluateReviewRuntime } from "@rtb/engineering-review/runtime";

export function resolvePublicSupabaseConfig(): { url: string; anonKey: string; projectRef: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  const runtime = process.env.NEXT_PUBLIC_RTB_REVIEW_RUNTIME ?? process.env.RTB_REVIEW_RUNTIME;
  const decision = evaluateReviewRuntime({ url, runtime, anonKey });
  if (!decision.ok || !anonKey) {
    throw new Error("Supabase public configuration is missing or invalid for this runtime");
  }
  return { url, anonKey, projectRef: decision.projectRef };
}

