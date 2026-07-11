import { describe, it, expect } from "vitest";
import { mapInstallationProgress } from "./installation-administration-service";

describe("InstallationAdministrationService", () => {
  it("does not mark future customer steps as completed", () => {
    const progress = mapInstallationProgress({
      installation: { id: "inst-1", status: "provisioning" },
      workflowSteps: [
        {
          step_key: "entitlement_verified",
          status: "completed",
          started_at: "2026-01-01T00:00:00Z",
          completed_at: "2026-01-01T00:00:01Z",
        },
        {
          step_key: "dependencies_validated",
          status: "completed",
          started_at: "2026-01-01T00:00:01Z",
          completed_at: "2026-01-01T00:00:02Z",
        },
        { step_key: "provisioning", status: "in_progress", started_at: "2026-01-01T00:00:02Z" },
      ],
    });

    const activation = progress.steps.find((s) => s.key === "activation_complete");
    expect(activation?.status).toBe("pending");

    const subscription = progress.steps.find((s) => s.key === "subscription_verified");
    expect(subscription?.status).toBe("completed");
  });
});
