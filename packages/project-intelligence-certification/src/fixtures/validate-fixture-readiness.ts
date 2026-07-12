import type { PiFixtureManifest } from "./env.js";

export interface FixtureReadiness {
  ok: boolean;
  failures: string[];
}

function required(value: unknown, path: string, failures: string[]): void {
  if (typeof value !== "string" || !value.trim()) failures.push(`${path} is required`);
}

/** Validates the complete fixture contract without requiring hosted credentials. */
export function validatePiFixtureReadiness(manifest: unknown): FixtureReadiness {
  const failures: string[] = [];
  const data = manifest as Partial<PiFixtureManifest> | null;
  if (!data || typeof data !== "object") return { ok: false, failures: ["manifest is required"] };

  required(data.runId, "runId", failures);
  required(data.createdAt, "createdAt", failures);
  if (data.slugPrefix !== "cert-pi-") failures.push("slugPrefix must be cert-pi-");
  const baseline = data.baseline;
  if (!baseline) {
    failures.push("baseline is required");
  } else {
    for (const key of ["tenantId", "workspaceId", "workspaceBId", "engineeringProjectId", "mappingId", "approvedMappingId", "foreignMappingId", "engineeringOsInstallationId", "piApplicationInstallationId", "licenceId"] as const) {
      required(baseline[key], `baseline.${key}`, failures);
    }
    for (const actor of ["owner", "admin", "engineer", "engineerWorkspaceBOnly", "viewer", "otherTenantOwner"]) {
      const user = baseline.users?.[actor];
      if (!user) {
        failures.push(`baseline.users.${actor} is required`);
        continue;
      }
      required(user.id, `baseline.users.${actor}.id`, failures);
      required(user.email, `baseline.users.${actor}.email`, failures);
      required(user.jwt, `baseline.users.${actor}.jwt`, failures);
      required(user.role, `baseline.users.${actor}.role`, failures);
    }
    required(baseline.seatAssignments?.owner, "baseline.seatAssignments.owner", failures);
    required(baseline.seatAssignments?.engineer, "baseline.seatAssignments.engineer", failures);
  }

  const denial = data.denial;
  if (!denial) {
    failures.push("denial is required");
  } else {
    required(denial.piNotInstalledTenant?.tenantId, "denial.piNotInstalledTenant.tenantId", failures);
    required(denial.piNotInstalledTenant?.workspaceId, "denial.piNotInstalledTenant.workspaceId", failures);
    required(denial.piNotInstalledTenant?.engineeringOsInstallationId, "denial.piNotInstalledTenant.engineeringOsInstallationId", failures);
    required(denial.piNotInstalledTenant?.owner?.jwt, "denial.piNotInstalledTenant.owner.jwt", failures);
    required(denial.suspendedLicence?.tenantId, "denial.suspendedLicence.tenantId", failures);
    required(denial.suspendedLicence?.licenceId, "denial.suspendedLicence.licenceId", failures);
    required(denial.suspendedLicence?.owner?.jwt, "denial.suspendedLicence.owner.jwt", failures);
    required(denial.seatNotAssigned?.tenantId, "denial.seatNotAssigned.tenantId", failures);
    required(denial.seatNotAssigned?.workspaceId, "denial.seatNotAssigned.workspaceId", failures);
    required(denial.seatNotAssigned?.user?.jwt, "denial.seatNotAssigned.user.jwt", failures);
    required(denial.workspaceNotAssigned?.tenantId, "denial.workspaceNotAssigned.tenantId", failures);
    required(denial.workspaceNotAssigned?.userWithoutWorkspace?.jwt, "denial.workspaceNotAssigned.userWithoutWorkspace.jwt", failures);
    for (const [key, fixture] of Object.entries(denial)) {
      required(fixture?.expectedCode, `denial.${key}.expectedCode`, failures);
      if (!fixture?.expectedReason && !fixture?.expectedState) {
        failures.push(`denial.${key} requires expectedReason or expectedState`);
      }
    }
  }
  return { ok: failures.length === 0, failures };
}

