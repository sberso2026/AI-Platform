import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { canAccessPlatformRoute, resolveNavTier } from "@rtb/platform-core";

const PLATFORM_ACCESS_PREFIXES = [
  "/platform/",
  "/system/",
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
    const { data: membership } = await supabase
      .from("tenant_memberships")
      .select("role_id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .limit(1)
      .single();

    if (membership?.role_id) {
      const { data: role } = await supabase
        .from("roles")
        .select("slug")
        .eq("id", membership.role_id)
        .single();

      const roleSlug = (role?.slug as string) ?? "member";
      const allowed = canAccessPlatformRoute(pathname, {
        roleSlug,
        tier: resolveNavTier(roleSlug),
      });

      if (!allowed) {
        const url = request.nextUrl.clone();
        url.pathname = "/engineering";
        return NextResponse.redirect(url);
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/health).*)",
  ],
};

