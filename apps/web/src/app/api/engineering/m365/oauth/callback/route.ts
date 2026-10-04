import { NextResponse } from "next/server";
import { authorizeEngineeringSegment, withEngineeringApi } from "@/lib/commerce/engineering-api";
import {
  classifyMicrosoftOAuthError,
  defaultM365RedirectUri,
  MicrosoftTokenExchangeFailure,
  runAuthorizedMicrosoftOAuthCallback,
  verifyOAuthState,
} from "@rtb/engineering-os";

export const GET = withEngineeringApi("settings", async ({ ctx, correlationId }, request) => {
  const url = new URL(request.url);
  const origin = `${url.protocol}//${url.host}`;
  const integrations = `${origin}/engineering/settings/integrations`;
  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookie = cookieHeader.split(";").map((part) => part.trim()).find((part) => part.startsWith("eos_m365_oauth_state="));
  const stateCookie = cookie ? decodeURIComponent(cookie.slice("eos_m365_oauth_state=".length)) : "";
  const secret = process.env.RTB_M365_OAUTH_STATE_SECRET?.trim() || process.env.RTB_M365_CLIENT_SECRET?.trim();
  const redirect = (query: string) => {
    const response = NextResponse.redirect(`${integrations}?${query}`);
    response.cookies.set("eos_m365_oauth_state", "", { httpOnly: true, path: "/", maxAge: 0 });
    return response;
  };
  if (!secret || !stateCookie) return redirect("m365=sign_in_required");
  let state;
  try {
    state = verifyOAuthState(stateCookie, secret);
  } catch {
    return redirect("m365=sign_in_required");
  }
  if (state.eosTenantId !== ctx.tenantId || state.userId !== ctx.userId) {
    return redirect("m365=tenant_mismatch");
  }
  const returnedState = url.searchParams.get("state") ?? "";
  if (returnedState !== stateCookie) return redirect("m365=sign_in_required");
  const oauthError = url.searchParams.get("error");
  if (oauthError) {
    const classified = classifyMicrosoftOAuthError(oauthError, url.searchParams.get("error_description"));
    return redirect(`m365=${classified === "ADMIN_CONSENT_REQUIRED" ? "admin_consent" : "error"}`);
  }
  const settingsCommerce = await authorizeEngineeringSegment(ctx, "settings", "POST", correlationId);
  if (!settingsCommerce) return redirect("m365=admin_required");
  try {
    const redirectUri = process.env.RTB_M365_REDIRECT_URI?.trim() || defaultM365RedirectUri(origin);
    const code = url.searchParams.get("code");
    const adminConsent = url.searchParams.get("admin_consent");
    const tenant = url.searchParams.get("tenant");
    await runAuthorizedMicrosoftOAuthCallback({
      code,
      adminConsent: adminConsent ?? "",
      tenant: tenant ?? "",
      redirectUri,
      completeMicrosoftSignIn: (identity, onStage) =>
        ctx.engineering.m365Connector.completeMicrosoftSignIn(settingsCommerce, ctx.tenantId, identity, onStage),
    });
    return redirect("m365=connected");
  } catch (error) {
    const tokenExchangeFailure = error instanceof MicrosoftTokenExchangeFailure ? error : null;
    if (tokenExchangeFailure) {
      return redirect("m365=error");
    }
    const message = error instanceof Error ? error.message : "";
    if (message.includes("ADMIN_CONSENT") || message.includes("consent")) return redirect("m365=admin_consent");
    if (message.includes("RTB_APP_NOT_CONFIGURED")) return redirect("m365=not_configured");
    return redirect("m365=error");
  }
});
