import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";

export async function GET() {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [plugins, installations] = await Promise.all([
    ctx.kernel.plugins.listPlugins(),
    ctx.kernel.plugins.listInstallations(ctx.tenantId),
  ]);

  return NextResponse.json({ data: { plugins, installations } });
}

export async function POST(request: Request) {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  if (body.action === "register") {
    const plugin = await ctx.kernel.plugins.registerPlugin({
      pluginId: body.pluginId,
      name: body.name,
      author: body.author ?? "RTB Engineering",
      version: body.version,
      manifest: body.manifest ?? {},
      operatingSystem: body.operatingSystem,
      permissions: body.permissions,
    });
    return NextResponse.json({ data: plugin }, { status: 201 });
  }

  const installation = await ctx.kernel.plugins.install({
    tenantId: ctx.tenantId,
    pluginId: body.pluginId,
    version: body.version,
    config: body.config,
    installedBy: ctx.userId,
  });

  return NextResponse.json({ data: installation }, { status: 201 });
}
