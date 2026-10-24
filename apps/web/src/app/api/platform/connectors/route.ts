import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";
import {
  EngineeringConnectorRegistry,
  FileImportConnectorAdapter,
  NativeMockConnectorAdapter,
  getPhaseE4Declaration,
  toAdminViewStatus,
} from "@rtb/engineering-os";

/**
 * Minimal admin connector registry surface (E4).
 * In-process reference registry for capability/health listing — not durable production store.
 * Normal engineers should not use this; platform admin only.
 */
function referenceRegistryForTenant(tenantId: string) {
  const registry = new EngineeringConnectorRegistry();
  registry.register(new NativeMockConnectorAdapter(tenantId));
  const file = new FileImportConnectorAdapter(tenantId);
  registry.register(file);
  return registry;
}

export async function GET() {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const registry = referenceRegistryForTenant(ctx.tenantId);
  const connectors = registry.listAdminViews(ctx.tenantId);
  return NextResponse.json({
    data: {
      declaration: getPhaseE4Declaration(),
      connectors,
      adminStatuses: connectors.map((c) => ({
        connectorId: c.connectorId,
        status: c.status,
      })),
      note: "E4 reference adapters only; live vendor connections are not certified. Credentials via Platform Secrets.",
    },
  });
}

export async function POST(request: Request) {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const action = body.action as string | undefined;
  const registry = referenceRegistryForTenant(ctx.tenantId);

  if (action === "test") {
    const connectorId = String(body.connectorId ?? "");
    try {
      const health = await registry.testConnection(connectorId, ctx.tenantId);
      const meta = registry.get(connectorId, ctx.tenantId)?.metadata;
      return NextResponse.json({
        data: {
          health,
          adminStatus: meta ? toAdminViewStatus(meta) : "Disconnected",
        },
      });
    } catch {
      return NextResponse.json({ error: "connector_not_found" }, { status: 404 });
    }
  }

  if (action === "disable") {
    const connectorId = String(body.connectorId ?? "");
    try {
      registry.setStatus(connectorId, ctx.tenantId, "DISABLED");
      return NextResponse.json({ data: { connectorId, status: "Disabled" } });
    } catch {
      return NextResponse.json({ error: "connector_not_found" }, { status: 404 });
    }
  }

  return NextResponse.json(
    { error: "Unsupported action. Use test|disable." },
    { status: 400 },
  );
}
