/**
 * AI Vision extension interfaces — reserved only.
 * No computer vision implementation in Phase 9B.
 */

export type BoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
  coordinateSpace: "image" | "normalized" | "world";
};

export type VisionObservation = {
  id: string;
  sessionId: string;
  evidenceId?: string;
  modelId?: string;
  runtimeRunId?: string;
  observedAt: string;
  reserved: true;
};

export type VisionFinding = {
  id: string;
  visionObservationId: string;
  label: string;
  confidence: number;
  boundingBoxes: BoundingBox[];
  reserved: true;
};

export const AI_VISION_EXTENSION_RESERVED = true as const;
