import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Gate T — legacy equivalence matrix remains present and classifies processing behaviours.
 */
describe("Gate T — Meeting Intelligence legacy equivalence", () => {
  it("documents Phase 6C-3C processing equivalence categories", () => {
    const matrixPath = resolve(
      process.cwd(),
      "../../docs/migration/PROJECT_INTELLIGENCE_MEETING_EQUIVALENCE_MATRIX.md",
    );
    const matrix = readFileSync(matrixPath, "utf8");
    expect(matrix).toMatch(/Phase 6C-3C processing equivalence/i);
    expect(matrix).toMatch(/MeetingProcessingService\.enqueueProcessing/);
    expect(matrix).toMatch(/assertProposalConvertible/);
    expect(matrix).toMatch(/MeetingDocumentGroundingAdapter/);
    expect(matrix).toMatch(/reconnect/i);
    expect(matrix).toMatch(/DeterministicMeetingAiAdapter|deterministic/i);
  });

  it("keeps provider-bot live capture explicitly non-certified", () => {
    const matrixPath = resolve(
      process.cwd(),
      "../../docs/migration/PROJECT_INTELLIGENCE_MEETING_EQUIVALENCE_MATRIX.md",
    );
    const matrix = readFileSync(matrixPath, "utf8");
    expect(matrix).toMatch(/Teams \/ Zoom \/ Meet/);
    expect(matrix).toMatch(/Design only|unavailable/i);
  });
});
