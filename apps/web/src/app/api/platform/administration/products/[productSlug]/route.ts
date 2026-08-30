import { NextResponse } from "next/server";
import {
  enrichProductAdministrationView,
  mapInstallationProgress,
  mapLicenceSeatPools,
  mapUsageMetrics,
  mapWorkspaceProductAssignments,
  parseProductDetailTab,
  type ProductDetailTab,
} from "@rtb/platform-core";
import { getAuthContext } from "@/lib/kernel";
import { requireCommerceAdmin } from "@/lib/commerce/with-commerce-entitlement";

type Params = { params: Promise<{ productSlug: string }> };

export async function GET(request: Request, { params }: Params) {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await requireCommerceAdmin(ctx);
  if (denied) return denied;

  const { productSlug } = await params;
  const tab = parseProductDetailTab(new URL(request.url).searchParams.get("tab"));

  const catalogData = await ctx.commerce.catalog.buildTenantCommerceData(ctx.tenantId);
  const products = await import("@rtb/platform-core").then(({ mapRegistryToCommercialProducts }) =>
    mapRegistryToCommercialProducts({ roleSlug: ctx.roleSlug, engineeringOsEnabled: true }, catalogData)
  );
  const product = products.find((p) => p.slug === productSlug);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const productRecord = catalogData.commercial_products?.find((p) => p.slug === productSlug);
  const productId = productRecord?.id;

  const payload: Record<string, unknown> = {
    product: enrichProductAdministrationView(product),
    tab,
  };

  if (tab === "overview" || tab === "health") {
    const installation = productId
      ? await ctx.commerce.installations.getByProduct(ctx.tenantId, productId)
      : null;
    if (installation) {
      const health = await ctx.commerce.installationHealth
        .check(ctx.tenantId, installation.id)
        .catch(() => null);
      payload.product = enrichProductAdministrationView(product, {
        installationId: installation.id,
        lastHealthCheckAt: (health as { checked_at?: string } | null)?.checked_at,
        healthCheckStatus: (health as { status?: string } | null)?.status,
        availableVersion: (installation as { available_version?: string }).available_version,
      });
    }
  }

  if (tab === "applications" && productSlug === "engineering-os") {
    const { ENGINEERING_APPLICATIONS } = await import("@rtb/engineering-os/manifest");
    const { mapEngineeringApplications } = await import("@rtb/platform-core");
    const [installs, piDecision] = await Promise.all([
      ctx.commerce.applicationInstallationLifecycle.listByTenant(ctx.tenantId),
      ctx.commerce.entitlements.check({
        tenantId: ctx.tenantId,
        workspaceId: ctx.workspaceId,
        userId: ctx.userId,
        productKey: "engineering-os",
        applicationKey: "project_intelligence",
        action: "access",
        cachePolicy: "allow-short-cache",
      }),
    ]);
    const installedKeys = new Set(
      installs
        .filter((row) => row.status === "active" || row.status === "degraded")
        .map((row) => row.application_key)
    );
    if (piDecision.allowed) installedKeys.add("project_intelligence");
    const seeds = ENGINEERING_APPLICATIONS.map((app) => ({
      app_key: app.app_key,
      name: app.name,
      description: app.description,
      version: app.version,
      enabled: installedKeys.has(app.app_key),
      routes: app.routes,
    }));
    payload.applicationViews = mapEngineeringApplications(seeds, {
      roleSlug: ctx.roleSlug,
      engineeringOsEnabled: true,
    }).filter((view) => view.appKey === "project_intelligence" || view.section === "installed");
  }

  if (tab === "workspaces") {
    const installations = productId
      ? [await ctx.commerce.installations.getByProduct(ctx.tenantId, productId)].filter(Boolean)
      : await ctx.commerce.installations.listByTenant(ctx.tenantId);

    const { data: workspaces } = await ctx.supabase
      .from("workspaces")
      .select("id, name")
      .eq("tenant_id", ctx.tenantId)
      .eq("status", "active");

    const workspaceMap = new Map((workspaces ?? []).map((w) => [w.id as string, w.name as string]));
    const assignments: Parameters<typeof mapWorkspaceProductAssignments>[0] = [];

    for (const inst of installations) {
      if (!inst) continue;
      const rows = await ctx.commerce.installations.listWorkspaceAssignments(
        ctx.tenantId,
        inst.id
      );
      for (const row of rows) {
        assignments.push({
          assignment_id: row.id as string,
          workspace_id: row.workspace_id as string,
          workspace_name: workspaceMap.get(row.workspace_id as string) ?? row.workspace_id as string,
          product_slug: productSlug,
          product_name: product.name,
          installation_status: inst.status,
        });
      }
    }

    payload.workspaces = mapWorkspaceProductAssignments(assignments);
    payload.availableWorkspaces = (workspaces ?? []).map((w) => ({
      id: w.id,
      name: w.name,
    }));
    payload.installationId = installations[0]?.id;
    payload.productId = productId;
  }

  if (tab === "licences-seats") {
    const [licenses, seatPools, productsCatalog] = await Promise.all([
      ctx.commerce.licenses.listByTenant(ctx.tenantId),
      ctx.commerce.seats.listByTenant(ctx.tenantId),
      ctx.commerce.products.listCatalog(),
    ]);
    const productNameById = new Map(productsCatalog.map((p) => [p.id, p.name]));
    const filteredLicenses = productId
      ? licenses.filter((l) => l.product_id === productId)
      : licenses;
    const filteredPools = productId
      ? seatPools.filter((p) => p.product_id === productId)
      : seatPools;
    payload.licenceSeats = mapLicenceSeatPools(filteredLicenses, filteredPools, productNameById);
  }

  if (tab === "usage") {
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const usage = await ctx.commerce.usage.aggregateByTenant(
      ctx.tenantId,
      monthStart,
      new Date().toISOString()
    );
    payload.usage = mapUsageMetrics(usage);
  }

  if (tab === "installation" || tab === "health") {
    const installation = productId
      ? await ctx.commerce.installations.getByProduct(ctx.tenantId, productId)
      : null;
    if (installation) {
      const [{ steps }, health] = await Promise.all([
        ctx.commerce.installationLifecycle.getWorkflowProgress(ctx.tenantId, installation.id),
        ctx.commerce.installationHealth.check(ctx.tenantId, installation.id).catch(() => null),
      ]);
      payload.installationProgress = mapInstallationProgress({
        installation: {
          id: installation.id,
          status: installation.status,
          product_id: installation.product_id,
        },
        workflowSteps: steps.map((s) => ({
          step_key: s.step_key as string,
          status: s.status as string,
          started_at: s.started_at as string | null | undefined,
          completed_at: s.completed_at as string | null | undefined,
          error_code: s.error_code as string | null | undefined,
          error_message: s.error_message as string | null | undefined,
        })),
        productSlug,
        productName: product.name,
        healthCheckStatus: (health as { status?: string } | null)?.status,
      });
      payload.health = health;
    }
  }

  if (tab === "version-history") {
    payload.versionHistory = productId
      ? await ctx.supabase
          .from("commercial_installation_versions")
          .select("version, created_at, metadata")
          .eq("tenant_id", ctx.tenantId)
          .order("created_at", { ascending: false })
          .limit(20)
          .then(({ data }) => data ?? [])
      : [];
  }

  if (tab === "audit-history") {
    payload.auditEvents = productId
      ? await ctx.commerce.installationLifecycle
          .listEvents(ctx.tenantId, (await ctx.commerce.installations.getByProduct(ctx.tenantId, productId))?.id ?? "")
          .catch(() => [])
      : [];
  }

  return NextResponse.json({ data: payload });
}

export type { ProductDetailTab };
