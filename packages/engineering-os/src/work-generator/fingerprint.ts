import { createHash } from "node:crypto";
import type { WorkPlanContextSnapshot } from "./types";

export function fingerprintWorkPlanInput(input: {
  projectId: string;
  templateCode: string;
  templateVersion: string;
  workType: string;
  lifecycleStage: string;
  systemId?: string | null;
  snapshot: WorkPlanContextSnapshot;
}): string {
  const identities = {
    projectId: input.projectId,
    template: `${input.templateCode}@${input.templateVersion}`,
    workType: input.workType,
    lifecycleStage: input.lifecycleStage,
    systemId: input.systemId ?? null,
    requirements: input.snapshot.requirements.map((row) => row.objectId).sort(),
    assumptions: input.snapshot.assumptions.map((row) => row.objectId).sort(),
    interfaces: input.snapshot.interfaces.map((row) => row.objectId).sort(),
    decisions: input.snapshot.decisions.map((row) => row.objectId).sort(),
    analyses: input.snapshot.analyses.map((row) => `${row.objectId}:${row.stale ? "stale" : "current"}`).sort(),
    information: input.snapshot.information.map((row) => `${row.sourceObjectId ?? row.title}:${row.revision ?? ""}:${row.freshness ?? ""}`).sort(),
    gaps: input.snapshot.gaps.map((row) => `${row.kind}:${row.title}`).sort(),
  };
  return createHash("sha256").update(JSON.stringify(identities)).digest("hex");
}

export function compareFingerprints(previous: string, next: string): "CURRENT" | "STALE" {
  return previous === next ? "CURRENT" : "STALE";
}
