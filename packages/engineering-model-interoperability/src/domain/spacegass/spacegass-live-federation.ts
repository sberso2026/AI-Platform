/**
 * Phase 13D — Live model / result federation via SPACE GASS API.
 *
 * Opens a job, reads nodes/members/sections/materials (+ bounded result classes),
 * always closes the job. Fail-closed when API unavailable.
 * Never labels FEDERATED EXPORT / fixture content as LIVE MODEL.
 */

import { randomUUID } from "node:crypto";
import type { EngineeringModelElementReference } from "../engineering-model-element-reference";
import type { EngineeringModelReference } from "../engineering-model-reference";
import type { EngineeringAnalysisResultReference } from "../result-reference";
import { probeSpaceGassLiveHealth } from "./spacegass-live-health";
import {
  createSPACEGASSLiveProvider,
  type SPACEGASSLiveProvider,
  type SPACEGASSLiveProviderOptions,
} from "./spacegass-live-provider";
import {
  SPACEGASS_PROVENANCE,
  type SpaceGassLiveHealthStatus,
  type SpaceGassProvenanceLabel,
} from "./spacegass-live-types";
import {
  SPACEGASS_ADAPTER_VERSION,
  SPACEGASS_DISPLAY_NAME,
  SPACEGASS_PROVIDER_KEY,
} from "./spacegass-version";

export type SpaceGassLiveFederationInput = {
  tenantId: string;
  workspaceId: string;
  /** Local .sg path for POST /job/open, or omit to use open-sample. */
  filePath?: string;
  sampleFileName?: string;
  projectId?: string;
  displayName?: string;
  locator?: string;
};

export type SpaceGassLiveFederationResult =
  | {
      ok: true;
      provenanceLabel: "LIVE MODEL";
      model: EngineeringModelReference;
      elements: EngineeringModelElementReference[];
      results: EngineeringAnalysisResultReference[];
      healthStatus: SpaceGassLiveHealthStatus;
      nodeCount: number;
      memberCount: number;
      sectionCount: number;
      materialCount: number;
    }
  | {
      ok: false;
      provenanceLabel: SpaceGassProvenanceLabel;
      errorCode: string;
      detail: string;
      healthStatus: SpaceGassLiveHealthStatus;
      silentFallbackUsed: false;
      correctiveFindings: string[];
    };

function nowIso() {
  return new Date().toISOString();
}

function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" ? (v as Record<string, unknown>) : {};
}

function idOf(row: Record<string, unknown>, fallback: string): string {
  const id = row.id ?? row.Id ?? row.nodeId ?? row.memberId;
  return id != null ? String(id) : fallback;
}

export async function federateSpaceGassLiveModel(
  input: SpaceGassLiveFederationInput,
  options?: SPACEGASSLiveProviderOptions & { provider?: SPACEGASSLiveProvider },
): Promise<SpaceGassLiveFederationResult> {
  const provider =
    options?.provider ?? createSPACEGASSLiveProvider(options);
  const health = await probeSpaceGassLiveHealth({
    ...options,
    provider,
  });

  if (!health.reachable || !health.licenseOk || !health.versionOk) {
    return {
      ok: false,
      provenanceLabel: SPACEGASS_PROVENANCE.federatedExport,
      errorCode:
        health.status === "version_mismatch"
          ? "version_mismatch"
          : health.status === "license_unavailable"
            ? "license_unavailable"
            : health.status === "unauthorized"
              ? "unauthorized"
              : "live_api_unavailable",
      detail: health.detail,
      healthStatus: health.status,
      silentFallbackUsed: false,
      correctiveFindings: health.correctiveFindings,
    };
  }

  const openTarget = input.filePath?.trim() || input.sampleFileName?.trim();
  if (!openTarget) {
    return {
      ok: false,
      provenanceLabel: SPACEGASS_PROVENANCE.liveModel,
      errorCode: "live_job_path_required",
      detail:
        "Live federation requires filePath (.sg) or sampleFileName for open-sample",
      healthStatus: health.status,
      silentFallbackUsed: false,
      correctiveFindings: [
        "Provide SPACEGASS_LIVE_JOB_PATH or SPACEGASS_LIVE_SAMPLE for certification federation.",
      ],
    };
  }

  let opened = false;
  try {
    // Best-effort close any prior job (one active job per service).
    await provider.closeJob();

    const openRes = input.filePath?.trim()
      ? await provider.openJob(input.filePath.trim())
      : await provider.openSample(input.sampleFileName!.trim());
    if (!openRes.ok) {
      return {
        ok: false,
        provenanceLabel: SPACEGASS_PROVENANCE.liveModel,
        errorCode: openRes.errorCode || "job_open_failed",
        detail: openRes.detail,
        healthStatus: health.status,
        silentFallbackUsed: false,
        correctiveFindings: [
          "Failed to open SPACE GASS job via live API — fail closed, no fixture substitution.",
        ],
      };
    }
    opened = true;

    const [nodesR, membersR, sectionsR, materialsR] = await Promise.all([
      provider.getNodes(),
      provider.getMembers(),
      provider.getSections(),
      provider.getMaterials(),
    ]);

    for (const r of [nodesR, membersR, sectionsR, materialsR]) {
      if (!r.ok) {
        return {
          ok: false,
          provenanceLabel: SPACEGASS_PROVENANCE.liveModel,
          errorCode: r.errorCode || "structure_read_failed",
          detail: r.detail,
          healthStatus: health.status,
          silentFallbackUsed: false,
          correctiveFindings: [
            "Live structure read failed — fail closed; do not fall back to FEDERATED EXPORT fixture as LIVE MODEL.",
          ],
        };
      }
    }

    const nodes = nodesR.ok ? nodesR.data : [];
    const members = membersR.ok ? membersR.data : [];
    const sections = sectionsR.ok ? sectionsR.data : [];
    const materials = materialsR.ok ? materialsR.data : [];

    const ts = nowIso();
    const modelRefId = `emi_model_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
    const externalModelId =
      input.filePath?.trim() ||
      input.sampleFileName?.trim() ||
      `live:${modelRefId}`;

    const model: EngineeringModelReference = {
      kind: "engineering_model_reference",
      owner: "source_client_engineering_application",
      federationOwner: "engineering_model_interoperability",
      modelRefId,
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      providerKey: SPACEGASS_PROVIDER_KEY,
      externalModelId,
      displayName:
        input.displayName ?? `${SPACEGASS_DISPLAY_NAME} LIVE MODEL`,
      formatFamily: "native",
      status: "federated",
      platformFileRef: input.locator ?? externalModelId,
      schemaHint: "spacegass_live_api",
      notes: `${SPACEGASS_PROVENANCE.liveModel} via SpaceGassApi ${SPACEGASS_ADAPTER_VERSION}`,
      rtbOwned: false,
      federated: true,
      projectId: input.projectId,
      version: 1,
      createdAt: ts,
      updatedAt: ts,
    };

    const elements: EngineeringModelElementReference[] = [];
    nodes.forEach((n, i) => {
      const row = asRecord(n);
      const externalElementId = idOf(row, `node_${i + 1}`);
      elements.push({
        kind: "engineering_model_element_reference",
        owner: "source_client_engineering_application",
        federationOwner: "engineering_model_interoperability",
        elementRefId: `emi_el_${randomUUID().replace(/-/g, "").slice(0, 16)}`,
        modelRefId,
        tenantId: input.tenantId,
        workspaceId: input.workspaceId,
        externalElementId,
        elementKind: "node",
        displayName: externalElementId,
        sourceProperties: {
          x: Number(row.x ?? row.X ?? 0),
          y: Number(row.y ?? row.Y ?? 0),
          z: Number(row.z ?? row.Z ?? 0),
          provenance: SPACEGASS_PROVENANCE.liveModel,
        },
        createdAt: ts,
        updatedAt: ts,
      });
    });
    members.forEach((m, i) => {
      const row = asRecord(m);
      const externalElementId = idOf(row, `member_${i + 1}`);
      elements.push({
        kind: "engineering_model_element_reference",
        owner: "source_client_engineering_application",
        federationOwner: "engineering_model_interoperability",
        elementRefId: `emi_el_${randomUUID().replace(/-/g, "").slice(0, 16)}`,
        modelRefId,
        tenantId: input.tenantId,
        workspaceId: input.workspaceId,
        externalElementId,
        elementKind: "member",
        displayName: externalElementId,
        sourceProperties: {
          nodeI: String(row.nodeI ?? row.NodeI ?? row.node1 ?? ""),
          nodeJ: String(row.nodeJ ?? row.NodeJ ?? row.node2 ?? ""),
          sectionId: String(row.sectionId ?? row.SectionId ?? "") || null,
          materialId: String(row.materialId ?? row.MaterialId ?? "") || null,
          provenance: SPACEGASS_PROVENANCE.liveModel,
        },
        createdAt: ts,
        updatedAt: ts,
      });
    });
    sections.forEach((s, i) => {
      const row = asRecord(s);
      const externalElementId = idOf(row, `section_${i + 1}`);
      elements.push({
        kind: "engineering_model_element_reference",
        owner: "source_client_engineering_application",
        federationOwner: "engineering_model_interoperability",
        elementRefId: `emi_el_${randomUUID().replace(/-/g, "").slice(0, 16)}`,
        modelRefId,
        tenantId: input.tenantId,
        workspaceId: input.workspaceId,
        externalElementId,
        elementKind: "section",
        displayName: String(row.name ?? row.Name ?? externalElementId),
        sourceProperties: { provenance: SPACEGASS_PROVENANCE.liveModel },
        createdAt: ts,
        updatedAt: ts,
      });
    });
    materials.forEach((m, i) => {
      const row = asRecord(m);
      const externalElementId = idOf(row, `material_${i + 1}`);
      elements.push({
        kind: "engineering_model_element_reference",
        owner: "source_client_engineering_application",
        federationOwner: "engineering_model_interoperability",
        elementRefId: `emi_el_${randomUUID().replace(/-/g, "").slice(0, 16)}`,
        modelRefId,
        tenantId: input.tenantId,
        workspaceId: input.workspaceId,
        externalElementId,
        elementKind: "material",
        displayName: String(row.name ?? row.Name ?? externalElementId),
        sourceProperties: { provenance: SPACEGASS_PROVENANCE.liveModel },
        createdAt: ts,
        updatedAt: ts,
      });
    });

    // Bounded existing-result federation from live job (if static results present).
    const results: EngineeringAnalysisResultReference[] = [];
    const jobStatus = await provider.getJobStatus();
    if (jobStatus.ok && jobStatus.data.analysis?.hasStaticResults) {
      results.push({
        kind: "engineering_analysis_result_reference",
        owner: "source_client_engineering_application",
        federationOwner: "engineering_model_interoperability",
        resultRefId: `emi_res_${randomUUID().replace(/-/g, "").slice(0, 16)}`,
        modelRefId,
        tenantId: input.tenantId,
        workspaceId: input.workspaceId,
        externalResultId: `live_static_${modelRefId}`,
        resultKind: "linear_elastic_static",
        provenance: "external_existing",
        rtbGenerated: false,
        trustClassification: "source_declared",
        solverProviderId: SPACEGASS_PROVIDER_KEY,
        notes: `${SPACEGASS_PROVENANCE.existingResult} from live job (not ${SPACEGASS_PROVENANCE.rtbExecutedResult})`,
        createdAt: ts,
        updatedAt: ts,
      });
    }

    return {
      ok: true,
      provenanceLabel: SPACEGASS_PROVENANCE.liveModel,
      model,
      elements,
      results,
      healthStatus: health.status,
      nodeCount: nodes.length,
      memberCount: members.length,
      sectionCount: sections.length,
      materialCount: materials.length,
    };
  } catch (e) {
    return {
      ok: false,
      provenanceLabel: SPACEGASS_PROVENANCE.liveModel,
      errorCode: "live_federation_failed",
      detail: e instanceof Error ? e.message : "live_federation_failed",
      healthStatus: health.status,
      silentFallbackUsed: false,
      correctiveFindings: [
        "Unexpected live federation failure — fail closed, no CalculiX/fixture substitute.",
      ],
    };
  } finally {
    if (opened) {
      try {
        await provider.closeJob();
      } catch {
        // close best-effort
      }
    }
  }
}

/**
 * Bounded live result federation (existing results in open/openable job).
 * Distinct from RTB EXECUTED RESULT.
 */
export async function federateSpaceGassLiveResults(
  input: SpaceGassLiveFederationInput,
  options?: SPACEGASSLiveProviderOptions & { provider?: SPACEGASSLiveProvider },
): Promise<SpaceGassLiveFederationResult> {
  const federation = await federateSpaceGassLiveModel(input, options);
  if (!federation.ok) return federation;
  return {
    ...federation,
    // Results remain EXISTING RESULT trust unless produced by RTB live execution.
  };
}
