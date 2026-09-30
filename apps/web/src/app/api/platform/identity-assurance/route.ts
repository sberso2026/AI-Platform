import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { unauthenticatedResponse, resolveRequestId } from "@/lib/lifecycle-api";

/**
 * Certification-safe assurance readout. Returns only AAL and verified factor count.
 * Never includes tokens, cookies, TOTP, or secrets.
 */
export async function GET(request: Request) {
  const requestId = resolveRequestId(request);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return unauthenticatedResponse(requestId);

  const [{ data: aalData }, { data: factorData }] = await Promise.all([
    supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
    supabase.auth.mfa.listFactors(),
  ]);
  const verifiedFactors = (factorData?.totp ?? []).filter((factor) => factor.status === "verified").length;
  const aal = typeof aalData?.currentLevel === "string" && aalData.currentLevel ? aalData.currentLevel : "unknown";

  return NextResponse.json({
    authenticated: true,
    aal,
    verifiedFactors,
  });
}
