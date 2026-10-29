/** Immutable Evidence Framework — append-only with provenance and chain-of-custody. */

export type EvidenceKind =
  | "photo"
  | "video"
  | "audio"
  | "drawing"
  | "pdf"
  | "document"
  | "thermal"
  | "ultrasound"
  | "point_cloud"
  | "lidar"
  | "laser_scan"
  | "drone_image"
  | "robot_image"
  | "mesh_3d"
  | "ai_inference"
  | "voice_note"
  | "external_url"
  | "sensor_data"
  | "pack_extension";

export type EvidenceProvenance = {
  capturedByPersonId?: string;
  capturedAt: string;
  source: "human" | "device" | "ai" | "import" | "sensor" | "pack";
  deviceId?: string;
  runtimeRunId?: string;
};

export type EvidenceChainOfCustody = {
  custodyEvents: Array<{
    at: string;
    actorPersonId?: string;
    action: "created" | "transferred" | "reviewed" | "approved" | "exported";
    note?: string;
  }>;
};

export type ImmutableEvidenceRecord = {
  id: string;
  sessionId: string;
  observationId?: string;
  kind: EvidenceKind;
  /** Platform Files pointer — never a private blob store. */
  fileId?: string;
  externalUrl?: string;
  contentHash: string;
  hashAlgorithm: "sha256";
  version: number;
  previousEvidenceId?: string;
  provenance: EvidenceProvenance;
  chainOfCustody: EvidenceChainOfCustody;
  immutable: true;
};

export function appendEvidenceVersion(
  previous: ImmutableEvidenceRecord | null,
  next: Omit<ImmutableEvidenceRecord, "version" | "previousEvidenceId" | "immutable">,
): ImmutableEvidenceRecord {
  return {
    ...next,
    immutable: true,
    version: previous ? previous.version + 1 : 1,
    previousEvidenceId: previous?.id,
  };
}
