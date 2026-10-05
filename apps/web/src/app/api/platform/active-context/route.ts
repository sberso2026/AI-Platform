import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import {
  CANONICAL_CONTEXT_TENANT_COOKIE,
  CANONICAL_CONTEXT_WORKSPACE_COOKIE,
  resolveCanonicalActorContext,
  resolveReviewIdentityPolicy,
} from "@rtb/engineering-review/identity";
import {
  boundActorContextClient,
  canonicalContextCookieOptions,
  loadCanonicalMemberships,
  lookupWorkspaceOwnership,
  requestedContextFromStores,
} from "@/lib/identity/canonical-context";
import { lifecycleErrorResponse, resolveRequestId, unauthenticatedResponse } from "@/lib/lifecycle-api";

function persist(response: NextResponse, tenantId: string, workspaceId: string) {
  const options = canonicalContextCookieOptions(process.env.NODE_ENV === "production");
  response.cookies.set(CANONICAL_CONTEXT_TENANT_COOKIE, tenantId, options);
  response.cookies.set(CANONICAL_CONTEXT_WORKSPACE_COOKIE, workspaceId, options);
}

function publicMemberships(
  memberships: Awaited<ReturnType<typeof loadCanonicalMemberships>>,
) {
  return memberships.map((row) => {
    const policy = resolveReviewIdentityPolicy(row.settings);
    return {
      tenantId: row.tenantId,
      tenantSlug: row.tenantSlug,
      roleSlug: row.roleSlug,
      requireMfa: policy.requireMfa,
      requireEnterpriseSso: policy.requireEnterpriseSso,
      workspaces: row.workspaces.map((workspace) => ({
        workspaceId: workspace.workspaceId,
        slug: workspace.slug,
      })),
    };
  });
}

export async function GET(request: Request) {
  const requestId = resolveRequestId(request);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return unauthenticatedResponse(requestId);

  const headerStore = await headers();
  const cookieStore = await cookies();
  const actorClient = boundActorContextClient(supabase);
  const requested = requestedContextFromStores({
    header: (name) => headerStore.get(name),
    cookie: (name) => cookieStore.get(name)?.value,
  });
  const memberships = await loadCanonicalMemberships(actorClient, user.id);
  if (!requested.ok) {
    return lifecycleErrorResponse(requested.reason, "Active tenant/workspace identifier is invalid", 400, requestId, {
      memberships: publicMemberships(memberships),
    });
  }
  const ownership = await lookupWorkspaceOwnership(actorClient, requested.workspaceId);
  const resolved = resolveCanonicalActorContext({
    memberships,
    requested,
    requestedWorkspaceOwnership: ownership,
  });
  if (!resolved.ok) {
    return NextResponse.json({
      data: {
        current: null,
        reason: resolved.reason,
        memberships: publicMemberships(memberships),
      },
      requestId,
    });
  }
  const policy = resolveReviewIdentityPolicy(resolved.settings);
  const response = NextResponse.json({
    data: {
      current: {
        tenantId: resolved.tenantId,
        workspaceId: resolved.workspaceId,
        tenantSlug: resolved.tenantSlug,
        roleSlug: resolved.roleSlug,
        source: resolved.source,
        requireMfa: policy.requireMfa,
        requireEnterpriseSso: policy.requireEnterpriseSso,
      },
      reason: resolved.source,
      memberships: publicMemberships(memberships),
    },
    requestId,
  });
  persist(response, resolved.tenantId, resolved.workspaceId);
  return response;
}

export async function POST(request: Request) {
  const requestId = resolveRequestId(request);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return unauthenticatedResponse(requestId);

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const actorClient = boundActorContextClient(supabase);
  const memberships = await loadCanonicalMemberships(actorClient, user.id);
  const requested = {
    tenantId: typeof body.tenantId === "string" ? body.tenantId : null,
    workspaceId: typeof body.workspaceId === "string" ? body.workspaceId : null,
  };
  const ownership = await lookupWorkspaceOwnership(actorClient, requested.workspaceId);
  const resolved = resolveCanonicalActorContext({
    memberships,
    requested,
    requestedWorkspaceOwnership: ownership,
  });
  if (!resolved.ok) {
    return lifecycleErrorResponse(
      resolved.reason,
      "Requested tenant/workspace is not authorized for this user",
      resolved.reason === "invalid_identifier" ? 400 : 403,
      requestId,
      { memberships: publicMemberships(memberships) },
    );
  }
  const policy = resolveReviewIdentityPolicy(resolved.settings);
  const response = NextResponse.json({
    data: {
      current: {
        tenantId: resolved.tenantId,
        workspaceId: resolved.workspaceId,
        tenantSlug: resolved.tenantSlug,
        roleSlug: resolved.roleSlug,
        source: "explicit",
        requireMfa: policy.requireMfa,
        requireEnterpriseSso: policy.requireEnterpriseSso,
      },
      memberships: publicMemberships(memberships),
    },
    requestId,
  });
  persist(response, resolved.tenantId, resolved.workspaceId);
  return response;
}
