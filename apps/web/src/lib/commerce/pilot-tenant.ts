import { NextResponse } from "next/server";

export function assertPilotTenantScope(tenantId: string): NextResponse | null {
  const allowedTenantId = process.env.COMMERCE_PILOT_TENANT_ID;
  if (!allowedTenantId) {
    return null;
  }
  if (allowedTenantId !== tenantId) {
    return NextResponse.json(
      { error: "Pilot reconciliation is limited to the RTB controlled pilot tenant." },
      { status: 403 },
    );
  }
  return null;
}
