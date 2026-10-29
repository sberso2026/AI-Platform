/**
 * AI Vision — Phase 9I implements advisory evidence analysis in domain/ai-vision-*.
 * Legacy reserved observation/finding shapes kept for compatibility.
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
  /** @deprecated Use domain/ai-vision-analysis.ts VisionAnalysisResult */
  reserved: false;
};

export type VisionFinding = {
  id: string;
  visionObservationId: string;
  label: string;
  confidence: number;
  boundingBoxes: BoundingBox[];
  /** @deprecated Use domain VisionAnalysisResult regions/labels */
  reserved: false;
};

/** Symbol retained for Phase 9C gate; product implemented in 9I domain modules. */
export const AI_VISION_EXTENSION_RESERVED = false as const;
