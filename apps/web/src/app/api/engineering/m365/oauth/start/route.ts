import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";
import {
  buildMicrosoftAdminConsentUrl,
  buildMicrosoftAuthorizeUrl,
  defaultM365RedirectUri,
  rtbMicrosoftAppConfig,
  signOAuthState,
} from "@rtb/engineering-os";

export const GET = withEngineeringApi("settings", async ({ ctx, commerce }, request) => {
  const app = rtbMicrosoftAppConfig();
  const url = new URL(request.url);
  const origin = `${url.protocol}//${url.host}`;
  const redirectUri = process.env.RTB_M365_REDIRECT_URI?.trim() || defaultM365RedirectUri(origin);
  const integrations = `${origin}/engineering/settings/integrations`;
  if (!app.configured || !commerce.workspaceId) {
    return NextResponse.redirect(`${integrations}?m365=not_configured`);
  }
  const secret = process.env.RTB_M365_OAUTH_STATE_SECRET?.trim() || process.env.RTB_M365_CLIENT_SECRET?.trim();
  if (!secret) {
    return NextResponse.redirect(`${integrations}?m365=not_configured`);
  }
  const adminConsent = url.searchParams.get("adminConsent") === "1";
  const state = signOAuthState(
    {
      nonce: crypto.randomUUID(),
      eosTenantId: ctx.tenantId,
      workspaceId: commerce.workspaceId,
      userId: ctx.userId,
      adminConsent,
      exp: Date.now() + 10 * 60 * 1000,
    },
    secret,
  );
  const authorize = adminConsent
    ? buildMicrosoftAdminConsentUrl({ applicationId: app.applicationId, redirectUri, state })
    : buildMicrosoftAuthorizeUrl({ applicationId: app.applicationId, redirectUri, state });
  const response = NextResponse.redirect(authorize);
  response.cookies.set("eos_m365_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: url.protocol === "https:",
    path: "/",
    maxAge: 600,
  });
  return response;
});
