"use client";

import Link from "next/link";
import {
  Button,
  buttonVariants,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@rtb/ui";
import type { CommercialActionId, CommercialApplicationView } from "@rtb/platform-core";
import {
  COMMERCIAL_ACTION_LABELS,
  isActionVisible,
} from "@rtb/platform-core";
import { CommercialStatusChips } from "./commercial-status-chips";

function ApplicationAction({
  action,
  app,
  roleSlug,
  variant,
}: {
  action: CommercialActionId;
  app: CommercialApplicationView;
  roleSlug: string;
  variant: "default" | "outline";
}) {
  if (!isActionVisible(action, roleSlug)) return null;

  const href =
    action === "open"
      ? app.openHref
      : action === "install"
        ? app.installHref
        : action === "manage"
          ? app.manageHref
          : undefined;
  const label = COMMERCIAL_ACTION_LABELS[action];

  if (href) {
    return (
      <Link
        href={href}
        className={buttonVariants({ variant, size: "sm" })}
        data-testid={`app-action-${action}`}
      >
        {label}
      </Link>
    );
  }

  return (
    <Button
      variant={variant}
      size="sm"
      disabled
      data-testid={`app-action-${action}`}
      title="Workflow not yet connected"
    >
      {label}
    </Button>
  );
}

export function ApplicationCard({
  app,
  roleSlug,
}: {
  app: CommercialApplicationView;
  roleSlug: string;
}) {
  return (
    <Card
      className="border-border bg-white shadow-sm"
      data-testid={`application-card-${app.appKey}`}
      data-section={app.section}
    >
      <CardHeader>
        <CardTitle className="text-base text-slate-800">{app.name}</CardTitle>
        <CardDescription>{app.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <CommercialStatusChips
          subscriptionStatus={app.subscriptionStatus ?? "expired"}
          licenceStatus={app.licenceStatus}
          installationStatus={app.installationStatus}
        />
        {app.version && (
          <p className="text-xs text-slate-500">Version {app.version}</p>
        )}
        <div className="flex flex-wrap gap-2">
          {app.primaryAction && (
            <ApplicationAction
              action={app.primaryAction}
              app={app}
              roleSlug={roleSlug}
              variant="default"
            />
          )}
          {app.secondaryAction && (
            <ApplicationAction
              action={app.secondaryAction}
              app={app}
              roleSlug={roleSlug}
              variant="outline"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
