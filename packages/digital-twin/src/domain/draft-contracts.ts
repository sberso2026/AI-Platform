/**
 * Phase 12A — draft public contract families (0.1.0-draft only).
 * See `docs/contracts/DIGITAL_TWIN_PUBLIC_CONTRACTS_DRAFT.md`.
 */

import { PUBLIC_CONTRACT_VERSION } from "../version";

export const DRAFT_CONTRACT_FAMILIES = [
  "TwinRegistrationDraft",
  "TwinTargetReferenceDraft",
  "TwinRepresentationReferenceDraft",
  "TwinStateSnapshotDraft",
  "TwinRelationshipDraft",
  "DigitalThreadLinkDraft",
  "FidelityConfigDraft",
  "TelemetryBindingDraft",
  "SimulationScenarioDraft",
  "SpatialAnchorDraft",
] as const;

export type DraftContractFamily = (typeof DRAFT_CONTRACT_FAMILIES)[number];

export type TwinTargetReferenceDraft = {
  contractVersion: typeof PUBLIC_CONTRACT_VERSION;
  targetKind: "asset" | "project" | "location" | "system" | "equipment";
  canonicalId: string;
  tenantId: string;
};

export type TwinRepresentationReferenceDraft = {
  contractVersion: typeof PUBLIC_CONTRACT_VERSION;
  twinId: string;
  fidelityLevel: "L0" | "L1" | "L2" | "L3" | "L4" | "L5";
  representationKind: "tabular" | "graph" | "spatial" | "simulation" | "reserved";
};

export type TwinStateSnapshotDraft = {
  contractVersion: typeof PUBLIC_CONTRACT_VERSION;
  twinId: string;
  category: "observed" | "derived" | "simulated" | "declared" | "unavailable";
  capturedAt: string;
  attributes: Record<string, unknown>;
};

/** @deprecated Phase 12A name — GA freezes public contracts at 1.0.0 (no draft). */
export function assertDraftContractsOnly(): { ok: true; contractVersion: typeof PUBLIC_CONTRACT_VERSION } {
  if (PUBLIC_CONTRACT_VERSION !== "1.0.0") {
    throw new Error("public_contracts_must_be_frozen_at_1_0_0");
  }
  return { ok: true, contractVersion: PUBLIC_CONTRACT_VERSION };
}
