import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";
import { requireCommerceAdmin } from "@/lib/commerce/with-commerce-entitlement";
import { CommerceDomainError } from "@rtb/platform-commerce";
import { InstallationLifecycleService } from "@rtb/platform-commerce";

export async function requireInstallationAdmin() {
  const ctx = await getAuthContext();
  if (!ctx) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const denied = await requireCommerceAdmin(ctx);
  if (denied) return { error: denied };
  try {
    InstallationLifecycleService.assertInstallPermission(ctx.roleSlug);
  } catch (err) {
    if (err instanceof CommerceDomainError) {
      return {
        error: NextResponse.json({ error: err.message, code: err.code }, { status: err.statusCode }),
      };
    }
    throw err;
  }
  return { ctx };
}

export function handleInstallationError(err: unknown): NextResponse {
  if (err instanceof CommerceDomainError) {
    return NextResponse.json({ error: err.message, code: err.code }, { status: err.statusCode });
  }
  throw err;
}
