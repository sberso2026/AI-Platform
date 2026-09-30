import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { toSafeIdentityAssurance } from "@/lib/supabase/safe-identity-assurance";

export async function GET() {
  const supabase = await createClient();
  await supabase.auth.getSession();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      toSafeIdentityAssurance({
        userPresent: false,
        currentLevel: null,
        nextLevel: null,
        verifiedFactors: 0,
      }),
    );
  }

  const [{ data: aal }, { data: factors }] = await Promise.all([
    supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
    supabase.auth.mfa.listFactors(),
  ]);
  const verifiedFactors = (factors?.totp ?? []).filter((factor) => factor.status === "verified").length;
  return NextResponse.json(
    toSafeIdentityAssurance({
      userPresent: true,
      currentLevel: aal?.currentLevel ?? null,
      nextLevel: aal?.nextLevel ?? null,
      verifiedFactors,
    }),
  );
}
