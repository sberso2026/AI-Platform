import { NextResponse } from "next/server";
import { withBusinessApi } from "@/lib/commerce/business-api";
import { ownerCommandError, ownerCommandScope } from "@/lib/business/owner-command-http";
import { hasBusinessPermission } from "@rtb/business-os";

export const GET = withBusinessApi(async ({ ctx }) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  try {
    const data = await ctx.business.connectors.overview(scope);
    return NextResponse.json({
      data: {
        ...data,
        canManage: hasBusinessPermission(ctx.permissions, "business_os.connectors.manage"),
        browserFixture: true,
        liveProviderCertification: false,
      },
    });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.connectors.view");
