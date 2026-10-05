"use client";

import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from "@rtb/ui";
import { RtbLogo } from "@/components/brand/rtb-logo";
import { createClient } from "@/lib/supabase/client";
import { persistVerifiedMfaSession, mfaUpgradeConfirmed } from "@/lib/supabase/persist-mfa-session";
import {
  challengeAfterVerifyDestination,
  mapMfaVerifyError,
  MFA_SECURITY_ROUTE,
  MFA_SESSION_UPGRADE_FAILED_MESSAGE,
  safeMfaReturnPath,
  verifiedTotpFactors,
} from "@rtb/engineering-review/mfa-ux";

type SafeAalReadout = {
  currentLevel: string | null;
  nextLevel: string | null;
  verifiedFactors: number;
  sessionPresent: boolean;
};

function MfaChallengeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = safeMfaReturnPath(searchParams.get("next"), "/review");
  const supabase = useMemo(() => createClient(), []);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [preMfa, setPreMfa] = useState<SafeAalReadout | null>(null);
  const [postVerify, setPostVerify] = useState<{
    verifySucceeded: boolean;
    currentLevel: string | null;
    nextLevel: string | null;
    sessionPresent: boolean;
    userPresent: boolean;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.replace(`/login?next=${encodeURIComponent(nextPath)}`);
        return;
      }
      const [{ data: sessionData }, { data: aalData }, { data: factorData }] = await Promise.all([
        supabase.auth.getSession(),
        supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
        supabase.auth.mfa.listFactors(),
      ]);
      if (cancelled) return;
      const verified = verifiedTotpFactors(factorData?.totp ?? []);
      setPreMfa({
        currentLevel: aalData?.currentLevel ?? null,
        nextLevel: aalData?.nextLevel ?? null,
        verifiedFactors: verified.length,
        sessionPresent: Boolean(sessionData.session),
      });
      if (aalData?.currentLevel === "aal2") {
        router.replace(nextPath);
        return;
      }
      if (verified.length === 0) {
        router.replace(`${MFA_SECURITY_ROUTE}?next=${encodeURIComponent(nextPath)}`);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [nextPath, router, supabase]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setPostVerify(null);
    try {
      const { data: factorData, error: factorError } = await supabase.auth.mfa.listFactors();
      if (factorError) {
        setError("Unable to load authenticator factors.");
        return;
      }
      const totp = verifiedTotpFactors(factorData?.totp ?? [])[0];
      if (!totp) {
        router.replace(`${MFA_SECURITY_ROUTE}?next=${encodeURIComponent(nextPath)}`);
        return;
      }
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: totp.id,
      });
      if (challengeError || !challenge?.id) {
        setError("Unable to start additional verification.");
        return;
      }
      const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
        factorId: totp.id,
        challengeId: challenge.id,
        code: code.trim(),
      });
      const verifySession =
        verifyData &&
        typeof verifyData === "object" &&
        "session" in verifyData &&
        verifyData.session &&
        typeof verifyData.session === "object"
          ? verifyData.session
          : null;
      const accessToken =
        verifySession && "access_token" in verifySession && typeof verifySession.access_token === "string"
          ? verifySession.access_token
          : undefined;
      const refreshToken =
        verifySession && "refresh_token" in verifySession && typeof verifySession.refresh_token === "string"
          ? verifySession.refresh_token
          : undefined;
      const observation = await persistVerifiedMfaSession(supabase, {
        data:
          accessToken && refreshToken
            ? { session: { access_token: accessToken, refresh_token: refreshToken } }
            : { session: null },
        error: verifyError,
      });
      setPostVerify({
        verifySucceeded: observation.verifySucceeded,
        currentLevel: observation.currentLevel,
        nextLevel: observation.nextLevel,
        sessionPresent: observation.sessionPresent,
        userPresent: observation.userPresent,
      });
      if (!observation.verifySucceeded) {
        setError(mapMfaVerifyError(verifyError?.message));
        return;
      }
      if (!mfaUpgradeConfirmed(observation)) {
        setError(MFA_SESSION_UPGRADE_FAILED_MESSAGE);
        return;
      }
      const result = challengeAfterVerifyDestination({
        currentAal: observation.currentLevel,
        nextPath,
      });
      if (!result.ok) {
        setError(MFA_SESSION_UPGRADE_FAILED_MESSAGE);
        return;
      }
      router.replace(result.path);
      router.refresh();
    } catch {
      setError("Unable to complete additional verification. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-[#F4F6F8] p-4"
      data-testid="mfa-challenge-page"
      data-pre-mfa-current-level={preMfa?.currentLevel ?? ""}
      data-pre-mfa-next-level={preMfa?.nextLevel ?? ""}
      data-pre-mfa-verified-factors={preMfa ? String(preMfa.verifiedFactors) : ""}
      data-verify-succeeded={postVerify ? String(postVerify.verifySucceeded) : ""}
      data-post-verify-current-level={postVerify?.currentLevel ?? ""}
      data-post-verify-next-level={postVerify?.nextLevel ?? ""}
      data-post-verify-session-present={postVerify ? String(postVerify.sessionPresent) : ""}
      data-post-verify-user-present={postVerify ? String(postVerify.userPresent) : ""}
    >
      <Card className="w-full max-w-md border-border bg-white shadow-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex justify-center">
            <RtbLogo size="lg" variant="full" inverted={false} />
          </div>
          <CardTitle>Additional verification is required.</CardTitle>
          <CardDescription>Enter the code from your authenticator app.</CardDescription>
          {preMfa?.currentLevel ? (
            <p className="pt-2 text-xs text-muted-foreground" data-testid="mfa-pre-assurance">
              Identity assurance: {preMfa.currentLevel.toUpperCase()}
            </p>
          ) : null}
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={(event) => void submit(event)}>
            <label className="text-sm font-medium" htmlFor="mfa-code">
              Authenticator code
            </label>
            <Input
              id="mfa-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              required
              data-testid="mfa-challenge-code"
            />
            {error ? (
              <p className="text-sm text-red-700" role="alert">
                {error}
              </p>
            ) : null}
            <Button type="submit" className="w-full" disabled={busy || code.trim().length < 6}>
              {busy ? "Verifying..." : "Verify"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginMfaPage() {
  return (
    <Suspense fallback={<p className="p-6 text-sm">Loading verification…</p>}>
      <MfaChallengeForm />
    </Suspense>
  );
}
