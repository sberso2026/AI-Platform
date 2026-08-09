import type { SecurityException } from "../contracts";

export class SecurityExceptionRegistry {
  readonly kind = "security_exception_registry" as const;
  private exceptions = new Map<string, SecurityException>();

  approve(exception: SecurityException, nowIso = new Date().toISOString()): SecurityException {
    if (exception.aiApproved !== false) {
      throw new Error("AI cannot approve security exceptions");
    }
    if (exception.permanentImplicit !== false) {
      throw new Error("Permanent implicit exceptions are forbidden");
    }
    if (!exception.approvedBy || !exception.expiresAt || !exception.reason) {
      throw new Error("Exception requires approvedBy, expiresAt, reason");
    }
    if (exception.approvedBy.startsWith("ai:") || exception.approvedBy === "ai_runtime") {
      throw new Error("AI cannot approve security exceptions");
    }
    const exp = Date.parse(exception.expiresAt);
    const now = Date.parse(nowIso);
    if (!Number.isNaN(exp) && !Number.isNaN(now) && exp <= now) {
      throw new Error("Exception must expire in the future at approval time");
    }
    const stored: SecurityException = {
      ...exception,
      reviewStatus: "active",
      aiApproved: false,
      permanentImplicit: false,
    };
    this.exceptions.set(stored.exceptionId, stored);
    return stored;
  }

  refreshExpiry(exceptionId: string, nowIso = new Date().toISOString()): SecurityException {
    const current = this.require(exceptionId);
    const exp = Date.parse(current.expiresAt);
    const now = Date.parse(nowIso);
    if (!Number.isNaN(exp) && !Number.isNaN(now) && exp < now) {
      const next = { ...current, reviewStatus: "expired" as const };
      this.exceptions.set(exceptionId, next);
      return next;
    }
    return current;
  }

  require(exceptionId: string): SecurityException {
    const e = this.exceptions.get(exceptionId);
    if (!e) throw new Error(`Unknown exception: ${exceptionId}`);
    return e;
  }

  list(): SecurityException[] {
    return [...this.exceptions.values()];
  }
}
