import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { evaluatePrivilegedMfa } from "@rtb/engineering-os/security-closure/privileged-mfa";
import {
  evaluateReviewIdentityPolicy,
  resolveReviewIdentityPolicy,
  type CanonicalContextDecision,
} from "@rtb/engineering-review/identity";
import { MFA_CHALLENGE_ROUTE, safeMfaReturnPath } from "@rtb/engineering-review/mfa-ux";
import {
  CANONICAL_CONTEXT_TENANT_COOKIE,
  CANONICAL_CONTEXT_WORKSPACE_COOKIE,
  canonicalContextCookieOptions,
  resolveRequestActorContext,
} from "@/lib/identity/canonical-context";
import { resolvePublicSupabaseConfig } from "@/lib/supabase/public-config";
import { canAccessPlatformRoute, NAV_TIER_RANK, resolveNavTier } from "@rtb/platform-core";
import type { NavTier } from "@rtb/types";

function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    const part = token.split(".")[1];
    if (!part) return {};
    const normalized = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
    const json = atob(padded);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function privilegedMfaEnforcementEnabled(): boolean {
  return (
    process.env.RTB_ENFORCE_PRIVILEGED_MFA === "1" ||
    process.env.VERCEL_ENV === "production" ||
    process.env.NODE_ENV === "production"
  );
}

type ActorFilterBuilder = PromiseLike<{ data: unknown[] | null; error: { message: string } | null }> & {
  eq: (column: string, value: string) => ActorFilterBuilder;
  maybeSingle: () => PromiseLike<{
    data: { id?: string; tenant_id?: string } | null;
    error: { message: string } | null;
  }>;
};

type ActorContextClient = {
  from: (table: string) => {
    select: (columns: string) => ActorFilterBuilder;
  };
};

function boundActorContextClient(value: unknown): ActorContextClient {
  return value as ActorContextClient;
}

const PLATFORM_ACCESS_PREFIXES = [
  "/platform/",
  "/system/",
  "/my-account",
  "/operating-systems",
  "/workspaces",
  "/command-centre",
  "/dashboard",
  "/plugins",
  "/users",
  "/roles",
  "/audit",
  "/settings",
];

function needsPlatformAccessCheck(pathname: string): boolean {
  return PLATFORM_ACCESS_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function isDeliverableLifecycleAal2Path(pathname: string): boolean {
  return (
    pathname === "/engineering/deliverables" ||
    pathname.startsWith("/engineering/deliverables/") ||
    pathname === "/engineering/lifecycle" ||
    pathname.startsWith("/engineering/lifecycle/") ||
    pathname === "/engineering/settings/deliverables" ||
    pathname.startsWith("/engineering/settings/deliverables/") ||
    pathname === "/engineering/information" ||
    pathname.startsWith("/engineering/information/") ||
    pathname === "/engineering/settings/information" ||
    pathname.startsWith("/engineering/settings/information/") ||
    pathname === "/engineering/work" ||
    pathname.startsWith("/engineering/work/") ||
    pathname === "/engineering/settings/work-context" ||
    pathname.startsWith("/engineering/settings/work-context/") ||
    pathname === "/engineering/information-requirements" ||
    pathname.startsWith("/engineering/information-requirements/") ||
    pathname === "/engineering/settings/information-requirements" ||
    pathname.startsWith("/engineering/settings/information-requirements/") ||
    pathname === "/engineering/settings/templates" ||
    pathname.startsWith("/engineering/settings/templates/")
  );
}

function resolveMembershipAccess(
  memberships: Array<{ roles: { slug: string } | { slug: string }[] | null }>
): { roleSlug: string; tier: NavTier } | null {
  if (!memberships.length) return null;

  let strictestTier: NavTier = "admin";
  let strictestRoleSlug = "owner";

  for (const row of memberships) {
    const role = row.roles;
    const slug = (Array.isArray(role) ? role[0]?.slug : role?.slug) ?? "member";
    const tier = resolveNavTier(slug);
    if (NAV_TIER_RANK[tier] <= NAV_TIER_RANK[strictestTier]) {
      strictestTier = tier;
      strictestRoleSlug = slug;
    }
  }

  return {
    roleSlug: strictestRoleSlug,
    tier: strictestTier,
  };
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { url, anonKey } = resolvePublicSupabaseConfig();

  const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet: { name: string; value: string; options: CookieOptions }[]) => {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  const isMfaChallengeRoute = pathname === MFA_CHALLENGE_ROUTE;
  const isAuthRoute =
    pathname === "/login" ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password");
  const isRecoveryRoute = pathname.startsWith("/reset-password");
  const isPublicRoute = isAuthRoute || isRecoveryRoute || pathname === "/" || isMfaChallengeRoute;
  const isApiRoute = pathname.startsWith("/api/");

  if (!user && !isPublicRoute && !isApiRoute) {
    const url = request.nextUrl.clone();
    const originalPath = pathname;
    url.pathname = "/login";
    url.search = "";
    if (
      originalPath === "/review" ||
      originalPath.startsWith("/review/") ||
      originalPath === "/settings/security" ||
      isDeliverableLifecycleAal2Path(originalPath)
    ) {
      url.searchParams.set("next", safeMfaReturnPath(originalPath));
    }
    return NextResponse.redirect(url);
  }

  if (!user && isMfaChallengeRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", safeMfaReturnPath(request.nextUrl.searchParams.get("next")));
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    const next = safeMfaReturnPath(request.nextUrl.searchParams.get("next"), "/engineering");
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const payload = session?.access_token ? decodeJwtPayload(session.access_token) : {};
    const aal = typeof payload.aal === "string" ? payload.aal : "aal1";
    if (
      aal !== "aal2" &&
      (request.nextUrl.searchParams.has("mfa_required") ||
        next.startsWith("/review") ||
        isDeliverableLifecycleAal2Path(next))
    ) {
      url.pathname = MFA_CHALLENGE_ROUTE;
      url.search = "";
      url.searchParams.set("next", next);
      return NextResponse.redirect(url);
    }
    url.pathname = next.startsWith("/review") || next === "/settings/security" || next.startsWith("/engineering")
      ? next
      : "/engineering";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (user && needsPlatformAccessCheck(pathname)) {
    const { data: memberships } = await supabase
      .from("tenant_memberships")
      .select("role_id, roles(slug)")
      .eq("user_id", user.id)
      .eq("status", "active");

    const access = resolveMembershipAccess(memberships ?? []);

    if (!access) {
      const url = request.nextUrl.clone();
      url.pathname = "/engineering";
      return NextResponse.redirect(url);
    }

    const allowed = canAccessPlatformRoute(pathname, {
      roleSlug: access.roleSlug,
      tier: access.tier,
    });

    if (!allowed) {
      const url = request.nextUrl.clone();
      url.pathname = "/engineering";
      return NextResponse.redirect(url);
    }

    const privilegedSurface =
      pathname.startsWith("/platform/") ||
      pathname.startsWith("/system/") ||
      pathname === "/audit" ||
      pathname.startsWith("/audit/");
    const platformAdmin =
      (user.app_metadata as { platform_admin?: boolean } | undefined)?.platform_admin === true;
    if (
      privilegedMfaEnforcementEnabled() &&
      privilegedSurface &&
      (platformAdmin || access.roleSlug === "owner")
    ) {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const payload = session?.access_token ? decodeJwtPayload(session.access_token) : {};
      const decision = evaluatePrivilegedMfa({
        aal: typeof payload.aal === "string" ? payload.aal : null,
        amr: Array.isArray(payload.amr) ? (payload.amr as Array<string | { method?: string }>) : null,
        platformAdmin,
        roleSlug: access.roleSlug,
      });
      if (!decision.allowed) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        url.search = "";
        url.searchParams.set("mfa_required", "privileged");
        url.searchParams.set("next", safeMfaReturnPath(pathname, "/engineering"));
        return NextResponse.redirect(url);
      }
    }
  }

  if (user && (pathname === "/review" || pathname.startsWith("/review/") || isDeliverableLifecycleAal2Path(pathname))) {
    const resolved = await resolveRequestActorContext({
      supabase: boundActorContextClient(supabase),
      userId: user.id,
      header: (name) => request.headers.get(name),
      cookie: (name) => request.cookies.get(name)?.value,
    });
    persistCanonicalContext(response, resolved);
    if (resolved.ok) {
      const policy = resolveReviewIdentityPolicy(resolved.settings ?? {});
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const payload = session?.access_token ? decodeJwtPayload(session.access_token) : {};
      const decision = evaluateReviewIdentityPolicy(policy, {
        aal: typeof payload.aal === "string" ? payload.aal : null,
        amr: Array.isArray(payload.amr) ? (payload.amr as Array<string | { method?: string }>) : null,
        appMetadata: (user.app_metadata as Record<string, unknown> | undefined) ?? null,
      });
      if (!decision.allowed) {
        const url = request.nextUrl.clone();
        url.pathname = MFA_CHALLENGE_ROUTE;
        url.search = "";
        url.searchParams.set("next", safeMfaReturnPath(pathname));
        const redirect = NextResponse.redirect(url);
        persistCanonicalContext(redirect, resolved);
        return redirect;
      }
    }
  }

  return response;
}

function persistCanonicalContext(response: NextResponse, resolved: CanonicalContextDecision) {
  if (!resolved.ok) return;
  const options = canonicalContextCookieOptions(process.env.NODE_ENV === "production");
  response.cookies.set(CANONICAL_CONTEXT_TENANT_COOKIE, resolved.tenantId, options);
  response.cookies.set(CANONICAL_CONTEXT_WORKSPACE_COOKIE, resolved.workspaceId, options);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/health|api/webhooks/microsoft-graph|api/platform/build-identity|api/deployment|deployment).*)",
  ],
};

