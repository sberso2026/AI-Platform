/**
 * Phase 13D.1 — Provider status / SPACE GASS detect-only probe.
 */
import { NextResponse } from "next/server";
import {
  createEtabsReservedHostProbe,
  getEtabsHostReservation,
  probeSpaceGassHost,
} from "@rtb/engineering-execution-host";
import {
  EXEC_HOST_GOVERNANCE,
  execHostErr,
  parseExecHostJsonBody,
  rejectForbiddenExecHostPayload,
  requireScope,
} from "../_assurance";

export async function POST(req: Request) {
  const parsed = await parseExecHostJsonBody(req);
  if (!parsed.ok) return parsed.response;
  const forbidden = rejectForbiddenExecHostPayload(parsed.body, parsed.requestId);
  if (forbidden) return forbidden;
  const scope = requireScope(parsed.body, parsed.requestId);
  if (scope instanceof NextResponse) return scope;

  const operation =
    typeof parsed.body.operation === "string" ? parsed.body.operation : "probe";
  const providerId =
    typeof parsed.body.providerId === "string" ? parsed.body.providerId : "spacegass";

  if (operation === "etabs_reservation") {
    return NextResponse.json({
      accepted: true,
      requestId: parsed.requestId,
      reservation: getEtabsHostReservation(),
      ...EXEC_HOST_GOVERNANCE,
    });
  }

  if (providerId === "etabs") {
    const probe = await createEtabsReservedHostProbe().probe();
    return NextResponse.json({
      accepted: true,
      requestId: parsed.requestId,
      probe,
      ...EXEC_HOST_GOVERNANCE,
    });
  }

  if (providerId !== "spacegass") {
    return execHostErr(
      422,
      "provider_unsupported",
      `Provider '${providerId}' is not registered on this host foundation`,
      parsed.requestId,
    );
  }

  const probe = await probeSpaceGassHost({ timeoutMs: 2500 });
  return NextResponse.json({
    accepted: true,
    requestId: parsed.requestId,
    correlationId: parsed.correlationId,
    tenantId: scope.tenantId,
    workspaceId: scope.workspaceId,
    probe,
    ...EXEC_HOST_GOVERNANCE,
  });
}
