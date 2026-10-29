/**
 * EOS 3.9 Migration Engine — staging/development only.
 * EOS_2_PROJECT != EOS_3_PROJECT_UNTIL_EXPLICITLY_MIGRATED
 * NO_AUTOMATIC_MIGRATION; AI_MIGRATION_AUTHORITY=NO
 */

import { createHash } from "node:crypto";
import { buildEos3Provenance } from "../commerce/eos3-provenance";
import { resolveProjectGeneration } from "../commerce/eos3-identity";
import { eos2AutoMigrationToEos3 } from "../commerce/eos3-foundation";
import { EOS2_TO_EOS3_OBJECT_MAPPING } from "./eos3-object-mapping";
import { EOS3_D1_MIGRATION_STATE, EOS3_EXTERNAL_SOLVER_GLOBAL_QUALIFICATION } from "./eos3-solver-framework";

export const AI_MIGRATION_AUTHORITY = false as const;
export const EOS_2_AUTO_MIGRATION_TO_EOS_3 = false as const;
export const EOS_2_BULK_AUTO_MIGRATION = false as const;
export const EOS_2_LOGIN_TRIGGERED_MIGRATION = false as const;
export const EOS_2_ENTITLEMENT_TRIGGERED_MIGRATION = false as const;
export const EOS_2_ROUTE_TRIGGERED_MIGRATION = false as const;
export const EOS_2_ENTITLEMENT_AUTO_ENABLES_EOS_3 = false as const;
export const EOS_2_ENROLLMENT_AUTO_ENABLES_EOS_3 = false as const;
export const EOS3_MIGRATION_POLICY_VERSION = "1.0.0" as const;

export type MigrationEligibility = "ELIGIBLE" | "ELIGIBLE_WITH_LIMITATIONS" | "NOT_ELIGIBLE";

export type MappingClass = "DIRECT_MAP" | "EXTENDED_MAP" | "TRANSFORM" | "DEFER" | "UNSUPPORTED";

export type MigrationJobState =
  | "DRAFT"
  | "PREFLIGHT"
  | "READY"
  | "AUTHORIZED"
  | "RUNNING"
  | "VERIFYING"
  | "COMPLETED"
  | "FAILED"
  | "ROLLED_BACK";

export type Eos2SourceProject = {
  projectId: string;
  tenantId: string;
  workspaceId: string;
  generation: 2;
  metadata: Record<string, unknown> | null;
  objects: Array<{
    objectId: string;
    objectType: string;
    revisionIds: string[];
    qualificationState: string | null;
    evidenceClass: string | null;
    payload: Record<string, unknown>;
    externalRef: string | null;
  }>;
  relationships: Array<{ fromId: string; toId: string; type: string }>;
  baselines: Array<{ baselineId: string; memberRevisionIds: string[]; frozen: true }>;
  decisions: Array<{
    decisionId: string;
    actorId: string;
    authority: string;
    at: string;
    rationale: string;
    evidenceIds: string[];
    evidenceClass: "HUMAN_DECISION";
  }>;
  assumptions: Array<{ assumptionId: string; text: string }>;
  interfaces: Array<{ interfaceId: string; sourceAuthority: string; receiverAuthority: string }>;
  deliverables: Array<{ deliverableId: string; approvalState: string; releaseState: string }>;
  workflowStates: Array<{ objectId: string; state: string; active: boolean }>;
  audit: Array<{ action: string; actorId: string; at: string }>;
  events: Array<{ eventId: string; type: string; historical: true }>;
  contentFingerprint: string;
};

export type MigrationEligibilityResult = {
  result: MigrationEligibility;
  reasons: string[];
  policyVersion: typeof EOS3_MIGRATION_POLICY_VERSION;
};

export type MigrationManifest = {
  migrationId: string;
  sourceProjectId: string;
  sourceGeneration: 2;
  targetGeneration: 3;
  sourceObjectCount: number;
  sourceRelationshipCount: number;
  policyVersion: typeof EOS3_MIGRATION_POLICY_VERSION;
  transformations: Array<{ objectType: string; mappingClass: MappingClass }>;
  preservedObjectIds: string[];
  skippedDeferred: string[];
  qualificationStates: Record<string, string | null>;
  sourceFingerprint: string;
  authorizedActorId: string | null;
  authorizedAt: string | null;
  createdAt: string;
  rollbackRef: string | null;
  immutable: true;
  provenance: Record<string, unknown>;
};

export type MigratedTargetProject = {
  projectId: string;
  tenantId: string;
  workspaceId: string;
  generation: 3;
  sourceProjectId: string;
  migrationId: string;
  objects: Eos2SourceProject["objects"];
  relationships: Eos2SourceProject["relationships"];
  baselines: Eos2SourceProject["baselines"];
  decisions: Eos2SourceProject["decisions"];
  assumptions: Eos2SourceProject["assumptions"];
  interfaces: Eos2SourceProject["interfaces"];
  deliverables: Eos2SourceProject["deliverables"];
  productionActivated: false;
  activated: false;
};

export type MigrationJob = {
  migrationId: string;
  state: MigrationJobState;
  tenantId: string;
  workspaceId: string;
  sourceProjectId: string;
  manifest: MigrationManifest | null;
  preflightFingerprint: string | null;
  target: MigratedTargetProject | null;
  authorizedBy: string | null;
  failureReason: string | null;
  verification: Record<string, unknown> | null;
  evidenceFingerprint: string | null;
  audit: Array<{ action: string; actorId: string | null; at: string; detail: Record<string, unknown> }>;
  createdAt: string;
  updatedAt: string;
};

function id(): string {
  return crypto.randomUUID();
}
function now(): string {
  return new Date().toISOString();
}
function hash(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}

export function fingerprintSource(project: Eos2SourceProject): string {
  return hash(
    JSON.stringify({
      projectId: project.projectId,
      objects: project.objects.map((o) => o.objectId).sort(),
      relationships: project.relationships.length,
      baselines: project.baselines.map((b) => b.baselineId).sort(),
      decisions: project.decisions.map((d) => d.decisionId).sort(),
      content: project.contentFingerprint,
    }),
  );
}

export function mappingClassFor(objectType: string): MappingClass {
  const row = EOS2_TO_EOS3_OBJECT_MAPPING.find((m) => m.eos3Object === objectType);
  if (!row) return "UNSUPPORTED";
  if (row.status === "NEW_EOS3_OBJECT") return "DEFER";
  if (row.transformationNeeded) return "TRANSFORM";
  if (row.status === "EXTENDED") return "EXTENDED_MAP";
  return "DIRECT_MAP";
}

export function evaluateMigrationEligibility(input: {
  source: Eos2SourceProject;
  eos3Entitled: boolean;
  eos3Enrolled: boolean;
  productionEnvironment?: boolean;
  unsupportedObjectTypes?: string[];
  unresolvedIntegrityIssues?: string[];
}): MigrationEligibilityResult {
  const reasons: string[] = [];
  if (input.productionEnvironment) {
    return { result: "NOT_ELIGIBLE", reasons: ["production_migration_denied"], policyVersion: EOS3_MIGRATION_POLICY_VERSION };
  }
  if (eos2AutoMigrationToEos3() !== false || EOS_2_AUTO_MIGRATION_TO_EOS_3 !== false) {
    reasons.push("auto_migration_guard_failed");
  }
  const gen = resolveProjectGeneration(input.source.metadata);
  if (gen !== "eos2_compatible" && input.source.generation !== 2) {
    reasons.push("source_not_eos2");
  }
  if (input.source.generation !== 2) reasons.push("wrong_source_generation");
  if (!input.eos3Entitled) reasons.push("eos3_not_entitled");
  if (!input.eos3Enrolled) reasons.push("eos3_not_enrolled");
  if ((input.unsupportedObjectTypes ?? []).length) {
    reasons.push(...(input.unsupportedObjectTypes ?? []).map((t) => `unsupported:${t}`));
  }
  if ((input.unresolvedIntegrityIssues ?? []).length) {
    reasons.push(...(input.unresolvedIntegrityIssues ?? []).map((i) => `integrity:${i}`));
  }
  const activeUnsafe = input.source.workflowStates.filter((w) => w.active && !["COMPLETED", "ACCEPTED", "FROZEN", "RELEASED"].includes(w.state));
  if (activeUnsafe.length) reasons.push("active_workflow_requires_assessment");

  if (reasons.some((r) => r.startsWith("unsupported:") || r.startsWith("integrity:") || r === "wrong_source_generation" || r === "eos3_not_entitled" || r === "eos3_not_enrolled" || r === "production_migration_denied")) {
    return { result: "NOT_ELIGIBLE", reasons, policyVersion: EOS3_MIGRATION_POLICY_VERSION };
  }
  if (reasons.length) {
    return { result: "ELIGIBLE_WITH_LIMITATIONS", reasons, policyVersion: EOS3_MIGRATION_POLICY_VERSION };
  }
  return { result: "ELIGIBLE", reasons: ["eligible"], policyVersion: EOS3_MIGRATION_POLICY_VERSION };
}

export function runPreflight(source: Eos2SourceProject): {
  ok: boolean;
  reasons: string[];
  fingerprint: string;
  objectCount: number;
  relationshipCount: number;
} {
  const reasons: string[] = [];
  if (!source.projectId) reasons.push("missing_project");
  if (source.generation !== 2) reasons.push("wrong_generation");
  if (!source.tenantId || !source.workspaceId) reasons.push("missing_scope");
  for (const b of source.baselines) {
    if (!b.frozen) reasons.push(`baseline_not_frozen:${b.baselineId}`);
  }
  for (const o of source.objects) {
    if (!o.objectId) reasons.push("object_missing_id");
  }
  const fingerprint = fingerprintSource(source);
  return {
    ok: reasons.length === 0,
    reasons,
    fingerprint,
    objectCount: source.objects.length,
    relationshipCount: source.relationships.length,
  };
}

export function createManifest(source: Eos2SourceProject, preflightFp: string): MigrationManifest {
  const transformations = [...new Set(source.objects.map((o) => o.objectType))].map((objectType) => ({
    objectType,
    mappingClass: mappingClassFor(objectType),
  }));
  const deferred = transformations.filter((t) => t.mappingClass === "DEFER" || t.mappingClass === "UNSUPPORTED").map((t) => t.objectType);
  const qualificationStates: Record<string, string | null> = {};
  for (const o of source.objects) qualificationStates[o.objectId] = o.qualificationState;
  return {
    migrationId: id(),
    sourceProjectId: source.projectId,
    sourceGeneration: 2,
    targetGeneration: 3,
    sourceObjectCount: source.objects.length,
    sourceRelationshipCount: source.relationships.length,
    policyVersion: EOS3_MIGRATION_POLICY_VERSION,
    transformations,
    preservedObjectIds: source.objects.map((o) => o.objectId),
    skippedDeferred: deferred,
    qualificationStates,
    sourceFingerprint: preflightFp,
    authorizedActorId: null,
    authorizedAt: null,
    createdAt: now(),
    rollbackRef: null,
    immutable: true,
    provenance: buildEos3Provenance({
      tenantId: source.tenantId,
      workspaceId: source.workspaceId,
      projectId: source.projectId,
      objectId: null,
      revisionId: null,
      source: "eos3.migration.manifest",
      actorId: null,
      authority: null,
      method: "createManifest",
      toolOrModel: null,
      evidenceClassification: "FACT",
      qualificationState: null,
    }),
  };
}

export class Eos3MigrationEngine {
  jobs: MigrationJob[] = [];
  targets = new Map<string, MigratedTargetProject>();
  sourceSnapshots = new Map<string, string>();
  observability = {
    jobs: 0,
    completed: 0,
    failed: 0,
    rollbacks: 0,
    authDenials: 0,
  };

  createJob(source: Eos2SourceProject): MigrationJob {
    const job: MigrationJob = {
      migrationId: id(),
      state: "DRAFT",
      tenantId: source.tenantId,
      workspaceId: source.workspaceId,
      sourceProjectId: source.projectId,
      manifest: null,
      preflightFingerprint: null,
      target: null,
      authorizedBy: null,
      failureReason: null,
      verification: null,
      evidenceFingerprint: null,
      audit: [{ action: "created", actorId: null, at: now(), detail: {} }],
      createdAt: now(),
      updatedAt: now(),
    };
    this.jobs.push(job);
    this.sourceSnapshots.set(source.projectId, fingerprintSource(source));
    this.observability.jobs += 1;
    return job;
  }

  authorizeAccess(
    caller: {
      authenticated: boolean;
      tenantId: string | null;
      workspaceId: string | null;
      eos3Entitled: boolean;
      eos3Enrolled: boolean;
      productionEnvironment?: boolean;
      role: string;
    },
    target: { tenantId: string; workspaceId: string },
  ): { allowed: boolean; reason?: string } {
    if (!caller.authenticated) return { allowed: false, reason: "unauthenticated" };
    if (caller.productionEnvironment) {
      this.observability.authDenials += 1;
      return { allowed: false, reason: "production_migration_denied" };
    }
    if (!caller.eos3Entitled || !caller.eos3Enrolled) return { allowed: false, reason: "not_entitled" };
    if (caller.tenantId !== target.tenantId || caller.workspaceId !== target.workspaceId) {
      this.observability.authDenials += 1;
      return { allowed: false, reason: "workspace_mismatch" };
    }
    return { allowed: true };
  }

  preflight(job: MigrationJob, source: Eos2SourceProject): MigrationJob {
    if (source.projectId !== job.sourceProjectId) throw new Error("source_project_mismatch");
    const pf = runPreflight(source);
    job.state = "PREFLIGHT";
    job.preflightFingerprint = pf.fingerprint;
    if (!pf.ok) {
      job.state = "FAILED";
      job.failureReason = pf.reasons.join(",");
      this.observability.failed += 1;
    } else {
      job.manifest = createManifest(source, pf.fingerprint);
      job.manifest.migrationId = job.migrationId;
      job.state = "READY";
    }
    job.updatedAt = now();
    job.audit.push({ action: "preflight", actorId: null, at: now(), detail: { ok: pf.ok, reasons: pf.reasons } });
    return job;
  }

  authorizeMigration(
    job: MigrationJob,
    actor: { actorId: string; role: string; isAi?: boolean },
  ): MigrationJob {
    if (actor.isAi || actor.role === "ai" || AI_MIGRATION_AUTHORITY) {
      this.observability.authDenials += 1;
      throw new Error("ai_migration_authority_denied");
    }
    if (!["migration_authority", "admin", "owner"].includes(actor.role)) {
      this.observability.authDenials += 1;
      throw new Error("insufficient_migration_authorization");
    }
    if (job.state !== "READY") throw new Error("migration_not_ready");
    if (!job.manifest) throw new Error("manifest_missing");
    job.authorizedBy = actor.actorId;
    job.manifest.authorizedActorId = actor.actorId;
    job.manifest.authorizedAt = now();
    job.state = "AUTHORIZED";
    job.updatedAt = now();
    job.audit.push({ action: "authorized", actorId: actor.actorId, at: now(), detail: {} });
    return job;
  }

  execute(
    job: MigrationJob,
    source: Eos2SourceProject,
    opts?: { injectFailure?: boolean; allowDrift?: boolean },
  ): MigrationJob {
    // Idempotency: repeated execute of completed migration returns existing target
    const existing = this.targets.get(job.migrationId);
    if (existing && (job.state === "COMPLETED" || job.state === "AUTHORIZED")) {
      job.target = existing;
      job.state = "COMPLETED";
      return job;
    }

    if (job.state !== "AUTHORIZED") throw new Error("migration_not_authorized");
    if (!job.manifest || !job.preflightFingerprint) throw new Error("preflight_required");

    // Source drift check
    const currentFp = fingerprintSource(source);
    if (!opts?.allowDrift && currentFp !== job.preflightFingerprint) {
      job.state = "FAILED";
      job.failureReason = "source_drift_detected";
      this.observability.failed += 1;
      job.audit.push({ action: "blocked_source_drift", actorId: null, at: now(), detail: { currentFp } });
      return job;
    }

    job.state = "RUNNING";
    job.updatedAt = now();

    if (opts?.injectFailure) {
      job.state = "FAILED";
      job.failureReason = "injected_mid_migration_failure";
      job.target = null;
      this.observability.failed += 1;
      job.audit.push({ action: "failed", actorId: null, at: now(), detail: { reason: job.failureReason } });
      return job;
    }

    // Source immutability: we never mutate source; copy into target
    const sourceFpBefore = fingerprintSource(source);

    const target: MigratedTargetProject = {
      projectId: `eos3-${source.projectId}`,
      tenantId: source.tenantId,
      workspaceId: source.workspaceId,
      generation: 3,
      sourceProjectId: source.projectId,
      migrationId: job.migrationId,
      objects: source.objects.map((o) => ({
        ...o,
        // Preserve qualification; never broaden
        qualificationState:
          o.qualificationState === "QUALIFIED_BOUNDED"
            ? "QUALIFIED_BOUNDED"
            : o.qualificationState === "QUALIFIED"
              ? "QUALIFIED_BOUNDED"
              : o.qualificationState ?? "NOT_QUALIFIED",
        evidenceClass:
          o.evidenceClass === "HUMAN_DECISION"
            ? "HUMAN_DECISION"
            : o.evidenceClass === "RECOMMENDATION"
              ? "RECOMMENDATION"
              : o.evidenceClass,
        payload: {
          ...o.payload,
          migratedFrom: o.objectId,
          eos2SourceId: o.objectId,
          d1MigrationState: EOS3_D1_MIGRATION_STATE,
          externalSolverGlobalQualification: EOS3_EXTERNAL_SOLVER_GLOBAL_QUALIFICATION,
        },
      })),
      relationships: [...source.relationships],
      baselines: source.baselines.map((b) => ({ ...b, frozen: true as const })),
      decisions: source.decisions.map((d) => ({ ...d, evidenceClass: "HUMAN_DECISION" as const })),
      assumptions: [...source.assumptions],
      interfaces: [...source.interfaces],
      deliverables: [...source.deliverables],
      productionActivated: false,
      activated: false,
    };

    // Ensure source unchanged
    if (fingerprintSource(source) !== sourceFpBefore) {
      throw new Error("source_mutated_during_migration");
    }
    this.sourceSnapshots.set(source.projectId, sourceFpBefore);

    this.targets.set(job.migrationId, target);
    job.target = target;
    job.state = "VERIFYING";
    job.verification = this.verify(job, source, target);
    if (!(job.verification as { ok: boolean }).ok) {
      job.state = "FAILED";
      job.failureReason = "verification_failed";
      this.targets.delete(job.migrationId);
      job.target = null;
      this.observability.failed += 1;
    } else {
      job.state = "COMPLETED";
      job.evidenceFingerprint = hash(JSON.stringify(job.verification));
      job.manifest!.rollbackRef = `rollback:${job.migrationId}`;
      this.observability.completed += 1;
    }
    job.updatedAt = now();
    job.audit.push({ action: "executed", actorId: job.authorizedBy, at: now(), detail: { state: job.state } });
    return job;
  }

  verify(job: MigrationJob, source: Eos2SourceProject, target: MigratedTargetProject): Record<string, unknown> {
    const d1Ok = target.objects
      .filter((o) => o.qualificationState === "QUALIFIED_BOUNDED")
      .every((o) => o.payload.d1MigrationState === "PRESERVE_COMPATIBLE");
    const nonD1Ok = target.objects
      .filter((o) => o.objectType === "Calculation" && o.qualificationState !== "QUALIFIED_BOUNDED")
      .every((o) => o.qualificationState === "NOT_QUALIFIED" || o.qualificationState === "IMPLEMENTED" || o.qualificationState == null);
    const decisionsHuman = target.decisions.every((d) => d.evidenceClass === "HUMAN_DECISION");
    const baselinesFrozen = target.baselines.every((b) => b.frozen);
    const revisionsPreserved = target.objects.every((o) => {
      const src = source.objects.find((s) => s.objectId === o.objectId);
      return src && src.revisionIds.length === o.revisionIds.length;
    });
    const ok =
      target.objects.length === source.objects.length &&
      target.relationships.length === source.relationships.length &&
      d1Ok &&
      decisionsHuman &&
      baselinesFrozen &&
      revisionsPreserved &&
      target.productionActivated === false &&
      target.activated === false &&
      !EOS3_EXTERNAL_SOLVER_GLOBAL_QUALIFICATION;

    return {
      ok,
      objectCountMatch: target.objects.length === source.objects.length,
      relationshipCountMatch: target.relationships.length === source.relationships.length,
      sourceObjectCount: source.objects.length,
      targetObjectCount: target.objects.length,
      sourceRelationshipCount: source.relationships.length,
      targetRelationshipCount: target.relationships.length,
      qualificationPreserved: d1Ok && nonD1Ok !== false,
      authorityPreserved: decisionsHuman,
      baselinePreserved: baselinesFrozen,
      revisionPreserved: revisionsPreserved,
      digitalThreadOk: target.relationships.length > 0,
      activationSeparated: target.activated === false,
      migrationId: job.migrationId,
    };
  }

  rollback(job: MigrationJob, actor: { actorId: string; role: string; isAi?: boolean }, source: Eos2SourceProject): MigrationJob {
    if (actor.isAi || actor.role === "ai") throw new Error("ai_cannot_rollback_migration");
    if (!["migration_authority", "admin", "owner"].includes(actor.role)) {
      throw new Error("insufficient_rollback_authorization");
    }
    if (!["COMPLETED", "FAILED"].includes(job.state)) throw new Error("rollback_not_allowed");
    this.targets.delete(job.migrationId);
    job.target = null;
    job.state = "ROLLED_BACK";
    job.updatedAt = now();
    const sourceFp = fingerprintSource(source);
    const expected = this.sourceSnapshots.get(source.projectId);
    job.verification = {
      rollbackOk: true,
      sourceUnchanged: sourceFp === expected,
      targetRemoved: !this.targets.has(job.migrationId),
      sourceFingerprint: sourceFp,
    };
    this.observability.rollbacks += 1;
    job.audit.push({ action: "rolled_back", actorId: actor.actorId, at: now(), detail: { sourceFp } });
    return job;
  }
}

export function productionMigrationGuard(productionEnvironment: boolean): { allowed: false; reason: string } | { allowed: true } {
  if (productionEnvironment) return { allowed: false, reason: "production_migration_denied" };
  return { allowed: true };
}

export function legacyProjectDefaultsToEos2(metadata: Record<string, unknown> | null): boolean {
  return resolveProjectGeneration(metadata) === "eos2_compatible";
}
