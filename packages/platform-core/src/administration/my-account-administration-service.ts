import type { MyAccountView, UsageMetricView } from "./administration-types";

export function buildMyAccountView(input: {
  entitlements: {
    engineeringOs?: { allowed: boolean; seatType?: string };
    applications?: Array<{ appKey: string; name: string; allowed: boolean; openHref?: string }>;
  };
  workspaces: Array<{ id: string; name: string }>;
  personalUsage: UsageMetricView[];
  licenceExpiry?: string;
}): MyAccountView {
  const assignedOperatingSystems: MyAccountView["assignedOperatingSystems"] = [];

  if (input.entitlements.engineeringOs?.allowed) {
    assignedOperatingSystems.push({
      slug: "engineering-os",
      name: "Engineering OS",
      seatType: input.entitlements.engineeringOs.seatType,
      workspaceNames: input.workspaces.map((w) => w.name),
    });
  }

  const assignedApplications =
    input.entitlements.applications?.filter((a) => a.allowed).map((a) => ({
      appKey: a.appKey,
      name: a.name,
      openHref: a.openHref,
    })) ?? [];

  return {
    assignedOperatingSystems,
    assignedApplications,
    seatType: input.entitlements.engineeringOs?.seatType,
    workspaceAccess: input.workspaces,
    personalUsage: input.personalUsage,
    licenceExpiry: input.licenceExpiry,
  };
}
