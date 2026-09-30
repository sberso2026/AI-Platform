import type { SupabaseClient } from "@supabase/supabase-js";

export type SafeMfaVerifyObservation = {
  verifySucceeded: boolean;
  errorCode: string | null;
  sessionPresent: boolean;
  userPresent: boolean;
  currentLevel: string | null;
  nextLevel: string | null;
};

type VerifySession = {
  access_token?: string;
  refresh_token?: string;
};

type VerifyOutcome = {
  data?: { session?: VerifySession | null } | null;
  error?: { code?: string; name?: string } | null;
};

function emptyObservation(
  verifySucceeded: boolean,
  errorCode: string | null,
): SafeMfaVerifyObservation {
  return {
    verifySucceeded,
    errorCode,
    sessionPresent: false,
    userPresent: false,
    currentLevel: null,
    nextLevel: null,
  };
}

/**
 * Apply the MFA verify session to the same Auth client used for cookie SSR,
 * then read sanitized AAL. Does not log tokens, cookies, or TOTP.
 */
export async function persistVerifiedMfaSession(
  supabase: SupabaseClient,
  verify: VerifyOutcome,
): Promise<SafeMfaVerifyObservation> {
  if (verify.error) {
    return emptyObservation(false, verify.error.code ?? verify.error.name ?? "verify_failed");
  }

  const session = verify.data?.session ?? null;
  if (session?.access_token && session?.refresh_token) {
    const { error: persistError } = await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });
    if (persistError) {
      return emptyObservation(true, persistError.code ?? persistError.name ?? "session_persist_failed");
    }
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const { data: userData } = await supabase.auth.getUser();
  const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  return {
    verifySucceeded: true,
    errorCode: null,
    sessionPresent: Boolean(sessionData.session),
    userPresent: Boolean(userData.user),
    currentLevel: aalData?.currentLevel ?? null,
    nextLevel: aalData?.nextLevel ?? null,
  };
}

export function mfaUpgradeConfirmed(observation: SafeMfaVerifyObservation): boolean {
  return (
    observation.verifySucceeded &&
    observation.sessionPresent &&
    observation.userPresent &&
    observation.currentLevel === "aal2"
  );
}
