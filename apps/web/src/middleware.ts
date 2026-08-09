import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { evaluatePrivilegedMfa } from "@rtb/engineering-os/security-closure/privileged-mfa";
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

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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

  const isAuthRoute = request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/signup");
  const isPublicRoute = isAuthRoute || request.nextUrl.pathname === "/";
  const isApiRoute = pathname.startsWith("/api/");

  if (!user && !isPublicRoute && !isApiRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/engineering";
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
        url.searchParams.set("mfa_required", "privileged");
        return NextResponse.redirect(url);
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/health|api/webhooks/microsoft-graph|api/platform/build-identity|api/deployment|deployment).*)",
  ],
};

