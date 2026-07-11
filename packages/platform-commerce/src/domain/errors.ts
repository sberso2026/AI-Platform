/**
 * Commerce domain errors — typed failures for lifecycle and entitlement enforcement.
 */

export class CommerceDomainError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly statusCode = 400
  ) {
    super(message);
    this.name = "CommerceDomainError";
  }
}

export class InvalidSubscriptionTransitionError extends CommerceDomainError {
  constructor(from: string, to: string) {
    super(`Invalid subscription transition: ${from} → ${to}`, "invalid_subscription_transition", 422);
    this.name = "InvalidSubscriptionTransitionError";
  }
}

export class SubscriptionNotFoundError extends CommerceDomainError {
  constructor(id: string) {
    super(`Subscription not found: ${id}`, "subscription_not_found", 404);
    this.name = "SubscriptionNotFoundError";
  }
}

export class SubscriptionConflictError extends CommerceDomainError {
  constructor(message: string) {
    super(message, "subscription_conflict", 409);
    this.name = "SubscriptionConflictError";
  }
}

export class TrialNotEligibleError extends CommerceDomainError {
  constructor(readonly reason: string) {
    super(`Trial not eligible: ${reason}`, "trial_not_eligible", 422);
    this.name = "TrialNotEligibleError";
  }
}

export class LicenceNotFoundError extends CommerceDomainError {
  constructor(id: string) {
    super(`Licence not found: ${id}`, "licence_not_found", 404);
    this.name = "LicenceNotFoundError";
  }
}

export class LicenceExpiredError extends CommerceDomainError {
  constructor() {
    super("Licence has expired", "licence_expired", 403);
    this.name = "LicenceExpiredError";
  }
}

export class SeatLimitExceededError extends CommerceDomainError {
  constructor() {
    super("Seat pool capacity exceeded", "seat_limit_exceeded", 409);
    this.name = "SeatLimitExceededError";
  }
}

export class SeatAlreadyAssignedError extends CommerceDomainError {
  constructor(userId: string) {
    super(`Seat already assigned to user ${userId}`, "seat_already_assigned", 409);
    this.name = "SeatAlreadyAssignedError";
  }
}

export class EntitlementDeniedError extends CommerceDomainError {
  constructor(readonly reasonCode: string, message?: string) {
    super(message ?? `Access denied: ${reasonCode}`, reasonCode, 403);
    this.name = "EntitlementDeniedError";
  }
}

export class CommercePermissionDeniedError extends CommerceDomainError {
  constructor() {
    super("Commerce permission denied", "commerce_permission_denied", 403);
    this.name = "CommercePermissionDeniedError";
  }
}

export class PlanChangeConflictError extends CommerceDomainError {
  constructor(message: string) {
    super(message, "plan_change_conflict", 409);
    this.name = "PlanChangeConflictError";
  }
}

export class InvalidInstallationTransitionError extends CommerceDomainError {
  constructor(from: string, to: string) {
    super(
      `Invalid installation transition: ${from} → ${to}`,
      "invalid_installation_transition",
      409
    );
    this.name = "InvalidInstallationTransitionError";
  }
}

export class InstallationNotFoundError extends CommerceDomainError {
  constructor(id: string) {
    super(`Installation not found: ${id}`, "installation_not_found", 404);
    this.name = "InstallationNotFoundError";
  }
}

export class InstallationConflictError extends CommerceDomainError {
  constructor(message: string, code = "installation_conflict") {
    super(message, code, 409);
    this.name = "InstallationConflictError";
  }
}

export class InstallationDependencyError extends CommerceDomainError {
  constructor(message: string, code: string) {
    super(message, code, 422);
    this.name = "InstallationDependencyError";
  }
}
