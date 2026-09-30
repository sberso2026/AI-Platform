import { cookies, headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { createPlatformKernel } from "@rtb/platform-kernel";
import { createEngineeringOS } from "@rtb/engineering-os";
import { createPlatformCommerce } from "@rtb/platform-commerce";
import { PermissionService } from "@rtb/platform-core";
import type { Permission } from "@rtb/types";
import type { TenantSettings } from "@rtb/types";
import { resolveRequestActorContext } from "@/lib/identity/canonical-context";
import type { CanonicalContextDeniedReason } from "@rtb/engineering-review/identity";

export async function getKernel() {
  const supabase = await createClient();
  const serviceClient = createServiceClient();
  return { supabase, kernel: createPlatformKernel(supabase, serviceClient) };
}

export interface AuthContext {
  userId: string;
  tenantId: string;
  workspaceId: string | undefined;
  roleSlug: string;
  permissions: Permission[];
  showAdvancedPlatformTools: boolean;
  supabase: Awaited<ReturnType<typeof createClient>>;
  kernel: ReturnType<typeof createPlatformKernel>;
  engineering: ReturnType<typeof createEngineeringOS>;
  commerce: ReturnType<typeof createPlatformCommerce>;
}

export type AuthContextResolution =
  | { ok: true; context: AuthContext }
  | { ok: false; reason: "unauthenticated" | CanonicalContextDeniedReason };

export async function resolveAuthContext(): Promise<AuthContextResolution> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: "unauthenticated" };

  const headerStore = await headers();
  const cookieStore = await cookies();
  const resolved = await resolveRequestActorContext({
    supabase,
    userId: user.id,
    header: (name) => headerStore.get(name),
    cookie: (name) => cookieStore.get(name)?.value,
  });
  if (!resolved.ok) return resolved;

  const serviceClient = createServiceClient();
  const kernel = createPlatformKernel(supabase, serviceClient);
  const engineering = createEngineeringOS(supabase, kernel, {
    documentBodyRetriever: {
      retrieve: async (query) => {
        const { createDocumentBodyRetrievalProbe } = await import(
          "@/lib/engineering/document-body-retrieval"
        );
        return createDocumentBodyRetrievalProbe().retrieve!(query);
      },
    },
    projectionWriteClient: serviceClient,
  });
  const commerce = createPlatformCommerce(supabase);
  const permissionService = new PermissionService(supabase);
  const permissions = await permissionService.getUserPermissions(user.id, resolved.tenantId);
  const settings = (resolved.settings ?? {}) as TenantSettings;

  return {
    ok: true,
    context: {
      userId: user.id,
      tenantId: resolved.tenantId,
      workspaceId: resolved.workspaceId,
      roleSlug: resolved.roleSlug,
      permissions,
      showAdvancedPlatformTools: settings.showAdvancedPlatformTools === true,
      supabase,
      kernel,
      engineering,
      commerce,
    },
  };
}

export async function getAuthContext(): Promise<AuthContext | null> {
  const resolved = await resolveAuthContext();
  return resolved.ok ? resolved.context : null;
}
