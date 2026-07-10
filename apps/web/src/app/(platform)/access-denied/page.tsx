import Link from "next/link";
import { buttonVariants } from "@rtb/ui";

const REASON_MESSAGES: Record<string, { title: string; description: string; action?: string }> = {
  subscription_suspended: {
    title: "Subscription suspended",
    description: "Your organisation's subscription is suspended. Contact your tenant owner to resolve billing or compliance issues.",
    action: "Contact owner",
  },
  subscription_cancelled: {
    title: "Subscription cancelled",
    description: "This product subscription has been cancelled and is no longer active.",
    action: "Renew subscription",
  },
  subscription_expired: {
    title: "Subscription expired",
    description: "Your trial or subscription period has ended. Upgrade or renew to restore access.",
    action: "Upgrade plan",
  },
  seat_not_assigned: {
    title: "Seat not assigned",
    description: "A licence is active for your organisation, but no seat has been assigned to your account.",
    action: "Request access",
  },
  application_not_in_plan: {
    title: "Application not included",
    description: "This application is not included in your current plan.",
    action: "Upgrade plan",
  },
  feature_not_enabled: {
    title: "Feature not enabled",
    description: "This feature is not enabled on your current plan.",
    action: "Upgrade plan",
  },
  licence_expired: {
    title: "Licence expired",
    description: "The licence for this application has expired.",
    action: "Renew licence",
  },
  subscription_not_found: {
    title: "No active subscription",
    description: "Your organisation does not have an active subscription for this product.",
    action: "Start trial",
  },
  subscription_missing: {
    title: "No active subscription",
    description: "Your organisation does not have an active subscription for this product.",
    action: "Start trial",
  },
  subscription_inactive: {
    title: "Subscription inactive",
    description: "This subscription is not currently active.",
    action: "Resolve subscription",
  },
  licence_missing: {
    title: "No licence",
    description: "No valid licence exists for this product or application.",
    action: "Request access",
  },
  licence_revoked: {
    title: "Licence revoked",
    description: "The licence for this resource has been revoked.",
    action: "Contact administrator",
  },
  workspace_not_entitled: {
    title: "Workspace not entitled",
    description: "This workspace is not entitled to use this application.",
    action: "Contact administrator",
  },
  usage_limit_exceeded: {
    title: "Usage limit exceeded",
    description: "Your organisation has exceeded the usage limit for this feature.",
    action: "Upgrade plan",
  },
  entitlement_unavailable: {
    title: "Commercial status unavailable",
    description: "We could not verify your commercial access right now. Please try again shortly.",
    action: "Retry",
  },
  internal_evaluation_error: {
    title: "Access check failed",
    description: "We could not complete the entitlement check. Please try again or contact support.",
    action: "Retry",
  },
};

export default async function AccessDeniedPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string; return?: string }>;
}) {
  const params = await searchParams;
  const reason = params.reason ?? "access_denied";
  const info = REASON_MESSAGES[reason] ?? {
    title: "Access denied",
    description: "You do not have permission to access this resource.",
  };

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">{info.title}</h1>
      <p className="mt-3 max-w-md text-muted-foreground">{info.description}</p>
      <div className="mt-8 flex gap-3">
        {params.return && (
          <Link href={params.return} className={buttonVariants({ variant: "outline" })}>
            Go back
          </Link>
        )}
        <Link href="/system/products" className={buttonVariants()}>
          View products
        </Link>
        <Link href="/system/subscriptions" className={buttonVariants({ variant: "secondary" })}>
          Manage subscriptions
        </Link>
      </div>
    </div>
  );
}
