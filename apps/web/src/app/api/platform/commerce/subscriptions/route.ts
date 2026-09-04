import { NextResponse } from "next/server";
import { InstallationStateMachine, LicenseIssuanceService } from "@rtb/platform-commerce";
import { getAuthContext } from "@/lib/kernel";
import { requireCommerceAdmin } from "@/lib/commerce/with-commerce-entitlement";
import {
  customerFacingProductName,
  licenceStateLabel,
  subscriptionStatusLabel,
  type SubscriptionDisplayRow,
} from "@/lib/commerce/commerce-display";

export async function GET() {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await requireCommerceAdmin(ctx);
  if (denied) return denied;

  const [subscriptions, products, licenses, seats, installations] = await Promise.all([
    ctx.commerce.subscriptions.listByTenant(ctx.tenantId),
    ctx.commerce.products.listCatalog(),
    ctx.commerce.licenses.listByTenant(ctx.tenantId),
    ctx.commerce.seats.listByTenant(ctx.tenantId),
    ctx.commerce.applicationInstallationLifecycle.listByTenant(ctx.tenantId),
  ]);

  const productById = new Map(products.map((product) => [product.id, product]));
  const planIds = [...new Set(subscriptions.map((row) => row.plan_id).filter(Boolean))] as string[];
  const plans = await Promise.all(planIds.map((planId) => ctx.commerce.plans.getById(planId)));
  const planById = new Map(
    plans.filter((plan): plan is NonNullable<typeof plan> => Boolean(plan)).map((plan) => [plan.id, plan]),
  );

  const applicationNames = new Map(
    LicenseIssuanceService.PILOT_APPLICATION_CATALOG.map((row) => [row.applicationKey, row.name]),
  );

  const data: SubscriptionDisplayRow[] = subscriptions.map((subscription) => {
    const product = productById.get(subscription.product_id);
    const plan = subscription.plan_id ? planById.get(subscription.plan_id) : undefined;
    const productLicence = licenses.find(
      (licence) =>
        licence.product_id === subscription.product_id &&
        licence.license_type === "product" &&
        licence.subscription_id === subscription.id,
    );
    const pool = seats.find((row) => row.product_id === subscription.product_id);
    const installedApplicationNames = installations
      .filter(
        (row) =>
          row.product_id === subscription.product_id &&
          InstallationStateMachine.isAccessGranting(
            InstallationStateMachine.normalizeAppStatus(row.status) as never,
          ),
      )
      .map((row) => applicationNames.get(row.application_key) ?? row.application_key);

    return {
      ...subscription,
      productName: customerFacingProductName({ slug: product?.slug, name: product?.name }),
      planName: plan?.name ?? "—",
      statusLabel: subscriptionStatusLabel(subscription.status),
      licenceState: licenceStateLabel(productLicence?.status),
      seatAssigned: pool?.assigned_seats ?? 0,
      seatTotal: pool?.total_seats ?? 0,
      installedApplicationNames,
    };
  });

  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await requireCommerceAdmin(ctx);
  if (denied) return denied;

  const body = await request.json();
  const subscription = await ctx.commerce.subscriptions.create({
    tenantId: ctx.tenantId,
    productId: body.productId,
    planId: body.planId,
    workspaceId: body.workspaceId,
    status: body.status,
    quantity: body.quantity,
    createdBy: ctx.userId,
  });
  return NextResponse.json({ data: subscription }, { status: 201 });
}
