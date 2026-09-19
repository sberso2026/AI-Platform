import type { DetectorDetection } from "./detectors/types";

export function dedupeDetections(detections: readonly DetectorDetection[]): {
  unique: DetectorDetection[];
  duplicateFindingRate: number;
} {
  const seen = new Map<string, DetectorDetection>();
  let duplicates = 0;
  for (const detection of detections) {
    const existing = seen.get(detection.detectionKey);
    if (!existing) {
      seen.set(detection.detectionKey, detection);
      continue;
    }
    duplicates += 1;
    if (detection.evidence.length > existing.evidence.length) {
      seen.set(detection.detectionKey, detection);
    }
  }
  const unique = [...seen.values()];
  return {
    unique,
    duplicateFindingRate: detections.length === 0 ? 0 : duplicates / detections.length,
  };
}
