/**
 * Phase 14D S01 — Break-glass governance (no hardcoded credentials).
 * Emergency access must never silently bypass audit.
 */

export type BreakGlassEligibility =
  | "platform_incident_commander"
  | "security_on_call"
  | "platform_owner_delegate";

export interface BreakGlassRequest {
  requestId: string;
  principalId: string;
  eligibility: BreakGlassEligibility;
  reason: string;
  requestedPrivileges: string[];
  /** ISO timestamp */
  requestedAt: string;
  /** ISO timestamp — required time bound */
  expiresAt: string;
}

export interface BreakGlassAuditEvent {
  eventId: string;
  requestId: string;
  action:
    | "requested"
    | "approved"
    | "activated"
    | "used"
    | "revoked"
    | "expired"
    | "post_use_review";
  at: string;
  actorId: string;
  detail: string;
  /** Never store secret material */
  containsSecretMaterial: false;
}

export interface BreakGlassSession {
  request: BreakGlassRequest;
  approvedBy: string;
  active: boolean;
  auditTrail: BreakGlassAuditEvent[];
  postUseReviewRequired: true;
}

const MAX_PRIVILEGES = [
  "platform_admin.read",
  "platform_admin.support",
  "tenant.isolation.investigate",
  "secret.metadata.read",
  "execution_host.status.read",
] as const;

export function assertBreakGlassReason(reason: string): void {
  if (!reason || reason.trim().length < 12) {
    throw new Error("Break-glass reason required (min 12 chars).");
  }
}

export function assertBreakGlassTimeBound(requestedAt: string, expiresAt: string): void {
  const start = Date.parse(requestedAt);
  const end = Date.parse(expiresAt);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    throw new Error("Break-glass expiresAt must be after requestedAt.");
  }
  const maxMs = 8 * 60 * 60 * 1000;
  if (end - start > maxMs) {
    throw new Error("Break-glass window must be ≤ 8 hours.");
  }
}

export function assertBreakGlassPrivileges(privileges: string[]): void {
  if (!privileges.length) {
    throw new Error("Break-glass privileges must be explicit and restricted.");
  }
  for (const p of privileges) {
    if (!(MAX_PRIVILEGES as readonly string[]).includes(p)) {
      throw new Error(`Break-glass privilege not allowed: ${p}`);
    }
  }
}

export function openBreakGlassSession(input: {
  request: BreakGlassRequest;
  approvedBy: string;
  actorId: string;
}): BreakGlassSession {
  assertBreakGlassReason(input.request.reason);
  assertBreakGlassTimeBound(input.request.requestedAt, input.request.expiresAt);
  assertBreakGlassPrivileges(input.request.requestedPrivileges);
  if (!input.approvedBy || input.approvedBy === input.request.principalId) {
    throw new Error("Break-glass requires distinct approver (segregation of duties).");
  }

  const now = new Date().toISOString();
  const auditTrail: BreakGlassAuditEvent[] = [
    {
      eventId: `${input.request.requestId}:requested`,
      requestId: input.request.requestId,
      action: "requested",
      at: input.request.requestedAt,
      actorId: input.request.principalId,
      detail: input.request.reason,
      containsSecretMaterial: false,
    },
    {
      eventId: `${input.request.requestId}:approved`,
      requestId: input.request.requestId,
      action: "approved",
      at: now,
      actorId: input.approvedBy,
      detail: `Approved privileges: ${input.request.requestedPrivileges.join(",")}`,
      containsSecretMaterial: false,
    },
    {
      eventId: `${input.request.requestId}:activated`,
      requestId: input.request.requestId,
      action: "activated",
      at: now,
      actorId: input.actorId,
      detail: `Expires ${input.request.expiresAt}`,
      containsSecretMaterial: false,
    },
  ];

  return {
    request: input.request,
    approvedBy: input.approvedBy,
    active: true,
    auditTrail,
    postUseReviewRequired: true,
  };
}

export function recordBreakGlassUse(
  session: BreakGlassSession,
  actorId: string,
  operation: string,
): BreakGlassSession {
  if (!session.active) {
    throw new Error("Break-glass session inactive.");
  }
  if (Date.parse(session.request.expiresAt) <= Date.now()) {
    throw new Error("Break-glass session expired.");
  }
  return {
    ...session,
    auditTrail: [
      ...session.auditTrail,
      {
        eventId: `${session.request.requestId}:used:${session.auditTrail.length}`,
        requestId: session.request.requestId,
        action: "used",
        at: new Date().toISOString(),
        actorId,
        detail: operation,
        containsSecretMaterial: false,
      },
    ],
  };
}

export function revokeBreakGlass(
  session: BreakGlassSession,
  actorId: string,
  reason: string,
): BreakGlassSession {
  return {
    ...session,
    active: false,
    auditTrail: [
      ...session.auditTrail,
      {
        eventId: `${session.request.requestId}:revoked`,
        requestId: session.request.requestId,
        action: "revoked",
        at: new Date().toISOString(),
        actorId,
        detail: reason,
        containsSecretMaterial: false,
      },
      {
        eventId: `${session.request.requestId}:post_use_review`,
        requestId: session.request.requestId,
        action: "post_use_review",
        at: new Date().toISOString(),
        actorId,
        detail: "Post-use review required before closure",
        containsSecretMaterial: false,
      },
    ],
  };
}

/** Hard lock: emergency credentials are never embedded in source. */
export const BREAK_GLASS_HARDCODED_CREDENTIALS_FORBIDDEN = true as const;

